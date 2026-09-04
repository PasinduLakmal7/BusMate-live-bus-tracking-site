import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Bus, Users, Clock, Compass, Bell, Shield, Loader2, ChevronRight, Map as MapIcon, Share2, TrendingUp, CheckCircle2, Star } from 'lucide-react';
import { GoogleMap, Marker, useLoadScript, DirectionsRenderer } from "@react-google-maps/api";
import { io } from 'socket.io-client';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import busIcon from '../assets/bus-icon.png';

const libraries = ["places"];

const BusDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const API_URL = '/api/site';

  // ── States & Logic (Hooks MUST be top-level) ──────────────────────────────
  const [busData, setBusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [timeAgo, setTimeAgo] = useState('just now');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  const [loggedInUser, setLoggedInUser] = useState(null);

  // Security Check & Auth Sync Node
  useEffect(() => {
    const fetchAuthAndFavs = async () => {
      try {
        const authRes = await fetch('/api/user/profile', { credentials: 'include' });
        const authData = await authRes.json();
        
        if (authData.success) {
          setLoggedInUser(authData.user);
          // If authorized, fetch real favorites to set the star color
          const favRes = await fetch('/api/favorites', { credentials: 'include' });
          const favData = await favRes.json();
          if (favData.success) {
            setIsFavorite(favData.favorites.some(f => f.item_id === id));
          }
        } else {
          setLoggedInUser(null);
          setIsFavorite(false);
        }
      } catch (err) {
        console.error("BusDetails: Global sync failure", err);
        setLoggedInUser(null);
        setIsFavorite(false);
      }
    };
    fetchAuthAndFavs();
  }, [id]);

  const toggleFavorite = async () => {
    // SECURITY HANDSHAKE: If guest operative, summon the Auth selecting modal
    if (!loggedInUser) {
      window.dispatchEvent(new Event('trigger-auth-modal'));
      return;
    }

    try {
      const endpoint = isFavorite ? '/api/favorites/remove' : '/api/favorites/add';
      const body = isFavorite 
        ? { item_type: 'bus', item_id: id }
        : { item_type: 'bus', item_id: id, item_name: `${busData?.busNumber} (Route ${busData?.route?.routeNumber})` };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      });
      
      const data = await res.json();
      if (data.success) {
        setIsFavorite(!isFavorite);
      }
    } catch (err) {
      console.error("BusDetails: Fav toggle error", err);
    }
  };

  // Handle Crowd Report
  const handleCrowdReport = async (level) => {
    if (!busData?.id) return;
    try {
       const res = await fetch(`${API_URL}/report-crowd`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ busId: busData.id, level })
       });
       const data = await res.json();
       if (data.success) {
          setReportSuccess(true);
          setTimeout(() => setReportSuccess(false), 3000);
       }
    } catch (err) {
       console.error("Report error:", err);
    }
  };

  // Fetch Bus Data
  const fetchBusDetails = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/buses/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.success) {
        setBusData(data.bus);
      } else if (id.startsWith('D-')) {
        // Fallback for ad-hoc driver tracking sessions (Mobile App)
        let dName = 'Unregistered Vehicle';
        try {
           const dRes = await fetch(`/api/drivers/all`);
           const dData = await dRes.json();
           const driver = dData.data?.find(d => String(d.driver_id) === String(id.replace('D-', '')));
           if (driver) dName = `Driver: ${driver.full_name}`;
        } catch (e) {
           console.error("Failed to fetch drivers for fallback", e);
        }

        let lastLocation = undefined;
        try {
           const locRes = await fetch(`/api/buses/locations`);
           const locData = await locRes.json();
           const matchLoc = locData.locations?.find(l => String(l.id) === String(id) || String(l.driverId) === String(id.replace('D-', '')));
           if (matchLoc) {
               lastLocation = { lat: matchLoc.lat, lon: matchLoc.lon, speed: matchLoc.speed, heading: matchLoc.heading, recorded_at: matchLoc.ts };
           }
        } catch(e) { console.error(e); }

        setBusData({
          id: id,
          busNumber: dName,
          driverId: id.replace('D-', ''),
          route: { routeNumber: 'Live Tracking', start: 'Ad-hoc', end: 'Tracking' },
          upcomingStops: [],
          location: lastLocation
        });
      }
    } catch (err) {
      console.error("Error fetching bus details:", err);
    } finally {
      if (loading) setLoading(false);
    }
  }, [id, loading]);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/alerts/bus/${id}`);
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error("Alerts fetch error:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchBusDetails();
    fetchAlerts();
    const interval = setInterval(() => {
        fetchBusDetails();
        fetchAlerts();
    }, 15000);
    
    // Socket Sync logic
    const socket = io('http://localhost:4000', { auth: { admin: true } });
    socket.on('bus:location', (data) => {
       const isMatch = data.busId === id || 
                       String(data.id) === String(busData?.id) || 
                       (String(id).startsWith('D-') && String(data.driverId) === String(id).replace('D-', ''));

       if (isMatch) {
          setBusData(prev => {
             if (!prev) return prev;
             return { 
               ...prev, 
               isReturning: data.isReturning || data.is_returning || prev.isReturning,
               location: { lat: data.lat, lon: data.lon, speed: data.speed, heading: data.heading, recorded_at: data.ts } 
             };
          });
       }
    });
    return () => { clearInterval(interval); socket.disconnect(); };
  }, [fetchBusDetails, id, busData?.id]);

  // Directions logic
  useEffect(() => {
    if (isLoaded && busData?.upcomingStops?.length >= 2 && !directionsResponse) {
      const stops = busData.upcomingStops
        .map(s => ({ lat: parseFloat(s.lat), lng: parseFloat(s.lng) }))
        .filter(s => !isNaN(s.lat) && !isNaN(s.lng));
      if (stops.length < 2) return;
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route({
        origin: stops[0], destination: stops[stops.length - 1],
        waypoints: stops.slice(1, -1).map(s => ({ location: s, stopover: true })),
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      }, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) setDirectionsResponse(result);
      });
    }
  }, [isLoaded, busData, directionsResponse]);

  // Last Seen logic
  const lastSeenDate = useMemo(() => {
    return busData?.location?.recorded_at ? new Date(busData.location.recorded_at) : null;
  }, [busData?.location?.recorded_at]);

  const isOffline = useMemo(() => {
    return lastSeenDate ? (new Date() - lastSeenDate) > 300000 : true;
  }, [lastSeenDate]);

  useEffect(() => {
    if (!lastSeenDate) return;
    const updateTime = () => {
       const diff = Math.floor((new Date() - lastSeenDate) / 1000);
       if (diff < 60) setTimeAgo(`${diff}s ago`);
       else setTimeAgo(`${Math.floor(diff/60)}m ago`);
    };
    const timer = setInterval(updateTime, 10000);
    updateTime();
    return () => clearInterval(timer);
  }, [lastSeenDate]);

  // Share Logic
  const shareLinks = useMemo(() => {
    const url = window.location.href;
    const text = `Track bus ${busData?.busNumber} live on BusMate! Currently on route ${busData?.route?.routeNumber || ''} (${busData?.route?.start || ''} to ${busData?.route?.end || 'Destination'}). Check live location here:`;
    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      sms: `sms:?body=${encodeURIComponent(text + ' ' + url)}`,
      copy: url
    };
  }, [busData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLinks.copy);
    alert('Link copied to clipboard!');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50/50 dark:bg-transparent">
      <div className="relative">
         <Loader2 className="w-16 h-16 text-blue-600 animate-spin opacity-20" />
         <Bus className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-bold mt-4 uppercase tracking-widest text-xs">Syncing Bus Analytics...</p>
    </div>
  );

  if (!busData) return (
    <div className="mt-40 text-center space-y-4">
      <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
        <Bus className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-gray-50">Bus Not Found</h2>
      <p className="text-gray-500">The requested vehicle might be offline or outside the coverage area.</p>
      <Button onClick={() => navigate('/live')}>Return to Map</Button>
    </div>
  );

  const mapCenter = busData.location 
    ? { lat: parseFloat(busData.location.lat), lng: parseFloat(busData.location.lon) }
    : { lat: 6.9271, lng: 79.8612 };

  // Optimized Dark Mode Styles with POI visibility
  const darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#1e1e2e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1e1e2e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "poi", elementType: "labels.icon", stylers: [{ visibility: "on" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  ];

  return (
    <div className="max-w-[95%] 2xl:max-w-[85%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 min-h-screen">
      
      {/* Navigation Breadcrumb */}
      <div className="mb-6">
        <Link 
          to="/crowd-status" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
            <Users className="w-4 h-4 group-hover:text-white" />
          </div>
          Back to Fleet Overview
        </Link>
      </div>

      {/* Header Info */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
            <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500 animate-none' : 'bg-green-500 animate-pulse'}`}></div>
            <span className={isOffline ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}>
              {isOffline ? 'Stationary / Offline' : `Live Tracking Enabled • Updated ${timeAgo}`}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
             <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-50 tracking-tighter uppercase flex items-center gap-4">
               {busData.busNumber}
               <button 
                 onClick={toggleFavorite}
                 className={`p-2 rounded-2xl border transition-all active:scale-110 shadow-lg ${isFavorite ? 'bg-amber-500 border-amber-600 shadow-amber-500/20 text-white' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-400'}`}
                 title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
               >
                 <Star className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
               </button>
             </h1>
             {busData.route && (
               <div className="flex gap-2">
                 <span className="text-lg bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 px-4 py-1.5 rounded-2xl border border-blue-100 dark:border-blue-900/30 font-black tracking-tighter">
                   #{busData.route.routeNumber}
                 </span>
                 <span className="text-lg bg-gray-500/10 text-gray-500 dark:text-gray-400 px-4 py-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 font-black tracking-tighter uppercase">
                   To {busData.isReturning ? busData.route.start : busData.route.end}
                 </span>
               </div>
             )}
          </div>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium mt-2">
            {busData.type || 'Inter-city'} • <span className="text-gray-900 dark:text-gray-200 font-bold">{busData.depotName}</span>
          </p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => setShowShareModal(true)} variant="secondary" className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:bg-gray-50">
             <Share2 className="w-4 h-4 mr-2" /> Share
           </Button>
           <Button onClick={() => navigate('/live')} className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20">
             <MapIcon className="w-4 h-4 mr-2" /> Full Real-time Map
           </Button>
        </div>
      </div>

      {/* Share Modal Overlay */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-sm" onClick={() => setShowShareModal(false)}></div>
          <Card className="relative w-full max-w-sm p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-3xl rounded-[2.5rem]">
            <h3 className="text-2xl font-black text-gray-900 dark:text-gray-50 mb-6 flex items-center gap-3">
               <Share2 className="w-6 h-6 text-blue-600" /> Share Journey
            </h3>
            
            <div className="space-y-3">
               <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-[#25d366]/10 hover:bg-[#25d366]/20 text-[#25d366] rounded-2xl transition-all font-bold">
                 <span>WhatsApp</span>
                 <Share2 className="w-5 h-5" />
               </a>
               <a href={shareLinks.telegram} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] rounded-2xl transition-all font-bold">
                 <span>Telegram</span>
                 <Share2 className="w-5 h-5" />
               </a>
               <a href={shareLinks.sms} className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl transition-all font-bold">
                 <span>SMS Message</span>
                 <Share2 className="w-5 h-5" />
               </a>
               <button onClick={handleCopy} className="w-full flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all font-bold mt-4">
                 <span>Copy Tracking Link</span>
                 <Share2 className="w-5 h-5" />
               </button>
            </div>

            <Button variant="secondary" className="w-full mt-6 border-none text-gray-500 font-bold" onClick={() => setShowShareModal(false)}>
              Close
            </Button>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Journey Details */}
        <div className="xl:col-span-12 2xl:col-span-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-6 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-transparent border-blue-100 dark:border-blue-900/30">
               <Compass className="w-6 h-6 text-blue-600 mb-3" />
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Live Speed</p>
               <p className="text-3xl font-black text-gray-900 dark:text-gray-50">
                 {busData.location ? Number(busData.location.speed || 0).toFixed(0) : '--'} 
                 <span className="text-sm font-bold text-gray-400 ml-1">km/h</span>
               </p>
            </Card>
            <Card className="p-6">
               <Users className={`w-6 h-6 mb-3 ${busData.occupancy < 40 ? 'text-emerald-500' : busData.occupancy < 80 ? 'text-amber-500' : 'text-rose-500'}`} />
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Density</p>
               <p className={`text-2xl font-black ${busData.occupancy < 40 ? 'text-emerald-600 dark:text-emerald-400' : busData.occupancy < 80 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                 {busData.occupancy < 40 ? 'Comfortable' : busData.occupancy < 80 ? 'Moderate' : 'Packed'}
               </p>
            </Card>
            <Card className="p-6">
               <Clock className="w-6 h-6 text-emerald-500 mb-3" />
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Arrival Status</p>
               <p className="text-2xl font-black text-emerald-600 uppercase">On Time</p>
            </Card>
            <Card className="p-6">
               <Bell className={`w-6 h-6 mb-3 ${alerts.length > 0 ? 'text-purple-600 animate-pulse' : 'text-gray-300 dark:text-gray-700'}`} />
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Live Alerts</p>
               <p className={`text-2xl font-black ${alerts.length > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-gray-50'}`}>
                 {alerts.length} Active
               </p>
            </Card>
          </div>

          <Card className="p-8">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
               <h3 className="text-xl font-black text-gray-900 dark:text-gray-50 flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                 Journey Progress
               </h3>
               {busData.route && (
                 <div className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700">
                   {busData.isReturning ? busData.route.end : busData.route.start} <ChevronRight className="inline w-3 h-3 mx-1" /> {busData.isReturning ? busData.route.start : busData.route.end}
                 </div>
               )}
             </div>

             <div className="space-y-0 relative">
               <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800"></div>

               {(busData.isReturning 
                    ? [...(busData.upcomingStops || [])].reverse() 
                    : (busData.upcomingStops || [])
                ).map((stop, index) => {
                 const isCurrent = stop.status === 'Departed' && (index + 1 === busData.upcomingStops.length || busData.upcomingStops[index + 1].status === 'Upcoming');
                 
                 return (
                 <div key={stop.id} className="relative pl-16 pb-8 group last:pb-0">
                    <div className={`absolute left-4 top-1 w-4 h-4 rounded-full border-4 transition-all duration-500 z-10 ${
                      isCurrent 
                        ? 'bg-blue-500 border-blue-200 dark:border-blue-700 animate-pulse scale-125' 
                        : stop.status === 'Departed'
                          ? 'bg-gray-400 border-gray-100 dark:border-gray-800'
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                    }`}></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 group-hover:translate-x-1 transition-transform">
                      <div>
                        <h4 className={`font-black text-lg ${isCurrent ? 'text-blue-600 dark:text-blue-400' : stop.status === 'Departed' ? 'text-gray-300 dark:text-gray-600 line-through' : 'text-gray-900 dark:text-gray-50'}`}>
                          {stop.name}
                        </h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{isCurrent ? 'Current Location' : stop.status}</p>
                      </div>
                      <div className={`bg-white dark:bg-gray-800 px-5 py-3 rounded-2xl border ${isCurrent ? 'border-blue-400 shadow-lg shadow-blue-500/10' : 'border-gray-100 dark:border-gray-700'} shadow-sm min-w-[120px] text-right`}>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`}>ETA</p>
                        <p className={`text-xl font-black ${isCurrent ? 'text-blue-600' : 'text-gray-900 dark:text-gray-50'}`}>{isCurrent ? 'NOW' : stop.eta}</p>
                      </div>
                    </div>
                 </div>
               )})}
             </div>
          </Card>
        </div>

        {/* Live Tracking Mini Map */}
        <div className="xl:col-span-12 2xl:col-span-4 space-y-6">
           <Card className="h-[600px] w-full relative overflow-hidden rounded-[2.5rem] border-[12px] border-white dark:border-gray-800 shadow-2xl">
             {isLoaded ? (
               <GoogleMap
                 mapContainerStyle={{ width: '100%', height: '100%' }}
                 center={mapCenter}
                 zoom={15}
                 options={{
                   disableDefaultUI: true,
                   zoomControl: false,
                   styles: document.documentElement.classList.contains('dark') ? darkMapStyles : [],
                 }}
               >
                 {/* Corrected Bus Marker Icon */}
                 <Marker 
                   position={mapCenter}
                   icon={{
                     url: busIcon,
                     scaledSize: new window.google.maps.Size(45, 45),
                     anchor: new window.google.maps.Point(22.5, 22.5),
                   }}
                 />

                 {/* Corrected Journey Path */}
                 {directionsResponse && (
                   <DirectionsRenderer
                     directions={directionsResponse}
                     options={{
                       suppressMarkers: true,
                       polylineOptions: {
                         strokeColor: "#2563eb",
                         strokeOpacity: 0.8,
                         strokeWeight: 6,
                       }
                     }}
                   />
                 )}
               </GoogleMap>
             ) : (
               <div className="w-full h-full bg-gray-50 dark:bg-gray-900 animate-pulse flex flex-col items-center justify-center">
                  <MapIcon className="w-16 h-16 text-gray-200 dark:text-gray-800 mb-4" />
                  <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Loading GIS Intelligence...</p>
               </div>
             )}
             
             <div className="absolute bottom-8 left-8 right-8">
                <Button 
                   onClick={() => navigate('/live')}
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none font-black shadow-2xl shadow-blue-500/30 py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
                >
                  <MapIcon className="w-5 h-5 text-white" /> View Comprehensive Map
                </Button>
             </div>
           </Card>

           <Card className={`p-6 border-none shadow-2xl relative overflow-hidden transition-all duration-500 ${alerts.length > 0 ? 'bg-rose-600' : 'bg-[#0a0a0c]'} text-white`}>
              <div className="relative z-10">
                <h4 className="font-black text-lg mb-2 flex items-center gap-2">
                   {alerts.length > 0 ? <Bell className="w-5 h-5 animate-bounce" /> : <Shield className="w-5 h-5 text-blue-500" />}
                   {alerts.length > 0 ? 'Active Service Disruption' : 'Safety & Tracking'}
                </h4>
                <div className="text-[13px] text-gray-400 leading-relaxed font-medium">
                  {alerts.length > 0 ? (
                    <div className="space-y-4 mt-6">
                       {alerts.map((alert, idx) => (
                          <div key={idx} className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                             <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${alert.type === 'Danger' ? 'bg-black/20 text-rose-200' : 'bg-amber-600/40 text-amber-200'}`}>
                                   {alert.type}
                                </span>
                                <span className="text-[10px] font-bold opacity-60">
                                   {new Date(alert.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                             </div>
                             <h5 className="font-black text-sm mb-1 uppercase tracking-tight text-white">{alert.title}</h5>
                             <p className="text-[12px] opacity-80 leading-relaxed font-bold text-blue-100">{alert.message}</p>
                          </div>
                       ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-gray-400 leading-relaxed font-medium">
                      Travel path is automatically snapped to roads using GPS telemetry. Nearby facilities and transit zones are audited for passenger safety.
                    </p>
                  )}
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-5">
                 <Bus className="w-32 h-32 text-white" />
              </div>
           </Card>

           {/* Live Experience Analysis (For passengers on board) */}
           <Card className="p-8 bg-gray-900 dark:bg-gray-800/80 border-none relative overflow-hidden shadow-2xl rounded-[2.5rem]">
              <div className="relative z-10">
                 <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                    <div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 shrink-0">
                       <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                       <h3 className="text-white text-2xl font-black tracking-tighter uppercase">On the bus right now?</h3>
                       <p className="text-blue-200 font-medium">Help others by reporting the live crowd level in real-time.</p>
                    </div>
                 </div>

                 {reportSuccess ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-[2rem] flex items-center justify-center gap-4 animate-in zoom-in-95 duration-300">
                       <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
                       <span className="text-emerald-500 font-black uppercase tracking-widest text-sm">Thank you! Community updated.</span>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       <button 
                         onClick={() => handleCrowdReport(20)} 
                         className="p-5 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all border border-emerald-500/20 hover:scale-[1.03] active:scale-95 flex flex-col items-center gap-2 group"
                       >
                          <div className="bg-emerald-500/10 p-2 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                             <Users className="w-5 h-5" />
                          </div>
                          Plenty of Seats
                       </button>
                       <button 
                         onClick={() => handleCrowdReport(60)} 
                         className="p-5 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all border border-amber-500/20 hover:scale-[1.03] active:scale-95 flex flex-col items-center gap-2 group"
                       >
                          <div className="bg-amber-500/10 p-2 rounded-xl group-hover:bg-amber-500/20 transition-colors">
                             <TrendingUp className="w-5 h-5" />
                          </div>
                          Moderate Load
                       </button>
                       <button 
                         onClick={() => handleCrowdReport(95)} 
                         className="p-5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all border border-rose-500/20 hover:scale-[1.03] active:scale-95 flex flex-col items-center gap-2 group"
                       >
                          <div className="bg-rose-500/10 p-2 rounded-xl group-hover:bg-rose-500/20 transition-colors">
                             <Shield className="w-5 h-5" />
                          </div>
                          Very Crowded
                       </button>
                    </div>
                 )}
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]"></div>
           </Card>
        </div>

      </div>
    </div>
  );
};

export default BusDetails;

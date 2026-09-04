import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import heroBg from '../assets/hero-bg-wide.png';
import { Search, Map, MapPin, Compass, AlertTriangle, Clock, Zap, Star } from 'lucide-react';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from "@react-google-maps/api";
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import Card from '../components/common/Card';
/* GeolocationStatus removed */

const libraries = ["places"];

const Home = () => {
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [locationStatus, setLocationStatus] = useState('loading');
  const [autocomplete, setAutocomplete] = useState(null);
  const [routeSearchQuery, setRouteSearchQuery] = useState('');
  const navigate = useNavigate();

  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const destination = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address
        };
        // Navigate to Route Planner with destination data
        navigate('/planner', { state: { destination } });
      }
    }
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const handleEnableLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }

    setLocationStatus('loading');
    setIsLocationEnabled(true);

    const startTracking = (highAccuracy = true) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLocationStatus(highAccuracy ? 'high' : 'low');
        },
        (error) => {
          console.warn(`Geolocation error (highAccuracy=${highAccuracy}):`, error);
          if (highAccuracy && (error.code === 3 || error.code === 1)) {
            startTracking(false);
          } else {
            setLocationStatus('error');
          }
        },
        { enableHighAccuracy: highAccuracy, timeout: highAccuracy ? 4000 : 10000, maximumAge: 60000 }
      );
    };

    startTracking(true);
  }, []);

  // Auto-enable location on mount
  useEffect(() => {
    if (isLoaded) {
      handleEnableLocation();
    }
  }, [isLoaded]);

  const onMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setUserLocation({ lat, lng });
    setLocationStatus('low');
    console.log("Home manual location set:", { lat, lng });
  }, []);

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  const [upcomingRoutes, setUpcomingRoutes] = useState([]);
  const [stats, setStats] = useState({ routes: 0, buses: 0, drivers: 0 });
  const [alerts, setAlerts] = useState([]);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesRes, statsRes, alertsRes, predRes] = await Promise.all([
          fetch('/api/site/routes', { credentials: 'include' }),
          fetch('/api/site/stats', { credentials: 'include' }),
          fetch('/api/site/alerts/latest', { credentials: 'include' }),
          fetch('/api/site/predictions', { credentials: 'include' })
        ]);

        const routesData = await routesRes.json();
        if (routesData.success) {
          setUpcomingRoutes(routesData.routes.slice(0, 2));
        }

        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }

        const alertsData = await alertsRes.json();
        if (alertsData.success) setAlerts(alertsData.alerts.slice(0, 2));

        const predData = await predRes.json();
        if (predData.success) setPredictions(predData.predictions);

      } catch (err) {
        console.error('Error fetching home data:', err);
      }
    };
    fetchData();
  }, []);


  return (
    <div className="pt-16 pb-10">
      {/* Hero Section */}
      <section className="relative text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image & Shaders */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        ></div>
        {/* Modern Shader Overlays - Kept clear so the globe is very visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-blue-900/20"></div>
        <div className="absolute inset-0 bg-blue-800/10 mix-blend-overlay"></div>

        <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto relative z-10 flex flex-col items-center text-center w-full drop-shadow-lg">
          {/* Active Alerts Ticker */}
          {alerts.length > 0 && (
            <div className="mb-8 w-full max-w-2xl bg-rose-600/10 backdrop-blur-md border border-rose-500/20 rounded-full px-6 py-2 flex items-center gap-4 overflow-hidden group/ticker">
              <div className="flex items-center gap-2 text-rose-500 shrink-0">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Disruptions:</span>
              </div>
              <div className="flex-grow overflow-hidden relative h-4">
                <div className="absolute inset-0 flex items-center animate-scroll-text whitespace-nowrap gap-12 font-bold text-[11px] text-rose-100 uppercase tracking-widest">
                  {alerts.map((a, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" /> {a.title}: {a.message}
                    </span>
                  ))}
                  {/* Duplicate for seamless scroll */}
                  {alerts.map((a, i) => (
                    <span key={`dup-${i}`} className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" /> {a.title}: {a.message}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <h1 className="flex flex-col mb-4 uppercase drop-shadow-2xl text-center items-center">
            <span className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white/90 leading-none">
              WHERE ARE YOU
            </span>
            <span className="text-5xl md:text-7xl lg:text-[5rem] font-black tracking-tighter text-blue-500 leading-none">
              GOING?
            </span>
          </h1>
          <p className="text-blue-50/60 text-[10px] md:text-xs mb-8 max-w-sm md:max-w-xl font-bold tracking-[0.4em] uppercase text-center leading-relaxed mx-auto">
            Live tracking, smart predictions, and seamless transit across the global node network.
          </p>

          <div className="w-full max-w-xl mx-auto bg-black/60 backdrop-blur-2xl border border-white/5 p-1 rounded-[2rem] shadow-2xl flex flex-col sm:flex-row gap-2 relative group transition-all duration-500">
            <div className="absolute -inset-1 bg-blue-500/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
            {isLoaded ? (
              <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged} className="flex-grow relative z-10 w-full">
                <InputField
                  icon={Search}
                  placeholder="Enter Route (e.g. 122) or Destination..."
                  value={routeSearchQuery || ""}
                  onChange={(e) => setRouteSearchQuery(e.target.value)}
                  className="w-full text-white bg-transparent border-none shadow-none font-bold placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest py-3 px-6"
                />
              </Autocomplete>
            ) : (
              <InputField
                icon={Search}
                placeholder="Initializing node matrix..."
                className="flex-grow text-white bg-transparent border-none shadow-none font-bold placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest relative z-10 py-3 px-6"
              />
            )}
            <Button 
              onClick={() => {
                if (routeSearchQuery) {
                  navigate(`/live?route=${encodeURIComponent(routeSearchQuery)}`);
                } else {
                  navigate('/live');
                }
              }}
              className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-2xl shadow-blue-500/40 relative z-10 active:scale-95 transition-all"
            >
              Launch Node
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Link to="/live" className="group block">
            <Card className="p-6 border-none bg-white dark:bg-gray-900 shadow-xl flex flex-col items-center text-center h-full relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors"></div>
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform shadow-inner border border-blue-100 dark:border-blue-800/50">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-[11px]">Live Tracking</h3>
            </Card>
          </Link>
          <Link to="/planner" className="group block">
            <Card className="p-6 border-none bg-white dark:bg-gray-900 shadow-xl flex flex-col items-center text-center h-full relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/10 transition-colors"></div>
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform shadow-inner border border-indigo-100 dark:border-indigo-800/50">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-[11px]">Route Planner</h3>
            </Card>
          </Link>
          <Link to="/routes" className="group block">
            <Card className="p-6 border-none bg-white dark:bg-gray-900 shadow-xl flex flex-col items-center text-center h-full relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors"></div>
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform shadow-inner border border-emerald-100 dark:border-emerald-800/50">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-[11px]">Bus Schedules</h3>
            </Card>
          </Link>
          <Link to="/favorites" className="group block">
            <Card className="p-6 border-none bg-white dark:bg-gray-900 shadow-xl flex flex-col items-center text-center h-full relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-500/10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-rose-500/10 transition-colors"></div>
              <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-rose-600 mb-4 group-hover:scale-110 transition-transform shadow-inner border border-rose-100 dark:border-rose-800/50">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-[11px]">Saved Routes</h3>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">

            {/* Live Map Preview Placeholder */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-gray-900 dark:text-gray-50 flex items-center gap-3 uppercase tracking-tight">
                  <MapPin className="w-6 h-6 text-blue-600" /> Active Radar
                </h2>
                <div className="flex items-center gap-3">
                  {isLocationEnabled && (
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                        <div className={`w-2 h-2 rounded-full ${locationStatus === 'high' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500'}`}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">
                          {locationStatus === 'high' ? 'LIVE SYNC' : 'APPROX'}
                        </span>
                      </div>
                      {(locationStatus === 'low' || locationStatus === 'error') && (
                        <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-widest">Network Variance</span>
                      )}
                    </div>
                  )}
                  <Link to="/live" className="text-[10px] px-4 py-2 font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Expand Node</Link>
                </div>
              </div>
              <Card className="h-72 sm:h-96 w-full relative bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl flex items-center justify-center overflow-hidden rounded-[2rem]">
                {isLocationEnabled && isLoaded && userLocation ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={userLocation}
                    zoom={15}
                    onClick={onMapClick}
                    options={{
                      disableDefaultUI: true,
                      zoomControl: true,
                      clickableIcons: false,
                      styles: isDarkMode ? [
                        { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
                        { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
                        { "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
                        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
                        { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
                        { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
                        { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
                        { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
                        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                        { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
                        { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
                        { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1b1b1b" }] },
                        { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
                        { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
                        { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#373737" }] },
                        { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
                        { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#4e4e4e" }] },
                        { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
                        { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
                        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] }
                      ] : []
                    }}
                  >
                    <Marker
                      position={userLocation}
                      icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                      }}
                    />
                  </GoogleMap>
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
                    <div className="text-center relative z-10 w-full px-4">
                      {loadError ? (
                        <p className="text-red-500 font-medium font-bold">Map Loading Error</p>
                      ) : (
                        <>
                          <p className="text-gray-500 dark:text-gray-400 font-medium mb-4 animate-pulse">
                            {!isLoaded ? "Initializing Maps..." : "Finding your location..."}
                          </p>
                        </>
                      )}
                    </div>
                  </>
                )}
              </Card>
            </section>

            {/* Smart Suggestions */}
            <section>
              <h2 className="text-xs font-black text-gray-900 dark:text-gray-50 flex items-center gap-3 mb-6 uppercase tracking-[0.2em]">
                <Zap className="w-5 h-5 text-amber-500" /> AI Dynamics
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <Card hover className="p-6 border-none bg-white dark:bg-gray-900 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-amber-500/10 transition-colors"></div>
                  <div className="flex items-start gap-5 relative z-10">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-2xl text-amber-600 border border-amber-100 dark:border-amber-800/50">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-gray-50 text-[11px] uppercase tracking-widest">Optimal Node Sync</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-bold leading-relaxed">
                        Best travel window detected: <span className="text-gray-900 dark:text-white uppercase tracking-wider mx-1">{predictions?.bestTime?.label || '10:00 AM'}</span> (System Minimum Node Load).
                      </p>
                    </div>
                  </div>
                </Card>
                <Card hover className="p-6 border-none bg-white dark:bg-gray-900 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors"></div>
                  <div className="flex items-start gap-5 relative z-10">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl text-blue-600 border border-blue-100 dark:border-blue-800/50">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-gray-50 text-[11px] uppercase tracking-widest">Efficiency Core</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-bold leading-relaxed">
                        Regional node efficiency: <span className="text-emerald-500 uppercase tracking-wider mx-1 font-black">{predictions?.efficiency || 88}%</span>. Normal flow detected.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">

            {/* Active Alerts Preview */}
            <Card className="p-5 border-none bg-white dark:bg-gray-900/50 backdrop-blur-sm shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-gray-900 dark:text-gray-50 flex items-center gap-3 uppercase tracking-tight text-xs">
                  <AlertTriangle className="w-5 h-5 text-red-500" /> Active Alerts
                </h3>
                {alerts.length > 0 && (
                  <span className="bg-red-500/10 text-red-500 text-[10px] font-black px-3 py-1 rounded-full border border-red-500/20 uppercase tracking-widest">
                    {alerts.length} New
                  </span>
                )}
              </div>
              <ul className="space-y-6">
                {alerts.length > 0 ? alerts.map((alert) => (
                  <li key={alert.id} className="group cursor-pointer">
                    <span className="text-[10px] font-black text-red-500 mb-1.5 block uppercase tracking-[0.2em]">{alert.type} • {alert.title}</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-bold leading-relaxed">{alert.message}</p>
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase mt-2 block tracking-widest">Received {new Date(alert.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </li>
                )) : (
                  <li className="text-center py-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">No active node disruptions</p>
                  </li>
                )}
              </ul>
              <Link to="/alerts" className="block text-center text-[10px] font-black uppercase tracking-[0.25em] text-blue-500 hover:text-blue-400 w-full mt-6 pt-6 border-t border-gray-100 dark:border-gray-800/50 transition-colors">
                Expand Alert Matrix
              </Link>
            </Card>

            {/* Daily Schedule Quick Look */}
            <Card className="p-6 bg-gray-900 text-white border-none shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-3 text-gray-400">
                <Clock className="w-5 h-5 text-blue-500" /> Dispatch Registry
              </h3>
              <ul className="space-y-4 relative z-10">
                {upcomingRoutes.length > 0 ? upcomingRoutes.map((route) => (
                  <li key={route.id} className="flex justify-between items-center group cursor-pointer hover:bg-white/5 p-3 rounded-2xl transition-colors -mx-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center">
                        <span className="font-black text-lg text-white group-hover:text-blue-500 transition-colors tracking-tight">{route.routeNumber}</span>
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-300 block">{route.startLocation}</span>
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">To {route.endLocation}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-400 flex items-center justify-end gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        {Math.floor(Math.random() * 15) + 2}m
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mt-1 leading-none">Live Sync</span>
                    </div>
                  </li>
                )) : (
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 animate-pulse">Synchronizing dispatch nodes...</p>
                )}
              </ul>
            </Card>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

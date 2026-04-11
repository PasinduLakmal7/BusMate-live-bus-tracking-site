import React, { useState, useEffect } from 'react';
import { Star, MapPin, Bus, Navigation, Trash2, Plus, UserPlus, Info, RefreshCw, Clock, Users, Shield, Bell, ChevronRight } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const [favBuses, setFavBuses] = useState([]);
  const [favStops, setFavStops] = useState([]);
  const [busDetails, setBusDetails] = useState({});
  const [stopDetails, setStopDetails] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Security Check & Data Sync Node
  useEffect(() => {
    const fetchAuthAndData = async () => {
      try {
        const authRes = await fetch('/api/user/profile', { credentials: 'include' });
        const authData = await authRes.json();
        
        if (authData.success) {
          setIsLoggedIn(true);
          // Fetch real favorites from database
          const favRes = await fetch('/api/favorites', { credentials: 'include' });
          const favData = await favRes.json();
          if (favData.success) {
            const buses = favData.favorites.filter(f => f.item_type === 'bus').map(f => ({
              id: f.item_id,
              number: f.item_name?.split(' (')[0] || f.item_id,
              route: f.item_name?.match(/Route (\w+)/)?.[1] || 'Express'
            }));
            const stops = favData.favorites.filter(f => f.item_type === 'stop').map(f => ({
              id: f.item_id,
              name: f.item_name || 'Transit Node'
            }));
            
            setFavBuses(buses);
            setFavStops(stops);
            syncLiveData(buses, stops);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Favorites: Global sync failure", err);
        setIsLoggedIn(false);
      } finally {
        setAuthChecking(false);
      }
    };
    fetchAuthAndData();
  }, []);

  const syncLiveData = async (buses, stops) => {
    if (buses.length === 0 && stops.length === 0) return;
    setIsSyncing(true);
    try {
       // Fetch live data for each bus
       const busRes = await Promise.all(
         buses.map(b => fetch(`/api/site/buses/${b.id}`).then(r => r.json()))
       );
       const busMap = {};
       busRes.forEach(r => { if(r.success) busMap[r.bus.id] = r.bus; });
       setBusDetails(busMap);

       // Fetch live data for each stop
       const stopRes = await Promise.all(
         stops.map(s => fetch(`/api/site/stops/${s.id}`).then(r => r.json()))
       );
       const stopMap = {};
       stopRes.forEach(r => { if(r.success) stopMap[r.stop?.stop_id || r.stop_id] = r; });
       setStopDetails(stopMap);
    } catch (err) {
       console.error("Sync failed:", err);
    } finally {
       setIsSyncing(false);
    }
  };

  const removeFavorite = async (item_id, item_type) => {
    try {
      const res = await fetch('/api/favorites/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id, item_type }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        if (item_type === 'bus') {
          setFavBuses(prev => prev.filter(b => b.id !== item_id));
        } else {
          setFavStops(prev => prev.filter(s => s.id !== item_id));
        }
      }
    } catch (err) {
      console.error("Removal handshake failed:", err);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // GUESTS SEE THIS:
  if (!isLoggedIn) {
     return (
        <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
           <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-[2.5rem] flex items-center justify-center mb-10 ring-1 ring-black/5 dark:ring-white/5 shadow-2xl">
              <Shield className="w-10 h-10 text-gray-400" />
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-50 tracking-tighter uppercase mb-6">
              Command Profile <span className="text-blue-600">Locked</span>
           </h1>
           <p className="text-gray-500 font-bold max-w-lg mb-10 uppercase tracking-widest text-xs">
              Synchronized route libraries and site node analysis are restricted to active operators. Please log in to unlock your transit intelligence core.
           </p>
           <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link to="/login">
                <Button className="px-10 py-5 bg-blue-600 shadow-2xl shadow-blue-500/20 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl active:scale-95 transition-all">
                  Initiate Login <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" className="px-10 py-5 border-gray-100 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl active:scale-95 hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                  Sign Up Profile <UserPlus className="w-4 h-4 text-blue-500" />
                </Button>
              </Link>
           </div>
        </div>
     );
  }

  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 mt-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-50 flex items-center gap-4 tracking-tighter uppercase mb-2">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/20">
              <Star className="w-7 h-7 text-white fill-current" />
            </div>
            Transit Library
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Auto-syncing live analytics for your saved fleet nodes.</p>
        </div>
        <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 p-2 rounded-2xl">
           <div className={`p-2 rounded-xl ${isSyncing ? 'animate-spin text-blue-500' : 'text-gray-400'}`}>
              <RefreshCw className="w-5 h-5" />
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              {isSyncing ? 'Synchronizing Live Telemetry...' : 'Real-time Analytics Ready'}
           </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Saved Vehicles Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-50 flex items-center gap-3 tracking-tight">
              <Bus className="w-6 h-6 text-blue-600" /> Saved Fleet Items
            </h2>
            <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase tracking-widest">{favBuses.length} Vehicles tracked</span>
          </div>
          
          <div className="space-y-4">
            {favBuses.length > 0 ? favBuses.map((bus) => {
              const liveData = busDetails[bus.id];
              const alertsCount = liveData?.alerts?.length || 0;
              
              return (
              <Card key={bus.id} className={`p-5 flex flex-col group transition-all shadow-lg hover:shadow-xl border-none ${alertsCount > 0 ? 'bg-rose-600 ring-4 ring-rose-500/20' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 ${alertsCount > 0 ? 'bg-white text-rose-600' : 'bg-gray-900 dark:bg-gray-800 text-white'} rounded-xl flex items-center justify-center font-black text-lg`}>
                      {bus.number?.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className={`font-black uppercase tracking-tight ${alertsCount > 0 ? 'text-white' : 'text-gray-900 dark:text-gray-50'}`}>{bus.number}</h3>
                      <p className={`text-xs font-bold uppercase tracking-widest ${alertsCount > 0 ? 'text-rose-100' : 'text-gray-400'}`}>
                        {bus.route ? `Route #${bus.route}` : 'Multi-route Express'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/bus/${bus.id}`}>
                      <Button variant="secondary" className={`p-3 border-none transition-all ${alertsCount > 0 ? 'bg-white/20 text-white hover:bg-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}>
                        <Navigation className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => removeFavorite(bus.id, 'bus')}
                      variant="secondary" 
                      className={`p-3 border-none transition-all ${alertsCount > 0 ? 'bg-white/10 text-white' : 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {liveData ? (
                  <div className={`grid grid-cols-3 md:grid-cols-3 gap-3 pt-3 border-t ${alertsCount > 0 ? 'border-white/20' : 'border-gray-50 dark:border-gray-800'}`}>
                    <div className="text-center">
                       <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${alertsCount > 0 ? 'text-rose-100' : 'text-gray-400'}`}>Speed</p>
                       <p className={`text-md font-black ${alertsCount > 0 ? 'text-white' : 'text-blue-600'}`}>
                         {Math.floor(liveData.location?.speed || 0)} <span className="text-[10px] uppercase">km/h</span>
                       </p>
                    </div>
                    <div className="text-center">
                       <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${alertsCount > 0 ? 'text-rose-100' : 'text-gray-400'}`}>Density</p>
                       <p className={`text-sm font-black ${alertsCount > 0 ? 'text-white' : liveData.occupancy > 80 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {liveData.occupancy < 40 ? 'Low' : liveData.occupancy < 80 ? 'Mid' : 'High'}
                       </p>
                    </div>
                    <div className="text-center">
                       <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${alertsCount > 0 ? 'text-rose-100' : 'text-gray-400'}`}>Status</p>
                       <div className="flex items-center justify-center gap-1">
                         <div className={`w-1.5 h-1.5 rounded-full ${alertsCount > 0 ? 'bg-white' : 'bg-green-500'}`}></div>
                         <p className={`text-xs font-black ${alertsCount > 0 ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>LIVE</p>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-10 animate-pulse bg-gray-50 dark:bg-gray-800/50 rounded-xl"></div>
                )}
              </Card>
            )}) : (
              <div className="p-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-700">
                <Bus className="w-14 h-14 text-gray-300 mx-auto mb-6 opacity-40" />
                <p className="text-gray-400 font-black mb-6 uppercase tracking-widest text-[10px]">Your fleet library is empty</p>
                <Link to="/live">
                  <Button size="sm" className="bg-blue-600 shadow-xl shadow-blue-500/20">Analyze Active Map</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Saved Stops Section */}
        <div>
           <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-50 flex items-center gap-3 tracking-tight">
              <MapPin className="w-6 h-6 text-emerald-600" /> Saved Site Nodes
            </h2>
            <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-widest">{favStops.length} Nodes tracked</span>
          </div>

          <div className="space-y-4">
            {favStops.length > 0 ? favStops.map((stop) => {
              const liveData = stopDetails[stop.id];
              const arrivalBuses = liveData?.arrivals || [];
              
              return (
              <Card key={stop.id} className="p-5 flex flex-col group hover:border-emerald-200 transition-all shadow-lg hover:shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 dark:text-gray-50 uppercase tracking-tight">{stop.name}</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Global Transit Node Analysis Active</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/stop/${stop.id}`}>
                      <Button variant="secondary" className="bg-emerald-50 text-emerald-600 border-none hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest h-11 px-6 shadow-sm">
                        Live Board
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => removeFavorite(stop.id, 'stop')}
                      variant="secondary" 
                      className="p-3 bg-rose-50 text-rose-500 border-none hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {liveData ? (
                  <div className="space-y-3 pt-4 border-t border-gray-50 dark:border-gray-800">
                     <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Upcoming Intelligence</p>
                     {arrivalBuses.length > 0 ? arrivalBuses.slice(0, 2).map((bus, idx) => (
                       <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center font-black text-[10px] text-emerald-600 border border-emerald-100 dark:border-emerald-900/30">
                                {bus.busNumber?.substring(0, 2)}
                             </div>
                             <span className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase">{bus.busNumber}</span>
                          </div>
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-md">{bus.eta}</span>
                       </div>
                     )) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">No active arrivals detected</span>
                        </div>
                     )}
                  </div>
                ) : (
                  <div className="h-16 animate-pulse bg-gray-50 dark:bg-gray-800/50 rounded-xl"></div>
                )}
              </Card>
            )}) : (
              <div className="p-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-700">
                <MapPin className="w-14 h-14 text-gray-300 mx-auto mb-6 opacity-40" />
                <p className="text-gray-400 font-black mb-6 uppercase tracking-widest text-[10px]">No site nodes analyzed yet</p>
                <Link to="/live">
                  <Button size="sm" className="bg-emerald-600 shadow-xl shadow-emerald-500/20">Nearby Node Scan</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Privacy Note */}
      <div className="mt-16 bg-gray-900 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-3xl">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center shrink-0">
             <Info className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-tight">Cloud-Sync Data Privacy</h4>
            <p className="text-gray-400 text-sm font-medium">Your transit library is securely synchronized to your database profile. Your nodes follow you across all devices.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;

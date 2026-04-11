import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Map, Clock, AlertCircle, Loader2 } from 'lucide-react';
import InputField from '../components/common/InputField';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const RoutesSchedules = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRouteId, setExpandedRouteId] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch('http://localhost:4000/site/routes');
        const data = await response.json();
        if (data.success) {
          // Add some colors for variety since backend doesn't provide them
          const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-500', 'bg-purple-600', 'bg-rose-600'];
          const formattedRoutes = data.routes.map((r, index) => ({
            id: r.routeNumber,
            dbId: r.id,
            name: `${r.startLocation} - ${r.endLocation}`,
            stops: [], // We'll fetch these on demand or just show a placeholder
            frequency: 'Every 15-20 mins', // Placeholder
            status: r.status ? 'Active' : 'Inactive',
            color: colors[index % colors.length]
          }));
          setRoutes(formattedRoutes);
        }
      } catch (err) {
        console.error('Error fetching routes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const filteredRoutes = routes.filter(route =>
    route.id.toString().includes(searchTerm) || route.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] mt-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
          </div>
        </div>
        <p className="text-gray-500 font-black uppercase tracking-widest mt-6 animate-pulse text-xs">Synchronizing transit nodes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-200 dark:border-gray-800 pb-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-4">
          <Map className="w-10 h-10 text-blue-600" /> Transit Network
        </h1>
        <p className="text-gray-500 font-bold tracking-widest uppercase mt-3 text-[10px]">Live intelligence and timetables for all active dispatch routes.</p>
      </div>
      <div className="w-full md:w-96 relative group focus-within:ring-4 focus-within:ring-blue-500/20 rounded-2xl transition-all">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
        <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/50 rounded-2xl flex items-center shadow-xl overflow-hidden">
          <Search className="w-5 h-5 text-gray-400 ml-4 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search route number or node..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent py-4 pl-3 pr-4 text-gray-900 dark:text-white font-bold outline-none placeholder:uppercase placeholder:tracking-widest placeholder:text-gray-500 text-[11px] uppercase tracking-[0.1em]"
          />
        </div>
      </div>
    </div>

    <div className="space-y-6">
      {filteredRoutes.map((route) => (
        <Card key={route.dbId} className="group overflow-hidden flex flex-col border-none bg-white dark:bg-gray-900/50 backdrop-blur-sm shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col md:flex-row w-full">

          {/* Route Header Banner */}
          <div className={`p-8 ${route.color} text-white flex flex-col justify-center items-center md:w-56 flex-shrink-0 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/20 transition-colors"></div>
            <span className="text-5xl font-black relative z-10">{route.id}</span>
            <div className="mt-4 flex flex-col items-center relative z-10 w-full px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-center opacity-80 leading-tight">{route.name.split(' - ')[0]}</span>
              <div className="w-0.5 h-4 bg-white/30 my-2"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-center opacity-80 leading-tight">{route.name.split(' - ')[1]}</span>
            </div>
          </div>

          {/* Route Intelligence Details */}
          <div className="p-8 flex-grow flex flex-col justify-between relative">
            <div>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{route.name}</h3>
                {route.status === 'Active' ? (
                  <span className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div> Active Sync
                  </span>
                ) : (
                  <span className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                    <AlertCircle className="w-3 h-3" /> {route.status}
                  </span>
                )}
              </div>

              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400/80 mb-3">Service Intelligence</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-relaxed mb-8 max-w-2xl bg-gray-50 dark:bg-gray-800/30 p-4 rounded-2xl">
                High-priority transit node connecting <span className="text-gray-900 dark:text-gray-200 tracking-wider mx-1 uppercase">{route.name.split(' - ')[0]}</span> and <span className="text-gray-900 dark:text-gray-200 tracking-wider mx-1 uppercase">{route.name.split(' - ')[1]}</span>.
                Tap the Live Map matrix to lock onto current dispatch positions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-100 dark:border-gray-800/50">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800/80 flex items-center justify-center border border-gray-200 dark:border-gray-700/50">
                  <Clock className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Dispatch Frequency</span>
                  <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-xs">{route.frequency}</span>
                </div>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <Button 
                  variant="secondary" 
                  onClick={() => navigate(`/timetable/${route.id}`)}
                  className="flex-1 sm:flex-none uppercase text-[10px] font-black tracking-widest px-6 py-3.5 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors"
                >
                  Timetable
                </Button>
                <Button 
                  onClick={() => navigate('/live')}
                  className="flex-1 sm:flex-none gap-2 uppercase text-[10px] font-black tracking-widest px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-0.5 group/btn"
                >
                  <Map className="w-4 h-4 text-white/50 group-hover/btn:text-white transition-colors" /> Live Matrix
                </Button>
              </div>
            </div>
          </div>
        </div>
        </Card>
      ))}

      {filteredRoutes.length === 0 && (
        <div className="text-center py-24 bg-gray-50 dark:bg-gray-900/40 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-gray-50 dark:ring-gray-900/50">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3">No nodes identified</h3>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">We couldn't lock onto any route matching "{searchTerm}".</p>
        </div>
      )}
    </div>
  </div>
  );
};

export default RoutesSchedules;


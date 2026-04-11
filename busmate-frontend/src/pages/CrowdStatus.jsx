import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Filter, Bus, TrendingUp, RefreshCcw, Clock, CheckCircle2, ChevronRight, X, Loader2 } from 'lucide-react';
import Card from '../components/common/Card';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';

const CrowdStatus = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [crowdBuses, setCrowdBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState(null); // For reporting modal
  const [reportSuccess, setReportSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCrowdData = useCallback(async () => {
    setIsRefreshing(true);
    try {
       const res = await fetch('/api/site/crowd-status');
      const data = await res.json();
      if (data.success) {
        setCrowdBuses(data.buses);
      }
    } catch (err) {
      console.error("Error fetching crowd data:", err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCrowdData();
    const interval = setInterval(fetchCrowdData, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, [fetchCrowdData]);

  const handleReport = async (level) => {
    if (!selectedBus) return;
    try {
       const res = await fetch('/api/site/report-crowd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ busId: selectedBus.id, level })
       });
       const data = await res.json();
       if (data.success) {
          setReportSuccess(true);
          setTimeout(() => {
             setReportSuccess(false);
             setSelectedBus(null);
             fetchCrowdData();
          }, 2000);
       }
    } catch (err) {
       console.error("Report error:", err);
    }
  };

  const getColorClasses = (color) => {
    switch(color) {
      case 'red': return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-200' };
      case 'amber': return { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-50', border: 'border-amber-200' };
      case 'emerald': return { bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50', border: 'border-emerald-200' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 relative min-h-screen">
      
      {/* Reporting Modal */}
      {selectedBus && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-sm" onClick={() => setSelectedBus(null)}></div>
            <Card className="relative w-full max-w-sm p-8 bg-white dark:bg-gray-900 border-none shadow-3xl rounded-[2.5rem] animate-in zoom-in-95 duration-200">
               {reportSuccess ? (
                  <div className="text-center py-8">
                     <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
                     </div>
                     <h3 className="text-2xl font-black text-gray-900 dark:text-gray-50 uppercase tracking-tighter">Report Saved!</h3>
                     <p className="text-gray-500 mt-2 font-medium">Thank you for helping others.</p>
                  </div>
               ) : (
                  <>
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-gray-50 uppercase tracking-tighter">Report Crowd</h3>
                        <button onClick={() => setSelectedBus(null)}><X className="text-gray-400 hover:text-gray-600" /></button>
                     </div>
                     <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">How crowded is bus <strong className="text-gray-900 dark:text-gray-50">{selectedBus.reg}</strong> right now?</p>
                     
                     <div className="space-y-3">
                        <button onClick={() => handleReport(20)} className="w-full p-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 text-emerald-600 rounded-2xl font-black uppercase text-xs tracking-widest text-left flex items-center justify-between transition-all">
                           <span>Plenty of Seats</span> <ChevronRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleReport(60)} className="w-full p-4 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/10 text-amber-600 rounded-2xl font-black uppercase text-xs tracking-widest text-left flex items-center justify-between transition-all">
                           <span>Standing Room Only</span> <ChevronRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleReport(95)} className="w-full p-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest text-left flex items-center justify-between transition-all">
                           <span>Packed / Very Full</span> <ChevronRight className="w-4 h-4" />
                        </button>
                     </div>
                  </>
               )}
            </Card>
         </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" /> Live Crowd Analysis
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Real-time occupancy metrics derived from passenger intelligence.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="secondary" className="flex items-center gap-2 flex-grow md:flex-grow-0 shrink-0" onClick={fetchCrowdData}>
            <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
          </Button>
          <div className="relative flex-grow md:w-80">
             <InputField 
                icon={Filter} 
                placeholder="Search Route or Registration..." 
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <Card className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border-none flex items-center gap-4">
          <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
             <h3 className="font-black text-emerald-900 dark:text-emerald-100 uppercase tracking-tighter">Seats Available</h3>
             <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Normal Load (0-40%)</p>
          </div>
        </Card>
        <Card className="p-4 bg-amber-50 dark:bg-amber-900/10 border-none flex items-center gap-4">
          <div className="bg-amber-500 p-3 rounded-2xl text-white shadow-lg shadow-amber-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
             <h3 className="font-black text-amber-900 dark:text-amber-100 uppercase tracking-tighter">Standing Room</h3>
             <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Medium Load (41-80%)</p>
          </div>
        </Card>
        <Card className="p-4 bg-red-50 dark:bg-red-900/10 border-none flex items-center gap-4">
          <div className="bg-red-500 p-3 rounded-2xl text-white shadow-lg shadow-red-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
             <h3 className="font-black text-red-900 dark:text-red-100 uppercase tracking-tighter">Full Capacity</h3>
             <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Packed (81-100%)</p>
          </div>
        </Card>
      </div>

      <div className="space-y-4 relative">
        {loading ? (
           <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4 opacity-20" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing Cloud Intelligence...</p>
           </div>
        ) : (
           <>
              {crowdBuses
                  .filter(b => 
                      b.reg.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      b.routeNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      b.destination.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((bus, i) => {
                const colors = getColorClasses(bus.color);
                return (
                  <Card 
                     key={i} 
                     onClick={() => navigate(`/bus/${bus.id}`)}
                     className={`overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] cursor-pointer group/card ${selectedBus?.id === bus.id ? 'ring-2 ring-blue-600 border-transparent' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-6">
                      
                      {/* Bus Info */}
                      <div className="flex items-center gap-5 w-full sm:w-auto">
                        <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-[1.5rem] flex items-center justify-center border border-gray-100 dark:border-gray-700 shrink-0 group-hover/card:bg-blue-600 transition-colors">
                          <span className="font-black text-2xl text-gray-900 dark:text-gray-100 group-hover/card:text-white">{bus.routeNo}</span>
                        </div>
                        <div>
                          <h3 className="font-extrabold text-gray-900 dark:text-gray-50 text-xl tracking-tighter group-hover/card:text-blue-600 transition-colors">
                            {bus.reg} <span className="ml-2 text-[10px] font-black text-gray-400 uppercase bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">{bus.type}</span>
                          </h3>
                          <p className="text-sm font-bold text-gray-400 flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4 text-blue-600" /> Towards <span className="text-gray-900 dark:text-gray-100">{bus.destination}</span>
                          </p>
                        </div>
                      </div>

                      {/* Crowd Status Indicator */}
                      <div className="w-full sm:w-1/3 flex items-center gap-6">
                        <div className="flex-grow">
                          <div className="flex justify-between items-end mb-2">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${colors.text}`}>{bus.status}</span>
                            <span className="text-lg font-black text-gray-900 dark:text-gray-50 tracking-tighter">{bus.crowd}%</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                            <div className={`h-full rounded-full ${colors.bg} transition-all duration-1000 shadow-lg`} style={{ width: `${bus.crowd}%`}}></div>
                          </div>
                        </div>
                        <button 
                           onClick={(e) => { e.stopPropagation(); setSelectedBus(bus); }}
                           className={`shrink-0 ${colors.light} ${colors.border} border-4 border-white dark:border-gray-800 rounded-[1.5rem] p-4 shadow-xl transform transition hover:scale-110 active:scale-95 group relative`}
                        >
                          <Users className={`w-8 h-8 ${colors.text}`} />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center animate-bounce">
                             <TrendingUp className="w-2.5 h-2.5 text-white" />
                          </div>
                        </button>
                      </div>

                    </div>
                  </Card>
                );
              })}

              {/* Smart Help Card: ONLY show if search query exists AND results are zero */}
              {searchQuery !== "" && crowdBuses.filter(b => 
                      b.reg.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      b.routeNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      b.destination.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                <Card className="mt-12 p-10 bg-gray-900 border-none overflow-hidden relative group animate-in slide-in-from-bottom-5 duration-500">
                   <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="text-center md:text-left">
                         <h3 className="text-white text-3xl font-black tracking-tighter uppercase mb-3">
                           No results for "{searchQuery}"
                         </h3>
                         <p className="text-blue-100 font-medium max-w-lg">
                           We couldn't find a live bus matching your search. It might be offline, out of coverage, or you can try searching visually on the live map.
                         </p>
                      </div>
                      <Button 
                         onClick={() => navigate('/live')}
                         className="bg-blue-600 text-white hover:bg-blue-700 border-none px-12 h-16 font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-transform hover:scale-[1.05]"
                      >
                         Open Live Map
                      </Button>
                   </div>
                   <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000"></div>
                   <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
                </Card>
              )}
           </>
        )}
      </div>

    </div>
  );
};

export default CrowdStatus;

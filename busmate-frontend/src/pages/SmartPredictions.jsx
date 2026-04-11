import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Clock, Calendar, CloudRain, AlertTriangle, Loader2 } from 'lucide-react';
import Card from '../components/common/Card';

const SmartPredictions = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:4000/site/predictions');
        const json = await res.json();
        if (json.success) {
          setData(json.predictions);
        }
      } catch (err) {
        console.error('Error fetching predictions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/site/predictions');
      const json = await res.json();
      if (json.success) {
        setData(json.predictions);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      // Small artificial delay for "scanning" feel
      setTimeout(() => setLoading(false), 800);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] mt-16">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-black uppercase tracking-widest text-xs animate-pulse">Running AI Simulations...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-950 to-blue-900 rounded-[3rem] p-8 md:p-12 mb-10 text-white relative overflow-hidden shadow-2xl border border-white/5 group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from)_0%,_transparent_50%)] from-blue-500/20 opacity-50"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4 group-hover:bg-blue-500/20 transition-colors duration-1000"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="bg-blue-600/30 p-5 rounded-[2rem] backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 to-transparent"></div>
              <Zap className="w-10 h-10 text-yellow-400 fill-yellow-400/20 relative z-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-none">Intelligence Core</h1>
              <div className="flex items-center gap-3 mt-3">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                 <p className="text-blue-200/50 font-black tracking-[0.4em] uppercase text-[10px]">BusMate Neural Network • Active Scanning</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            className="w-full md:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5 active:scale-95"
          >
            <TrendingUp className="w-4 h-4 text-blue-300" /> Re-Scan Node
          </button>
        </div>
        <p className="text-indigo-100/70 max-w-2xl text-lg font-medium leading-relaxed mt-10 border-l-2 border-blue-500/30 pl-6">
          Synthesizing historical patterns, live node telemetry, and crowd density to predict your optimal transit window with 94.2% accuracy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Best Time to Travel Widget */}
        <Card className="p-8 border-none bg-white dark:bg-gray-900/50 backdrop-blur-sm shadow-2xl lg:col-span-2 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-50 flex items-center gap-3 uppercase tracking-tight">
                <Clock className="w-6 h-6 text-emerald-500" /> Dispatch Density
              </h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Historical Crowd Intelligence Matrix</p>
            </div>
            <div className="px-5 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-emerald-600">
              Live Sync Active
            </div>
          </div>
          
          {/* Graph Area */}
          <div className="h-64 w-full bg-gray-50/50 dark:bg-black/20 rounded-[2rem] relative flex items-end justify-between px-6 pt-12 pb-8 border border-gray-100/50 dark:border-gray-800/50 group/graph">
            {data.crowdGraph.map((point) => {
              const height = `${point.level}%`;
              const isHigh = point.level > 70;
              const isLow = point.level < 35;
              
              return (
                <div key={point.hour} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-xl whitespace-nowrap z-20 shadow-2xl">
                    LOAD: {point.level}%
                  </div>

                  {/* The Bar itself */}
                  <div 
                    className={`w-6 sm:w-8 md:w-10 rounded-t-xl mb-3 shadow-lg border-x border-t border-white/10 transition-all duration-700 ${
                      isLow ? 'bg-emerald-500' : (isHigh ? 'bg-rose-500' : 'bg-amber-500')
                    }`}
                    style={{ height: `${point.level}%`, minHeight: '12px' }}
                  ></div>

                  <span className="text-[9px] text-gray-400 dark:text-gray-500 font-extrabold pb-2">{point.label}</span>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 flex gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 justify-center border-t border-gray-50 dark:border-gray-800 pt-6">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></span> Low Density</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50"></span> Medium</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50"></span> Congested</span>
          </div>
        </Card>

        <div className="space-y-8">
           {/* Weather Impact */}
          <Card className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-2xl rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-blue-100/80">
              <CloudRain className="w-5 h-5 text-blue-200" /> Enviro-Status
            </h3>
            <div className="text-center py-6 relative z-10 transition-transform group-hover:scale-110 duration-500">
              <CloudRain className="w-20 h-20 text-white mx-auto mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
              <h4 className="font-black text-3xl uppercase tracking-tighter">{data.weather.condition}</h4>
              <p className="text-sm text-blue-100 font-bold mt-3 uppercase tracking-widest opacity-70">Impact: {data.weather.impact} Node Delay</p>
            </div>
            <div className="mt-6 bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10 text-xs font-bold leading-relaxed relative z-10">
              <span className="block text-[9px] font-black uppercase tracking-widest text-blue-200 mb-1">AI Recommendation:</span>
              {data.weather.advice}
            </div>
          </Card>

          {/* Efficiency Trend */}
          <Card className="p-8 border-none bg-gray-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full blur-[50px]"></div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-gray-400">
              <TrendingUp className="w-5 h-5 text-purple-500" /> System Integrity
            </h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">On-Time Performance</span>
                  <span className="text-2xl font-black text-emerald-400">{data.efficiency}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden p-0.5 border border-gray-700">
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{ width: `${data.efficiency}%` }}></div>
                </div>
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-loose">
                Overall node efficiency is currently within optimal operational parameters based on last 24h dispatch logs.
              </p>
            </div>
          </Card>
        </div>

        {/* Disruptions Predictions */}
        <Card className="p-8 lg:col-span-3 border-none bg-white dark:bg-gray-900/50 backdrop-blur-md shadow-2xl rounded-[3rem]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-50 flex items-center gap-3 uppercase tracking-tight">
                <AlertTriangle className="w-6 h-6 text-amber-500" /> Anomaly Detection
              </h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Active disruption forecasting across regional nodes</p>
            </div>
            <div className="hidden sm:flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">High Risk</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Stable Node</span>
               </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {data.risks.map((risk) => (
              <div key={risk.id} className="group bg-gray-50/50 dark:bg-black/20 rounded-[2.5rem] p-6 border border-gray-100 dark:border-gray-800 transition-all hover:border-blue-500/30 hover:bg-white dark:hover:bg-gray-900 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-700 group-hover:bg-blue-600 transition-colors">
                      <span className="text-xl font-black text-gray-900 dark:text-white group-hover:text-white">{risk.routeNo}</span>
                    </div>
                    <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                      risk.risk > 50 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {risk.risk}% Prob
                    </span>
                  </div>
                  <h4 className="font-black text-gray-900 dark:text-white uppercase text-sm tracking-tight mb-2">{risk.name}</h4>
                  <p className="text-[11px] text-gray-500 font-bold leading-relaxed">{risk.message}</p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                    <span className="text-gray-400">Risk Matrix</span>
                    <span className={risk.risk > 50 ? 'text-rose-500' : 'text-emerald-500'}>{risk.status}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${risk.risk > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${risk.risk}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
      </div>
    </div>
  );
};

export default SmartPredictions;

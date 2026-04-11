import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Map, ChevronLeft, Search } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Timetable = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [activeTab, setActiveTab] = useState('weekday');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:4000/site/routes/${id}/timetable`);
        const data = await response.json();
        if (data.success) {
          setRouteInfo(data.routeInfo);
          setScheduleData(data.scheduleData);
        } else {
          console.error('Timetable sync failed:', data.message);
        }
      } catch (error) {
        console.error('Timetable sync failed', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [id]);

  const filteredData = scheduleData.filter(node =>
    !searchTerm ||
    node.time?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.busPlate?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] mt-16">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.8)]"></div>
          </div>
        </div>
        <p className="text-gray-500 font-black uppercase tracking-[0.3em] mt-8 animate-pulse text-xs">Downloading Timetable Matrix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[95%] 2xl:max-w-[85%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-gray-200 dark:border-gray-800 pb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-500 font-black uppercase tracking-widest text-[10px] mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Return to Network
          </button>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20">
              {routeInfo?.id}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {routeInfo?.name}
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              {routeInfo?.status}
            </span>
            <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
              {scheduleData.length} Scheduled Trips
            </span>
            <span className="text-gray-400 text-[10px]">·</span>
            <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
              {routeInfo?.busesOnRoute} {routeInfo?.busesOnRoute === 1 ? 'Bus' : 'Buses'} Assigned
            </span>
          </div>
        </div>

        <Button
          onClick={() => navigate('/live')}
          className="uppercase text-[10px] font-black tracking-widest px-8 py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl flex items-center gap-2"
        >
          <Map className="w-4 h-4" /> Live Tracking
        </Button>
      </div>

      {/* Controls */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-900/50 p-4 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-lg backdrop-blur-sm">
          {/* Weekday / Weekend Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-[1.5rem] w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('weekday')}
              className={`flex-1 sm:px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'weekday'
                  ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-md'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Weekdays
            </button>
            <button
              onClick={() => setActiveTab('weekend')}
              className={`flex-1 sm:px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'weekend'
                  ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-md'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Weekends
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative group w-full sm:w-64">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
            <div className="relative flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/50 rounded-2xl h-12">
              <Search className="w-4 h-4 text-gray-400 ml-4 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search time or plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent pl-3 pr-4 text-[10px] font-bold outline-none text-gray-900 dark:text-white placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <Card className="border-none bg-white dark:bg-gray-900/40 shadow-2xl rounded-[2rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700/50">
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center w-36">Time</th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Bus Identifier</th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Load Forecast</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Clock className="w-10 h-10 text-gray-300 dark:text-gray-700" />
                        <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">
                          {searchTerm ? `No trips matching "${searchTerm}"` : 'No schedule data found for this route.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((node, i) => (
                    <tr key={node.id || i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-5 px-6 text-center">
                        <div className="inline-block bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl text-gray-900 dark:text-white font-black text-xs tracking-wider border border-gray-200 dark:border-gray-700">
                          {node.time}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          {node.status === 'Active Sync' ? (
                            <>
                              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{node.status}</span>
                            </>
                          ) : node.status === 'Departed' ? (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{node.status}</span>
                            </>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{node.status}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-widest uppercase">{node.busPlate}</span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1 items-end">
                            <div className={`w-1.5 h-3 rounded-full ${['Low','Medium','High'].includes(node.capacity) ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                            <div className={`w-1.5 h-4 rounded-full ${['Medium','High'].includes(node.capacity) ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                            <div className={`w-1.5 h-5 rounded-full ${node.capacity === 'High' ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{node.capacity}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Timetable;

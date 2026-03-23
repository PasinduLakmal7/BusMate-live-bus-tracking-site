import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bus, Users, Clock, Compass, Bell, Play } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const BusDetails = () => {
  const { id } = useParams();
  
  // Mock Data
  const busNumber = id || '138';
  
  const upcomingStops = [
    { name: 'Townhall Junction', eta: '2 mins', status: 'Next', crowdedness: 'High' },
    { name: 'Viharamahadevi Park', eta: '6 mins', status: 'Upcoming', crowdedness: 'Medium' },
    { name: 'Nelum Pokuna', eta: '9 mins', status: 'Upcoming', crowdedness: 'Low' },
    { name: 'Kollupitiya', eta: '18 mins', status: 'Upcoming', crowdedness: 'Medium' },
  ];

  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      
      {/* Overview Card */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 shadow-xl">
              <Bus className="w-12 h-12 text-white" />
            </div>
            <div>
              <span className="bg-blue-400 text-blue-900 text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block shadow-sm">Route {busNumber}</span>
              <h1 className="text-3xl font-extrabold tracking-tight">WP-NC 4832</h1>
              <p className="text-blue-100 font-medium mt-1">Operator: SLTB • Air Conditioned</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
              <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Passanger Load</p>
              <p className="text-xl font-bold flex items-center justify-center gap-1"><Users className="w-5 h-5" /> 78%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
              <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Speed</p>
              <p className="text-xl font-bold flex items-center justify-center gap-1"><Compass className="w-5 h-5" /> 45 <span className="text-sm font-normal">km/h</span></p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            GPS Tracker Active
          </div>
          <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 text-sm">
             <Bell className="w-4 h-4 mr-1" /> Alert me when nearby
          </Button>
        </div>
      </Card>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Next Stops Timeline */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-400" /> Upcoming Stops
          </h2>
          
          <Card className="p-6">
            <div className="relative border-l-2 border-dashed border-gray-200 dark:border-gray-600 ml-3 md:ml-4 space-y-8 pb-4">
              {upcomingStops.map((stop, idx) => (
                <div key={idx} className="relative pl-6 md:pl-8">
                  {/* Timeline dot */}
                  {stop.status === 'Next' ? (
                    <span className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white ring-2 ring-blue-500">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                    </span>
                  ) : (
                    <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-500"></span>
                  )}

                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${stop.status === 'Next' ? '' : 'opacity-80'}`}>
                    <div>
                      <Link to={`/stop/${stop.name}`} className="font-bold text-gray-900 dark:text-gray-50 text-lg hover:text-blue-600 transition-colors">
                        {stop.name}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <Users className="w-3.5 h-3.5" /> 
                        {stop.crowdedness} passenger crowd expected
                      </p>
                    </div>
                    
                    <div className={`text-left sm:text-right ${stop.status === 'Next' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}>
                      <span className="text-xl font-black block">{stop.eta}</span>
                      <span className="text-xs font-semibold uppercase tracking-wider">ETA</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-4 border-dashed">
              Load all stops
            </Button>
          </Card>
        </div>

        {/* Live Mini Map */}
        <div className="space-y-4">
           <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Live Location</h2>
           <Card className="h-64 sm:h-80 w-full relative bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)", backgroundSize: "15px 15px" }}></div>
             <div className="text-center relative z-10 w-full px-4">
               <div className="bg-blue-600 text-white p-3 rounded-full shadow-xl border-4 border-white inline-block mb-3 cursor-pointer">
                 <Bus className="w-6 h-6" />
               </div>
               <p className="text-gray-500 dark:text-gray-400 font-medium mb-4 text-sm">Map tracking preview</p>
               <Link to="/live">
                 <Button variant="primary" className="shadow-lg text-xs py-1.5 px-3">
                   <Play className="w-3 h-3 mr-1" /> Full Map
                 </Button>
               </Link>
             </div>
           </Card>
        </div>

      </div>
    </div>
  );
};

export default BusDetails;

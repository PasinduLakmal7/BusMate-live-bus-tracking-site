import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bus, Users, Clock, Compass, Bell, Play, Loader2 } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const BusDetails = () => {
  const { id } = useParams();
  const [busData, setBusData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        const res = await fetch(`http://localhost:4000/site/buses/${id}`);
        const data = await res.json();
        if (data.success) {
          setBusData(data.bus);
        }
      } catch (err) {
        console.error("Error fetching bus details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusDetails();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Loading bus details...</p>
    </div>
  );

  if (!busData) return <div className="mt-20 text-center">Bus not found</div>;

  const upcomingStops = [
    { name: 'Loading...', eta: '-- mins', status: 'Next', crowdedness: 'Medium' },
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
              <span className="bg-blue-400 text-blue-900 text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block shadow-sm">Verified Bus #{busData.id}</span>
              <h1 className="text-3xl font-extrabold tracking-tight uppercase">{busData.busNumber}</h1>
              <p className="text-blue-100 font-medium mt-1">Depot: {busData.depotName} • {busData.type || 'Standard'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
              <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Passanger Load</p>
              <p className="text-xl font-bold flex items-center justify-center gap-1"><Users className="w-5 h-5" /> Normal</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
              <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Speed</p>
              <p className="text-xl font-bold flex items-center justify-center gap-1"><Compass className="w-5 h-5" /> -- <span className="text-sm font-normal">km/h</span></p>
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
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
              <Clock className="w-10 h-10 mb-2" />
              <p>Live schedule data unavailable</p>
              <Link to="/live" className="text-blue-600 hover:underline mt-2 text-sm">Track on full map</Link>
            </div>
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

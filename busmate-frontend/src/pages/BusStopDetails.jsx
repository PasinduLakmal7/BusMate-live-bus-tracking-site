import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Navigation, Clock, Users, Coffee, Shield, Loader2 } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const BusStopDetails = () => {
  const { id } = useParams();
  const [stopData, setStopData] = useState(null);
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStopDetails = async () => {
      try {
        const res = await fetch(`http://localhost:4000/site/stops/${id}`);
        const data = await res.json();
        if (data.success) {
          setStopData(data.stop);
          setArrivals(data.arrivals);
        }
      } catch (err) {
        console.error("Error fetching stop details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStopDetails();
  }, [id]);

  const getCrowdColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-amber-600 bg-amber-100';
      case 'Low': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Loading stop details...</p>
    </div>
  );

  if (!stopData) return <div className="mt-20 text-center">Stop not found</div>;

  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      {/* Header & Map Slice */}
      <Card className="mb-8 overflow-hidden">
        <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 relative">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(#94a3b8 2px, transparent 2px)", backgroundSize: "20px 20px" }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-blue-600 text-white p-3 rounded-full shadow-lg border-4 border-white">
              <MapPin className="w-8 h-8" />
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">{stopData.stop_name}</h1>
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">Bus Stop Code: #{stopData.stop_id}</span>
            </div>
            <Button className="flex items-center gap-2">
              <Navigation className="w-4 h-4" /> Navigate Here
            </Button>
          </div>
        </div>
      </Card>

      {/* Arriving Buses */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" /> Scheduled Arrivals
      </h2>
      
      <div className="space-y-4">
        {arrivals.length > 0 ? arrivals.map((bus, idx) => (
          <Link to={`/live`} key={idx} className="block group">
            <Card hover className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="bg-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-md">
                  {bus.routeNumber}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-50">Towards {bus.destination}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    Departure Time: {bus.startTime}
                  </div>
                </div>
              </div>
              
              <div className="text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 border-gray-100 dark:border-gray-700 pt-3 sm:pt-0">
                <span className="text-2xl font-black text-emerald-500">
                  {bus.startTime.slice(0, 5)}
                </span>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Scheduled</span>
              </div>
            </Card>
          </Link>
        )) : (
          <p className="text-center py-10 text-gray-500">No scheduled arrivals for this route today.</p>
        )}
      </div>
    </div>
  );
};

export default BusStopDetails;


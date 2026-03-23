import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Navigation, Clock, Users, Coffee, Shield } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const BusStopDetails = () => {
  const { id } = useParams();
  
  // Mock Data
  const stopName = id ? `${id} Stop` : 'Townhall Junction';
  
  const arrivingBuses = [
    { route: '138', destination: 'Fort', eta: '2 mins', crowd: 'High', color: 'red' },
    { route: '120', destination: 'Piliyandala', eta: '5 mins', crowd: 'Medium', color: 'amber' },
    { route: '154', destination: 'Angulana', eta: '12 mins', crowd: 'Low', color: 'emerald' },
  ];

  const getCrowdColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-amber-600 bg-amber-100';
      case 'Low': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      {/* Header & Map Slice */}
      <Card className="mb-8 overflow-hidden">
        <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 relative">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(#94a3b8 2px, transparent 2px)", backgroundSize: "20px 20px" }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-blue-600 text-white p-3 rounded-full shadow-lg border-4 border-white">
              <MapPin className="w-8 h-8" />
            </div>
          </div>
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-md cursor-pointer hover:bg-white transition-colors">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">Open Full Map</span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">{stopName}</h1>
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">Bus Stop Code: #45920</span>
            </div>
            <Button className="flex items-center gap-2">
              <Navigation className="w-4 h-4" /> Navigate Here
            </Button>
          </div>

          <div className="flex gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
              <Coffee className="w-4 h-4 text-amber-600" /> Food nearby
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
              <Shield className="w-4 h-4 text-blue-600" /> Police post: 500m
            </div>
          </div>
        </div>
      </Card>

      {/* Arriving Buses */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" /> Live Arrivals
      </h2>
      
      <div className="space-y-4">
        {arrivingBuses.map((bus, idx) => (
          <Link to={`/bus/${bus.route}`} key={idx} className="block group">
            <Card hover className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="bg-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-md">
                  {bus.route}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-50">Towards {bus.destination}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className={`px-2 py-0.5 rounded-md font-medium text-xs flex items-center gap-1 ${getCrowdColor(bus.crowd)}`}>
                      <Users className="w-3 h-3" /> {bus.crowd} Crowd
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 border-gray-100 dark:border-gray-700 pt-3 sm:pt-0">
                <span className={`text-2xl font-black ${bus.color === 'red' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {bus.eta}
                </span>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Live ETA</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BusStopDetails;

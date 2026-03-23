import React, { useState } from 'react';
import { Map as MapIcon, Filter, Layers, Crosshair, Bus, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const LiveTracking = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('All');

  // Placeholder data for demonstration
  const activeBuses = [
    { id: 1, route: '138', eta: '2 min', crowd: 'Low', speed: '40 km/h', status: 'On Time' },
    { id: 2, route: '120', eta: '5 min', crowd: 'High', speed: '25 km/h', status: 'Delayed' },
  ];

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full bg-gray-100 dark:bg-gray-700 overflow-hidden pt-16 mt-[-4rem]">
      {/* Map Placeholder */}
      <div className="absolute inset-0 z-0 bg-blue-50/50 flex flex-col items-center justify-center">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#94a3b8 2px, transparent 2px)", backgroundSize: "30px 30px" }}></div>
        <MapIcon className="w-24 h-24 text-blue-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-500 dark:text-gray-400">Interactive Map View</h2>
        <p className="text-gray-400 max-w-md text-center mt-2">
          (Google Maps / OpenStreetMap integration will render here)
        </p>
      </div>

      {/* Floating Header & Search */}
      <div className="absolute top-20 left-4 right-4 md:left-8 md:right-8 z-10 flex flex-col sm:flex-row gap-3">
        <div className="flex-grow bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center p-2 border border-gray-100 dark:border-gray-700">
          <div className="pl-3 pr-2 text-gray-400">
            <Filter className="w-5 h-5" />
          </div>
          <select 
            className="w-full bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-300 py-2 outline-none font-medium text-sm sm:text-base"
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
          >
            <option value="All">All Routes</option>
            <option value="138">138 - Maharagama / Fort</option>
            <option value="120">120 - Piliyandala / Fort</option>
            <option value="177">177 - Kaduwela / Kollupitiya</option>
          </select>
          <Button 
            variant="ghost" 
            className="ml-2 text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 sm:px-4 sm:py-2 flex items-center justify-center border-none"
            onClick={() => setShowFilters(!showFilters)}
          >
            <LevelsIcon />
          </Button>
        </div>
      </div>

      {/* Map Content Overlay / Fake Map Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Fake Bus Marker 1 */}
        <div className="absolute top-1/3 left-1/4 animate-bounce pointer-events-auto cursor-pointer group">
          <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white">
            <Bus className="w-5 h-5" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 text-xs font-bold py-1 px-2 rounded shadow-md whitespace-nowrap">
            Route 138
          </div>
        </div>

        {/* Fake Bus Marker 2 */}
        <div className="absolute top-1/2 right-1/3 pointer-events-auto cursor-pointer group">
          <div className="bg-amber-500 text-white p-2 rounded-full shadow-lg border-2 border-white">
            <Bus className="w-5 h-5" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 text-xs font-bold py-1 px-2 rounded shadow-md whitespace-nowrap">
            Route 120 (Delayed)
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute right-4 bottom-24 sm:bottom-8 z-10 flex flex-col gap-3">
        <button className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Layers className="w-6 h-6" />
        </button>
        <button className="bg-blue-600 p-3 rounded-full shadow-lg text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Crosshair className="w-6 h-6" />
        </button>
      </div>

      {/* Bus Info Bottom Sheet (Mobile) / Side Panel (Desktop) */}
      <div className="absolute bottom-0 left-0 right-0 sm:left-4 sm:bottom-4 sm:right-auto sm:w-80 z-20">
        <Card className="rounded-b-none sm:rounded-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] sm:shadow-xl border-b-0 sm:border-b">
          <div className="p-1 flex justify-center sm:hidden">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2"></div>
          </div>
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-50 text-lg flex items-center gap-2">
                  <Bus className="w-5 h-5 text-blue-600" /> Route 138
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Maharagama towards Fort</p>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Live
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <p className="font-semibold text-gray-900 dark:text-gray-50 text-sm">On Time</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-600 mb-1">Crowd Level</p>
                <p className="font-semibold text-amber-700 text-sm">Medium (65%)</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Speed</p>
                <p className="font-semibold text-gray-900 dark:text-gray-50 text-sm">42 km/h</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-600 mb-1">Next Stop ETA</p>
                <p className="font-semibold text-blue-700 text-sm">2 mins</p>
              </div>
            </div>

            <Button className="w-full">
              View Detailed Route
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Helper icon component
const LevelsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"></line>
    <line x1="4" y1="10" x2="4" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="3"></line>
    <line x1="20" y1="21" x2="20" y2="16"></line>
    <line x1="20" y1="12" x2="20" y2="3"></line>
    <line x1="1" y1="14" x2="7" y2="14"></line>
    <line x1="9" y1="8" x2="15" y2="8"></line>
    <line x1="17" y1="16" x2="23" y2="16"></line>
  </svg>
)

export default LiveTracking;

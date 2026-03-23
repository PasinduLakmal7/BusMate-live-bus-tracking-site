import React, { useState } from 'react';
import { MapPin, Navigation, ArrowDownUp, Clock, Zap, DollarSign, ChevronDown } from 'lucide-react';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import Card from '../components/common/Card';

const RoutePlanner = () => {
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowResults(true);
  };

  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Planner Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 relative border-t-4 border-t-blue-600">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-6">Plan Your Journey</h2>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <InputField 
                  icon={MapPin} 
                  placeholder="Where are you starting?" 
                  className="mb-3"
                  defaultValue="Current Location"
                />
                <Button 
                  type="button"
                  variant="ghost" 
                  className="absolute right-2 top-1.5 p-1.5 text-blue-600 hover:bg-blue-50"
                  title="Use precise location"
                >
                  <Navigation className="w-4 h-4" />
                </Button>
                
                <div className="absolute left-6 top-[2.75rem] bottom-[2.75rem] w-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
                
                <Button 
                  type="button"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm p-1.5 rounded-full hover:bg-gray-50 z-10"
                >
                  <ArrowDownUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </Button>

                <InputField 
                  icon={MapPin} 
                  placeholder="Where do you want to go?" 
                  className="text-red-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <select className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none">
                  <option>Leave Now</option>
                  <option>Depart At</option>
                  <option>Arrive By</option>
                </select>
                <input 
                  type="time" 
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
                  defaultValue="10:00"
                />
              </div>

              <Button type="submit" className="w-full mt-4 py-3 text-base shadow-md">
                Find Routes
              </Button>
            </form>
          </Card>

          {/* Results List */}
          {showResults && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <h3 className="font-bold text-gray-900 dark:text-gray-50 flex justify-between items-center">
                Suggested Routes
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">Sorted by best match</span>
              </h3>

              {/* Route Option 1 (Fastest) */}
              <Card hover className="p-4 border-l-4 border-l-emerald-500 ring-2 ring-emerald-500/20">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">Fastest</span>
                    <span className="font-bold text-gray-900 dark:text-gray-50 text-lg">35 min</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">Rs. 120</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm mb-4">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">138</span>
                  <span className="text-gray-400">→</span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-medium">Walk 5m</span>
                  <span className="text-gray-400">→</span>
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">120</span>
                </div>
                
                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 10:15 AM - 10:50 AM</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> Medium Crowd</span>
                </div>
              </Card>

              {/* Route Option 2 (Least Crowded) */}
              <Card hover className="p-4 border-l-4 border-l-transparent">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">Comfortable</span>
                    <span className="font-bold text-gray-900 dark:text-gray-50 text-lg">45 min</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">Rs. 150</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm mb-4">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">EX-1</span>
                  <span className="text-gray-400">→</span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-medium">Walk 2m</span>
                </div>
                
                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 10:30 AM - 11:15 AM</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-emerald-500" /> Low Crowd</span>
                </div>
              </Card>

              {/* Route Option 3 (Cheapest) */}
              <Card hover className="p-4 border-l-4 border-l-transparent opacity-80">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><DollarSign className="w-3 h-3" /> Cheapest</span>
                    <span className="font-bold text-gray-900 dark:text-gray-50 text-lg">55 min</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">Rs. 80</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm mb-4">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">120</span>
                </div>
                
                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 10:10 AM - 11:05 AM</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-red-500" /> High Crowd</span>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Map Preview Area (Desktop) */}
        <div className="hidden lg:block lg:col-span-2">
          {showResults ? (
            <Card className="h-full min-h-[600px] w-full relative bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-500">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(#94a3b8 2px, transparent 2px)", backgroundSize: "30px 30px" }}></div>
              <div className="relative z-10 text-center max-w-md bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm">
                <Navigation className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-2">Interactive Route Map</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  The detailed turn-by-turn map view and polyline rendering will be displayed here using the Google Maps API.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span> Start
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span> End
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full min-h-[600px] w-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center border-none shadow-none text-center p-8">
              <MapPin className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-400">Enter your destination to see route options</h3>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;

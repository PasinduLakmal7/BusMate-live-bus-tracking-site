import React, { useState, useEffect } from 'react';
import { Search, Map, Clock, AlertCircle, Loader2 } from 'lucide-react';
import InputField from '../components/common/InputField';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const RoutesSchedules = () => {
  const [searchTerm, setSearchTerm] = useState('');
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading routes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">Routes & Schedules</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Find timetables and details for all available bus routes.</p>
        </div>
        <div className="w-full md:w-72">
          <InputField 
            icon={Search} 
            placeholder="Search route number or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredRoutes.map((route) => (
          <Card key={route.dbId} className="overflow-hidden flex flex-col md:flex-row">
            
            {/* Route Header Mobile / Side Banner Desktop */}
            <div className={`p-6 ${route.color} text-white flex flex-col justify-center items-center md:w-48 flex-shrink-0`}>
              <span className="text-4xl font-black">{route.id}</span>
              <span className="text-sm font-medium mt-2 text-center opacity-90">{route.name.split(' - ')[0]}</span>
              <span className="text-xs opacity-70">to</span>
              <span className="text-sm font-medium text-center opacity-90">{route.name.split(' - ')[1]}</span>
            </div>

            {/* Route Details */}
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">{route.name}</h3>
                  {route.status === 'Active' ? (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">Active</span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {route.status}
                    </span>
                  )}
                </div>
                
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Service Details:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Reliable service connecting {route.name.split(' - ')[0]} and {route.name.split(' - ')[1]}. 
                  Check the live map for current bus positions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Frequency: <span className="font-semibold text-gray-900 dark:text-gray-50">{route.frequency}</span>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="secondary" className="flex-1 sm:flex-none">
                    View Timetable
                  </Button>
                  <Button className="flex-1 sm:flex-none gap-2">
                    <Map className="w-4 h-4" /> Live Map
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredRoutes.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50 mb-1">No routes found</h3>
            <p className="text-gray-500 dark:text-gray-400">We couldn't find any route matching "{searchTerm}".</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutesSchedules;


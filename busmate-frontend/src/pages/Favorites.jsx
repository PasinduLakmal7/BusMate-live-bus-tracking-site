import React from 'react';
import { Star, MapPin, Bus, Navigation, Trash2, Plus } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const savedRoutes = [
    { id: '138', name: 'Home to Work', from: 'Maharagama', to: 'Townhall', type: 'route' },
    { id: '120', name: 'Work to Gym', from: 'Townhall', to: 'Piliyandala', type: 'route' },
  ];

  const savedStops = [
    { id: 's1', name: 'Nugegoda Supermarket', routes: ['138', '119', '163'] },
    { id: 's2', name: 'Bambalapitiya Station', routes: ['100', '101', '154'] },
  ];

  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500" /> Favorites
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Quick access to your most used routes and stops.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Saved Routes Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600" /> Saved Routes
          </h2>
          <div className="space-y-4">
            {savedRoutes.map((route, i) => (
              <Card key={i} hover className="p-4 flex items-center justify-between group">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-xs">{route.id}</span>
                    <h3 className="font-bold text-gray-900 dark:text-gray-50">{route.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{route.from}</span>
                    <span className="text-gray-300">→</span>
                    <span>{route.to}</span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" className="p-2 h-auto text-blue-600 hover:text-blue-700">
                    <Navigation className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" className="p-2 h-auto text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
            
            <Card hover className="p-4 border-dashed border-2 bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 hover:text-blue-600 cursor-pointer">
              <Plus className="w-5 h-5 mr-2" /> Add a frequent route
            </Card>
          </div>
        </div>

        {/* Saved Stops Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" /> Saved Stops
          </h2>
          <div className="space-y-4">
            {savedStops.map((stop, i) => (
              <Card key={i} hover className="p-4 flex flex-col group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-gray-50">{stop.name}</h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/stop/${encodeURIComponent(stop.name)}`}>
                      <Button variant="secondary" className="p-2 h-auto text-blue-600">
                        View Live
                      </Button>
                    </Link>
                    <Button variant="secondary" className="p-2 h-auto text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {stop.routes.map(r => (
                    <span key={r} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                      {r}
                    </span>
                  ))}
                </div>
              </Card>
            ))}

            <Card hover className="p-4 border-dashed border-2 bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 hover:text-emerald-600 cursor-pointer">
              <Plus className="w-5 h-5 mr-2" /> Save a nearby stop
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;

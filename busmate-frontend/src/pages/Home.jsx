import React from 'react';
import { Link } from 'react-router-dom';
import heroBg from '../assets/hero-bg.jpg';
import { Search, Map, MapPin, Compass, AlertTriangle, Clock, Zap, Star } from 'lucide-react';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import Card from '../components/common/Card';

const Home = () => {
  return (
    <div className="pt-16 pb-10">
      {/* Hero Section */}
      <section className="relative text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image & Shaders */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat sm:bg-fixed"
          style={{ backgroundImage: `url(${heroBg})` }}
        ></div>
        {/* Modern Shader Overlays - Kept clear so the globe is very visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-blue-900/20"></div>
        <div className="absolute inset-0 bg-blue-800/10 mix-blend-overlay"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center w-full drop-shadow-lg">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-white drop-shadow-2xl">
            Where are you going?
          </h1>
          <p className="text-blue-50 text-lg md:text-xl mb-8 max-w-2xl font-medium drop-shadow-md">
            Live tracking, smart predictions, and seamless travel across the city.
          </p>

          <div className="w-full max-w-3xl bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-2">
            <InputField
              icon={Search}
              placeholder="Enter destination, stop, or route..."
              className="flex-grow text-gray-900 dark:text-gray-50 border-none shadow-none bg-gray-50/50"
            />
            <Button className="w-full sm:w-auto px-8 py-3 text-base shadow-none">
              Search
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Link to="/live" className="group">
            <Card hover className="p-4 flex flex-col items-center justify-center text-center h-full bg-white/90 backdrop-blur-sm shadow-md">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-sm md:text-base">Live Tracking</h3>
            </Card>
          </Link>
          <Link to="/planner" className="group">
            <Card hover className="p-4 flex flex-col items-center justify-center text-center h-full bg-white/90 backdrop-blur-sm shadow-md">
              <div className="bg-purple-100 p-3 rounded-full text-purple-600 mb-3 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-sm md:text-base">Route Planner</h3>
            </Card>
          </Link>
          <Link to="/live" className="group">
            <Card hover className="p-4 flex flex-col items-center justify-center text-center h-full bg-white/90 backdrop-blur-sm shadow-md">
              <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-sm md:text-base">Nearby Buses</h3>
            </Card>
          </Link>
          <Link to="/favorites" className="group">
            <Card hover className="p-4 flex flex-col items-center justify-center text-center h-full bg-white/90 backdrop-blur-sm shadow-md">
              <div className="bg-orange-100 p-3 rounded-full text-orange-600 mb-3 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-sm md:text-base">Saved Routes</h3>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">

            {/* Live Map Preview Placeholder */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" /> Buses Near You
                </h2>
                <Link to="/live" className="text-sm text-blue-600 font-medium hover:underline">View Full Map</Link>
              </div>
              <Card className="h-64 sm:h-80 w-full relative bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
                <div className="text-center relative z-10 w-full px-4">
                  <Map className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">Live map integration will display here</p>
                  <Button variant="primary" className="shadow-lg">
                    <MapPin className="w-4 h-4 mr-2" /> Enable Location
                  </Button>
                </div>
              </Card>
            </section>

            {/* Smart Suggestions */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-amber-500" /> AI Insights
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Card hover className="p-4 border-l-4 border-l-amber-500">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-50 text-sm">Best Time to Travel</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Route 138 is usually least crowded between 10:00 AM and 11:30 AM.</p>
                    </div>
                  </div>
                </Card>
                <Card hover className="p-4 border-l-4 border-l-emerald-500">
                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-50 text-sm">Fastest Route Found</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Taking the Expressway route today will save you 25 minutes to Fort.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">

            {/* Active Alerts Preview */}
            <Card className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" /> Active Alerts
                </h3>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">2 New</span>
              </div>
              <ul className="space-y-4">
                <li className="border-b border-gray-50 dark:border-gray-800 pb-3 last:border-0 last:pb-0">
                  <span className="text-xs font-semibold text-red-600 mb-1 block">Delay • Route 120</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Heavy traffic near Townhall junction. Expect 15 min delays.</p>
                  <span className="text-xs text-gray-400 mt-1 block">Updated 10 mins ago</span>
                </li>
                <li className="pt-1">
                  <span className="text-xs font-semibold text-amber-600 mb-1 block">Reroute • Route 138</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Road closure on Main Street. Buses rerouting via Park Road.</p>
                  <span className="text-xs text-gray-400 mt-1 block">Updated 1 hour ago</span>
                </li>
              </ul>
              <Link to="/alerts" className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700 w-full mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                View all alerts
              </Link>
            </Card>

            {/* Daily Schedule Quick Look */}
            <Card className="p-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" /> Upcoming Dispatches
              </h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-lg block">138</span>
                    <span className="text-xs text-gray-400">Maharagama - Fort</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400 block">5 min</span>
                    <span className="text-xs text-gray-400">On time</span>
                  </div>
                </li>
                <li className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <div>
                    <span className="font-bold text-lg block">120</span>
                    <span className="text-xs text-gray-400">Piliyandala - Fort</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400 block">12 min</span>
                    <span className="text-xs text-gray-400">On time</span>
                  </div>
                </li>
              </ul>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

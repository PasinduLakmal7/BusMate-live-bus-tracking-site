import React, { useState } from 'react';
import { User, Map, History, Bell, Globe, Moon, ChevronRight, LogOut, Edit3 } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const UserDashboard = () => {
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setDarkMode(false);
      window.dispatchEvent(new Event('theme-change')); // Optional sync event
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setDarkMode(true);
      window.dispatchEvent(new Event('theme-change'));
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 pb-20">
      
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-10 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white dark:bg-gray-800 opacity-5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/4"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/20 backdrop-blur-md rounded-full border-4 border-white/30 flex items-center justify-center text-4xl shadow-inner">
              👨🏽‍💻
            </div>
            <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full border-2 border-white shadow-lg transform transition hover:scale-110">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-center sm:text-left mt-2 sm:mt-0 flex-grow">
            <h1 className="text-3xl font-black mb-1">Kasun Silva</h1>
            <p className="text-blue-200 font-medium mb-4">kasun.silva@example.com</p>
            
            <div className="flex justify-center sm:justify-start gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 text-center">
                <p className="text-white text-lg font-bold">142</p>
                <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold">Journeys</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 text-center">
                <p className="text-white text-lg font-bold">8</p>
                <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold">Saved Routes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Settings Area */}
        <div className="md:col-span-2 space-y-6">
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 px-1">Account & Preferences</h2>
          
          <Card className="overflow-hidden divide-y divide-gray-100">
            {/* Nav Item */}
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors group">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-50">Saved Routes & Stops</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your favorite places</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600" />
            </div>

            {/* Nav Item */}
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors group">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-50">Travel History</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">View your past journeys</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-600" />
            </div>

            {/* Nav Item */}
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors group">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 text-amber-600 p-2.5 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-50">Notification Settings</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Control alert preferences</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-amber-600" />
            </div>
          </Card>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 px-1 pt-4">App Settings</h2>

          <Card className="overflow-hidden divide-y divide-gray-100">
            {/* Toggle Item */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 text-purple-600 p-2.5 rounded-xl">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-50">Language</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">English (US)</p>
                </div>
              </div>
              <select className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 outline-none outline-none">
                <option>English</option>
                <option>Sinhala</option>
                <option>Tamil</option>
              </select>
            </div>

            {/* Toggle Item */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="bg-gray-800 text-gray-300 p-2.5 rounded-xl border border-gray-700">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-50">Dark Mode</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Switch app theme</p>
                </div>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-800 transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </Card>

          <Button variant="danger" className="w-full sm:w-auto mt-4 py-3 flex items-center justify-center gap-2 font-bold shadow-md">
            <LogOut className="w-5 h-5" /> Sign Out
          </Button>

        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2">Pro Passenger Tips</h3>
            <p className="text-sm text-blue-800/80 mb-4 leading-relaxed">
              Did you know? Saving your home and work routes allows BusMate to predict the best time to leave based on traffic history.
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm py-2">Set Up Now</Button>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;

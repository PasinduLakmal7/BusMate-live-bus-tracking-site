import React, { useState } from 'react';
import { Users, Filter, Bus, TrendingUp, RefreshCcw } from 'lucide-react';
import Card from '../components/common/Card';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';

const CrowdStatus = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const crowdData = [
    { id: '138', reg: 'WP-NC 4832', type: 'Normal', crowd: 95, status: 'Full', color: 'red', eta: '2 mins' },
    { id: '138', reg: 'WP-ND 1120', type: 'A/C', crowd: 65, status: 'Medium', color: 'amber', eta: '10 mins' },
    { id: '120', reg: 'WP-NB 3940', type: 'Normal', crowd: 30, status: 'Empty', color: 'emerald', eta: '5 mins' },
    { id: '177', reg: 'WP-NC 8821', type: 'Normal', crowd: 80, status: 'High', color: 'red', eta: '12 mins' },
    { id: '154', reg: 'WP-NA 5502', type: 'Normal', crowd: 45, status: 'Medium', color: 'amber', eta: '8 mins' },
  ];

  const getColorClasses = (color) => {
    switch(color) {
      case 'red': return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-200' };
      case 'amber': return { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-50', border: 'border-amber-200' };
      case 'emerald': return { bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50', border: 'border-emerald-200' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-700 dark:text-gray-300', light: 'bg-gray-50 dark:bg-gray-900', border: 'border-gray-200 dark:border-gray-600' };
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" /> Live Crowd Status
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Check seat availability before your bus arrives.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="secondary" className="flex items-center gap-2 flex-grow md:flex-grow-0" onClick={handleRefresh}>
            <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <div className="relative flex-grow md:w-64">
             <InputField icon={Filter} placeholder="Filter route..." className="w-full" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-4 bg-emerald-50 border-emerald-100 flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
             <h3 className="font-bold text-gray-900 dark:text-gray-50">Green (<span className="text-emerald-600">0-40%</span>)</h3>
             <p className="text-sm text-gray-600 dark:text-gray-400">Seats Available</p>
          </div>
        </Card>
        <Card className="p-4 bg-amber-50 border-amber-100 flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-full text-amber-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
             <h3 className="font-bold text-gray-900 dark:text-gray-50">Yellow (<span className="text-amber-600">41-80%</span>)</h3>
             <p className="text-sm text-gray-600 dark:text-gray-400">Standing Room Only</p>
          </div>
        </Card>
        <Card className="p-4 bg-red-50 border-red-100 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-full text-red-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
             <h3 className="font-bold text-gray-900 dark:text-gray-50">Red (<span className="text-red-600">81-100%</span>)</h3>
             <p className="text-sm text-gray-600 dark:text-gray-400">Packed / Full</p>
          </div>
        </Card>
      </div>

      <div className="space-y-4 relative">
        {isRefreshing && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
             <RefreshCcw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}
        
        {crowdData.map((bus, i) => {
          const colors = getColorClasses(bus.color);
          return (
            <Card key={i} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
                
                {/* Bus Info */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="bg-gray-100 dark:bg-gray-700 w-12 h-12 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-600 shrink-0">
                    <span className="font-black text-xl text-gray-800 dark:text-gray-200">{bus.id}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-50 text-lg flex items-center gap-2">
                      {bus.reg} <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{bus.type}</span>
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" /> Arriving in <strong className="text-gray-900 dark:text-gray-50">{bus.eta}</strong>
                    </p>
                  </div>
                </div>

                {/* Crowd Status Indicator */}
                <div className="w-full sm:w-1/2 flex items-center gap-4">
                  <div className="flex-grow">
                    <div className="flex justify-between items-end mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>{bus.status}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-50">{bus.crowd}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div className={`h-2.5 rounded-full ${colors.bg} transition-all duration-1000`} style={{ width: `${bus.crowd}%`}}></div>
                    </div>
                  </div>
                  <div className={`shrink-0 ${colors.light} ${colors.border} border border-2 border-white rounded-full p-2.5 shadow-sm transform transition hover:scale-105`}>
                    <Users className={`w-6 h-6 ${colors.text}`} />
                  </div>
                </div>

              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CrowdStatus;

import React, { useState } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, Filter, Settings, Check } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Alerts = () => {
  const [activeTab, setActiveTab] = useState('All');

  const alerts = [
    {
      id: 1,
      type: 'Delay',
      title: 'Heavy Traffic on High Level Road',
      description: 'Route 138 buses are experiencing 15-20 min delays due to road construction near Nugegoda junction.',
      time: '10 min ago',
      routes: ['138', '122', '125'],
      icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
      bg: 'bg-amber-50',
      border: 'border-l-amber-500'
    },
    {
      id: 2,
      type: 'Accident',
      title: 'Accident near Baseline Road',
      description: 'Major roadblocks near Dematagoda. Routes 154 and 170 are being diverted.',
      time: '1 hour ago',
      routes: ['154', '170'],
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      bg: 'bg-red-50',
      border: 'border-l-red-500'
    },
    {
      id: 3,
      type: 'System',
      title: 'Scheduled Maintenance',
      description: 'The BusMate app will be offline from 2:00 AM to 3:00 AM for scheduled server upgrades.',
      time: '5 hours ago',
      routes: ['All'],
      icon: <Info className="w-5 h-5 text-blue-500" />,
      bg: 'bg-blue-50',
      border: 'border-l-blue-500'
    }
  ];

  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" /> Notifications
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Stay updated with live transit alerts and route changes.</p>
        </div>
        <Button variant="secondary" className="flex items-center gap-2">
          <Settings className="w-4 h-4" /> Manage Subscriptions
        </Button>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
        {['All', 'Delays', 'Accidents', 'Route Changes', 'System'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
              activeTab === tab 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900 dark:text-gray-50">Today</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          <Check className="w-4 h-4" /> Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className={`p-5 border-l-4 ${alert.border} ${alert.bg} relative overflow-hidden`}>
            <div className="flex gap-4">
              <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm self-start shrink-0">
                {alert.icon}
              </div>
              <div>
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-gray-50 text-base">{alert.title}</h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{alert.time}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-3">{alert.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mr-1 flex items-center">Routes affected:</span>
                  {alert.routes.map((route, i) => (
                    <span key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 rounded font-mono font-bold shadow-sm">
                      {route}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {/* Empty state (conditional) */}
        {/* <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50 mb-1">You're all caught up!</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">No new alerts for your subscribed routes.</p>
        </div> */}
      </div>
    </div>
  );
};

export default Alerts;

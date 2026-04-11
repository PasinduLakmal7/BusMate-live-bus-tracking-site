import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, Check, Search, Calendar, MapPin } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

const Alerts = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = '/api/alerts';

  const fetchAlerts = async (type = 'All') => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?type=${type}`);
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts(activeTab);
  }, [activeTab]);

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/read`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
      }
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch(`${API_URL}/mark-all-read`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
      }
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'Delay': return { icon: <AlertCircle className="w-5 h-5 text-amber-500" />, border: 'border-l-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' };
      case 'Accident': return { icon: <AlertTriangle className="w-5 h-5 text-red-500" />, border: 'border-l-red-500', bg: 'bg-red-50 dark:bg-red-900/10' };
      case 'System': return { icon: <Info className="w-5 h-5 text-blue-500" />, border: 'border-l-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' };
      case 'Route Change': return { icon: <MapPin className="w-5 h-5 text-purple-500" />, border: 'border-l-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10' };
      default: return { icon: <Bell className="w-5 h-5 text-gray-500" />, border: 'border-l-gray-300', bg: 'bg-gray-50 dark:bg-gray-800/20' };
    }
  };

  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 min-h-[80vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none">
              <Bell className="w-7 h-7 text-white" />
            </div>
            Notifications
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Stay updated with live transit alerts and route changes.</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all shadow-sm"
        >
          <Calendar className="w-4 h-4" /> Manage Subscriptions
        </Button>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-1">
        {['All', 'Delays', 'Accidents', 'Route Changes', 'System'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-2xl whitespace-nowrap text-sm font-bold transition-all duration-300 ${
              activeTab === tab 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-none -translate-y-0.5' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
           <h3 className="font-black text-gray-900 dark:text-gray-50 text-lg">Timeline</h3>
           <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-lg">Real-time</span>
        </div>
        <button 
          onClick={markAllRead}
          className="text-sm text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1.5 transition-colors group"
        >
          <Check className="w-4 h-4 group-hover:scale-110 transition-transform" /> Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium tracking-tight">Syncing with live stream...</p>
          </div>
        ) : alerts.length > 0 ? (
          alerts.map((alert) => {
            const style = getAlertIcon(alert.type);
            return (
              <Card 
                key={alert.id} 
                className={`p-6 border-l-4 ${style.border} ${style.bg} relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${alert.is_read ? 'opacity-80' : ''}`}
              >
                <div className="flex gap-5">
                  <div className="bg-white dark:bg-gray-800 p-2.5 rounded-2xl shadow-sm self-start shrink-0 border border-gray-100 dark:border-gray-700">
                    {style.icon}
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                       <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-gray-900 dark:text-gray-50 text-lg tracking-tight leading-tight">{alert.title}</h3>
                          {!alert.is_read && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>}
                       </div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100/50 dark:bg-gray-800/50 px-2 py-1 rounded-md self-start">{getRelativeTime(alert.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-4">{alert.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-md">Affecting</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(alert.routes) ? alert.routes : JSON.parse(alert.routes || "[]")).map((route, i) => (
                            <span key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-[11px] px-2.5 py-0.5 rounded-lg font-mono font-black shadow-sm ring-1 ring-black/[0.03]">
                              {route}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {!alert.is_read && (
                        <button 
                          onClick={() => markAsRead(alert.id)}
                          className="ml-auto text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl transition-all"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="bg-gray-50 dark:bg-gray-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
              <Check className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-gray-50 mb-2 tracking-tight">You're all caught up!</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No new alerts for your selected journey types.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;

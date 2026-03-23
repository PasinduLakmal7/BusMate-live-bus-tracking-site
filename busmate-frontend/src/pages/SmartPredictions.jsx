import React from 'react';
import { Zap, TrendingUp, Clock, Calendar, CloudRain, AlertTriangle } from 'lucide-react';
import Card from '../components/common/Card';

const SmartPredictions = () => {
  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Zap className="w-6 h-6 text-yellow-300" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">AI Insights & Predictions</h1>
          </div>
          <p className="text-indigo-100 max-w-2xl text-lg opacity-90">
            Powered by historical data and live traffic parameters, we help you make smarter transit decisions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Best Time to Travel Widget */}
        <Card hover className="p-6 border-t-4 border-t-emerald-500 lg:col-span-2">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" /> Best Time to Travel
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Based on your saved route: 138 (Maharagama - Fort)</p>
            </div>
            <select className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-sm rounded-lg p-2 outline-none">
              <option>Today</option>
              <option>Tomorrow</option>
            </select>
          </div>
          
          {/* Mock Graph Area */}
          <div className="h-48 w-full bg-gray-50 dark:bg-gray-900 rounded-xl relative flex items-end justify-between px-2 pt-8 pb-6 border border-gray-100 dark:border-gray-700">
            {[8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map((hour) => {
              // Creating a fake bell curve distribution for crowd levels
              const height = hour === 8 || hour === 5 ? '80%' 
                           : hour === 9 || hour === 6 ? '95%' 
                           : hour === 12 || hour === 1 ? '60%' 
                           : '30%';
              
              const isLow = parseInt(height) <= 30;
              
              return (
                <div key={hour} className="flex flex-col items-center w-full group relative">
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
                    Crowd: {height}
                  </div>
                  <div 
                    className={`w-2/3 md:w-4/5 rounded-t-sm transition-all duration-500 ${isLow ? 'bg-emerald-400' : (parseInt(height) > 75 ? 'bg-red-400' : 'bg-amber-400')}`}
                    style={{ height: height }}
                  ></div>
                  <span className="text-[10px] text-gray-400 mt-2 font-medium">{hour} {hour < 7 || hour > 11 ? 'PM' : 'AM'}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 justify-center">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> Low</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Medium</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400"></span> High</span>
          </div>
        </Card>

        {/* Weather Impact */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-blue-500" /> Weather Impact
          </h3>
          <div className="text-center py-4">
            <CloudRain className="w-16 h-16 text-blue-400 mx-auto mb-3" />
            <h4 className="font-bold text-gray-900 dark:text-gray-50 text-xl">Heavy Rain Expected</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Expect 20-30% delays across all major routes between 3 PM and 6 PM today.</p>
          </div>
          <div className="mt-4 bg-white dark:bg-gray-800 p-3 rounded-xl border border-blue-100 text-sm">
            <strong className="text-blue-700">AI Advice:</strong> Leave 30 mins earlier for evening commute.
          </div>
        </Card>

        {/* Weekly Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" /> Weekly Commute Trend
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Average Travel Time</span>
              <span className="font-bold text-gray-900 dark:text-gray-50">45 mins</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
            
            <div className="flex justify-between items-center text-sm pt-2">
              <span className="text-gray-600 dark:text-gray-400 font-medium">On-time Performance</span>
              <span className="font-bold text-emerald-600">82%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>
        </Card>

        {/* Disruptions Predictions */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Disruption Probability
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-50">Route 138</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">High Level Rd Expansion</p>
                </div>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">75% Risk</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">High probability of traffic build-up after 4:00 PM due to ongoing roadworks.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-50">Route 120</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Normal Conditions</p>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">Low Risk</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Smooth flow expected. Minor delays possible near Kohuwala junction.</p>
            </div>
          </div>
        </Card>
        
      </div>
    </div>
  );
};

export default SmartPredictions;

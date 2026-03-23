import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Map, Smartphone, Globe } from 'lucide-react';
import logo from '../../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 pt-10 pb-6 mt-auto">
      <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand & description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 group mb-4">
              <img src={logo} alt="BusMate Logo" className="w-8 h-8 object-contain drop-shadow-md group-hover:scale-105 transition-transform rounded-lg" />
              <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-gray-50">BusMate</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Your intelligent companion for seamless public transport navigation. Real-time tracking, AI predictions, and route planning.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/live" className="hover:text-blue-600 transition-colors">Live Tracking</Link></li>
              <li><Link to="/planner" className="hover:text-blue-600 transition-colors">Route Planner</Link></li>
              <li><Link to="/routes" className="hover:text-blue-600 transition-colors">All Schedules</Link></li>
              <li><Link to="/predictions" className="hover:text-blue-600 transition-colors">Smart Insights</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/help" className="hover:text-blue-600 transition-colors">Help Center</Link></li>
              <li><Link to="/help" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
              <li><Link to="/alerts" className="hover:text-blue-600 transition-colors">System Status</Link></li>
            </ul>
          </div>

          {/* Connect & Language */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-4">Connect With Us</h4>
            <div className="flex gap-4 mb-6">
              <a href="#" className="p-2 bg-gray-50 dark:bg-gray-900 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="p-2 bg-gray-50 dark:bg-gray-900 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-400 hover:bg-blue-50 transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 bg-gray-50 dark:bg-gray-900 rounded-full text-gray-500 dark:text-gray-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"><Instagram className="w-4 h-4" /></a>
            </div>
            <div className="flex items-center gap-2">
              <select className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 outline-none">
                <option value="en">English</option>
                <option value="si">Sinhala</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            © {new Date().getFullYear()} BusMate © 2026 • Powered by QuadNova. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
            <Link to="#" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

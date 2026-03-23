import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, MapPin, Search, ChevronRight, Menu, X, Bell, User, Sun, Moon } from 'lucide-react';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Live Tracking', path: '/live', icon: <Map className="w-5 h-5" /> },
    { name: 'Route Planner', path: '/planner', icon: <MapPin className="w-5 h-5" /> },
    { name: 'Analytics', path: '/predictions', icon: <Search className="w-5 h-5" /> },
  ];

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      // eslint-disable-next-line
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      // eslint-disable-next-line
      setIsDark(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Brand */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <img src={logo} alt="BusMate Logo" className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-105 transition-transform rounded-xl" />
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">BusMate</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive(link.path) 
                    ? 'text-blue-600' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Quick Actions (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              type="button"
              onClick={toggleDarkMode} 
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/alerts" className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900"></span>
            </Link>
            <Link to="/dashboard" className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition-colors text-sm font-medium flex items-center gap-2">
              <User className="w-5 h-5" />
            </Link>
            <Link to="/live" className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-all transform hover:scale-105 shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-2">
              Track Bus <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button 
              type="button"
              onClick={toggleDarkMode} 
              className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-lg absolute w-full animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2">
            <Link
              to="/live"
              onClick={() => setIsOpen(false)}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-medium shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Track Bus Now <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

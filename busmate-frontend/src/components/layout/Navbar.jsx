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
    <nav className="fixed w-full top-0 z-50 bg-[#0a0a0c]/90 dark:bg-[#0a0a0c]/95 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl transition-all duration-300">
      <div className="max-w-[95%] 2xl:max-w-[85%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Brand */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <img src={logo} alt="BusMate Logo" className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-transform rounded-xl" />
              <span className="font-bold text-xl tracking-tight text-white invisible sm:visible">BusMate</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center bg-gray-800/20 px-6 py-1.5 rounded-full border border-gray-700/30 space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2 text-sm font-medium transition-all hover:scale-105 ${
                  isActive(link.path) 
                    ? 'text-blue-500' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Quick Actions (Desktop) */}
          <div className="hidden lg:flex items-center space-x-5">
            <button 
              type="button"
              onClick={toggleDarkMode} 
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full transition-all"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/alerts" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border border-[#0a0a0c]"></span>
            </Link>
            <Link to="/dashboard" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full transition-all">
              <User className="w-5 h-5" />
            </Link>
            <Link to="/live" className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all transform hover:scale-105 shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-2">
              Track Bus <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button 
              type="button"
              onClick={toggleDarkMode} 
              className="p-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 space-y-2 bg-[#0a0a0c] border-b border-gray-800 shadow-2xl absolute w-full animate-in slide-in-from-top-4 duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-base font-semibold transition-all ${
                isActive(link.path)
                  ? 'bg-blue-600/10 text-blue-500'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-800">
            <Link
              to="/live"
              onClick={() => setIsOpen(false)}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
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

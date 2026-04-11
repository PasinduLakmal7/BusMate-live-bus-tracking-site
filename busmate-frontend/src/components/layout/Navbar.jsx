import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Map, MapPin, Search, ChevronRight, Menu, X, Bell, User, Sun, Moon, Star, HelpCircle, Clock, LogOut } from 'lucide-react';
import logo from '../../assets/logo.png';
import AuthSelectionModal from '../auth/AuthSelectionModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        setIsLoggedIn(false);
        setUser(null);
        navigate('/');
      }
    } catch (err) {
      console.error("Logout fail:", err);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/profile', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setIsLoggedIn(true);
          setUser(data.user);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (err) {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    checkAuth();
  }, [location]);

  // Site-wide Auth Trigger Matrix
  useEffect(() => {
    const handleTrigger = () => setIsAuthModalOpen(true);
    window.addEventListener('trigger-auth-modal', handleTrigger);
    return () => window.removeEventListener('trigger-auth-modal', handleTrigger);
  }, []);

  const navLinks = [
    { name: 'Live Tracking', path: '/live', icon: <Map className="w-5 h-5" /> },
    { name: 'Schedules', path: '/routes', icon: <Clock className="w-5 h-5" /> },
    { name: 'Route Planner', path: '/planner', icon: <MapPin className="w-5 h-5" /> },
    { name: 'Favorites', path: '/favorites', icon: <Star className="w-5 h-5" /> },
    { name: 'Analytics', path: '/predictions', icon: <Search className="w-5 h-5" /> },
    { name: 'Help Center', path: '/help', icon: <HelpCircle className="w-5 h-5" /> },
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
    const newDark = !isDark;
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setIsDark(newDark);
    window.dispatchEvent(new Event('theme-change'));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="fixed w-full top-0 z-50 bg-white/90 dark:bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800/50 shadow-2xl transition-all duration-300">
        <div className="max-w-[95%] 2xl:max-w-[85%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo & Brand */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 group">
                <img src={logo} alt="BusMate Logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-transform rounded-xl" />
                <span className="font-bold text-lg sm:text-xl tracking-tight text-gray-900 dark:text-white">BusMate</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center bg-gray-100/50 dark:bg-gray-900/40 px-8 py-2 rounded-full border border-gray-200 dark:border-white/5 backdrop-blur-md shadow-inner gap-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-110 active:scale-95 ${isActive(link.path)
                      ? 'text-blue-600 dark:text-blue-500'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <span className="opacity-70">{link.icon}</span>
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Quick Actions (Desktop) */}
            <div className="hidden lg:flex items-center space-x-5">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-full transition-all"
                aria-label="Toggle Dark Mode"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/alerts" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-full transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border border-white dark:border-[#0a0a0c]"></span>
              </Link>
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <Link to="/dashboard" className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black uppercase text-sm border-2 border-white/20 dark:border-white/10 shadow-lg hover:scale-110 transition-all">
                    {user?.username?.charAt(0) || 'U'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-rose-500 hover:text-rose-600 dark:hover:text-white hover:bg-rose-50 dark:hover:bg-rose-600 rounded-full transition-all"
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-full transition-all"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
              <Link to="/live" className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all transform hover:scale-105 shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-2">
                Track Bus <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 space-y-2 bg-white dark:bg-[#0a0a0c] border-b border-gray-200 dark:border-gray-800 shadow-2xl absolute w-full animate-in slide-in-from-top-4 duration-300">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-base font-semibold transition-all ${isActive(link.path)
                    ? 'bg-blue-600/10 text-blue-600 dark:text-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="w-full h-14 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <User className="w-4 h-4 text-blue-600 dark:text-blue-500" /> Account Authorization
              </button>
              <Link
                to="/live"
                onClick={() => setIsOpen(false)}
                className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
              >
                Track Bus Now <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}
      </nav>
      <AuthSelectionModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>

  );
};

export default Navbar;

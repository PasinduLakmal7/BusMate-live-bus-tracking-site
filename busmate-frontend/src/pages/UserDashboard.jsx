import React, { useState, useEffect } from 'react';
import { User, Map, History, Bell, Globe, Moon, ChevronRight, LogOut, Edit3, Shield, Mail } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate, Link } from 'react-router-dom';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [savedCount, setSavedCount] = useState(0);

  // Dashboard Sync: Listen for dark mode changes elsewhere (like Navbar)
  useEffect(() => {
    const checkDark = () => setDarkMode(document.documentElement.classList.contains('dark'));
    
    // Listen for custom event
    window.addEventListener('theme-change', checkDark);
    
    // Also use MutationObserver as a fallback for robustness
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Fetch real user data from backend
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/user/profile', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Dashboard: Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Fetch real saved nodes from database
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/favorites', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setSavedCount(data.favorites.length);
        }
      } catch (err) {
        console.error("Dashboard: Failed to load stats", err);
      }
    };
    fetchStats();

    return () => window.removeEventListener('theme-change', checkDark);
  }, []);

  const toggleDarkMode = () => {
    const isNowDark = !darkMode;
    if (isNowDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setDarkMode(isNowDark);
    window.dispatchEvent(new Event('theme-change'));
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        setUser(null);
        navigate('/');
      }
    } catch (err) {
      console.error("Sign-out failure:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0c]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // GUEST PROFILE HUB
  if (!user) {
    return (
      <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center mb-10 ring-1 ring-blue-500/20 shadow-2xl">
          <User className="w-10 h-10 text-blue-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-50 tracking-tighter uppercase mb-6">
          Operational Profile <span className="text-blue-600">Pending</span>
        </h1>
        <p className="text-gray-500 font-bold max-w-lg mb-12 uppercase tracking-widest text-[10px] leading-relaxed">
          Please authorize your identity session to access your personal transit intelligence hub. New operatives can establish a profile at the registry gateway below.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link to="/login">
            <Button className="px-12 py-5 bg-blue-600 shadow-2xl shadow-blue-500/20 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl active:scale-95 transition-all">
              Login Session <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="secondary" className="px-12 py-5 border-gray-100 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl active:scale-95 hover:bg-white/5 transition-all flex items-center justify-center gap-3">
              New Operative Registry <Edit3 className="w-4 h-4 text-emerald-500" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 pb-20">

      {/* Profile Header (Dynamic) */}
      <div className="bg-gradient-to-br from-[#1e40af] via-[#1d4ed8] to-[#312e81] rounded-[2.5rem] p-8 sm:p-12 mb-10 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="relative group">
            <div className="w-32 h-32 md:w-36 md:h-36 bg-white/15 backdrop-blur-xl rounded-[2rem] border-[6px] border-white/20 flex items-center justify-center text-5xl shadow-2xl transition-transform duration-500 group-hover:rotate-6">
              {user?.profilePic || '🚍'}
            </div>
            <button className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-3 rounded-2xl border-4 border-[#1e40af] shadow-xl hover:bg-blue-400 transition-all hover:scale-110 active:scale-95">
              <Edit3 className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center md:text-left mt-2 md:mt-0 flex-grow">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-white/10 mb-4">
              <Shield className="w-3 h-3 text-blue-300" /> Platinum Member
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">{user?.username || 'Guest'}</h1>
            <p className="text-blue-100/80 font-bold mb-6 flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4 opacity-60" /> {user?.email || 'Not logged in'}
            </p>

            <div className="group cursor-default">
              <p className="text-white text-3xl font-black transition-transform group-hover:-translate-y-1">{savedCount}</p>
              <p className="text-blue-200/50 text-[10px] uppercase tracking-widest font-black">Saved Nodes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Main Settings Area */}
        <div className="lg:col-span-2 space-y-8">

          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-50 tracking-tight">Account & Security</h2>
          </div>

          <Card className="overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none divide-y divide-gray-50 dark:divide-gray-800/50">
            {/* Nav Item */}
            <div
              onClick={() => navigate('/live')}
              className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 p-4 rounded-[1.25rem] group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <Map className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-gray-50 text-lg">Saved Routes & Stops</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Quick access to your regular paths</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Nav Item */}
            <div
              onClick={() => navigate('/planner')}
              className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 p-4 rounded-[1.25rem] group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-gray-50 text-lg">Travel Analytics</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Your monthly transit breakdown</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Nav Item */}
            <div
              onClick={() => navigate('/alerts')}
              className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 p-4 rounded-[1.25rem] group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-gray-50 text-lg">Notification Preferences</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Control SMS & app alerts</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Card>

          <div className="flex items-center gap-3 px-2 pt-6">
            <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-50 tracking-tight">App Experience</h2>
          </div>

          <Card className="overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none divide-y divide-gray-50 dark:divide-gray-800/50">
            {/* Selection Item */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-5">
                <div className="bg-purple-100 dark:bg-purple-900/20 text-purple-600 p-4 rounded-[1.25rem]">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-gray-50 text-lg">Language</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Currently set to English</p>
                </div>
              </div>
              <select className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-bold rounded-xl focus:ring-2 focus:ring-blue-500 p-3 outline-none transition-all shadow-sm">
                <option>English</option>
                <option>Sinhala</option>
                <option>Tamil</option>
              </select>
            </div>

            {/* Toggle Item */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-5">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-[1.25rem] ring-1 ring-white/10 shadow-lg">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-gray-50 text-lg">Dark Interface</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Eye-friendly night mode</p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ${darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ease-in-out ${darkMode ? 'translate-x-[0.95rem]' : 'translate-x-[0rem]'}`} />
              </button>
            </div>
          </Card>

          <Button
            variant="danger"
            onClick={handleSignOut}
            className="w-full sm:w-auto mt-10 py-5 px-10 flex items-center justify-center gap-3 font-black text-lg shadow-2xl shadow-red-500/20 active:scale-95 transition-all rounded-[1.5rem]"
          >
            <LogOut className="w-6 h-6" /> Sign Out Securely
          </Button>

        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card className="p-8 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-100 dark:border-blue-900/30 rounded-[2rem] shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
              <User className="w-32 h-32" />
            </div>
            <h3 className="font-black text-blue-900 dark:text-blue-100 text-xl mb-3 tracking-tight">Pro Passenger Tips</h3>
            <p className="text-sm text-blue-800/70 dark:text-blue-200/60 mb-6 leading-relaxed font-medium">
              Did you know? Saving your home and work routes allows BusMate to predict the best time to leave based on traffic history.
            </p>
            <Button
              onClick={() => navigate('/live')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95"
            >
              Set Up Now
            </Button>
          </Card>

          <Card
            onClick={() => navigate('/help')}
            className="p-6 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2rem] bg-transparent text-center group cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/5 transition-all"
          >
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest">Help Center Gateway</p>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;

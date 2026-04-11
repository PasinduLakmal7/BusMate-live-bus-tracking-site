import React, { useState, useMemo } from 'react';
import { MessageCircle, HelpCircle, Phone, Mail, BookOpen, ChevronDown, ChevronUp, Search, Shield, Map, Zap, Users, Info, ExternalLink, Navigation, X, User } from 'lucide-react';
import Card from '../components/common/Card';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';

const CATEGORIES = [
  { 
    id: 'tracking',
    title: 'Live Tracking', 
    icon: <Map className="w-6 h-6" />, 
    desc: 'Understanding markers and GPS accuracy.', 
    color: 'blue',
    steps: [
      "Open the 'Live Map' from the navbar.",
      "Bus markers show real-time vehicle positions.",
      "Green/Blue markers are on time, Rose Red indicates delays.",
      "Click any bus to see its Registration Number and Route.",
      "Your location is shown as a pulsing blue dot for proximity check."
    ]
  },
  { 
    id: 'planning',
    title: 'Route Planning', 
    icon: <Navigation className="w-6 h-6" />, 
    desc: 'Planning multi-leg commuting journeys.', 
    color: 'emerald',
    steps: [
      "Enter your starting point or use 'Current Location'.",
      "Set your destination transit node.",
      "The AI will suggest the fastest bus combinations.",
      "Estimated fares are calculated based on travel distance.",
      "Each leg shows specific start/end stops for your journey."
    ]
  },
  { 
    id: 'crowd',
    title: 'Crowd Insights', 
    icon: <Users className="w-6 h-6" />, 
    desc: 'How density metrics are calculated.', 
    color: 'rose',
    steps: [
      "Low Density (Green): Plenty of seating available.",
      "Medium Density (Amber): Standing room only.",
      "High Density (Rose): Vehicle is at maximum capacity.",
      "Insights are updated via live ticket transactions.",
      "Community reports help refine accuracy in real-time."
    ]
  },
  { 
    id: 'alerts',
    title: 'Smart Alerts', 
    icon: <Zap className="w-6 h-6" />, 
    desc: 'Managing push notifications and alerts.', 
    color: 'amber',
    steps: [
      "Alerts appear as rose-red banners on bus detail pages.",
      "Critical alerts signal route diversions or breakdowns.",
      "You can find a full history of service reports in 'System Status'.",
      "Tap the 'Bell' icon in the navbar for a global feed.",
      "Report issues yourself using the contact form below."
    ]
  },
];

const FAQS = [
  {
    q: "How accurate is the live tracking?",
    a: "Our live tracking relies on GPS telemetry installed in the buses. It provides real-time situational awareness with an accuracy margin of 30-50 meters, updated every 15 seconds.",
    cat: 'Live Map'
  },
  {
    q: "How do I save a favorite bus or stop?",
    a: "Navigate to any bus or stop detail page and tap the 'Star' icon in the header. That item will then be permanently tracked in your global 'Transit Library' accessible via the navbar.",
    cat: 'Favorites'
  },
  {
    q: "How is the crowd level calculated?",
    a: "Crowd levels are calculated using a fusion of historical load peaks, real-time ticket transactions, and community-sourced reports from passengers currently on board.",
    cat: 'Crowd Insights'
  },
  {
    q: "What do the different colors mean on the map?",
    a: "Green indicates on-time performance with low density. Amber signals moderate traffic or load. Rose Red indicates heavy congestion or a service disruption alert that requires your attention.",
    cat: 'Live Map'
  },
  {
    q: "How are the estimated fares calculated?",
    a: "Fares are calculated based on the standard transit distance between your starting node and destination node. Note that seasonal surges or student discounts may apply differently at the terminal.",
    cat: 'Route Planner'
  },
  {
    q: "How often does the tracking data refresh?",
    a: "Our systems poll for telemetry every 15-20 seconds. If a bus marker is pulsing, it indicates a highly active GPS sync. If it turns gray, the vehicle may be briefly stationary or in a low-signal area.",
    cat: 'Live Map'
  },
  {
    q: "How do I report an incorrect arrival time?",
    a: "Use the 'Contact Specialists' form at the bottom of this page. Include the Bus Registration number and your stop name for faster resolution by our dispatch team.",
    cat: 'Support'
  },
  {
    q: "Can I use the app without an internet connection?",
    a: "While live tracking requires data, you can view your transit library (favorited routes and stops) and basic route information using cached device memory.",
    cat: 'General'
  },
  {
    q: "Is there a way to see all bus schedules at once?",
    a: "Yes, navigate to 'All Schedules' in the footer or menu. You can browse every route in our registry and filter them by departure time or transit zone.",
    cat: 'Schedules'
  }
];

const HelpSupport = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGuide, setActiveGuide] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Support Form State
  const [formState, setFormState] = useState({ topic: '', name: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const categories = ["All", ...new Set(FAQS.map(f => f.cat))];

  const handleInputChange = (e) => {
     const { name, value } = e.target;
     setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setOpenFaq(null); // Reset open FAQ when searching
  };

  const handleSubmit = async (e) => {
     e.preventDefault();
     if (!formState.name || !formState.message || formState.topic === 'Select Resolution Type...' || !formState.topic) {
        setStatus({ type: 'error', message: 'All intelligence nodes required.' });
        return;
     }

     setSubmitting(true);
     setStatus(null);

     try {
        const res = await fetch('http://localhost:5000/api/site/submit-ticket', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(formState)
        });
        const data = await res.json();

        if (data.success) {
           setStatus({ type: 'success', message: 'Support ticket launched successfully.' });
           setFormState({ topic: '', name: '', message: '' });
        } else {
           setStatus({ type: 'error', message: data.error || 'Identity verification failed.' });
        }
     } catch (err) {
        setStatus({ type: 'error', message: 'System communication failure.' });
     } finally {
        setSubmitting(false);
     }
  };

  const filteredFaqs = useMemo(() => {
     let data = FAQS;
     
     if (activeCategory !== "All") {
        data = data.filter(f => f.cat === activeCategory);
     }

     if (!searchQuery.trim()) return data;
     
     const query = searchQuery.toLowerCase();
     return data.filter(f => 
       f.q.toLowerCase().includes(query) || 
       f.a.toLowerCase().includes(query) ||
       f.cat.toLowerCase().includes(query)
     );
  }, [searchQuery, activeCategory]);

  return (
    <div className="max-w-[95%] 2xl:max-w-[85%] mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20 min-h-screen">
      
      {/* Hero Header Section */}
      <div className="relative mb-16 p-10 lg:p-16 rounded-[2.5rem] bg-gray-900 border border-gray-800 overflow-hidden text-center shadow-2xl">
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
             <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 rotate-3 transition-transform hover:rotate-0">
                <HelpCircle className="w-9 h-9 text-white" />
             </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4 drop-shadow-lg">
            Intelligence <span className="text-blue-500">Support</span>
          </h1>
          <p className="text-gray-400 text-lg font-medium max-w-lg mx-auto">
             Access our global transit library for instant assistance and resolution.
          </p>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-20">
        {CATEGORIES.map((cat, i) => (
          <Card 
            key={i} 
            hover 
            onClick={() => setActiveGuide(cat)}
            className="p-8 border-none bg-white dark:bg-gray-900/50 shadow-xl flex flex-col items-center text-center group cursor-pointer"
          >
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg ${
               cat.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
               cat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
               cat.color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
             }`}>
                {cat.icon}
             </div>
             <h3 className="text-xl font-black text-gray-900 dark:text-gray-50 uppercase tracking-tight mb-2">{cat.title}</h3>
             <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{cat.desc}</p>
             <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                Open Guide
             </div>
          </Card>
        ))}
      </div>

      {/* Guide Modal Backdrop */}
      {activeGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" onClick={() => setActiveGuide(null)}></div>
           <Card className="relative z-10 w-full max-w-lg p-10 border-none shadow-[0_30px_100px_rgba(0,0,0,0.5)] rounded-[3rem] bg-white dark:bg-gray-900 overflow-hidden transform animate-in zoom-in-95 duration-200">
              <div className={`absolute top-0 left-0 w-full h-2 ${
                  activeGuide.color === 'blue' ? 'bg-blue-600' : 
                  activeGuide.color === 'emerald' ? 'bg-emerald-600' :
                  activeGuide.color === 'rose' ? 'bg-rose-600' : 'bg-amber-600'
              }`}></div>
              <div className="flex justify-between items-start mb-8">
                 <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      activeGuide.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                      activeGuide.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                      activeGuide.color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                       {activeGuide.icon}
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-gray-900 dark:text-gray-50 uppercase tracking-tight">{activeGuide.title}</h2>
                       <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Master Guide • V5.1</p>
                    </div>
                 </div>
                 <button onClick={() => setActiveGuide(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="space-y-4">
                 {activeGuide.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4 group">
                       <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            activeGuide.color === 'blue' ? 'bg-blue-100 text-blue-600' : 
                            activeGuide.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                            activeGuide.color === 'rose' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {idx + 1}
                          </div>
                          {idx < activeGuide.steps.length - 1 && <div className="w-0.5 h-full bg-gray-100 dark:bg-gray-800 my-1"></div>}
                       </div>
                       <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed pb-4 group-hover:text-blue-500 transition-colors">{step}</p>
                    </div>
                 ))}
              </div>

              <Button onClick={() => setActiveGuide(null)} className="w-full mt-8 bg-gray-900 dark:bg-gray-800 rounded-2xl py-4 font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all">
                 Got it, Launch Nodes
              </Button>
           </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-12">
        {/* FAQ Section */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-50 uppercase tracking-tight flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-blue-600" /> Resolution Center
            </h2>
            
            {/* Resolution-Anchored Search - Expanded Presence */}
            <div className="relative group w-full md:flex-1 md:max-w-2xl lg:max-w-3xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 rounded-xl blur-md opacity-20 group-focus-within:opacity-100 transition duration-500 animate-pulse"></div>
              <div className="relative flex items-center bg-white dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-blue-600/30 rounded-xl transition-all group-focus-within:border-blue-500 group-focus-within:ring-4 group-focus-within:ring-blue-500/10 shadow-xl">
                 <Search className="ml-5 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                 <input 
                   type="text"
                   value={searchQuery}
                   onChange={handleSearch}
                   placeholder="Search our knowledge base..."
                   className="w-full bg-transparent py-4 pl-4 pr-10 text-gray-900 dark:text-white text-base outline-none font-black placeholder:text-gray-400 dark:placeholder:text-gray-500 uppercase tracking-tight"
                 />
                 {searchQuery && (
                   <button 
                     onClick={() => setSearchQuery("")}
                     className="mr-5 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-blue-500 transition-all"
                   >
                      <X className="w-4 h-4" />
                   </button>
                 )}
              </div>
            </div>
          </div>

          {/* Intelligence Category Pills */}
          <div className="flex flex-wrap gap-3 mb-10">
             {categories.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => {
                     setActiveCategory(cat);
                     setOpenFaq(null);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     activeCategory === cat 
                     ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                     : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                   {cat}
                </button>
             ))}
          </div>
          
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? filteredFaqs.map((faq, i) => (
              <Card key={i} className="overflow-hidden border-none shadow-lg dark:bg-gray-900/40">
                <button
                  className="w-full p-6 flex justify-between items-center text-left focus:outline-none group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">{faq.cat}</span>
                     <span className="font-bold text-gray-900 dark:text-gray-50 text-lg group-hover:text-blue-600 transition-colors">{faq.q}</span>
                  </div>
                  {openFaq === i ? (
                    <ChevronUp className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                  )}
                </button>
                <div className={`overflow-hidden transition-all duration-500 ${openFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-8 pt-0 text-gray-600 dark:text-gray-400 leading-relaxed font-medium border-t border-gray-50 dark:border-gray-800/50 mt-2">
                    {faq.a}
                    <div className="mt-6 flex gap-4">
                       <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 hover:underline">
                          Helpful <Shield className="w-3 h-3" />
                       </button>
                       <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 hover:underline">
                          Read Full Guide <ExternalLink className="w-3 h-3" />
                       </button>
                    </div>
                  </div>
                </div>
              </Card>
            )) : (
              <div className="p-20 text-center bg-gray-50 dark:bg-gray-900/20 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
                 <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                 <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No intelligence matched your query</p>
                 <button onClick={() => setSearchQuery("")} className="text-blue-600 font-bold mt-4 hover:underline">Reset Search Filters</button>
              </div>
            )}
          </div>
        </div>        {/* Elite Reach Out Terminal - Final Command Upgrade */}
        <div className="lg:col-span-4">
          <Card className="p-8 bg-gray-900 border border-gray-800 shadow-[0_40px_100px_rgba(0,0,0,0.5)] text-white sticky top-24 rounded-[3rem] overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/20 transition-all"></div>
            
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                     <MessageCircle className="w-7 h-7 text-blue-500" /> Reach Out
                  </h2>
               </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Dispatch Online</span>
               </div>
            </div>
            
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10 pb-6 border-b border-gray-800">Average resolution: <span className="text-blue-500">14 minutes</span></p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {status && (
                <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2 duration-300 ${
                  status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                }`}>
                   {status.message}
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 ml-1">Case Intelligence</label>
                <div className="relative group/field">
                   <div className="absolute left-5 top-[1.35rem] text-gray-600 group-focus-within/field:text-blue-500 transition-colors z-10">
                      <HelpCircle className="w-4 h-4" />
                   </div>
                   <select 
                     name="topic"
                     value={formState.topic}
                     onChange={handleInputChange}
                     className="w-full bg-gray-800/80 border border-gray-700/50 rounded-2xl py-[1.1rem] pl-12 pr-10 text-white outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-500/50 transition-all font-bold text-[11px] appearance-none cursor-pointer uppercase tracking-tight relative"
                   >
                      <option className="bg-gray-900">Select Resolution Type...</option>
                      <option className="bg-gray-900">Tactical Delay Report</option>
                      <option className="bg-gray-900">Fare Query Integration</option>
                      <option className="bg-gray-900">Identity & Security Node</option>
                      <option className="bg-gray-900">General Support Command</option>
                   </select>
                   <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none group-focus-within/field:text-blue-500 transition-colors">
                      <ChevronDown className="w-4 h-4" />
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 ml-1">Full Identity</label>
                <div className="relative group/field">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/field:text-blue-500 transition-colors">
                      <User className="w-4 h-4" />
                   </div>
                   <input 
                     type="text" 
                     name="name"
                     value={formState.name}
                     onChange={handleInputChange}
                     placeholder="Mission handle / Name" 
                     className="w-full bg-gray-800/80 border border-gray-700/50 rounded-2xl py-4 pl-12 pr-5 text-white outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-500/50 transition-all font-bold text-[11px] placeholder:text-gray-700 uppercase tracking-tight" 
                   />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 ml-1">Situation Intel</label>
                <div className="relative group/field">
                   <div className="absolute left-5 top-5 text-gray-600 group-focus-within/field:text-blue-500 transition-colors">
                      <Info className="w-4 h-4" />
                   </div>
                   <textarea 
                     rows="4" 
                     name="message"
                     value={formState.message}
                     onChange={handleInputChange}
                     placeholder="Brief our nodes on your situation..." 
                     className="w-full bg-gray-800/80 border border-gray-700/50 rounded-2xl py-4 pl-12 pr-5 text-white outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-500/50 transition-all font-bold text-[11px] resize-none placeholder:text-gray-700 uppercase tracking-tight leading-relaxed"
                   />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-4 shadow-xl shadow-blue-500/20 text-white font-black text-[10px] uppercase tracking-[0.25em] rounded-2xl group transition-all transform hover:-translate-y-1 disabled:opacity-50"
                >
                   <div className="flex items-center justify-center gap-3">
                      <span>{submitting ? 'Launching...' : 'Launch Support Case'}</span>
                      <Zap className={`w-4 h-4 text-white/50 group-hover:text-amber-400 transition-colors ${submitting ? 'animate-spin' : 'animate-pulse'}`} />
                   </div>
                </Button>
              </div>
            </form>

            <div className="mt-12 pt-8 border-t border-gray-800/50 space-y-6">
              <div className="flex items-center gap-5 group cursor-pointer">
                <div className="w-12 h-12 bg-gray-800/80 border border-gray-700/50 rounded-xl flex items-center justify-center group-hover:bg-blue-900/40 group-hover:border-blue-500 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
                   <Phone className="w-5 h-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Secure Line</p>
                   <p className="text-sm font-black text-white group-hover:text-blue-500 transition-colors">+94 77 817 0067</p>
                </div>
              </div>
              <div className="flex items-center gap-5 group cursor-pointer">
                <div className="w-12 h-12 bg-gray-800/80 border border-gray-700/50 rounded-xl flex items-center justify-center group-hover:bg-blue-900/40 group-hover:border-blue-500 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
                   <Mail className="w-5 h-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Dispatch Hub</p>
                   <p className="text-sm font-black text-white lowercase group-hover:text-blue-500 transition-colors">pherath119@gmail.com</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-8 p-6 bg-blue-600/5 border border-blue-600/20 rounded-[2rem] text-center">
             <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Service Excellence</span>
             </div>
             <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-widest px-4">Our dispatchers monitor every node 24/7. Your resolution is our top-tier priority.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, ChevronRight, Bus, Navigation, Share2, Compass, Loader2, Star } from 'lucide-react';
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { io } from 'socket.io-client';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const libraries = ["places"];

const BusStopDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [stopData, setStopData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showFacilities, setShowFacilities] = useState(false);
    const [liveBuses, setLiveBuses] = useState({}); // Tracking live updates for arrivals
    const [alerts, setAlerts] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const favs = JSON.parse(localStorage.getItem('favStops') || '[]');
        setIsFavorite(favs.some(f => f.id === id));

        // Check login status for the demo
        const checkLogin = async () => {
            try {
                const res = await fetch('/api/user/profile');
                const data = await res.json();
                setLoggedInUser(data.success ? data.user : null);
            } catch (err) {
                setLoggedInUser(null);
            }
        };
        checkLogin();
    }, [id]);

    const [loggedInUser, setLoggedInUser] = useState(null);

    const toggleFavorite = () => {
        // SECURITY CHECK: If user is not logged in, block favorite action
        if (!loggedInUser) {
            alert("Please login first");
            navigate('/login');
            return;
        }

        const favs = JSON.parse(localStorage.getItem('favStops') || '[]');
        let newFavs;
        if (isFavorite) {
            newFavs = favs.filter(f => f.id !== id);
        } else {
            newFavs = [...favs, {
                id,
                name: stopData?.stop?.stop_name,
                type: 'stop'
            }];
        }
        localStorage.setItem('favStops', JSON.stringify(newFavs));
        setIsFavorite(!isFavorite);
    };

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const fetchStopDetails = useCallback(async () => {
        try {
            const res = await fetch(`/api/site/stops/${id}`);
            const data = await res.json();
            if (data.success) {
                setStopData(data);
            }
        } catch (err) {
            console.error("Error fetching stop details:", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchAlerts = useCallback(async () => {
        try {
            const res = await fetch(`/api/site/alerts/stop/${id}`);
            const data = await res.json();
            if (data.success) {
                setAlerts(data.alerts);
            }
        } catch (err) {
            console.error("Alerts error:", err);
        }
    }, [id]);

    useEffect(() => {
        fetchStopDetails();
        fetchAlerts();

        // ── Real-Time Socket Connection ──────────────────────────────────────────
        const socket = io('http://localhost:4000', { auth: { admin: true } });
        socket.on('bus:location', (data) => {
            // We track any live bus that matches one of the routes for this stop
            setLiveBuses(prev => ({
                ...prev,
                [data.routeNumber]: {
                    lat: data.lat,
                    lon: data.lon,
                    speed: data.speed,
                    ts: data.ts
                }
            }));
        });

        const interval = setInterval(() => {
            fetchStopDetails();
            fetchAlerts();
        }, 15000);

        return () => {
            socket.disconnect();
            clearInterval(interval);
        };
    }, [fetchStopDetails, fetchAlerts]);

    // Handlers
    const handleNavigate = () => {
        if (!stopData?.stop) return;
        const { latitude, longitude } = stopData.stop;
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Stop link copied to clipboard!');
    };

    const shareLinks = useMemo(() => {
        const url = window.location.href;
        const text = `Check out the bus arrival schedule for stop ${stopData?.stop?.stop_name || ''} (#${id}) on BusMate:`;
        return {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
            sms: `sms:?body=${encodeURIComponent(text + ' ' + url)}`
        };
    }, [id, stopData]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50/50 dark:bg-transparent">
            <div className="relative">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin opacity-20" />
                <MapPin className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold mt-4 uppercase tracking-widest text-xs">Accessing Transit Node...</p>
        </div>
    );

    if (!stopData?.stop) return (
        <div className="mt-40 text-center space-y-4">
            <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-50">Stop Not Found</h2>
            <p className="text-gray-500">The requested bus stop ID is invalid or has been decommissioned.</p>
            <Button onClick={() => navigate('/live')}>Return to Map</Button>
        </div>
    );

    const { stop, arrivals } = stopData;
    const center = { lat: parseFloat(stop.latitude), lng: parseFloat(stop.longitude) };

    const darkMapStyles = [
        { elementType: "geometry", stylers: [{ color: "#1e1e2e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#1e1e2e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    ];

    return (
        <div className="max-w-[95%] xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 min-h-screen relative">

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-sm" onClick={() => setShowShareModal(false)}></div>
                    <Card className="relative w-full max-w-sm p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-3xl rounded-[2.5rem]">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-gray-50 mb-6 flex items-center gap-3">
                            <Share2 className="w-6 h-6 text-blue-600" /> Share Stop Info
                        </h3>
                        <div className="space-y-3">
                            <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-[#25d366]/10 text-[#25d366] rounded-2xl font-bold transition-all hover:bg-[#25d366]/20">
                                <span>WhatsApp</span> <Share2 className="w-5 h-5" />
                            </a>
                            <a href={shareLinks.telegram} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-[#0088cc]/10 text-[#0088cc] rounded-2xl font-bold transition-all hover:bg-[#0088cc]/20">
                                <span>Telegram</span> <Share2 className="w-5 h-5" />
                            </a>
                            <a href={shareLinks.sms} className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold transition-all hover:bg-gray-200 dark:hover:bg-gray-700">
                                <span>SMS</span> <Share2 className="w-5 h-5" />
                            </a>
                            <button onClick={handleCopy} className="w-full flex items-center justify-between p-4 bg-blue-600 text-white rounded-2xl font-bold mt-4 hover:bg-blue-700 transition-all">
                                <span>Copy Link</span> <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                        <Button className="w-full mt-6 border-none text-gray-500 font-bold" variant="secondary" onClick={() => setShowShareModal(false)}>Close</Button>
                    </Card>
                </div>
            )}

            {/* Nearby Facilities Discovery Modal (Centered) */}
            {showFacilities && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-sm" onClick={() => setShowFacilities(false)}></div>
                    <Card className="relative w-full max-w-2xl p-8 bg-white dark:bg-gray-900 border-none shadow-[0_0_100px_-20px_rgba(37,99,235,0.2)] rounded-[3rem] animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-gray-50 tracking-tighter uppercase flex items-center gap-4">
                                    <Compass className="w-8 h-8 text-blue-600" /> Site Analysis: {stop.stop_name}
                                </h3>
                                <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Analyzing 500m vicinity Intelligence...</p>
                            </div>
                            <Button variant="secondary" className="border-none bg-gray-50 dark:bg-gray-800" onClick={() => setShowFacilities(false)}>Close</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/30 text-center group hover:bg-blue-600 transition-all duration-300">
                                <MapPin className="w-6 h-6 text-blue-600 group-hover:text-white mx-auto mb-3" />
                                <h4 className="font-black text-blue-900 dark:text-blue-100 group-hover:text-white uppercase tracking-tighter text-sm">Fuel & Gas</h4>
                                <p className="text-blue-600 dark:text-blue-400 group-hover:text-blue-100 font-bold text-[10px] mt-1 uppercase">2 Sheds</p>
                            </div>
                            <div className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30 text-center group hover:bg-emerald-600 transition-all duration-300">
                                <Clock className="w-6 h-6 text-emerald-600 group-hover:text-white mx-auto mb-3" />
                                <h4 className="font-black text-emerald-900 dark:text-emerald-100 group-hover:text-white uppercase tracking-tighter text-sm">Grocery</h4>
                                <p className="text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-100 font-bold text-[10px] mt-1 uppercase">5 Stores</p>
                            </div>
                            <div className="p-6 bg-amber-50/50 dark:bg-amber-900/10 rounded-[2.5rem] border border-amber-100 dark:border-amber-900/30 text-center group hover:bg-amber-500 transition-all duration-300">
                                <Bus className="w-6 h-6 text-amber-500 group-hover:text-white mx-auto mb-3" />
                                <h4 className="font-black text-amber-900 dark:text-amber-100 group-hover:text-white uppercase tracking-tighter text-sm">ATMs</h4>
                                <p className="text-amber-600 dark:text-amber-400 group-hover:text-amber-100 font-bold text-[10px] mt-1 uppercase">3 Hubs</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 mb-8">
                            <p className="text-gray-600 dark:text-gray-400 font-medium text-sm text-center mb-6 leading-relaxed">
                                Need to find these locations immediately? Open the live Surroundings Feed in Google Maps to see business names and reviews.
                            </p>
                            <Button
                                onClick={() => window.open(`https://www.google.com/maps/search/ATMs+Shops+Fuel+Sheds+around+${center.lat},${center.lng}/@${center.lat},${center.lng},16z`, '_blank')}
                                className="w-full bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 hover:scale-[1.02] transition-transform shadow-2xl h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
                            >
                                <Navigation className="w-4 h-4 mr-2" /> View Live Surroundings Feed
                            </Button>
                        </div>

                        <p className="text-gray-400 text-center font-black text-[8px] uppercase tracking-[0.4em]">
                            Intelligence Powered by BusMate Node Engine
                        </p>
                    </Card>
                </div>
            )}

            {/* Header / Hero Section */}
            <Card className="overflow-hidden border-none shadow-2xl rounded-[2.5rem] mb-12">
                <div className="h-64 md:h-80 w-full relative group">
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={center}
                            zoom={16}
                            options={{
                                disableDefaultUI: false,
                                styles: document.documentElement.classList.contains('dark') ? darkMapStyles : [],
                                zoomControl: true,
                            }}
                        >
                            <Marker position={center} options={{
                                icon: {
                                    url: 'https://cdn-icons-png.flaticon.com/512/3082/3082383.png',
                                    scaledSize: new window.google.maps.Size(45, 45)
                                }
                            }} />
                        </GoogleMap>
                    ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    )}

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 pt-16 bg-gradient-to-t from-white dark:from-gray-900 to-transparent">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Transit Node Analysis</p>
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-50 tracking-tighter uppercase mb-2 flex items-center gap-4">
                                    {stop.stop_name}
                                    <button
                                        onClick={toggleFavorite}
                                        className={`p-2 rounded-2xl border transition-all active:scale-110 shadow-lg ${isFavorite ? 'bg-amber-500 border-amber-600 shadow-amber-500/20 text-white' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-400'}`}
                                        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        <Star className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                                    </button>
                                </h1>
                                <p className="text-gray-500 font-bold">Official Site ID: <span className="text-blue-500">ST-{stop.stop_id}</span></p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleNavigate} className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 px-8">
                                    <Navigation className="w-4 h-4 mr-2" /> Navigate Here
                                </Button>
                                <Button onClick={() => setShowShareModal(true)} variant="secondary" className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800">
                                    <Share2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Scheduled Arrivals */}
            <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-gray-900 dark:text-gray-50 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                        Scheduled Arrivals
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Timetable data from official feed</p>
                </div>

                <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 leading-relaxed max-w-2xl">
                    The arrival times shown below represent the regular bus schedule passing through <span className="text-blue-500 font-black">{stop.stop_name}</span>. For real-time delays, please check the alerts feed.
                </p>

                <div className="space-y-4">
                    {arrivals.length > 0 ? arrivals.map((arrival) => {
                        const isLive = liveBuses[arrival.routeNumber];
                        return (
                            <Card key={arrival.id} className={`p-1 transition-all cursor-pointer group ${isLive ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'hover:border-blue-200'}`}>
                                <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-[1.5rem]">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${isLive ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-blue-600 shadow-blue-500/20'}`}>
                                            <span className="text-white font-black text-xl">{arrival.routeNumber}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-lg font-black text-gray-900 dark:text-gray-50 uppercase tracking-tighter">Towards {arrival.destination}</h4>
                                                {isLive && (
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border border-emerald-500/30 animate-pulse">
                                                        <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                                                        Live Now
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                {isLive ? `Real-time Speed: ${isLive.speed || 0} km/h` : `${arrival.routeNumber} Inter-city Express`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right pr-4">
                                        <p className={`text-2xl font-black ${isLive ? 'text-emerald-500' : 'text-gray-900 dark:text-gray-50'}`}>
                                            {isLive ? 'ARRIVING' : arrival.startTime.substring(0, 5)}
                                        </p>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isLive ? 'text-blue-500' : 'text-emerald-500'}`}>
                                            {isLive ? 'GPS TRACKED' : 'SCHEDULED'}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        );
                    }) : (
                        <div className="p-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-700">
                            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold">No upcoming schedules found for this stop.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Stop Specific Alerts Feed */}
            {alerts.length > 0 && (
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-rose-500 rounded-full animate-pulse"></div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-gray-50 uppercase tracking-tighter">Site Disruption Alerts</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {alerts.map((alert, idx) => (
                            <Card key={idx} className={`p-6 border-none shadow-2xl relative overflow-hidden ${alert.type === 'Danger' ? 'bg-rose-500' : 'bg-amber-500'} text-white`}>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-black uppercase tracking-tighter text-lg">{alert.title}</h4>
                                        <span className="text-[10px] font-bold opacity-60">
                                            {new Date(alert.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium opacity-90 leading-relaxed">{alert.message}</p>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-10">
                                    <Clock className="w-24 h-24" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                    onClick={() => setShowFacilities(true)}
                    className="p-8 group hover:bg-blue-600 transition-all duration-300 cursor-pointer"
                >
                    <Compass className="w-8 h-8 text-blue-600 group-hover:text-white mb-4" />
                    <h4 className="text-lg font-black text-gray-900 dark:text-gray-50 group-hover:text-white mb-2">Nearby Facilities</h4>
                    <p className="text-gray-500 group-hover:text-blue-100 text-sm font-medium">Find shops, banks, and sheds within 500m of this stop.</p>
                </Card>
                <Card
                    onClick={() => navigate('/planner')}
                    className="p-8 group hover:bg-emerald-600 transition-all duration-300 cursor-pointer"
                >
                    <Bus className="w-8 h-8 text-emerald-600 group-hover:text-white mb-4" />
                    <h4 className="text-lg font-black text-gray-900 dark:text-gray-50 group-hover:text-white mb-2">Alternate Routes</h4>
                    <p className="text-gray-500 group-hover:text-emerald-100 text-sm font-medium">Use the Route Planner to find other transit paths from here.</p>
                </Card>
                <Card
                    className={`p-8 group transition-all duration-300 cursor-pointer ${alerts.length > 0 ? 'bg-rose-500 hover:bg-rose-600 border-none shadow-rose-500/20' : 'hover:bg-amber-500'}`}
                    onClick={() => navigate('/alerts')}
                >
                    <Share2 className={`w-8 h-8 group-hover:text-white mb-4 ${alerts.length > 0 ? 'text-white' : 'text-amber-500'}`} />
                    <h4 className={`text-lg font-black group-hover:text-white mb-2 ${alerts.length > 0 ? 'text-white' : 'text-gray-900 dark:text-gray-50'}`}>Live Alert Feed</h4>
                    <p className={`text-sm font-medium ${alerts.length > 0 ? 'text-rose-100' : 'text-gray-500 group-hover:text-amber-50'}`}>
                        {alerts.length > 0 ? `${alerts.length} Active Disruptions found for this stop.` : 'Check for delays or service updates affecting this stop.'}
                    </p>
                </Card>
            </div>

        </div>
    );
};

export default BusStopDetails;

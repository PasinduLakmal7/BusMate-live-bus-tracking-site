import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Map as MapIcon, Filter, Layers, Crosshair, Bus, X, Users, Zap, Clock, ChevronRight } from 'lucide-react';
import { GoogleMap, Marker, useLoadScript, InfoWindow, Autocomplete } from "@react-google-maps/api";
import { useNavigate } from 'react-router-dom';
import io from "socket.io-client";
import Button from '../components/common/Button';
import busIcon from '../assets/bus-icon.png';

const libraries = ["places"];

// Helper to calculate distance in km using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
];

// Mock Bus Stops removed - Data now fetched from DB

const LiveTracking = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('All');
  const [busStops, setBusStops] = useState([]);
  const [nearbyBuses, setNearbyBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [map, setMap] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [socketStatus, setSocketStatus] = useState('connecting');
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  // Dark mode observer
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [allRoutes, setAllRoutes] = useState([]);

  // Fetch Bus Stops and Routes from Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Stops
        const stopsRes = await fetch(`${API_URL}/stops`);
        const stopsData = await stopsRes.json();
        if (stopsData.success && stopsData.stops) {
          const stopsMap = new Map();
          stopsData.stops.forEach((stop) => {
            if (stopsMap.has(stop.id)) {
               stopsMap.get(stop.id).routes.push(stop.route);
            } else {
               stopsMap.set(stop.id, {
                 id: stop.id,
                 name: stop.name,
                 lat: parseFloat(stop.lat),
                 lng: parseFloat(stop.lng),
                 routes: [stop.route]
               });
            }
          });
          setBusStops(Array.from(stopsMap.values()));
        }

        // Fetch Routes
        const routesRes = await fetch(`${API_URL}/site/routes`);
        const routesData = await routesRes.json();
        if (routesData.success) {
          setAllRoutes(routesData.routes);
        }
      } catch (err) {
        console.error("Failed to fetch map data:", err);
      }
    };
    fetchData();
  }, [API_URL]);


  // Fetch User Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Socket.io for real-time bus updates
  useEffect(() => {
    const socket = io("/", { auth: { admin: true } });
    socket.on("connect", () => setSocketStatus('connected'));
    socket.on("connect_error", () => setSocketStatus('error'));
    socket.on("bus:location", (data) => {
      setNearbyBuses((prev) => {
        const index = prev.findIndex(b => b.driverId === data.driverId);
        let dist = 0;
        if (userLocation) {
            dist = calculateDistance(userLocation.lat, userLocation.lng, data.lat, data.lon);
        }
        const updatedBus = { ...data, distance: dist };
        if (index !== -1) {
          const newBuses = [...prev];
          newBuses[index] = updatedBus;
          return newBuses;
        }
        return [...prev, updatedBus];
      });
    });
    return () => socket.disconnect();
  }, [API_URL]);

  const mapContainerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  
  // Center map on user location if available, else fallback to Colombo
  const center = useMemo(() => userLocation || { lat: 6.9271, lng: 79.8612 }, [userLocation]);

  const onMapLoad = useCallback((mapInstance) => setMap(mapInstance), []);

  const handleRecenter = () => {
    if (map) { map.panTo(center); map.setZoom(13); }
  };

  // Filter buses by selected route
  const filteredBuses = selectedRoute === 'All'
    ? nearbyBuses
    : nearbyBuses.filter(b => b.routeId === selectedRoute);

  return (
    <div className="relative h-[calc(100vh)] w-full overflow-hidden">

      {/* ── Full-Screen Map ── */}
      <div className="absolute inset-0 z-0">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: true,
              zoomControl: false,
              clickableIcons: false,
              styles: isDarkMode ? darkMapStyles : [],
            }}
          >
            {/* Live bus markers */}
            {filteredBuses.map((bus) => (
              <Marker
                key={bus.driverId}
                position={{ lat: bus.lat, lng: bus.lon }}
                icon={{
                  url: busIcon,
                  scaledSize: new window.google.maps.Size(55, 45),
                  anchor: new window.google.maps.Point(27, 22),
                }}
                onClick={() => { setSelectedBus(bus); setSelectedStop(null); }}
              />
            ))}

            {/* User Location Marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                  scaledSize: new window.google.maps.Size(32, 32),
                }}
                zIndex={1000}
              />
            )}

            {/* Bus stop markers */}
            {busStops.map((stop) => (
              <Marker
                key={stop.id}
                position={{ lat: stop.lat, lng: stop.lng }}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  scaledSize: new window.google.maps.Size(28, 28),
                }}
                onClick={() => { setSelectedStop(stop); setSelectedBus(null); }}
              />
            ))}

            {/* Bus Info Window */}
            {selectedBus && (
              <InfoWindow
                position={{ lat: selectedBus.lat, lng: selectedBus.lon }}
                onCloseClick={() => setSelectedBus(null)}
              >
                <div style={{ minWidth: 230, fontFamily: 'inherit' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ background: '#2563eb', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                          ROUTE {selectedBus.routeId || '138'}
                        </span>
                        <span style={{ color: '#9ca3af', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                          {selectedBus.busId || 'NA-1234'}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>To Fort Terminal</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>5<span style={{ fontSize: 10, fontWeight: 600 }}> min</span></div>
                      <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>ETA</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    <div style={{ background: '#eff6ff', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Speed</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>{Number(selectedBus.speed || 42).toFixed(1)} km/h</div>
                    </div>
                    <div style={{ background: '#ecfdf5', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Crowding</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>Medium</div>
                    </div>
                    <div style={{ background: '#f9fafb', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Driver</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>#{selectedBus.driverId || 'N/A'}</div>
                    </div>
                    <div style={{ background: '#fefce8', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Status</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Active</div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/bus/${selectedBus.busId || 'dummy'}`)}
                    style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    View Full Details →
                  </button>
                </div>
              </InfoWindow>
            )}

            {/* Bus Stop Info Window */}
            {selectedStop && (
              <InfoWindow
                position={{ lat: selectedStop.lat, lng: selectedStop.lng }}
                onCloseClick={() => setSelectedStop(null)}
              >
                <div style={{ minWidth: 200, fontFamily: 'inherit' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6 }}>🚌 {selectedStop.name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>Routes serving this stop:</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    {selectedStop.routes.map(r => (
                      <span key={r} style={{ background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4 }}>{r}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate(`/stop/${selectedStop.id}`)}
                    style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '9px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Stop Details →
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
            <MapIcon className="w-24 h-24 text-blue-500/30 mb-4 animate-pulse" />
            <h2 className="text-xl font-bold text-gray-400">Loading Live Map...</h2>
            {loadError && <p className="text-red-400 mt-2 text-sm">Failed to load Google Maps.</p>}
          </div>
        )}
      </div>

      {/* ── Top Bar (Navbar Overlay) ── */}
      <div className="absolute top-16 left-4 right-4 md:left-6 md:right-6 z-20 flex items-center gap-3 pt-4">
        {/* Route Selector */}
        <div className="flex-grow bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-xl flex items-center pl-4 pr-3 py-1 border border-gray-100 dark:border-gray-800 max-w-xs transition-all">
          <div className="flex items-center gap-2 mr-3">
            <div className={`w-2 h-2 rounded-full ${socketStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
          </div>
          <Filter className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <select
              className="w-full bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-300 py-2.5 outline-none font-semibold text-sm cursor-pointer"
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
            >
              <option value="All">All Live Routes</option>
              {allRoutes.map(route => (
                <option key={route.id} value={route.routeNumber}>
                  {route.routeNumber} – {route.startLocation} / {route.endLocation}
                </option>
              ))}
            </select>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl shadow-xl transition-all hover:scale-105 flex-shrink-0"
          title="Open Filters"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* ── Map Controls (Right Side) ── */}
      <div className="absolute right-4 md:right-6 bottom-24 z-20 flex flex-col gap-3">
        <button
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-all hover:scale-105"
          title="Map Layers"
        >
          <Layers className="w-5 h-5" />
        </button>
        <button
          onClick={handleRecenter}
          className="bg-blue-600 hover:bg-blue-700 p-3 rounded-2xl shadow-xl text-white transition-all hover:scale-105"
          title="Recenter Map"
        >
          <Crosshair className="w-5 h-5" />
        </button>
      </div>

      {/* ── Live Status Bar (Bottom) ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[92%] sm:w-auto">
        <div className="bg-[#0a0a0c]/90 backdrop-blur-xl border border-gray-800 px-5 py-3 rounded-3xl shadow-2xl flex items-center gap-5 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-2 pr-5 border-r border-gray-800 flex-shrink-0">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[11px] font-bold text-white uppercase tracking-widest">Live</span>
          </div>

          {filteredBuses.length === 0 ? (
            <span className="text-[12px] text-gray-500 font-medium">No buses detected nearby</span>
          ) : (
            <div className="flex items-center gap-6">
              {filteredBuses.slice(0, 3).map(bus => (
                <div
                  key={bus.driverId}
                  className="flex items-center gap-3 cursor-pointer hover:bg-white/5 px-2 py-1 rounded-xl transition-all"
                  onClick={() => { setSelectedBus(bus); setSelectedStop(null); }}
                >
                  <div className="bg-blue-600 p-2 rounded-xl">
                    <Bus className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Route {bus.routeId || '138'}</p>
                    <p className="text-xs font-bold text-white">{bus.busId || 'NA-5567'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Filter Side Panel ── */}
      {/* Backdrop */}
      {showFilters && (
        <div
          className="absolute inset-0 bg-black/30 z-30 backdrop-blur-sm"
          onClick={() => setShowFilters(false)}
        />
      )}

      <div className={`absolute top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-950 z-40 transition-transform duration-500 shadow-2xl ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" /> Map Filters
            </h2>
            <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex-grow overflow-y-auto p-6 space-y-8">

            {/* Route Filter */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Select Route</p>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedRoute('All')}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all border font-semibold text-sm ${
                    selectedRoute === 'All'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-700 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                >
                  <span>🗺 All Routes</span>
                </button>
                {allRoutes.map(route => (
                  <button
                    key={route.id}
                    onClick={() => setSelectedRoute(route.routeNumber)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl transition-all border font-semibold text-sm ${
                      selectedRoute === route.routeNumber
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-700 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <span>🚌 Route {route.routeNumber}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bus Status Filter */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Bus Status</p>
              <div className="grid grid-cols-2 gap-2">
                {['Active', 'Idle'].map(status => (
                  <button key={status} className="bg-gray-50 dark:bg-gray-900 p-3.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 border border-transparent hover:border-blue-500/30 transition-all">
                    {status === 'Active' ? '🟢' : '🟡'} {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Sync Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Real-time Sync</span>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-[12px] text-blue-700 dark:text-blue-300 opacity-80 leading-relaxed">
                Connected to live tracking server. Bus positions update every 5 seconds automatically.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 w-full bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 py-2.5 rounded-xl text-xs font-bold border border-blue-100 dark:border-blue-900 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <Clock className="w-3.5 h-3.5" /> Force Refresh
              </button>
            </div>

            {/* Nearby Stops */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Database Stops</p>
              <div className="space-y-2">
                {busStops.map(stop => (
                  <div
                    key={stop.id}
                    onClick={() => { navigate(`/stop/${stop.id}`); setShowFilters(false); }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{stop.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{stop.routes.join(', ')}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Footer */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">BusMate Live v1.2</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;

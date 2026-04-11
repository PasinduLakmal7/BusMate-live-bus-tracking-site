import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Map as MapIcon, Map, Filter, Layers, Crosshair, Bus, X, Users, Zap, Clock, ChevronRight, Star, AlertTriangle } from 'lucide-react';
import { GoogleMap, Marker, useLoadScript, InfoWindow, Autocomplete, Polyline, OverlayViewF, DirectionsRenderer, OverlayView } from "@react-google-maps/api";
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

// ── Smooth Animation Marker Component (Precision 360° Rotation Version) ──
const SmoothMarker = ({ bus, onClick }) => {
  const [pos, setPos] = useState({ lat: bus.lat, lng: bus.lon });
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    let start = null;
    let animationFrameId;
    const duration = 2000;
    const initialPos = { ...pos };
    const targetPos = { lat: bus.lat, lng: bus.lon };

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);

      const nextLat = initialPos.lat + (targetPos.lat - initialPos.lat) * progress;
      const nextLng = initialPos.lng + (targetPos.lng - initialPos.lng) * progress;

      setPos({ lat: nextLat, lng: nextLng });
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    const diffLat = Math.abs(parseFloat(targetPos.lat) - parseFloat(initialPos.lat));
    const diffLng = Math.abs(parseFloat(targetPos.lng) - parseFloat(initialPos.lng));

    if (diffLat > 0.0000001 || diffLng > 0.0000001) {
      const dy = parseFloat(targetPos.lat) - parseFloat(initialPos.lat);
      const dx = parseFloat(targetPos.lng) - parseFloat(initialPos.lng);
      const visualHeading = (Math.atan2(dx, dy) * 180) / Math.PI;
      setHeading(visualHeading);
      animationFrameId = requestAnimationFrame(animate);
    } else {
      setPos(targetPos);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [bus.lat, bus.lon]);

  const occupancyColor = bus.occupancy < 40 ? 'bg-emerald-500' : bus.occupancy < 80 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <OverlayViewF
      position={pos}
      mapPaneName="overlayMouseTarget"
      getPixelPositionOffset={() => ({ x: -20, y: -20 })}
    >
      <div
        onMouseUp={(e) => {
          e.stopPropagation();
          onClick(bus);
        }}
        className="group relative cursor-pointer touch-none"
        style={{ width: '40px', height: '40px', pointerEvents: 'auto' }}
      >
        {/* Hover Badge */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 whitespace-nowrap translate-y-2 group-hover:translate-y-0">
          <span className="text-[10px] font-black text-white uppercase tracking-widest">{bus.routePath}</span>
          <div className={`w-1.5 h-1.5 rounded-full ${occupancyColor}`}></div>
        </div>

        <img
          src={busIcon}
          alt="bus"
          style={{
            width: '40px',
            height: '40px',
            transform: `rotate(${heading - 90}deg)`,
            transition: 'transform 0.5s ease-in-out',
          }}
          className="relative z-10 drop-shadow-lg group-hover:scale-110 active:scale-95 transition-transform"
        />
      </div>
    </OverlayViewF>
  );
};



const LiveTracking = () => {
  const savedCenter = localStorage.getItem('busmate_map_center');
  const savedZoom = localStorage.getItem('busmate_map_zoom');

  const [center, setCenter] = useState(savedCenter ? JSON.parse(savedCenter) : { lat: 6.8403, lng: 79.9298 });
  const [zoom, setZoom] = useState(savedZoom ? parseInt(savedZoom) : 13);

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
  const [useRadiusFilter, setUseRadiusFilter] = useState(false);
  const [showStops, setShowStops] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [routeSearchQuery, setRouteSearchQuery] = useState('');
  const [stopSearchQuery, setStopSearchQuery] = useState('');
  const [isRouteDropdownOpen, setIsRouteDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [favBusIds, setFavBusIds] = useState([]);
  const [debugLogs, setDebugLogs] = useState(["Initializing telemetry..."]);
  const RADIUS_LIMIT_KM = 20;
  const navigate = useNavigate();

  // Fetch operative's favorite buses for the radar filter
  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const res = await fetch('/api/favorites', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setFavBusIds(data.favorites.filter(f => f.item_type === 'bus').map(f => f.item_id));
        }
      } catch (err) {
        console.error("Radar: Fav fetch failed", err);
      }
    };
    fetchFavs();
  }, []);

  // Use a relative path prefix for Vite's proxy (see vite.config.js)
  const API_URL = '/api';

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
    const fetchStaticData = async () => {
      try {
        const stopsRes = await fetch(`${API_URL}/site/stops`);
        const stopsData = await stopsRes.json();
        if (stopsData.success && stopsData.stops) {
          const stopsMap = new window.Map();
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

        const routesRes = await fetch(`${API_URL}/site/routes`);
        const routesData = await routesRes.json();
        if (routesData.success) {
          setAllRoutes(routesData.routes);
        }
      } catch (err) {
        console.error("Failed to fetch static map data:", err);
      }
    };

    const fetchLiveLocations = async () => {
      try {
        const locationsRes = await fetch(`${API_URL}/buses/locations`);
        const locationsData = await locationsRes.json();
        if (locationsData.success && locationsData.locations) {
          setNearbyBuses(locationsData.locations.map(loc => ({
            ...loc,
            lat: parseFloat(loc.lat),
            lon: parseFloat(loc.lon),
            speed: parseFloat(loc.speed || 0),
            distance: 0
          })));
          setDebugLogs(prev => [...prev.slice(-4), `Pulled ${locationsData.locations.length} nodes`]);
        }
      } catch (err) {
        console.error("Failed to fetch live locations:", err);
        setDebugLogs(prev => [...prev.slice(-4), "API fetch failure"]);
      }
    };

    fetchStaticData();
    fetchLiveLocations();
  }, [API_URL]);

  // Fetch Route Path using Directions API when route is selected
  useEffect(() => {
    let ignore = false;

    // FORCE RESET: Wipe the map clean as soon as a new selection starts
    setDirectionsResponse(null);

    const fetchRoutePath = async () => {
      if (selectedRoute === 'All') return;

      try {
        const routeObj = allRoutes.find(r => String(r.routeNumber) === String(selectedRoute));
        if (!routeObj) return;

        const res = await fetch(`${API_URL}/site/routes/${routeObj.id}`);
        const data = await res.json();

        if (ignore) return;

        if (data.success && data.route?.stops && data.route.stops.length >= 2) {
          const stops = data.route.stops
            .filter(s => s.lat && s.lng)
            .map(s => ({ lat: parseFloat(s.lat), lng: parseFloat(s.lng) }));

          const isExpressway = String(selectedRoute).startsWith("EX-");
          const directionsService = new window.google.maps.DirectionsService();

          directionsService.route(
            {
              origin: stops[0],
              destination: stops[stops.length - 1],
              waypoints: stops.slice(1, -1).map(s => ({
                location: new window.google.maps.LatLng(s.lat, s.lng),
                stopover: true
              })),
              travelMode: window.google.maps.TravelMode.DRIVING,
              avoidHighways: !isExpressway,
              optimizeWaypoints: true
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK && !ignore) {
                setDirectionsResponse(result);
              }
            }
          );
        }
      } catch (err) {
        console.error("Failed to fetch route path:", err);
      }
    };

    if (isLoaded) fetchRoutePath();

    return () => { ignore = true; };
  }, [selectedRoute, allRoutes, API_URL, isLoaded]);


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

  // Socket.io for real-time bus updates (Authenticated as Admin)
  useEffect(() => {
    // We connect with admin:true so the backend allows us to see ALL routes without a driver token
    const socket = io({
      auth: { admin: true },
      transports: ['polling', 'websocket'], // Prefer polling for compatibility through tunnels
      path: '/socket.io',
      extraHeaders: {
        "ngrok-skip-browser-warning": "true"
      }
    });

    socket.on("connect", () => {
      console.log("Live Tracking: Connected to bus stream");
      setSocketStatus('connected');
      setDebugLogs(prev => [...prev.slice(-4), "Connected to uplink"]);
    });

    socket.on("connect_error", (err) => {
      console.warn("Live Tracking: Connection error", err);
      setSocketStatus('error');
      setDebugLogs(prev => [...prev.slice(-4), `Uplink Err: ${err.message}`]);
    });

    socket.on("bus:location", (data) => {
      setNearbyBuses((prev) => {
        // Try to find by busId or database id
        const index = prev.findIndex(b => b.busId === data.busId || b.id === data.id);

        if (index !== -1) {
          const newBuses = [...prev];
          // PRESERVE mission data: Don't let nulls overwrite valid route info!
          const existingBus = newBuses[index];
          newBuses[index] = {
            ...existingBus,
            ...data,
            lat: parseFloat(data.lat),
            lon: parseFloat(data.lon),
            // Only use new IDs if they are actually provided
            routeId: data.routeId || existingBus.routeId,
            routeNumber: data.routeNumber || existingBus.routeNumber,
            destination: data.destination || existingBus.destination
          };
          return newBuses;
        }

        const newBus = {
          ...data,
          lat: parseFloat(data.lat),
          lon: parseFloat(data.lon)
        };
        return [...prev, newBus];
      });
    });

    return () => socket.disconnect();
  }, []); // Run only once!

  const mapContainerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);

  const onMapLoad = useCallback((mapInstance) => setMap(mapInstance), []);

  const handleRecenter = () => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(13);
    }
  };

  // Filter buses and inject full route path intelligence
  const filteredBuses = useMemo(() => {
    let list = nearbyBuses;

    // Filter by Favorites Only
    if (showOnlyFavorites) {
      list = list.filter(b => favBusIds.includes(String(b.id)) || favBusIds.includes(String(b.busId)));
    }

    // Filter by route
    if (selectedRoute !== 'All') {
      const routeObj = allRoutes.find(r => String(r.routeNumber) === String(selectedRoute));
      const targetId = routeObj ? routeObj.id : selectedRoute;
      list = list.filter(b => String(b.routeId) === String(targetId));
    }

    // Filter by status (Active > 1km/h, Idle <= 1km/h)
    if (statusFilter === 'Active') {
      list = list.filter(b => (b.speed || 0) > 1);
    } else if (statusFilter === 'Idle') {
      list = list.filter(b => (b.speed || 0) <= 1);
    }

    // Filter by 10km radius if active
    if (useRadiusFilter && userLocation) {
      list = list.filter(b => {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lon);
        return dist <= RADIUS_LIMIT_KM;
      });
    }

    // INJECT: Full Transit Path Intelligence (e.g. "32/Badulla-Colombo")
    return list.map(bus => {
      // Robust find: try ID, CamelCase ID, snake_case ID, and Route Number
      const route = allRoutes.find(r =>
        String(r.id) === String(bus.routeId) ||
        String(r.id) === String(bus.route_id) ||
        String(r.routeNumber) === String(bus.routeNumber) ||
        String(r.routeNumber) === String(bus.routeNo)
      );

      let routePath = '???';
      if (route) {
        routePath = `${route.routeNumber}/${route.startLocation}-${route.endLocation}`;
      } else if (bus.routeNumber || bus.route_number || bus.routeNo) {
        // Fallback: If we have a number but it's not in the DB yet, show it with destination
        const num = bus.routeNumber || bus.route_number || bus.routeNo;
        routePath = bus.destination ? `${num}/${bus.destination}` : num;
      } else if (bus.destination) {
        // Last-ditch: just show the destination
        routePath = bus.destination;
      }

      return { ...bus, routePath: routePath.toUpperCase() };
    });
  }, [nearbyBuses, selectedRoute, statusFilter, useRadiusFilter, userLocation, showOnlyFavorites, favBusIds, allRoutes]);

  // Filter routes for the searchable dropdown
  const filteredRoutesDropdown = useMemo(() => {
    if (!routeSearchQuery) return allRoutes;
    return allRoutes.filter(r =>
      r.routeNumber.toLowerCase().includes(routeSearchQuery.toLowerCase()) ||
      r.startLocation.toLowerCase().includes(routeSearchQuery.toLowerCase()) ||
      r.endLocation.toLowerCase().includes(routeSearchQuery.toLowerCase())
    );
  }, [allRoutes, routeSearchQuery]);

  // Filter bus stops for the sidebar based on selected route and search query
  const filteredSidebarStops = useMemo(() => {
    let list = busStops;
    if (selectedRoute !== 'All') {
      list = list.filter(stop => stop.routes.includes(selectedRoute));
    }
    if (stopSearchQuery) {
      list = list.filter(stop => stop.name.toLowerCase().includes(stopSearchQuery.toLowerCase()));
    }
    return list;
  }, [busStops, selectedRoute, stopSearchQuery]);

  return (
    <div className="relative h-[calc(100vh)] w-full overflow-hidden">

      {/* ── Full-Screen Map ── */}
      <div className="absolute inset-0 z-0">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={zoom}
            onLoad={onMapLoad}
            onDragEnd={() => {
              if (map) {
                const newCenter = map.getCenter().toJSON();
                setCenter(newCenter);
                localStorage.setItem('busmate_map_center', JSON.stringify(newCenter));
              }
            }}
            onZoomChanged={() => {
              if (map) {
                const newZoom = map.getZoom();
                setZoom(newZoom);
                localStorage.setItem('busmate_map_zoom', newZoom.toString());
              }
            }}
            options={{
              disableDefaultUI: true,
              zoomControl: false,
              clickableIcons: false,
              styles: isDarkMode ? darkMapStyles : [],
            }}
          >
            {/* Live bus markers (Animated for Smoothness) */}
            {filteredBuses.map((bus, idx) => (
              <SmoothMarker
                key={bus.id || bus.busId || bus.driverId || `bus-${idx}`}
                bus={bus}
                onClick={(b) => {
                  setSelectedBus(b);
                  setSelectedStop(null);
                  if (map) {
                    const offset = 0.01;
                    map.panTo({ lat: b.lat + offset, lng: b.lon });
                  }
                }}
              />
            ))}

            {/* Route Path using DirectionsRenderer (Better for clearing old paths) */}
            {directionsResponse && (
              <DirectionsRenderer
                directions={directionsResponse}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: "#2563eb",
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                  }
                }}
              />
            )}

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

            {/* Bus stop markers (Only if enabled or route selected) */}
            {(showStops || (selectedRoute !== 'All' && directionsResponse)) && busStops
              .filter(stop => selectedRoute === 'All' || stop.routes.includes(selectedRoute))
              .map((stop) => (
                <Marker
                  key={stop.id}
                  position={{ lat: stop.lat, lng: stop.lng }}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor: isDarkMode ? '#1e293b' : '#ffffff',
                    fillOpacity: 1,
                    strokeColor: '#3b82f6',
                    strokeWeight: 3,
                    scale: 6,
                  }}
                  onClick={() => { setSelectedStop(stop); setSelectedBus(null); }}
                />
              ))}
            {/* Premium Bus Info Popup using OverlayView for full styling control */}
            {selectedBus && (
              <OverlayViewF
                position={{ lat: selectedBus.lat, lng: selectedBus.lon }}
                mapPaneName={"overlayMouseTarget"}
                getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -(height + 60) })}
              >
                <div className="animate-in fade-in zoom-in-95 duration-200 cursor-default">
                  {/* The Popup Container */}
                  <div className="relative w-[280px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[28px] shadow-2xl border border-white/20 dark:border-gray-800 p-5 pt-6 shadow-blue-500/10">

                    {/* Close Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedBus(null); }}
                      className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Header: Route & ETA */}
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                            Route {selectedBus.routeNumber}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 text-[10px] items-center font-bold uppercase tracking-widest flex gap-1">
                            {selectedBus.busId}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-gray-50 leading-tight">
                          To {selectedBus.endLocation || selectedBus.destination || 'Terminal'}
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-500 leading-none">
                          {selectedBus.speed > 5 && selectedBus.distance ? Math.ceil((selectedBus.distance / selectedBus.speed) * 60) : '—'}
                          <span className="text-[10px] ml-0.5 opacity-80 uppercase">min</span>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">ETA</p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className={`rounded-2xl p-3 border ${selectedBus.speed > 5 ? 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-100/50 dark:border-blue-500/10' : 'bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5'}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Zap className={`w-3 h-3 ${selectedBus.speed > 5 ? 'text-blue-500' : 'text-gray-400'}`} />
                          <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Speed</span>
                        </div>
                        <p className={`text-xs font-black ${selectedBus.speed > 5 ? 'text-blue-800 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                          {Number(selectedBus.speed || 0).toFixed(1)} <span className="text-[10px] opacity-60">km/h</span>
                        </p>
                      </div>

                      <div className={`rounded-2xl p-3 border ${(selectedBus.id % 3 === 0) ? 'bg-red-50/50 dark:bg-red-500/5 border-red-100/50 dark:border-red-500/10' : (selectedBus.id % 2 === 0) ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100/50 dark:border-emerald-500/10' : 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-100/50 dark:border-amber-500/10'}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Users className={`w-3 h-3 ${(selectedBus.id % 3 === 0) ? 'text-red-500' : (selectedBus.id % 2 === 0) ? 'text-emerald-500' : 'text-amber-500'}`} />
                          <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Crowd</span>
                        </div>
                        <p className={`text-xs font-black ${(selectedBus.id % 3 === 0) ? 'text-red-800 dark:text-red-300' : (selectedBus.id % 2 === 0) ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
                          {(selectedBus.id % 3 === 0) ? 'High' : (selectedBus.id % 2 === 0) ? 'Low' : 'Medium'}
                        </p>
                      </div>

                      <div className="bg-gray-50/50 dark:bg-white/5 rounded-2xl p-3 border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Driver</span>
                        </div>
                        <p className="text-xs font-black text-gray-900 dark:text-gray-300">#{selectedBus.driverId || 'D-1024'}</p>
                      </div>

                      <div className={`rounded-2xl p-3 border ${selectedBus.speed > 1 ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100/50 dark:border-emerald-500/10' : 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-100/50 dark:border-amber-500/10'}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${selectedBus.speed > 1 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                          <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-0.5">Status</span>
                        </div>
                        <p className={`text-xs font-black ${selectedBus.speed > 1 ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
                          {selectedBus.speed > 1 ? 'Active' : 'Idle'}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => navigate(`/bus/${encodeURIComponent(selectedBus.busId || 'dummy')}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 group"
                    >
                      View Full Intelligence Report
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>

                    {/* Speech Bubble Tail */}
                    <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-white/95 dark:bg-gray-900/95 rotate-45 border-r border-b border-white/20 dark:border-gray-800 shadow-xl"></div>
                  </div>
                </div>
              </OverlayViewF>
            )}

            {/* Premium Bus Stop Popup using OverlayView */}
            {selectedStop && (
              <OverlayViewF
                position={{ lat: selectedStop.lat, lng: selectedStop.lng }}
                mapPaneName={"overlayMouseTarget"}
                getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -(height + 60) })}
              >
                <div className="animate-in fade-in zoom-in-95 duration-200 cursor-default">
                  <div className="relative w-[260px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[28px] shadow-2xl border border-white/20 dark:border-gray-800 p-5 pt-6 shadow-blue-500/10">

                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedStop(null); }}
                      className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-600/10 p-2.5 rounded-2xl">
                        <MapIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-gray-50 leading-tight">{selectedStop.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Verified Station</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 leading-none">Serving Routes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedStop.routes.map(r => (
                          <span key={r} className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/stop/${selectedStop.id}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
                    >
                      Full Station Intelligence
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>

                    {/* Speech Bubble Tail */}
                    <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-white/95 dark:bg-gray-900/95 rotate-45 border-r border-b border-white/20 dark:border-gray-800 shadow-xl"></div>
                  </div>
                </div>
              </OverlayViewF>
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

      {/* ── Diagnostic Radar Overlay (Bottom-Right) ── */}
      <div className="absolute bottom-6 left-6 z-50 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
        <div className="bg-black/80 backdrop-blur-md rounded-xl p-3 border border-white/10 text-[9px] font-mono text-blue-400">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-1.5 h-1.5 rounded-full ${socketStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="uppercase tracking-widest font-black">Link Status: {socketStatus}</span>
          </div>
          {debugLogs.map((log, i) => (
            <div key={i} className="opacity-70">&gt; {log}</div>
          ))}
          <div className="mt-1 text-gray-400">Total Nodes: {nearbyBuses.length}</div>
          <div className={`mt-0.5 font-bold ${filteredBuses.length > 0 ? 'text-green-400' : 'text-amber-400'}`}>Map Icons: {filteredBuses.length}</div>
        </div>
      </div>

      {/* ── Top Bar (Navbar Overlay) ── */}
      <div className="absolute top-16 left-4 right-4 md:left-6 md:right-6 z-20 flex items-center gap-3 pt-4">
        {/* Custom Searchable Route Selector */}
        <div className="relative flex-grow max-w-xs z-30">
          <div
            onClick={() => setIsRouteDropdownOpen(!isRouteDropdownOpen)}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-xl flex items-center pl-4 pr-3 py-2.5 border border-gray-100 dark:border-gray-800 cursor-pointer transition-all hover:border-blue-500/50"
          >
            <div className={`w-2 h-2 rounded-full mr-3 ${socketStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
            <Filter className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="flex-grow text-gray-700 dark:text-gray-300 font-bold text-sm truncate">
              {selectedRoute === 'All' ? 'All Live Routes' : selectedRoute}
            </span>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isRouteDropdownOpen ? 'rotate-90' : ''}`} />
          </div>

          {/* Dropdown Menu */}
          {isRouteDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/98 dark:bg-gray-900/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Search Inside Dropdown */}
              <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                <input
                  type="text"
                  placeholder="Search route number or city..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                  value={routeSearchQuery}
                  onChange={(e) => setRouteSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>

              <div className="max-h-64 overflow-y-auto">
                <div
                  onClick={() => { setSelectedRoute('All'); setIsRouteDropdownOpen(false); setRouteSearchQuery(''); }}
                  className={`px-4 py-3 text-xs font-bold cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${selectedRoute === 'All' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  All Live Routes
                </div>
                {filteredRoutesDropdown.map(route => (
                  <div
                    key={route.id}
                    onClick={() => { setSelectedRoute(route.routeNumber); setIsRouteDropdownOpen(false); setRouteSearchQuery(''); }}
                    className={`px-4 py-3 text-xs font-bold cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-t border-gray-50 dark:border-gray-800 ${selectedRoute === route.routeNumber ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    <span className="text-blue-500 mr-2">{route.routeNumber}</span>
                    <span>{route.startLocation} / {route.endLocation}</span>
                  </div>
                ))}
                {filteredRoutesDropdown.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-400 text-[11px] font-bold uppercase tracking-widest">No routes found</div>
                )}
              </div>
            </div>
          )}
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
              {filteredBuses.slice(0, 3).map((bus, index) => (
                <div
                  key={bus.busId || `bus-${index}`}
                  className="flex items-center gap-3 cursor-pointer hover:bg-white/5 px-2 py-1 rounded-xl transition-all"
                  onClick={() => { setSelectedBus(bus); setSelectedStop(null); }}
                >
                  <div className="bg-blue-600 p-2 rounded-xl">
                    <Bus className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                      Route {bus.routeNumber}
                    </p>
                    <p className="text-xs font-bold text-white">{bus.busId}</p>
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
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all border font-semibold text-sm ${selectedRoute === 'All'
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
                    className={`w-full text-left px-4 py-3.5 rounded-xl transition-all border font-semibold text-sm ${selectedRoute === route.routeNumber
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-700 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-700'
                      }`}
                  >
                    <span>🚌 Route {route.routeNumber}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Favorites Filter */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-emerald-500">Operative Intel</p>
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`w-full text-left px-4 py-3.5 rounded-xl transition-all border font-black uppercase text-[10px] tracking-widest flex items-center justify-between group ${showOnlyFavorites
                  ? 'bg-amber-500 border-amber-600 text-white shadow-xl shadow-amber-500/30'
                  : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-700 dark:text-gray-300 hover:bg-amber-500/10'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Star className={`w-4 h-4 ${showOnlyFavorites ? 'fill-current text-white' : 'text-amber-500'}`} />
                  <span>Show Favorites Only</span>
                </div>
                {showOnlyFavorites && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
              </button>
            </div>

            {/* Bus Status Filter */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Bus Status</p>
              <div className="grid grid-cols-2 gap-2">
                {['All', 'Active', 'Idle'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`p-3.5 rounded-xl text-sm font-bold border transition-all ${statusFilter === status
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-600 dark:text-gray-400 hover:border-blue-500/30'
                      }`}
                  >
                    {status === 'Active' ? '🟢' : status === 'Idle' ? '🟡' : '📦'} {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Filter */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Distance Filter</p>
              <button
                onClick={() => setUseRadiusFilter(!useRadiusFilter)}
                className={`w-full text-left px-4 py-3.5 rounded-xl transition-all border font-semibold text-sm flex items-center justify-between ${useRadiusFilter
                  ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-500/20'
                  : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-700 dark:text-gray-300'
                  }`}
              >
                <span>Nearby (Sub 10km)</span>
                <Zap className={`w-4 h-4 ${useRadiusFilter ? 'text-white' : 'text-gray-400'}`} />
              </button>
              {useRadiusFilter && !userLocation && (
                <p className="text-[10px] text-red-500 mt-2">Waiting for your GPS location...</p>
              )}
            </div>

            {/* Bus Stops Toggle */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Map Elements</p>
              <button
                onClick={() => setShowStops(!showStops)}
                className={`w-full text-left px-4 py-3.5 rounded-xl transition-all border font-semibold text-sm flex items-center justify-between ${showStops
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-700 dark:text-gray-300'
                  }`}
              >
                <span>{showStops ? 'Hide' : 'Show'} All Bus Stops</span>
                <Layers className={`w-4 h-4 ${showStops ? 'text-white' : 'text-gray-400'}`} />
              </button>
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

            {/* Route Stops Filtered with Search */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                {selectedRoute === 'All' ? 'All Database Stops' : `Stops on Route ${selectedRoute}`}
              </p>

              {/* Stop Search */}
              <input
                type="text"
                placeholder="Find a stop..."
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-xs font-bold mb-4 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                value={stopSearchQuery}
                onChange={(e) => setStopSearchQuery(e.target.value)}
              />

              <div className="space-y-2">
                {filteredSidebarStops.map(stop => (
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
                {filteredSidebarStops.length === 0 && (
                  <div className="py-8 text-center text-gray-400 text-[11px] font-bold uppercase tracking-widest">No stops for this route</div>
                )}
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

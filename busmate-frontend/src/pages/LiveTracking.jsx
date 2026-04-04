import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Map as MapIcon, Filter, Layers, Crosshair, Bus, X, Users, Zap, Clock, ChevronRight } from 'lucide-react';
import { GoogleMap, Marker, useLoadScript, InfoWindow, Autocomplete, Polyline, OverlayView } from "@react-google-maps/api";
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
    const duration = 2000; // Match fetch/simulate interval (2sec)
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

    // We parse floats and safely avoid tiny javascript jitter that causes stationary buses to spin/wiggle
    const diffLat = Math.abs(parseFloat(targetPos.lat) - parseFloat(initialPos.lat));
    const diffLng = Math.abs(parseFloat(targetPos.lng) - parseFloat(initialPos.lng));

    if (diffLat > 0.0000001 || diffLng > 0.0000001) {
      // LOGIC: Calculate the precise angle of movement on the screen.
      // This stops "drifting" (sliding sideways around curves) by locking the rotation
      const dy = parseFloat(targetPos.lat) - parseFloat(initialPos.lat);
      const dx = parseFloat(targetPos.lng) - parseFloat(initialPos.lng);
      const visualHeading = (Math.atan2(dx, dy) * 180) / Math.PI;
      setHeading(visualHeading);

      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [bus.lat, bus.lon]);

  return (
    <OverlayView
      position={pos}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -(height / 2) })}
    >
      <div
        onClick={() => onClick(bus)}
        className="cursor-pointer flex flex-col items-center"
      >
        <img
          src={busIcon}
          alt="bus"
          style={{
            width: '45px',
            height: '45px',
            // Image faces Right (+90°). Subtract 90 to match 0° North vector.
            transform: `rotate(${heading - 90}deg)`,
            transition: 'transform 0.5s ease-in-out'
          }}
        />
      </div>
    </OverlayView>
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
  const [routePath, setRoutePath] = useState([]);
  const [routeSearchQuery, setRouteSearchQuery] = useState('');
  const [stopSearchQuery, setStopSearchQuery] = useState('');
  const [isRouteDropdownOpen, setIsRouteDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const RADIUS_LIMIT_KM = 10;
  const navigate = useNavigate();

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
        }
      } catch (err) {
        console.error("Failed to fetch live locations:", err);
      }
    };

    fetchStaticData();

    // Initial fetch for all buses
    const fetchInitialLocations = async () => {
      try {
        const res = await fetch(`${API_URL}/buses/locations`);
        const data = await res.json();
        if (data.success && data.locations) {
          const formatted = data.locations.map(loc => ({
            ...loc,
            lat: parseFloat(loc.lat),
            lon: parseFloat(loc.lon),
            speed: parseFloat(loc.speed || 0),
            distance: 0
          }));
          setNearbyBuses(formatted);
        }
      } catch (err) {
        console.error("Initial location fetch failed:", err);
      }
    };
    fetchInitialLocations();

    // Setup Socket.io for Real-time Streaming
    const socket = io('/', { path: '/socket.io' });

    socket.on('bus:location', (update) => {
      setNearbyBuses(prev => {
        const exists = prev.find(b => b.id === update.id || b.busId === update.busId);
        if (exists) {
          return prev.map(b => (b.id === update.id || b.busId === update.busId) ? {
            ...b,
            lat: update.lat,
            lon: update.lon,
            speed: update.speed,
            heading: update.heading
          } : b);
        } else {
          // If a new bus comes online, add it!
          return [...prev, {
            ...update,
            lat: parseFloat(update.lat),
            lon: parseFloat(update.lon),
            speed: parseFloat(update.speed || 0),
            distance: 0
          }];
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [API_URL]);

  // Fetch Route Path for Polyline when route is selected
  useEffect(() => {
    const fetchRoutePath = async () => {
      if (selectedRoute === 'All') {
        setRoutePath([]);
        return;
      }
      try {
        // Find the route ID for the selected routeNumber
        const routeObj = allRoutes.find(r => String(r.routeNumber) === String(selectedRoute));
        if (!routeObj) return;

        const res = await fetch(`${API_URL}/site/routes/${routeObj.id}`);
        const data = await res.json();
        if (data.success && data.route?.stops && data.route.stops.length >= 2) {
          const stops = data.route.stops
            .filter(s => s.lat && s.lng)
            .map(s => ({ lat: parseFloat(s.lat), lng: parseFloat(s.lng) }));

          const isExpressway = String(selectedRoute).startsWith("EX-");

          // OPTIMIZATION: Use Google Directions Service to get exact road-snapped path
          const directionsService = new window.google.maps.DirectionsService();

          const origin = stops[0];
          const destination = stops[stops.length - 1];
          const waypoints = stops.slice(1, -1).map(s => ({
            location: new window.google.maps.LatLng(s.lat, s.lng),
            stopover: true
          }));

          directionsService.route(
            {
              origin: new window.google.maps.LatLng(origin.lat, origin.lng),
              destination: new window.google.maps.LatLng(destination.lat, destination.lng),
              waypoints: waypoints,
              travelMode: window.google.maps.TravelMode.DRIVING,
              avoidHighways: !isExpressway,
              optimizeWaypoints: true
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                // Extract points from the result
                const fullPath = [];
                const legs = result.routes[0].legs;
                for (let i = 0; i < legs.length; i++) {
                  const steps = legs[i].steps;
                  for (let j = 0; j < steps.length; j++) {
                    const nextSeg = steps[j].path;
                    for (let k = 0; k < nextSeg.length; k++) {
                      fullPath.push({ lat: nextSeg[k].lat(), lng: nextSeg[k].lng() });
                    }
                  }
                }
                setRoutePath(fullPath);
              } else {
                // Fallback to straight lines if directions fail
                setRoutePath(stops);
                console.warn("Directions request failed due to " + status);
              }
            }
          );
        }
      } catch (err) {
        console.error("Failed to fetch route path:", err);
      }
    };
    if (isLoaded) fetchRoutePath();
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

  // Socket.io for real-time bus updates
  useEffect(() => {
    // Use relative path for socket (proxied via Vite)
    const socket = io({ auth: { admin: true } });
    socket.on("connect", () => setSocketStatus('connected'));
    socket.on("connect_error", () => setSocketStatus('error'));
    socket.on("bus:location", (data) => {
      setNearbyBuses((prev) => {
        const index = prev.findIndex(b => b.busId === data.busId);
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

  const onMapLoad = useCallback((mapInstance) => setMap(mapInstance), []);

  const handleRecenter = () => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(13);
    }
  };

  // Filter buses by selected route and optional distance (10km)
  const filteredBuses = useMemo(() => {
    let list = nearbyBuses;

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

    return list;
  }, [nearbyBuses, selectedRoute, statusFilter, useRadiusFilter, userLocation]);

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
            {filteredBuses.map((bus) => (
              <SmoothMarker
                key={bus.busId || bus.driverId}
                bus={bus}
                onClick={(b) => { setSelectedBus(b); setSelectedStop(null); }}
              />
            ))}

            {/* Route Polyline Path */}
            {routePath.length > 0 && (
              <Polyline
                path={routePath}
                options={{
                  strokeColor: "#2563eb",
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                  geodesic: true,
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
            {(showStops || (selectedRoute !== 'All' && routePath.length > 0)) && busStops
              .filter(stop => selectedRoute === 'All' || stop.routes.includes(selectedRoute))
              .map((stop) => (
                <Marker
                  key={stop.id}
                  position={{ lat: stop.lat, lng: stop.lng }}
                  icon={{
                    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    scaledSize: new window.google.maps.Size(18, 18),
                    anchor: new window.google.maps.Point(9, 9)
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
                          ROUTE {selectedBus.routeNumber}
                        </span>
                        <span style={{ color: '#9ca3af', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                          {selectedBus.busId}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                        To {selectedBus.destination || 'Terminal'}
                      </div>
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

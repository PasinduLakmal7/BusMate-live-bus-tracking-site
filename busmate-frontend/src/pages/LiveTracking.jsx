import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Map as MapIcon, Map, Filter, Layers, Crosshair, Bus, X, Users, Zap, Clock, ChevronRight, Star, AlertTriangle, Footprints, ArrowDownUp } from 'lucide-react';
import { GoogleMap, Marker, useLoadScript, InfoWindow, Autocomplete, Polyline, OverlayViewF, DirectionsRenderer, OverlayView } from "@react-google-maps/api";
import { useLocation, useNavigate } from 'react-router-dom';
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
  const [heading, setHeading] = useState(parseFloat(bus.heading) || 0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Reset hover whenever the bus moves to a new GPS position
    setIsHovered(false);

    let start = null;
    let animationFrameId;
    // MATCH TELEMETRY SYNC: 5 seconds update cycle
    const duration = 5000;
    const initialPos = { ...pos };
    const targetPos = { lat: bus.lat, lng: bus.lon };

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const nextLat = initialPos.lat + (targetPos.lat - initialPos.lat) * progress;
      const nextLng = initialPos.lng + (targetPos.lng - initialPos.lng) * progress;
      setPos({ lat: nextLat, lng: nextLng });
      if (progress < 1) animationFrameId = requestAnimationFrame(animate);
    };

    const diffLat = Math.abs(parseFloat(targetPos.lat) - parseFloat(initialPos.lat));
    const diffLng = Math.abs(parseFloat(targetPos.lng) - parseFloat(initialPos.lng));

    // Update heading only if movement is significant
    if (diffLat > 0.000001 || diffLng > 0.000001) {
      const dy = parseFloat(targetPos.lat) - parseFloat(initialPos.lat);
      const dx = parseFloat(targetPos.lng) - parseFloat(initialPos.lng);
      // Determine rotation from North (0 degrees)
      const newHeading = (Math.atan2(dx, dy) * 180) / Math.PI;
      setHeading(newHeading);
      animationFrameId = requestAnimationFrame(animate);
    } else {
      setPos(targetPos);
    }

    return () => { if (animationFrameId) cancelAnimationFrame(animationFrameId); };
  }, [bus.lat, bus.lon]);

  const occupancyColor = bus.occupancy < 40 ? 'bg-emerald-500' : bus.occupancy < 80 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <OverlayViewF
      position={pos}
      mapPaneName="overlayMouseTarget"
      getPixelPositionOffset={() => ({ x: -20, y: -20 })}
    >
      <div
        onMouseUp={(e) => { e.stopPropagation(); onClick(bus); }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative cursor-pointer touch-none"
        style={{ width: '40px', height: '40px', pointerEvents: 'auto' }}
      >
        {/* Route Badge */}
        {isHovered && (
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0a0a0c]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-2xl pointer-events-none whitespace-nowrap z-[100]"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-white uppercase tracking-wider">
                {bus.routePath || 'Route Tracking'}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full ${occupancyColor}`}></div>
            </div>
          </div>
        )}

        <img
          src={busIcon}
          alt="bus"
          style={{
            width: '40px',
            height: '40px',
            // Correct for icon being East-facing by default (Standard 2D asset)
            transform: `rotate(${heading - 90}deg)`,
            transition: 'transform 0.8s ease-in-out',
          }}
          className="relative z-0 drop-shadow-lg hover:scale-110 active:scale-95 transition-transform"
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
  const [allRoutes, setAllRoutes] = useState([]);
  const [busesMeta, setBusesMeta] = useState([]);
  const [driversMeta, setDriversMeta] = useState([]);
  const [allStopsRaw, setAllStopsRaw] = useState([]);
  const currentRouteObj = useMemo(() => {
    return allRoutes.find(r => String(r.routeNumber) === String(selectedRoute));
  }, [allRoutes, selectedRoute]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [map, setMap] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [socketStatus, setSocketStatus] = useState('connecting');
  const [userLocation, setUserLocation] = useState(null);
  const [useRadiusFilter, setUseRadiusFilter] = useState(false);
  const [showStops, setShowStops] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [walkingDirections, setWalkingDirections] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationInfo, setNavigationInfo] = useState({ distance: '', duration: '', instruction: '' });
  const [catchStatus, setCatchStatus] = useState({ status: 'analyzing', busETA: null, walkETA: null, busNumber: '' });
  const [routeSearchQuery, setRouteSearchQuery] = useState('');
  const [stopSearchQuery, setStopSearchQuery] = useState('');
  const [isRouteDropdownOpen, setIsRouteDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [directionFilter, setDirectionFilter] = useState('All'); // New: 'All', 'Forward', 'Return'
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [favBusIds, setFavBusIds] = useState([]);
  const [debugLogs, setDebugLogs] = useState(["Initializing telemetry..."]);
  const RADIUS_LIMIT_KM = 20;
  const navigate = useNavigate();
  const location = useLocation();

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

  // Handle Auto-Start Navigation from Route Planner
  useEffect(() => {
    if (location.state?.autoStartRoute) {
      setSelectedRoute(location.state.autoStartRoute);
      if (location.state.autoStartNavigation) {
        // Small delay to allow route to settle and directions service to pick up nearest stop before expanding UI
        setTimeout(() => setIsNavigating(true), 800);
      }

      // Clean up the state so it doesn't re-trigger on refresh safely
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

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


  // Fetch Bus Stops, Routes and Bus Metadata from Backend
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        setDebugLogs(prev => [...prev.slice(-4), "Metadata Sync: Initiated"]);

        const [stopsRes, routesRes, busesRes, driversRes] = await Promise.all([
          fetch(`${API_URL}/site/stops`).catch(e => ({ status: 'fetch_error', ok: false })),
          fetch(`${API_URL}/site/routes`).catch(e => ({ status: 'fetch_error', ok: false })),
          fetch(`${API_URL}/site/buses`).catch(e => ({ status: 'fetch_error', ok: false })),
          fetch(`/api/drivers/all`).catch(e => ({ status: 'fetch_error', ok: false }))
        ]);

        if (stopsRes.status === 500) setDebugLogs(prev => [...prev.slice(-4), "ERR: Stops 500"]);
        if (routesRes.status === 500) setDebugLogs(prev => [...prev.slice(-4), "ERR: Routes 500"]);
        if (busesRes.status === 500) setDebugLogs(prev => [...prev.slice(-4), "ERR: Buses 500"]);
        if (driversRes.status === 500) setDebugLogs(prev => [...prev.slice(-4), "ERR: Drivers 500"]);

        const [stopsData, routesData, busesData, driversData] = await Promise.all([
          stopsRes.ok ? stopsRes.json() : { success: false },
          routesRes.ok ? routesRes.json() : { success: false },
          busesRes.ok ? busesRes.json() : { success: false },
          driversRes.ok ? driversRes.json() : { success: false }
        ]);

        if (stopsData.success && stopsData.stops) {
          setAllStopsRaw(stopsData.stops);
          const stopsMap = new window.Map();
          stopsData.stops.forEach((stop) => {
            if (!stopsMap.has(stop.id)) {
              stopsMap.set(stop.id, {
                id: stop.id,
                name: stop.name,
                lat: parseFloat(stop.lat),
                lng: parseFloat(stop.lng),
                order: parseInt(stop.order) || 0,
                routes: [stop.route]
              });
            } else {
              const entry = stopsMap.get(stop.id);
              if (!entry.routes.includes(stop.route)) {
                entry.routes.push(stop.route);
              }
            }
          });
          setBusStops(Array.from(stopsMap.values()));
        }

        if (routesData.success) setAllRoutes(routesData.routes || []);
        if (busesData.success) setBusesMeta(busesData.buses || busesData.data || []);
        if (driversData.success) setDriversMeta(driversData.data || driversData.drivers || []);

        setDebugLogs(prev => [...prev.slice(-4), "Metadata Sync: Ready"]);

      } catch (err) {
        console.error("Static fetch failure:", err);
        setDebugLogs(prev => [...prev.slice(-4), "Metadata Sync: Offline"]);
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
        console.error("Live fetch failure:", err);
      }
    };

    fetchStaticData();
    fetchLiveLocations();
  }, [API_URL]);

  const lastFetchedRouteRef = useRef(null);

  // Fetch Route Path using Directions API when route is selected
  useEffect(() => {
    if (!isLoaded || selectedRoute === 'All') {
      setDirectionsResponse(null);
      lastFetchedRouteRef.current = 'All';
      return;
    }

    if (lastFetchedRouteRef.current === selectedRoute) return;

    let ignore = false;

    const fetchRoutePath = async () => {
      try {
        const route = allRoutes.find(r => String(r.routeNumber) === String(selectedRoute));
        if (!route) {
          console.warn(`[RoutePath] Route ${selectedRoute} metadata not found in allRoutes.`);
          return;
        }

        lastFetchedRouteRef.current = selectedRoute;

        const routeNum = String(selectedRoute);
        const sortedRouteStops = allStopsRaw
          .filter(s =>
            String(s.route) === routeNum ||
            String(s.routeNumber) === routeNum ||
            String(s.route_id) === String(route.id)
          )
          .sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0))
          .slice(0, 23);

        setDebugLogs(prev => [...prev.slice(-4), `Route ${routeNum}: ${sortedRouteStops.length} stops found`]);

        if (sortedRouteStops.length < 2) {
          setDebugLogs(prev => [...prev.slice(-4), `Route ${routeNum}: Insufficient stops`]);
          return;
        }

        const waypoints = sortedRouteStops.map(stop => ({
          location: {
            lat: parseFloat(stop.lat || stop.latitude) || 0,
            lng: parseFloat(stop.lng || stop.longitude) || 0
          },
          stopover: true
        }));

        const originStop = sortedRouteStops[0];
        const destStop = sortedRouteStops[sortedRouteStops.length - 1];

        const originLat = parseFloat(originStop?.lat || originStop?.latitude) || 6.9271;
        const originLng = parseFloat(originStop?.lng || originStop?.longitude) || 79.8612;
        const destLat = parseFloat(destStop?.lat || destStop?.latitude) || 6.9271;
        const destLng = parseFloat(destStop?.lng || destStop?.longitude) || 79.8612;

        const directionsService = new window.google.maps.DirectionsService();

        const requestDirections = (useWaypoints) => {
          const originCoords = { lat: parseFloat(originLat.toFixed(6)), lng: parseFloat(originLng.toFixed(6)) };
          const destCoords = { lat: parseFloat(destLat.toFixed(6)), lng: parseFloat(destLng.toFixed(6)) };

          // Standard Google Maps API limit is 23 TOTAL waypoints (Origin + Destination + 21 Intermediate). 
          // Slice intelligently to stay within the 21 intermediate stop limit.
          let finalWaypoints = [];
          if (useWaypoints && waypoints.length > 2) {
            const intermediateStops = waypoints.slice(1, -1);
            if (intermediateStops.length > 21) {
              // Pick 21 stops evenly distributed to maintain road-snapping shape
              const total = intermediateStops.length;
              finalWaypoints = Array.from({ length: 21 }, (_, i) =>
                intermediateStops[Math.floor((i * total) / 21)]
              );
            } else {
              finalWaypoints = intermediateStops;
            }
          }

          directionsService.route(
            {
              origin: originCoords,
              destination: destCoords,
              waypoints: finalWaypoints,
              optimizeWaypoints: false,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK && !ignore) {
                setDirectionsResponse(result);
              } else if (useWaypoints && !ignore) {
                requestDirections(false);
              } else if (!ignore) {
                console.error(`Route Path directions request failed due to ${status}`);
                setDirectionsResponse(null);
              }
            }
          );
        };

        requestDirections(true);
      } catch (err) {
        console.error("Route path fetch error:", err);
      }
    };

    fetchRoutePath();
    return () => { ignore = true; };
  }, [selectedRoute, allRoutes, allStopsRaw, isLoaded]);

  // Nearest bus stop on the selected route to the user's location (must be before walking useEffect)
  const nearestStopOnRoute = useMemo(() => {
    if (!userLocation || selectedRoute === 'All' || !allRoutes.length) return null;

    const currentRouteObj = allRoutes.find(r => String(r.routeNumber) === String(selectedRoute));

    // Use allStopsRaw for more robust filtering including route_id
    const stopsOnRoute = allStopsRaw.filter(s =>
      String(s.route) === String(selectedRoute) ||
      String(s.routeNumber) === String(selectedRoute) ||
      String(s.route_id) === String(currentRouteObj?.id)
    );

    if (stopsOnRoute.length === 0) return null;

    let nearest = null;
    let minDist = Infinity;

    stopsOnRoute.forEach(stop => {
      const stopLat = parseFloat(stop.lat || stop.latitude);
      const stopLng = parseFloat(stop.lng || stop.longitude);
      if (isNaN(stopLat) || isNaN(stopLng)) return;

      const d = calculateDistance(userLocation.lat, userLocation.lng, stopLat, stopLng);
      if (d < minDist) {
        minDist = d;
        nearest = {
          ...stop,
          lat: stopLat,
          lng: stopLng,
          name: stop.stop_name || stop.name
        };
      }
    });

    return nearest;
  }, [userLocation, selectedRoute, allStopsRaw, allRoutes]);

  // Transfer stop (Alighting Stop) identification for multi-leg journeys
  const transferStop = useMemo(() => {
    // Priority 1: Check if we have coordinate coordinates passed directly (Most Reliable)
    const latVal = parseFloat(location.state?.autoSetArrivalLat);
    const lngVal = parseFloat(location.state?.autoSetArrivalLng);

    if (!isNaN(latVal) && !isNaN(lngVal)) {
      return {
        lat: latVal,
        lng: lngVal,
        name: location.state.autoSetDirection || "Your Stop"
      };
    }

    if (!allStopsRaw.length) return null;

    // Fallback: Name-based matching (for manual route selection if needed)
    const rawTarget = location.state?.autoSetDirection || navigationInfo.arrivalStop;
    if (!rawTarget) return null;

    const normalize = (str) => {
      if (!str) return "";
      return str.toLowerCase()
        .replace(/\bjunction\b/g, 'jct')
        .replace(/\bbus stop\b/g, '')
        .replace(/\bbus stand\b/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
    };

    const targetName = normalize(rawTarget);

    // FUZZY MATCH
    const stop = allStopsRaw.find(s => {
      const dbName = normalize(s.stop_name || s.name);
      return dbName === targetName || dbName.includes(targetName) || targetName.includes(dbName);
    });

    if (!stop) return null;
    const finalLat = parseFloat(stop.lat || stop.latitude);
    const finalLng = parseFloat(stop.lng || stop.longitude);

    if (isNaN(finalLat) || isNaN(finalLng)) return null;

    return {
      lat: finalLat,
      lng: finalLng,
      name: stop.stop_name || stop.name
    };
  }, [location.state, navigationInfo.arrivalStop, allStopsRaw]);

  // Walking directions: user location → nearest stop on selected route (actual road path)
  useEffect(() => {
    if (!isLoaded || !userLocation || !nearestStopOnRoute) {
      setWalkingDirections(null);
      return;
    }
    let cancelled = false;
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: userLocation,
        destination: { lat: nearestStopOnRoute.lat, lng: nearestStopOnRoute.lng },
        travelMode: window.google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (!cancelled && status === window.google.maps.DirectionsStatus.OK) {
          setWalkingDirections(result);
        } else if (!cancelled) {
          setWalkingDirections(null);
        }
      }
    );
    return () => { cancelled = true; };
  }, [userLocation, nearestStopOnRoute, isLoaded]);

  // Handle Navigation Panel Info Updates
  useEffect(() => {
    if (walkingDirections && walkingDirections.routes[0]) {
      const leg = walkingDirections.routes[0].legs[0];
      setNavigationInfo({
        distance: leg.distance.text,
        duration: leg.duration.text,
        instruction: leg.steps[0].instructions.replace(/<[^>]*>?/gm, '') // Strip HTML tags
      });
    } else if (isNavigating) {
      // If we're already navigating but directions are temporarily missing, 
      // don't kill the session, just wait for the update.
      // setIsNavigating(false); // REMOVED THIS LINE
    }
  }, [walkingDirections]);

  // Auto-center camera during navigation mode
  useEffect(() => {
    if (isNavigating && map && userLocation) {
      map.panTo(userLocation);
      // Ensure tilt is active for 2.5D look
      map.setTilt(45);
    }
  }, [isNavigating, userLocation, map]);


  // Fetch User Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            heading: position.coords.heading || 0,
          });
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Socket.io for real-time bus updates (Authenticated as Admin)
  useEffect(() => {
    const socket = io({
      auth: { admin: true },
      transports: ['polling', 'websocket'],
      path: '/socket.io',
      extraHeaders: { "ngrok-skip-browser-warning": "true" }
    });

    socket.on("connect", () => {
      setSocketStatus('connected');
      setDebugLogs(prev => [...prev.slice(-4), "Telemetry Uplink: Active"]);
    });


    socket.on("bus:location", (data) => {
      setNearbyBuses((prev) => {
        // More aggressive ID matching including driverId from mobile app
        const index = prev.findIndex(b =>
          (data.busId && (b.busId === data.busId || b.bus_number === data.busId)) ||
          (data.id && String(b.id) === String(data.id)) ||
          (data.driverId && (String(b.driverId) === String(data.driverId) || String(b.driver_id) === String(data.driverId)))
        );

        if (index !== -1) {
          const newBuses = [...prev];
          const existing = newBuses[index];
          newBuses[index] = {
            ...existing,
            ...data,
            lat: parseFloat(data.lat),
            lon: parseFloat(data.lon),
            // Preserve enriched metadata if incoming data is sparse
            routeId: data.routeId || data.route_id || existing.routeId,
            routeNumber: data.routeNumber || data.route_number || existing.routeNumber || data.routeNo,
            destination: data.destination || existing.destination,
            isReturning: data.isReturning !== undefined ? data.isReturning : existing.isReturning,
            is_returning: data.isReturning !== undefined ? data.isReturning : existing.is_returning,
            busId: data.busId || data.bus_number || existing.busId
          };
          return newBuses;
        }

        return [...prev, {
          ...data,
          lat: parseFloat(data.lat),
          lon: parseFloat(data.lon),
          speed: parseFloat(data.speed || 0),
          busId: data.busId || data.bus_number || (data.driverId ? `D-${data.driverId}` : data.id)
        }];
      });
    });

    return () => socket.disconnect();
  }, []);

  const mapContainerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);

  const onMapLoad = useCallback((mapInstance) => setMap(mapInstance), []);

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
      const targetId = String(routeObj ? routeObj.id : selectedRoute);
      const targetNum = String(selectedRoute);

      list = list.filter(b =>
        String(b.routeId) === targetId ||
        String(b.route_id) === targetId ||
        String(b.routeNumber) === targetNum ||
        String(b.route_number) === targetNum ||
        String(b.routeNo) === targetNum
      );
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

    // Filter by direction if specific route selected
    if (selectedRoute !== 'All' && directionFilter !== 'All') {
      list = list.filter(b => {
        const isReturning = b.isReturning || b.is_returning;
        if (directionFilter === 'Forward') return !isReturning;
        if (directionFilter === 'Return') return isReturning;
        return true;
      });
    }

    return list.map(bus => {
      // 1. SELF-HEALING: Enrich from busesMeta if critical fields are missing
      let enrichedBus = { ...bus };

      let meta = busesMeta.find(m =>
        (enrichedBus.busId && (m.bus_number === enrichedBus.busId || m.license_plate === enrichedBus.busId)) ||
        (enrichedBus.id && String(m.id) === String(enrichedBus.id)) ||
        (enrichedBus.driverId && String(m.driver_id) === String(enrichedBus.driverId)) ||
        (enrichedBus.driver_id && String(m.driver_id) === String(enrichedBus.driver_id))
      );

      // 2. CROSS-ENTITY FALLBACK: If not found in busesMeta, try to resolve via Driver registry
      if (!meta && (enrichedBus.driverId || enrichedBus.driver_id)) {
        const dID = enrichedBus.driverId || enrichedBus.driver_id;
        const driver = driversMeta.find(d => String(d.driver_id) === String(dID) || String(d.id) === String(dID));
        if (driver && driver.bus_id) {
          meta = busesMeta.find(m => String(m.id) === String(driver.bus_id));
        }
      }

      if (meta) {
        enrichedBus.busId = enrichedBus.busId && !enrichedBus.busId.startsWith('D-') ? enrichedBus.busId : (meta.bus_number || meta.license_plate);
        enrichedBus.routeId = enrichedBus.routeId || meta.route_id;
        enrichedBus.routeNumber = enrichedBus.routeNumber || meta.route_number;
        enrichedBus.destination = enrichedBus.destination || meta.destination || meta.end_location;
        enrichedBus.id = enrichedBus.id || meta.id;
      }

      // 3. Resolve route details from allRoutes
      const route = allRoutes.find(r =>
        String(r.id) === String(enrichedBus.routeId) ||
        String(r.id) === String(enrichedBus.route_id) ||
        String(r.routeNumber) === String(enrichedBus.routeNumber) ||
        String(r.routeNumber) === String(enrichedBus.routeNo) ||
        String(r.routeNumber) === String(enrichedBus.route_number)
      );

      let routePath = '???';
      if (route) {
        enrichedBus.routeNumber = route.routeNumber;
        enrichedBus.startLocation = route.startLocation;
        enrichedBus.endLocation = route.endLocation;

        // Dynamically set destination based on simulation/socket 'isReturning' flag
        if (enrichedBus.isReturning || enrichedBus.is_returning) {
          enrichedBus.destination = route.startLocation;
          enrichedBus.direction = 'Return';
        } else {
          enrichedBus.destination = route.endLocation;
          enrichedBus.direction = 'Forward';
        }
        routePath = `${route.routeNumber}/${enrichedBus.destination}`;
      } else if (enrichedBus.routeNumber || enrichedBus.route_number || enrichedBus.routeNo) {
        const num = enrichedBus.routeNumber || enrichedBus.route_number || enrichedBus.routeNo;
        routePath = enrichedBus.destination ? `${num}/${enrichedBus.destination}` : num;
      } else if (enrichedBus.destination) {
        routePath = enrichedBus.destination;
      }

      return { ...enrichedBus, routePath: String(routePath).toUpperCase() };
    });
  }, [nearbyBuses, selectedRoute, statusFilter, directionFilter, useRadiusFilter, userLocation, showOnlyFavorites, favBusIds, allRoutes, busesMeta, driversMeta]);

  // Race Logic: Compare Bus ETA with User Walking ETA
  useEffect(() => {
    if (!isNavigating || !selectedRoute || selectedRoute === 'All' || !nearestStopOnRoute || !nearbyBuses.length || !navigationInfo.duration) {
      // Only reset if totally not navigating or missing essential info
      if (!isNavigating) setCatchStatus({ status: 'analyzing', busETA: null, walkETA: null, busNumber: '' });
      return;
    }

    const walkTimeMin = parseInt(navigationInfo.duration) || 0;
    // Include all buses on the route, even if they are currently idle (speed 0)
    const busesOnRoute = filteredBuses.filter(b => String(b.routeId) !== '0');

    if (busesOnRoute.length === 0) {
      setCatchStatus({ status: 'No buses on route', busETA: null, walkETA: walkTimeMin, busNumber: '' });
      return;
    }

    // Get all stops for THIS route in order
    const currentRouteObj = allRoutes.find(r => String(r.routeNumber) === String(selectedRoute));
    const routeStops = allStopsRaw
      .filter(s => String(s.route) === String(selectedRoute) || String(s.routeId) === String(currentRouteObj?.id))
      .sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));

    // Find our target stop's order
    const targetStopOrder = parseInt(nearestStopOnRoute.order) || 0;

    // Find the best APPROACHING bus
    let bestBus = null;
    let minBusETA = Infinity;
    let anyBusExisted = busesOnRoute.length > 0;
    let busesActuallyPassed = 0;

    busesOnRoute.forEach(bus => {
      const isReturning = bus.isReturning || bus.is_returning;
      const distToStop = calculateDistance(bus.lat, bus.lon, nearestStopOnRoute.lat, nearestStopOnRoute.lng);

      // Optimization: Find the closest stop to the bus to get its 'current order'
      let busCurrentOrder = 0;
      let minBusToStopDist = Infinity;
      routeStops.forEach(rs => {
        const d = calculateDistance(bus.lat, bus.lon, parseFloat(rs.lat), parseFloat(rs.lng));
        if (d < minBusToStopDist) {
          minBusToStopDist = d;
          busCurrentOrder = parseInt(rs.order) || 0;
        }
      });

      // Enhanced: Only mark as passed if strictly beyond the stop AND further than 800m away
      // We check if busCurrentOrder is significantly greater than targetStopOrder to avoid snap-jitter
      let hasPassed = false;
      if (targetStopOrder > 0) { // Only check if we have valid sequence data
        if (!isReturning) {
          if (busCurrentOrder > targetStopOrder && distToStop > 0.8) hasPassed = true;
        } else {
          if (busCurrentOrder < targetStopOrder && distToStop > 0.8) hasPassed = true;
        }
      }

      if (hasPassed) {
        busesActuallyPassed++;
      } else {
        const speed = Math.max(parseFloat(bus.speed || 0), 25);
        const etaMin = (distToStop / speed) * 60;
        if (etaMin < minBusETA) {
          minBusETA = etaMin;
          bestBus = bus;
        }
      }
    });

    if (bestBus) {
      const diff = minBusETA - walkTimeMin;
      let status = 'Safe to Catch';

      if (minBusETA < 1.5) status = 'Bus at Stop!';
      else if (diff < -3) status = 'Potential Miss';
      else if (diff < 2) status = 'Hurry Up!';
      else status = 'Safe to Catch';

      setCatchStatus({
        status,
        busETA: Math.ceil(minBusETA),
        walkETA: walkTimeMin,
        busNumber: bestBus.busId || bestBus.bus_number || 'Bus'
      });
    } else {
      // Differentiate why we have no bus
      const statusText = anyBusExisted && busesActuallyPassed === busesOnRoute.length
        ? 'Passed Your Stop'
        : 'Waiting for Bus...';

      setCatchStatus({ status: statusText, busETA: null, walkETA: walkTimeMin, busNumber: '' });
    }
  }, [isNavigating, selectedRoute, nearestStopOnRoute, nearbyBuses, navigationInfo.duration, filteredBuses]);

  const handleRecenter = () => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(13);
    }
  };



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
  // (nearestStopOnRoute moved above walking useEffect to prevent TDZ error)

  return (
    <div className="relative h-[calc(100vh)] w-full overflow-hidden">

      {/* ── MODERN NAVIGATION OVERLAY (Floating Dynamic Mode) ── */}
      {isNavigating && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-[100] animate-in slide-in-from-top duration-500">
          <div className={`backdrop-blur-xl p-5 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 transition-all duration-700 ${catchStatus.status === 'Safe to Catch' ? 'bg-emerald-600/90 dark:bg-emerald-500/90' :
            catchStatus.status === 'Hurry Up!' ? 'bg-amber-500/90 dark:bg-amber-400/90' :
              catchStatus.status === 'Potential Miss' ? 'bg-rose-600/90 dark:bg-rose-500/90' :
                catchStatus.status === 'Passed Your Stop' ? 'bg-red-800/95 dark:bg-red-700/95' :
                  catchStatus.status === 'Bus at Stop!' ? 'bg-blue-600/90 dark:bg-blue-500/90 animate-pulse' :
                    'bg-gray-800/90 dark:bg-gray-700/90'
            }`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 grow min-w-0">
                <div className="bg-white/20 p-3 rounded-2xl flex-shrink-0">
                  <Footprints className={`w-6 h-6 text-white ${catchStatus.status !== 'Safe to Catch' ? 'animate-pulse' : ''}`} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5 leading-none">
                    {transferStop ? 'Transfer Intelligence' : 'Status Intelligence'}
                  </p>
                  <h2 className="text-white text-lg font-black leading-tight truncate uppercase tracking-tight">
                    {transferStop
                      ? `Transfer at ${transferStop.name}`
                      : (navigationInfo.instruction || `Heading to ${nearestStopOnRoute?.name}`)}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsNavigating(false)}
                className="bg-black/10 hover:bg-black/20 text-white p-2.5 rounded-2xl border border-white/10 transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 pt-5 border-t border-white/10 flex flex-col gap-4">
              <div className="flex divide-x divide-white/10 items-center grow">
                <div className="px-4 text-center basis-1/3">
                  <div className="flex items-center justify-center gap-1.5 mb-1.5 leading-none">
                    <Footprints className="w-3 h-3 text-white/40" />
                    <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest">Your Walk</p>
                  </div>
                  <p className="text-xl font-black text-white leading-none">{navigationInfo.duration || '-- min'}</p>
                </div>
                <div className="px-4 text-center basis-1/3 border-white/10">
                  <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest mb-1.5 leading-none">Bus {catchStatus.busNumber || '--'}</p>
                  <p className={`text-xl font-black leading-none ${catchStatus.status.includes('Miss') || catchStatus.status.includes('Passed') ? 'text-red-200' : 'text-white'}`}>
                    {catchStatus.busETA ? `${catchStatus.busETA} min` : '--'}
                  </p>
                </div>
                <div className="px-4 text-center basis-1/3 border-white/10">
                  <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest mb-1.5 leading-none">Verdict</p>
                  <div className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-tighter leading-none inline-block transition-all shadow-lg ${catchStatus.status === 'Safe to Catch' ? 'bg-white text-emerald-600' :
                    catchStatus.status === 'Hurry Up!' ? 'bg-white text-amber-600 animate-pulse' :
                      catchStatus.status === 'Potential Miss' ? 'bg-white text-rose-600 animate-bounce' :
                        catchStatus.status === 'Passed Your Stop' ? 'bg-red-600 text-white ring-2 ring-white/30' :
                          catchStatus.status === 'Bus at Stop!' ? 'bg-white text-blue-600' :
                            'bg-white/10 text-white/60'
                    }`}>
                    {catchStatus.status}
                  </div>
                </div>
              </div>

              {/* Race Progress Bar */}
              {catchStatus.busETA && (
                <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full transition-all duration-1000 ${catchStatus.status === 'Safe to Catch' ? 'bg-emerald-400' :
                      catchStatus.status === 'Hurry Up!' ? 'bg-amber-400' : 'bg-rose-500'
                      }`}
                    style={{ width: `${Math.min(100, (catchStatus.walkETA / catchStatus.busETA) * 50)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PREMIUM START NAVIGATION CARD ── */}
      {walkingDirections && !isNavigating && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[100] animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500">
          <div className="bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-2xl p-5 rounded-[28px] shadow-2xl border border-white/20 dark:border-gray-800 flex flex-col gap-4 shadow-blue-500/10">
            <div className="flex justify-between items-center px-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Route Ready</p>
                </div>
                <h3 className="text-gray-900 dark:text-white font-bold text-[15px] leading-tight truncate max-w-[160px]">
                  {nearestStopOnRoute?.name || 'Nearest Stop'}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  {navigationInfo?.duration || '--'}
                </div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  {navigationInfo?.distance || '--'} walk
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsNavigating(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3 py-4 rounded-2xl font-black shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-[0.2em] group border border-blue-500/50"
            >
              <Zap className="w-5 h-5 fill-current group-hover:rotate-12 group-hover:scale-110 transition-transform" />
              Start Navigation
            </button>
          </div>
        </div>
      )}

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



            {/* User Location — Pulsing Dot (always visible) */}
            {userLocation && (
              <OverlayViewF
                position={userLocation}
                mapPaneName="overlayMouseTarget"
                getPixelPositionOffset={() => ({ x: -24, y: -24 })}
              >
                <div className="pointer-events-none transition-all duration-300" style={{ transform: isNavigating ? `rotate(${userLocation.heading || 0}deg)` : 'none' }}>
                  {isNavigating ? (
                    /* Navigation Arrow */
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <div className="absolute inset-0 bg-blue-600/20 rounded-full animate-ping" />
                      <div className="relative">
                        <div className="absolute -inset-2 bg-blue-600/30 blur-lg rounded-full" />
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
                          <path d="M20 5L32 32L20 26L8 32L20 5Z" fill="#2563eb" stroke="white" strokeWidth="3" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    /* Standard Pulsing Dot */
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <div className="absolute w-10 h-10 bg-blue-600/25 rounded-full animate-pulse" />
                      <div className="w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-lg shadow-blue-600/40 relative z-10" />
                    </div>
                  )}
                </div>
              </OverlayViewF>
            )}

            {/* Route Path (Blue) - Precise road-snapped Google path */}
            {directionsResponse && selectedRoute !== "All" && (
              <DirectionsRenderer
                directions={directionsResponse}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: "#3b82f6",
                    strokeOpacity: 0.9,
                    strokeWeight: 7,
                    zIndex: 100
                  }
                }}
              />
            )}

            {/* Walking path: user → nearest stop (Standard Red for foot distance) */}
            {walkingDirections && selectedRoute !== 'All' && (
              <DirectionsRenderer
                directions={walkingDirections}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: '#ef4444', // Red
                    strokeOpacity: 0.9,
                    strokeWeight: 6,
                    zIndex: 300,
                  },
                }}
              />
            )}

            {/* Transfer Point Indicator (High-Viz Yellow Aura for the alighting halt) */}
            {transferStop && (
              <>
                {/* Fallback Standard Marker (Guarantee visibility) */}
                <Marker
                  position={{ lat: transferStop.lat, lng: transferStop.lng }}
                  options={{
                    zIndex: 490,
                    icon: {
                      path: 0, // SymbolPath.CIRCLE
                      fillColor: '#facc15',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 3,
                      scale: 8
                    }
                  }}
                />
                {/* Premium Aura */}
                <OverlayViewF
                  position={{ lat: transferStop.lat, lng: transferStop.lng }}
                  mapPaneName="overlayLayer"
                  getPixelPositionOffset={() => ({ x: -30, y: -30 })}
                >
                  <div className="relative w-[60px] h-[60px] flex items-center justify-center z-[500] group">
                    {/* Elite Multi-ring Pulse */}
                    <div className="absolute inset-0 bg-yellow-400/30 rounded-full animate-[ping_2s_infinite]" />
                    <div className="absolute inset-[8px] bg-yellow-400/20 rounded-full animate-[ping_3s_infinite]" />

                    <div className="w-8 h-8 bg-yellow-400 rounded-full border-[4px] border-white shadow-[0_0_20px_rgba(250,204,21,0.6)] relative z-[510] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowDownUp className="w-4 h-4 text-gray-900 font-black" />
                    </div>

                    {/* Elite Glass Label Area */}
                    <div className="absolute top-full mt-4 bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-2xl whitespace-nowrap z-[520] group-hover:-translate-y-1 transition-transform">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                        <p className="text-[11px] font-black text-white uppercase tracking-wider">Stop: {transferStop.name}</p>
                      </div>
                    </div>
                  </div>
                </OverlayViewF>
              </>
            )}

            {/* Bus stop markers (Only if enabled or route selected) */}
            {(showStops || (selectedRoute !== 'All' && directionsResponse)) && busStops
              .filter(stop => selectedRoute === 'All' || stop.routes.includes(selectedRoute))
              .map((stop) => {
                const isKatubedda = (stop.stop_name || stop.name || '').toLowerCase().includes('katubedda');
                return (
                  <Marker
                    key={stop.id}
                    position={{ lat: parseFloat(stop.lat), lng: parseFloat(stop.lng) }}
                    icon={{
                      path: 0,
                      fillColor: isKatubedda ? '#75ef44ff' : (isDarkMode ? '#1e293b' : '#ffffff'),
                      fillOpacity: 1,
                      strokeColor: isKatubedda ? '#ffffff' : '#3b82f6',
                      strokeWeight: isKatubedda ? 3 : 3,
                      scale: isKatubedda ? 9 : 6,
                    }}
                    zIndex={isKatubedda ? 200 : 100}
                    onClick={() => { setSelectedStop(stop); setSelectedBus(null); }}
                  />
                );
              })}

            {/* Special Demo Marker: Katubedda Junction (Elite "Get back" Point) */}
            <OverlayViewF
              position={{ lat: 6.799325804010394, lng: 79.88839634948542 }}
              mapPaneName="floatPane"
              getPixelPositionOffset={() => ({ x: -60, y: -60 })}
            >
              <div className="relative flex flex-col items-center group cursor-pointer animate-in fade-in zoom-in duration-500 z-[1000]">
                {/* Modern "Get back" Label: Glassmorphism Elite */}
                <div className="mb-3 px-4 py-2 bg-blue-600/90 backdrop-blur-md rounded-2xl border border-white/30 shadow-[0_8px_32px_rgba(37,99,235,0.4)] flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
                  <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">Get back</span>
                </div>

                {/* Modern Pin Point */}
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping duration-[3s]" />
                  <div className="w-5 h-5 bg-blue-600 rounded-full border-[3px] border-white shadow-2xl relative z-10" />
                  {/* Tail */}
                  <div className="absolute -bottom-1 w-1 h-3 bg-blue-600 rounded-full blur-[1px]" />
                </div>
              </div>
            </OverlayViewF>
            {/* Premium Bus Info Popup using OverlayView for full styling control */}
            {selectedBus && (
              <OverlayViewF
                position={{ lat: selectedBus.lat, lng: selectedBus.lon }}
                mapPaneName={"floatPane"}
                getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -(height + 80) })}
              >
                <div className="animate-in fade-in zoom-in-95 duration-200 cursor-default select-none group pointer-events-auto">
                  {/* The Popup Container */}
                  <div className="relative w-[280px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[28px] shadow-2xl border border-white/20 dark:border-gray-800 p-5 pt-6 shadow-blue-500/10">

                    {/* Close Button - Optimized for Touch */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedBus(null);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute -top-2 -right-2 p-3 rounded-full bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 transition-all shadow-xl border border-gray-100 dark:border-gray-700 z-50 group active:scale-90"
                      title="Close"
                    >
                      <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    </button>

                    {/* Header: Route & ETA */}
                    <div className="flex justify-between items-start mb-5 pr-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                            Route {selectedBus.routeNumber || selectedBus.route_number || '--'}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 text-[10px] items-center font-bold uppercase tracking-widest flex gap-1">
                            {selectedBus.busId || selectedBus.busCode || 'Vehicle'}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-gray-50 leading-tight">
                          To {selectedBus.endLocation || selectedBus.destination || selectedBus.route_name || 'Terminal'}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/bus/${encodeURIComponent(selectedBus.id || selectedBus.busId || selectedBus.driverId || 'dummy')}`);
                      }}
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
                mapPaneName={"floatPane"}
                getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -(height + 60) })}
              >
                <div className="animate-in fade-in zoom-in-95 duration-200 cursor-default select-none pointer-events-auto">
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

              {/* ▬▬ NEW: INTEGRATED DIRECTION PICKER ▬▬ */}
              {selectedRoute !== 'All' && currentRouteObj && (
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 ml-1">Choose Destination</p>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDirectionFilter('Forward'); setIsRouteDropdownOpen(false); }}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black transition-all ${directionFilter === 'Forward' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'}`}
                    >
                      <span className="truncate pr-2">To {currentRouteObj.endLocation}</span>
                      {directionFilter === 'Forward' && <ChevronRight className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDirectionFilter('Return'); setIsRouteDropdownOpen(false); }}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black transition-all ${directionFilter === 'Return' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'}`}
                    >
                      <span className="truncate pr-2">To {currentRouteObj.startLocation}</span>
                      {directionFilter === 'Return' && <ChevronRight className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDirectionFilter('All'); }}
                      className={`text-[10px] font-bold text-center py-1.5 opacity-60 hover:opacity-100 transition-opacity uppercase tracking-widest underline underline-offset-4 decoration-blue-500/30 ${directionFilter === 'All' ? 'text-blue-600' : 'text-gray-500'}`}
                    >
                      Show Both Directions
                    </button>
                  </div>
                </div>
              )}

              {/* Search Inside Dropdown */}
              <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                <input
                  type="text"
                  placeholder="Change route or search city..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                  value={routeSearchQuery}
                  onChange={(e) => setRouteSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>

              <div className="max-h-64 overflow-y-auto">
                <div
                  onClick={() => { setSelectedRoute('All'); setDirectionFilter('All'); setIsRouteDropdownOpen(false); setRouteSearchQuery(''); }}
                  className={`px-4 py-3 text-xs font-bold cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${selectedRoute === 'All' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Clear Selection (Show All)
                </div>
                {filteredRoutesDropdown.map(route => (
                  <div
                    key={route.id}
                    onClick={() => { setSelectedRoute(route.routeNumber); setRouteSearchQuery(''); }}
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

            {/* Select Direction Filter (Conditional) */}
            {selectedRoute !== 'All' && currentRouteObj && (
              <div className="animate-in slide-in-from-left duration-500">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Select Direction</p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setDirectionFilter('All')}
                    className={`p-3.5 rounded-xl text-xs font-black border transition-all text-left flex justify-between items-center ${directionFilter === 'All'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <span>All Directions</span>
                    {directionFilter === 'All' && <ChevronRight className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setDirectionFilter('Forward')}
                    className={`p-3.5 rounded-xl text-xs font-black border transition-all text-left flex justify-between items-center ${directionFilter === 'Forward'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <div className="overflow-hidden">
                      <p className="opacity-60 text-[9px] uppercase tracking-tighter mb-0.5">Heading To</p>
                      <p className="truncate max-w-[180px]">{currentRouteObj.endLocation}</p>
                    </div>
                    {directionFilter === 'Forward' && <ChevronRight className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setDirectionFilter('Return')}
                    className={`p-3.5 rounded-xl text-xs font-black border transition-all text-left flex justify-between items-center ${directionFilter === 'Return'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <div className="overflow-hidden">
                      <p className="opacity-60 text-[9px] uppercase tracking-tighter mb-0.5">Heading To</p>
                      <p className="truncate max-w-[180px]">{currentRouteObj.startLocation}</p>
                    </div>
                    {directionFilter === 'Return' && <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

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

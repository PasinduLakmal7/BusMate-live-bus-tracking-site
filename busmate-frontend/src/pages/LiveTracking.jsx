import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Map as MapIcon, Filter, Layers, Crosshair, Bus, AlertCircle, Navigation } from 'lucide-react';
import { GoogleMap, Marker, useLoadScript, InfoWindow } from "@react-google-maps/api";
import io from "socket.io-client";
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import busIcon from '../assets/bus-icon.png';

const libraries = ["places"];

// Helper to calculate distance in km using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const LiveTracking = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('All');
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyBuses, setNearbyBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [map, setMap] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

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

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.error("Error getting location", err)
    );

    // Also track location
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.error("Error watching location", err)
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Socket connection for bus updates
  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:4000", {
      auth: { admin: true },
    });

    socket.on("bus:location", (data) => {
      // data: { driverId, busId, routeId, lat, lon, speed, timestamp }
      if (!userLocation) return;

      const dist = calculateDistance(userLocation.lat, userLocation.lng, data.lat, data.lon);

      if (dist <= 5) { // Only show buses within 5km
        setNearbyBuses((prev) => {
          const index = prev.findIndex(b => b.driverId === data.driverId);
          const updatedBus = { ...data, distance: dist };
          if (index !== -1) {
            const newBuses = [...prev];
            newBuses[index] = updatedBus;
            return newBuses;
          }
          return [...prev, updatedBus];
        });
      } else {
        // Remove from nearby if it goes out of range
        setNearbyBuses((prev) => prev.filter(b => b.driverId !== data.driverId));
      }
    });

    return () => socket.disconnect();
  }, [userLocation]);

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  const center = useMemo(() => userLocation || { lat: 6.9271, lng: 79.8612 }, [userLocation]);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const handleRecenter = () => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(15);
    }
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full bg-gray-100 dark:bg-gray-700 overflow-hidden pt-16 mt-[-4rem]">
      {/* Map Content */}
      <div className="absolute inset-0 z-0">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={14}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: true,
              zoomControl: false,
              styles: isDarkMode ? [
                { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
                { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
                { "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
                { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
                { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
                { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
                { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
                { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
                { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
                { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
                { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1b1b1b" }] },
                { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
                { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
                { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#373737" }] },
                { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
                { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#4e4e4e" }] },
                { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
                { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
                { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] }
              ] : []
            }}
          >
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
              />
            )}
            {nearbyBuses.map((bus) => (
              <Marker
                key={bus.driverId}
                position={{ lat: bus.lat, lng: bus.lon }}
                icon={{
                  url: busIcon,
                  scaledSize: new window.google.maps.Size(60, 50)
                }}
                onClick={() => setSelectedBus(bus)}
              />
            ))}
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50/50">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#94a3b8 2px, transparent 2px)", backgroundSize: "30px 30px" }}></div>
            <MapIcon className="w-24 h-24 text-blue-200 mb-4 animate-pulse" />
            <h2 className="text-xl font-bold text-gray-500 dark:text-gray-400">Loading Live Map...</h2>
            {loadError && <p className="text-red-500 mt-2">Error loading Google Maps</p>}
          </div>
        )}
      </div>

      {/* Floating Header & Search */}
      <div className="absolute top-20 left-4 right-4 md:left-8 md:right-8 z-10 flex flex-col sm:flex-row gap-3">
        <div className="flex-grow bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center p-2 border border-gray-100 dark:border-gray-700">
          <div className="pl-3 pr-2 text-gray-400">
            <Filter className="w-5 h-5" />
          </div>
          <select
            className="w-full bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-300 py-2 outline-none font-medium text-sm sm:text-base"
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
          >
            <option value="All">All Nearby Routes</option>
            <option value="138">138 - Maharagama / Fort</option>
            <option value="120">120 - Piliyandala / Fort</option>
            <option value="177">177 - Kaduwela / Kollupitiya</option>
          </select>
          <Button
            variant="ghost"
            className="ml-2 text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 sm:px-4 sm:py-2 flex items-center justify-center border-none"
            onClick={() => setShowFilters(!showFilters)}
          >
            <LevelsIcon />
          </Button>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute right-4 bottom-24 sm:bottom-8 z-10 flex flex-col gap-3">
        <button className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Layers className="w-6 h-6" />
        </button>
        <button
          onClick={handleRecenter}
          className="bg-blue-600 p-3 rounded-full shadow-lg text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Crosshair className="w-6 h-6" />
        </button>
      </div>

      {/* Bus Info Panel (Always showing nearest or selected) */}
      {(selectedBus || (nearbyBuses.length > 0)) && (
        <div className="absolute bottom-0 left-0 right-0 sm:left-4 sm:bottom-4 sm:right-auto sm:w-80 z-20">
          <Card className="rounded-b-none sm:rounded-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] sm:shadow-xl border-b-0 sm:border-b">
            <div className="p-1 flex justify-center sm:hidden">
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2"></div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-50 text-lg flex items-center gap-2">
                    <Bus className="w-5 h-5 text-blue-600" /> Route {selectedBus?.routeId || nearbyBuses[0]?.routeId || '...'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Distance: {(selectedBus?.distance || nearbyBuses[0]?.distance || 0).toFixed(2)} km away
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Live
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Driver ID</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-50 text-sm">{selectedBus?.driverId || nearbyBuses[0]?.driverId}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <p className="text-xs text-amber-600 mb-1">Status</p>
                  <p className="font-semibold text-amber-700 text-sm">Active</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Speed</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-50 text-sm">{selectedBus?.speed || nearbyBuses[0]?.speed || 0} km/h</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-600 mb-1">Last Update</p>
                  <p className="font-semibold text-blue-700 text-sm">Just now</p>
                </div>
              </div>

              <Button className="w-full">
                Track This Bus
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Helper icon component
const LevelsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"></line>
    <line x1="4" y1="10" x2="4" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="3"></line>
    <line x1="20" y1="21" x2="20" y2="16"></line>
    <line x1="20" y1="12" x2="20" y2="3"></line>
    <line x1="1" y1="14" x2="7" y2="14"></line>
    <line x1="9" y1="8" x2="15" y2="8"></line>
    <line x1="17" y1="16" x2="23" y2="16"></line>
  </svg>
)

export default LiveTracking;

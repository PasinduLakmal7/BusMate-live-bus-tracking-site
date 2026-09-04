import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Navigation, ArrowDownUp, Clock, Zap, ArrowRight, AlertTriangle, Bus, X, RotateCcw } from 'lucide-react';
import { GoogleMap, Marker, useLoadScript, Polyline, OverlayView, Autocomplete, DirectionsRenderer } from "@react-google-maps/api";
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import Card from '../components/common/Card';

const libraries = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = { lat: 6.9271, lng: 79.8612 }; // Colombo

const RoutePlanner = () => {
  const API_URL = '/api';
  const [mapState, setMapState] = useState('default'); // 'default', 'active', 'results'
  const [showResults, setShowResults] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [destAddress, setDestAddress] = useState("");
  const [map, setMap] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [locationStatus, setLocationStatus] = useState('loading');
  const location = useLocation();
  const navigate = useNavigate();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFindingRoutes, setIsFindingRoutes] = useState(false);

  const [autocomplete, setAutocomplete] = useState(null);
  const [destAutocomplete, setDestAutocomplete] = useState(null);
  const [currentAddress, setCurrentAddress] = useState("Detecting...");

  // Helper to extract all transit steps from Google Directions response
  const getAllTransitSteps = (response) => {
    if (!response || !response.routes || response.routes.length === 0) return [];
    const leg = response.routes[0].legs[0];
    return leg.steps.filter(step => step.travel_mode === 'TRANSIT');
  };

  // Compute total fare across all transit steps for the journey summary
  const computeTotalFare = (steps) => {
    return steps.reduce((total, step) => {
      return total + 30 + ((step.distance?.value || 0) / 1000) * 13;
    }, 0).toFixed(2);
  };

  // Reset everything back to clean slate
  const handleReset = () => {
    setShowResults(false);
    setMapState('default');
    setSuggestions([]);
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');
    setDestination(null);
    setDestAddress('');
  };

  const calculateRoute = async () => {
    if (!userLocation || !destination) return;
    setIsFindingRoutes(true);

    // BUG FIX: Clear stale results before new search begins
    setSuggestions([]);
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');

    const directionsService = new window.google.maps.DirectionsService();

    // Fetch bus suggestions from our backend first
    try {
      const suggestRes = await fetch(`${API_URL}/site/suggest?startLat=${userLocation.lat}&startLng=${userLocation.lng}&endLat=${destination.lat}&endLng=${destination.lng}`);
      const suggestData = await suggestRes.json();
      if (suggestData.success) {
        setSuggestions(suggestData.suggestions);
      }
    } catch (err) {
      console.error("Suggestion fetch failed:", err);
    }

    // Helper to Promisify the Directions Service
    const getRoute = (mode) => {
      return new Promise((resolve, reject) => {
        directionsService.route(
          {
            origin: userLocation,
            destination: destination,
            travelMode: mode,
            provideRouteAlternatives: mode === window.google.maps.TravelMode.TRANSIT,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              resolve(result);
            } else {
              reject(status);
            }
          }
        );
      });
    };

    try {
      // 1. Try Transit First (Bus/Train)
      const results = await getRoute(window.google.maps.TravelMode.TRANSIT);
      if (results && results.routes && results.routes.length > 0) {
        setDirectionsResponse(results);
        const leg = results.routes[0].legs[0];
        setDistance(leg.distance.text);
        setDuration(leg.duration.text);

        // IMPROVEMENT: Auto-fit map to show the full route
        if (map) {
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(userLocation);
          bounds.extend(destination);
          map.fitBounds(bounds, { top: 60, bottom: 60, left: 40, right: 40 });
        }
      }
    } catch (error) {
      console.warn("Public Transit route not found, falling back to Driving...", error);

      try {
        // 2. Fallback to Driving
        const results = await getRoute(window.google.maps.TravelMode.DRIVING);
        if (results && results.routes && results.routes.length > 0) {
          setDirectionsResponse(results);
          const leg = results.routes[0].legs[0];
          setDistance(leg.distance.text);
          setDuration(leg.duration.text);

          // IMPROVEMENT: Auto-fit map to show the full route
          if (map) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(userLocation);
            bounds.extend(destination);
            map.fitBounds(bounds, { top: 60, bottom: 60, left: 40, right: 40 });
          }
        }
      } catch (fallbackError) {
        console.error("All route modes failed:", fallbackError);
        // No alert - just show the empty state gracefully
        setDirectionsResponse(null);
        setDistance("");
        setDuration("");
      }
    } finally {
      setIsFindingRoutes(false);
    }
  };

  const initialCalculatedRef = useRef(false);

  // Check for destination passed from Home page and handle initial calculation
  useEffect(() => {
    if (location.state?.destination && userLocation && isLoaded && !initialCalculatedRef.current) {
      const { lat, lng, address } = location.state.destination;
      setDestination({ lat, lng });
      setDestAddress(address || "Selected Destination");
      calculateRoute();
      setMapState('results');
      setShowResults(true);
      initialCalculatedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, isLoaded, location.state]);


  const detectLocation = useCallback((isManual = false) => {
    setLocationStatus('loading');
    if (isManual) setCurrentAddress("Detecting current location...");

    const applyLocation = (coords, accuracyLevel = 'high') => {
      const newPos = { lat: coords.lat, lng: coords.lng };
      setUserLocation(newPos);
      setLocationStatus(accuracyLevel);
      if (map) {
        map.panTo(newPos);
        map.setZoom(16);
      }
      if (window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: newPos }, (results, status) => {
          if (status === "OK" && results && results.length > 0) {
            // Find cleanest address (skip raw plus codes)
            const cleanResult = results.find(r => !r.formatted_address.includes('+') && !r.types.includes('plus_code')) || results[0];
            let addr = cleanResult.formatted_address;
            // Clean any leading plus code prefix (e.g. "QVVW+XJ7, Moratuwa" or "QFXJ+H8 Wattegama")
            addr = addr.replace(/^[A-Z0-9]{2,8}\+[A-Z0-9]{2,5}[,\s]+/i, '');
            setCurrentAddress(addr);
          } else {
            setCurrentAddress(`Coordinate: ${newPos.lat.toFixed(4)}, ${newPos.lng.toFixed(4)}`);
          }
        });
      } else {
        setCurrentAddress(`Coordinate: ${newPos.lat.toFixed(4)}, ${newPos.lng.toFixed(4)}`);
      }
    };

    const fallbackToIPOrDefault = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            applyLocation({ lat: data.latitude, lng: data.longitude }, 'low');
            return;
          }
        }
      } catch (e) {
        console.warn("IP Geolocation fallback failed:", e);
      }
      // Default to Colombo / Moratuwa
      applyLocation(defaultCenter, 'low');
    };

    if (!navigator.geolocation) {
      fallbackToIPOrDefault();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }, 'high');
      },
      (errHigh) => {
        console.warn("High accuracy geolocation failed, trying standard accuracy:", errHigh.message);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            applyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }, 'low');
          },
          (errLow) => {
            console.warn("Standard accuracy geolocation failed, using fallback:", errLow.message);
            fallbackToIPOrDefault();
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [map]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    detectLocation(false);

    return () => {
      observer.disconnect();
    };
  }, [detectLocation]);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onLoadAutocomplete = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const newPos = { lat, lng };
        setUserLocation(newPos);
        setCurrentAddress(place.formatted_address || "Custom Location");
        setLocationStatus('high');
        if (map) {
          map.panTo(newPos);
          map.setZoom(16);
          if (destination) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(newPos);
            bounds.extend(destination);
            map.fitBounds(bounds, 100);
          }
        }
      }
    }
  };

  const onLoadDestAutocomplete = (instance) => {
    setDestAutocomplete(instance);
  };

  const onDestPlaceChanged = () => {
    if (destAutocomplete !== null) {
      const place = destAutocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const newPos = { lat, lng };
        setDestination(newPos);
        setDestAddress(place.formatted_address || "Destination Location");
        setMapState('active');

        if (map) {
          const bounds = new window.google.maps.LatLngBounds();
          if (userLocation) bounds.extend(userLocation);
          bounds.extend(newPos);
          map.fitBounds(bounds, 100);
        }
      }
    }
  };

  useEffect(() => {
    if (userLocation && isLoaded) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: userLocation }, (results, status) => {
        if (status === "OK" && results[0]) {
          setCurrentAddress(results[0].formatted_address);
        } else {
          setCurrentAddress("Coordinate: " + userLocation.lat.toFixed(4) + ", " + userLocation.lng.toFixed(4));
        }
      });
    }
  }, [userLocation, isLoaded]);

  const onMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setUserLocation({ lat, lng });
    setLocationStatus('low');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (userLocation && destination) {
      calculateRoute();
      setMapState('results');
      setShowResults(true);
    } else {
      alert("Please select both a start and end location first!");
    }
  };

  const handleDestinationChange = (e) => {
    setDestAddress(e.target.value);
  };

  // BUG FIX: Handle Google Maps load error
  if (loadError) {
    return (
      <div className="max-w-[90%] mx-auto px-4 py-8 mt-16 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Map failed to load</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
          There was a problem loading Google Maps. Please check your internet connection or API key configuration.
        </p>
        <p className="text-xs text-red-400 mt-3 font-mono">{loadError.message}</p>
      </div>
    );
  }

  const transitSteps = directionsResponse ? getAllTransitSteps(directionsResponse) : [];

  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Planner Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 relative border-t-4 border-t-blue-600">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Plan Your Journey</h2>
              {/* IMPROVEMENT: Reset / Clear Route button */}
              {showResults && (
                <button
                  onClick={handleReset}
                  title="Clear route and start over"
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative flex flex-col gap-3">
                {isLoaded ? (
                  <Autocomplete
                    onLoad={onLoadAutocomplete}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <InputField
                      icon={MapPin}
                      placeholder="Search your location..."
                      value={currentAddress === "Detecting..." || currentAddress === "Detecting current location..." ? "" : currentAddress}
                      onChange={(e) => setCurrentAddress(e.target.value)}
                      rightElement={
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700"
                            title="Centre map on your location"
                            onClick={() => detectLocation(true)}
                          >
                            <Navigation className={`w-4 h-4 ${locationStatus === 'loading' ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              const tempAddress = currentAddress;
                              const tempLocation = userLocation;
                              setCurrentAddress(destAddress);
                              setUserLocation(destination);
                              setDestAddress(tempAddress);
                              setDestination(tempLocation);
                            }}
                            variant="ghost"
                            title="Swap Locations"
                            className="p-1.5 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-transform active:rotate-180"
                          >
                            <ArrowDownUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </Button>
                        </div>
                      }
                    />
                  </Autocomplete>
                ) : (
                  <InputField
                    icon={MapPin}
                    placeholder="Loading search..."
                    className="opacity-50"
                    disabled
                  />
                )}

                {isLoaded ? (
                  <Autocomplete
                    onLoad={onLoadDestAutocomplete}
                    onPlaceChanged={onDestPlaceChanged}
                  >
                    <InputField
                      icon={MapPin}
                      placeholder="Where do you want to go?"
                      className="text-gray-900 dark:text-gray-50"
                      value={destAddress}
                      onChange={handleDestinationChange}
                    />
                  </Autocomplete>
                ) : (
                  <InputField
                    icon={MapPin}
                    placeholder="Loading search..."
                    className="opacity-50"
                    disabled
                  />
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <select className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none">
                  <option>Leave Now</option>
                  <option>Depart At</option>
                  <option>Arrive By</option>
                </select>
                <input
                  type="time"
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
                  defaultValue="10:00"
                />
              </div>

              <Button type="submit" disabled={isFindingRoutes} className="w-full mt-4 py-3 text-base shadow-md disabled:opacity-50">
                {isFindingRoutes ? 'Searching...' : 'Find Routes'}
              </Button>
            </form>
          </Card>

          {/* Results List */}
          {showResults && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <h3 className="font-bold text-gray-900 dark:text-gray-50 flex justify-between items-center">
                Suggested Routes
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  {isFindingRoutes
                    ? 'Searching...'
                    : transitSteps.length > 0
                      ? `${transitSteps.length} step journey`
                      : suggestions.length > 0
                        ? `Found ${suggestions.length} option${suggestions.length > 1 ? 's' : ''}`
                        : 'No routes found'}
                </span>
              </h3>

              {isFindingRoutes ? (
                <div className="py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-sm text-gray-500">Searching all Sri Lankan bus routes...</p>
                </div>
              ) : suggestions.length > 0 && transitSteps.length === 0 ? (
                <>
                  {/* IMPROVEMENT: Journey Summary Header for local DB results */}
                  {distance && (
                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl px-4 py-3">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Total Distance</p>
                        <p className="text-sm font-black text-blue-700 dark:text-blue-300">{distance}</p>
                      </div>
                      <div className="w-px h-8 bg-blue-200 dark:bg-blue-700" />
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Est. Duration</p>
                        <p className="text-sm font-black text-blue-700 dark:text-blue-300">{duration}</p>
                      </div>
                      <div className="w-px h-8 bg-blue-200 dark:bg-blue-700" />
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Est. Fare</p>
                        <p className="text-sm font-black text-blue-700 dark:text-blue-300">{suggestions[0]?.fare || 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  {suggestions.map((route, idx) => (
                    <Card
                      key={route.id}
                      hover
                      className={`p-4 border-l-4 transition-all cursor-pointer ${idx === 0 ? 'border-l-emerald-500 shadow-md ring-1 ring-emerald-500/10' : 'border-l-blue-500'}`}
                      onClick={() => setMapState('results')}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {idx === 0 && (
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Fastest</span>
                          )}
                          <span className="font-bold text-gray-900 dark:text-gray-50 text-xl">{route.duration}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 mb-0.5">Fare</p>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-50">{route.fare}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm mb-4">
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-800">
                          <span className="bg-blue-600 text-white w-8 h-5 flex items-center justify-center rounded text-[10px] font-black">{route.routeNumber}</span>
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{route.name || "City Transit Route"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 mb-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span className="truncate">Board at: {route.start_stop || currentAddress?.split(',')[0]}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          <span className="truncate">Alight at: {route.end_stop || destAddress?.split(',')[0]}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                        <div className="flex gap-4 text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tight">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {route.distance}</span>
                          <span className="flex items-center gap-1">
                            <Zap className={`w-3 h-3 ${route.crowd === 'High' ? 'text-red-500' : 'text-emerald-500'}`} />
                            {route.crowd} Crowd
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300" />
                      </div>
                    </Card>
                  ))}
                </>
              ) : transitSteps.length > 0 ? (
                /* SMART FALLBACK: Map through every transit step (bus) required to complete the journey */
                <div className="space-y-4">
                  {/* Journey Summary Header */}
                  <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl px-4 py-3">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Total Distance</p>
                      <p className="text-sm font-black text-blue-700 dark:text-blue-300">{distance}</p>
                    </div>
                    <div className="w-px h-8 bg-blue-200 dark:bg-blue-700" />
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Est. Duration</p>
                      <p className="text-sm font-black text-blue-700 dark:text-blue-300">{duration}</p>
                    </div>
                    <div className="w-px h-8 bg-blue-200 dark:bg-blue-700" />
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Total Fare</p>
                      <p className="text-sm font-black text-blue-700 dark:text-blue-300">Rs. {computeTotalFare(transitSteps)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <Bus className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Recommended Connections</p>
                      <p className="text-[10px] text-blue-700/70 dark:text-blue-400/70 mt-0.5">Board each bus in sequence to complete your journey.</p>
                    </div>
                  </div>

                  {transitSteps.map((step, idx) => (
                    <Card
                      key={idx}
                      hover
                      className="p-4 border-l-4 border-l-blue-500 animate-in fade-in duration-500"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Leg {idx + 1}</span>
                          <span className="font-bold text-gray-900 dark:text-gray-50 text-xl">{step.duration?.text || "N/A"}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 mb-0.5 tracking-tight">Est. Fare</p>
                          {/* BUG FIX: Use distance.value (meters) not distance.text (string) */}
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-50">
                            Rs. {(30 + ((step.distance?.value || 0) / 1000) * 13).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm mb-4">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-grow">
                          {step.transit?.line?.short_name || step.transit?.line?.name ? (
                            <span className="bg-blue-600 text-white min-w-[32px] h-5 px-1 flex items-center justify-center rounded text-[10px] font-black">
                              {step.transit?.line?.short_name || step.transit?.line?.name}
                            </span>
                          ) : (
                            <Bus className="w-4 h-4 text-blue-600" />
                          )}
                          <div className="truncate">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Recommended Service</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{step.transit?.line?.agencies?.[0]?.name || "National Public Transport"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 mb-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                          <span className="truncate">From: {step.transit?.departure_stop?.name || "Departure Stop"}</span>
                        </div>
                        <div className="flex col gap-2 text-[11px] font-bold pl-3 border-l-2 border-dotted border-gray-200 dark:border-gray-700 ml-[3px] py-1 text-gray-400">
                          <span className="truncate">{step.transit?.num_stops} stops</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                          <span className="truncate">To: {step.transit?.arrival_stop?.name || "Arrival Stop"}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                        <div className="flex gap-4 text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tight">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {step.distance?.text || "N/A"}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Standard Timetable</span>
                        </div>
                        {(() => {
                           const routeNumber = step.transit?.line?.short_name || step.transit?.line?.name;
                           const isTrain = routeNumber?.toLowerCase().includes('train') || step.transit?.line?.vehicle?.type === 'TRAIN';
                           if (routeNumber && !isTrain) {
                             return (
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   const directionFilter = step.transit?.arrival_stop?.name;
                                   const arrivalLoc = step.transit?.arrival_stop?.location;
                                   const originLoc = idx === 0 
                                     ? userLocation 
                                     : transitSteps[idx - 1]?.transit?.arrival_stop?.location;
                                   
                                   const originLat = typeof originLoc?.lat === 'function' ? originLoc.lat() : originLoc?.lat;
                                   const originLng = typeof originLoc?.lng === 'function' ? originLoc.lng() : originLoc?.lng;

                                   navigate('/live', { 
                                     state: { 
                                       autoStartRoute: routeNumber, 
                                       autoSetDirection: directionFilter,
                                       autoSetArrivalLat: typeof arrivalLoc?.lat === 'function' ? arrivalLoc.lat() : arrivalLoc?.lat,
                                       autoSetArrivalLng: typeof arrivalLoc?.lng === 'function' ? arrivalLoc.lng() : arrivalLoc?.lng,
                                       autoSetOriginLat: originLat,
                                       autoSetOriginLng: originLng,
                                       autoStartNavigation: true 
                                     } 
                                   });
                                 }}
                                 className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-[10px] uppercase tracking-widest"
                               >
                                 Track Bus
                                 <ArrowRight className="w-3 h-3" />
                               </button>
                             )
                           }
                           return <ArrowRight className="w-4 h-4 text-gray-300" />;
                        })()}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-dashed border-blue-200 dark:border-blue-800">
                  <AlertTriangle className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-blue-800 dark:text-blue-300">No direct bus routes found</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1 uppercase tracking-wider font-extrabold">Try adjusting your start or end locations</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map Preview Area */}
        <div className="lg:col-span-2 relative h-[500px] lg:h-auto overflow-hidden rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 order-first lg:order-last mb-6 lg:mb-0">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={userLocation || defaultCenter}
              zoom={14}
              onLoad={onMapLoad}
              onClick={onMapClick}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                clickableIcons: false,
                styles: isDarkMode ? [
                  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
                  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
                  { "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
                  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
                  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
                  { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
                  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
                  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
                  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
                ] : []
              }}
            >
              {/* User Pulse Dot using OverlayView */}
              {userLocation && (
                <OverlayView
                  position={userLocation}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div className="pulse-wrapper">
                    <div className="pulse-ring"></div>
                    <div className="pulse-dot"></div>
                  </div>
                </OverlayView>
              )}

              {/* Destination Pin */}
              {destination && (mapState === 'active' || mapState === 'results') && (
                <Marker
                  position={destination}
                  options={{
                    icon: {
                      url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                      scaledSize: new window.google.maps.Size(40, 40)
                    }
                  }}
                />
              )}

              {/* Route Path (Results State) using DirectionsRenderer */}
              {mapState === 'results' && directionsResponse && (
                <DirectionsRenderer
                  directions={directionsResponse}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: "#3b82f6",
                      strokeOpacity: 0.9,
                      strokeWeight: 6,
                    }
                  }}
                />
              )}


              {/* Start Marker for Results */}
              {mapState === 'results' && userLocation && (
                <Marker
                  position={userLocation}
                  icon={{
                    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    scaledSize: new window.google.maps.Size(30, 30)
                  }}
                />
              )}
            </GoogleMap>
          ) : (
            <div className="h-full min-h-[400px] w-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center p-8">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
              <h3 className="text-xl font-medium text-gray-400">Loading Route Map...</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;

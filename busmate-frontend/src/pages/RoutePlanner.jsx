import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, Navigation, ArrowDownUp, Clock, Zap, DollarSign, ChevronDown, Map as MapIcon } from 'lucide-react';
import { GoogleMap, Marker, useLoadScript, Polyline, InfoWindow, OverlayView, Autocomplete, DirectionsRenderer, DirectionsService } from "@react-google-maps/api";
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import Card from '../components/common/Card';

const libraries = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = { lat: 6.9271, lng: 79.8612 }; // Colombo

// Mock data removed to show only live location correctly

const RoutePlanner = () => {
  const [mapState, setMapState] = useState('default'); // 'default', 'active', 'results'
  const [showResults, setShowResults] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [destAddress, setDestAddress] = useState("");
  const [map, setMap] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [locationStatus, setLocationStatus] = useState('loading');
  const location = useLocation();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  const calculateRoute = async () => {
    if (!userLocation || !destination) return;

    const directionsService = new window.google.maps.DirectionsService();

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
        setDistance(results.routes[0].legs[0].distance.text);
        setDuration(results.routes[0].legs[0].duration.text);
      }
    } catch (error) {
      console.warn("Public Transit route not found, falling back to Driving...", error);
      
      try {
        // 2. Fallback to Driving
        const results = await getRoute(window.google.maps.TravelMode.DRIVING);
        if (results && results.routes && results.routes.length > 0) {
          setDirectionsResponse(results);
          setDistance(results.routes[0].legs[0].distance.text);
          setDuration(results.routes[0].legs[0].duration.text);
        }
      } catch (fallbackError) {
        console.error("All route modes failed:", fallbackError);
        alert("Could not find any road route between these points (Status: " + fallbackError + ").");
        setDirectionsResponse(null);
        setDistance("");
        setDuration("");
      }
    }
  };


  // Check for destination passed from Home page
  useEffect(() => {
    if (location.state?.destination && isLoaded) {
      const { lat, lng, address } = location.state.destination;
      setDestination({ lat, lng });
      setDestAddress(address || "Selected Destination");
    }
  }, [location.state, isLoaded]);

  // Auto-calculate route if destination is passed from home and userLocation is ready
  useEffect(() => {
    if (location.state?.destination && userLocation && isLoaded && !directionsResponse) {
      calculateRoute();
      setMapState('results');
      setShowResults(true);
    }
  }, [userLocation, isLoaded, location.state, directionsResponse]);


  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    let watchId;

    const startTracking = (highAccuracy = true) => {
      if (watchId) navigator.geolocation.clearWatch(watchId);

      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLocationStatus(highAccuracy ? 'high' : 'low');
          },
          (err) => {
            console.error(`Geolocation error (highAccuracy=${highAccuracy}):`, err);
            if (highAccuracy && (err.code === 3 || err.code === 1)) {
              startTracking(false);
            } else {
              setLocationStatus('error');
            }
          },
          { enableHighAccuracy: highAccuracy, timeout: highAccuracy ? 10000 : 20000, maximumAge: 0 }
        );
      } else {
        setLocationStatus('error');
      }
    };

    startTracking(true);

    return () => {
      observer.disconnect();
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

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
    } else {
      console.log("Autocomplete is not loaded yet!");
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
    setLocationStatus('low'); // manual is "low" or "manual"
    console.log("Manual starting point set:", { lat, lng });
  }, []);

  const [autocomplete, setAutocomplete] = useState(null);
  const [destAutocomplete, setDestAutocomplete] = useState(null);
  const [currentAddress, setCurrentAddress] = useState("Detecting...");


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
    // Remove individual manual handling since Autocomplete will handle the selection
  };

  const polylinePath = useMemo(() => {
    if (userLocation && destination) {
      return [userLocation, destination];
    }
    return [];
  }, [userLocation, destination]);

  return (
    <div className="max-w-[90%] 2xl:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Planner Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 relative border-t-4 border-t-blue-600">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-6">Plan Your Journey</h2>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                {isLoaded ? (
                  <Autocomplete
                    onLoad={onLoadAutocomplete}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <InputField
                      icon={MapPin}
                      placeholder="Search your location..."
                      className="mb-3"
                      value={currentAddress === "Detecting..." ? "" : currentAddress}
                      onChange={(e) => setCurrentAddress(e.target.value)}
                    />
                  </Autocomplete>
                ) : (
                  <InputField
                    icon={MapPin}
                    placeholder="Loading search..."
                    className="mb-3 opacity-50"
                    disabled
                  />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-2 top-1.5 p-1.5 text-blue-600 hover:bg-blue-50 z-20"
                  title="Use precise location"
                  onClick={() => {
                    if (userLocation && map) {
                      map.panTo(userLocation);
                      map.setZoom(16);
                    } else if (!userLocation) {
                      alert("Wait... We are still fetching your location. If it stays wrong, type your address below!");
                    }
                  }}
                >
                  <Navigation className="w-4 h-4" />
                </Button>

                <div className="absolute left-6 top-[2.75rem] bottom-[2.75rem] w-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>

                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm p-1.5 rounded-full hover:bg-gray-50 z-10"
                >
                  <ArrowDownUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </Button>

                {isLoaded ? (
                  <Autocomplete
                    onLoad={onLoadDestAutocomplete}
                    onPlaceChanged={onDestPlaceChanged}
                  >
                    <InputField
                      icon={MapPin}
                      placeholder="Where do you want to go?"
                      className="text-gray-900 dark:text-gray-50 mb-1"
                      value={destAddress}
                      onChange={handleDestinationChange}
                    />
                  </Autocomplete>
                ) : (
                  <InputField
                    icon={MapPin}
                    placeholder="Loading search..."
                    className="mb-1 opacity-50"
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

              <Button type="submit" className="w-full mt-4 py-3 text-base shadow-md">
                Find Routes
              </Button>
            </form>
          </Card>

          {/* Results List */}
          {showResults && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <h3 className="font-bold text-gray-900 dark:text-gray-50 flex justify-between items-center">
                Suggested Routes
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">Sorted by best match</span>
              </h3>

              {/* Route Option 1 (Fastest) */}
              <Card hover className={`p-4 border-l-4 border-l-emerald-500 transition-all cursor-pointer ${showResults ? 'ring-2 ring-emerald-500/20' : ''}`} onClick={() => setMapState('results')}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Fastest</span>
                    <span className="font-bold text-gray-900 dark:text-gray-50 text-xl">{duration || "32 min"}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5 text-right">Fare</p>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-50">Rs. 110.00</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm mb-4">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">138</span>
                  <span className="text-gray-400">→</span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-medium">Walk 5m</span>
                  <span className="text-gray-400">→</span>
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">120</span>
                </div>

                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 10:15 AM - 10:50 AM</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> Medium Crowd</span>
                </div>
              </Card>

              {/* Route Option 2 (Least Crowded) */}
              <Card hover className="p-4 border-l-4 border-l-transparent">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">Comfortable</span>
                    <span className="font-bold text-gray-900 dark:text-gray-50 text-lg">45 min</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">Rs. 150</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm mb-4">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">EX-1</span>
                  <span className="text-gray-400">→</span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-medium">Walk 2m</span>
                </div>

                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 10:30 AM - 11:15 AM</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-emerald-500" /> Low Crowd</span>
                </div>
              </Card>

              {/* Route Option 3 (Cheapest) */}
              <Card hover className="p-4 border-l-4 border-l-transparent opacity-80">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><DollarSign className="w-3 h-3" /> Cheapest</span>
                    <span className="font-bold text-gray-900 dark:text-gray-50 text-lg">55 min</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">Rs. 80</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm mb-4">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">120</span>
                </div>

                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 10:10 AM - 11:05 AM</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-red-500" /> High Crowd</span>
                </div>
              </Card>
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
                  icon={{
                    url: "https://maps.googleapis.com/maps/api/staticmap?markers=color:red|size:mid|label:B|6.9,79.8", // fallback or marker
                    scaledSize: new window.google.maps.Size(40, 40)
                  }}
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
                    suppressMarkers: true, // Keep our custom Markers
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
              <MapPin className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-400">Loading Route Map...</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;

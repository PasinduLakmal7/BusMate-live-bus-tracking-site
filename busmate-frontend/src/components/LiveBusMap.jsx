import { useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import io from "socket.io-client";
import busIcon from "../assets/bus-icon.png";

// Ensure socket connects to the backend as an admin (no JWT required)
const socket = io("/", {
  autoConnect: false,
  auth: { admin: true },
});

export default function LiveBusMap({ driverId, routeId }) {
  const [pos, setPos] = useState(null);
  const [userPos, setUserPos] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    let watchId;

    const startTracking = (highAccuracy = true) => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      
      watchId = navigator.geolocation.watchPosition(
        (p) => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
        (err) => {
          console.error(`Error getting user location (highAccuracy=${highAccuracy}):`, err);
          if (highAccuracy && (err.code === 3 || err.code === 1)) {
            startTracking(false);
          }
        },
        { enableHighAccuracy: highAccuracy, timeout: highAccuracy ? 5000 : 15000, maximumAge: 0 }
      );
    };

    startTracking(true);

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    socket.connect();

    // If we have a routeId, we can join the route room (the new backend way)
    // For now we just listen to all bus:location events and filter by driverId
    const handleLocation = (data) => {
      // data: { driverId, busId, routeId, lat, lon, speed, timestamp }
      // Only update if it matches the specific driverId we are looking for
      if (driverId && data.driverId == driverId) {
        setPos({ lat: data.lat, lng: data.lon });
      } else if (!driverId) {
        // If no specific driverId, we might showing all (unlikely for this component's typical use)
        setPos({ lat: data.lat, lng: data.lon });
      }
    };

    socket.on("bus:location", handleLocation);

    // Optional: fetch last known position from Redis through backend API
    if (routeId) {
      fetch(`/api/routes/${routeId}/positions`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.positions) {
            const myBus = data.positions.find((p) => p.driverId == driverId);
            if (myBus) setPos({ lat: myBus.lat, lng: myBus.lon });
          }
        })
        .catch((err) => console.error("Failed to fetch initial pos", err));
    }

    return () => {
      socket.off("bus:location", handleLocation);
      socket.disconnect();
    };
  }, [driverId, routeId]);

  const center = useMemo(() => pos || { lat: 6.9271, lng: 79.8612 }, [pos]); // default Colombo

  if (loadError) return <p>Map load error</p>;
  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <GoogleMap
        center={center}
        zoom={16}
        mapContainerStyle={{ width: "100%", height: "100%" }}
      >
        {pos && (
          <Marker 
            position={pos} 
            icon={{
              url: busIcon,
              scaledSize: new window.google.maps.Size(60, 50)
            }}
          />
        )}
        {userPos && (
          <Marker 
            position={userPos} 
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new window.google.maps.Size(30,30)
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}

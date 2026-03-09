import { useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import io from "socket.io-client";

// Ensure socket connects to the backend as an admin (no JWT required)
const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:4000", {
  autoConnect: false,
  auth: { admin: true },
});

export default function LiveBusMap({ driverId, routeId }) {
  const [pos, setPos] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    socket.connect();

    // If we have a routeId, we can join the route room (the new backend way)
    // For now we just listen to all bus:location events and filter by driverId
    const handleLocation = (data) => {
      // data: { driverId, busId, routeId, lat, lon, speed, timestamp }
      // Show the location if it matches driverId, OR if driverId is the dummy "driver_001" 
      if (!driverId || data.driverId == driverId || driverId === "driver_001") {
        setPos({ lat: data.lat, lng: data.lon });
      }
    };

    socket.on("bus:location", handleLocation);

    // Optional: fetch last known position from Redis through backend API
    if (routeId) {
      fetch(`http://localhost:4000/routes/${routeId}/positions`)
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
        {pos && <Marker position={pos} />}
      </GoogleMap>
    </div>
  );
}

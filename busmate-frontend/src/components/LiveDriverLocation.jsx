import { useEffect, useState } from "react";
import io from "socket.io-client";

// Ensure socket connects to the backend as an admin (no JWT required)
const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:4000", {
    autoConnect: false,
    auth: { admin: true },
});

export default function LiveDriverLocation({ driverId }) {
    const [data, setData] = useState(null);
    const [status, setStatus] = useState("Waiting for location...");

    useEffect(() => {
        socket.connect();

        const handleLocation = (locData) => {
            // locData: { driverId, busId, routeId, lat, lon, speed, timestamp }
            if (!driverId || locData.driverId == driverId || driverId === "driver_001") {
                setData({
                    driverId: locData.driverId,
                    latitude: locData.lat,
                    longitude: locData.lon,
                    speed: locData.speed,
                    updatedAt: locData.timestamp,
                });
                setStatus("Location received via Socket.IO");
            }
        };

        socket.on("bus:location", handleLocation);

        socket.on("connect", () => {
            console.log("LiveDriverLocation socket connected");
            setStatus("Connected to location server...");
        });

        socket.on("disconnect", () => {
            setStatus("Disconnected from server");
        });

        return () => {
            socket.off("bus:location", handleLocation);
            socket.off("connect");
            socket.off("disconnect");
            socket.disconnect();
        };
    }, [driverId]);

    return (
        <div style={{ padding: 20 }}>
            <h3>Live Driver Location</h3>
            <p>Status: {status}</p>

            {data && (
                <div>
                    <p>Driver ID: {data.driverId}</p>
                    <p>Latitude: {data.latitude?.toFixed(5)}</p>
                    <p>Longitude: {data.longitude?.toFixed(5)}</p>
                    {data.speed != null && <p>Speed: {(data.speed * 3.6).toFixed(1)} km/h</p>}
                    <p>
                        UpdatedAt:{" "}
                        {data.updatedAt ? new Date(data.updatedAt).toLocaleString() : "—"}
                    </p>
                </div>
            )}
        </div>
    );
}

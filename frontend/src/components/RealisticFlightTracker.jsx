import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import { Battery, Signal, MapPin } from "lucide-react";

// 🚁 NEW HIGH-QUALITY DRONE ICON
const droneIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3165/3165643.png", 
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -30],
  className: "drop-shadow-2xl"
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/4320/4320350.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const phcIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Camera Follower
const CameraFollow = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if(position) map.flyTo(position, 16, { animate: true, duration: 1 });
  }, [position, map]);
  return null;
};

const RealisticFlightTracker = ({ origin, destination, orderId, phcName, onDeliveryComplete }) => {
  // ✅ SAFETY: Ensure coordinates are Numbers
  const safeOrigin = { lat: Number(origin.lat), lng: Number(origin.lng) };
  const safeDest = { lat: Number(destination.lat), lng: Number(destination.lng) };

  const [currentPos, setCurrentPos] = useState(safeOrigin);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ speed: 0, alt: 0, battery: 100, status: "Preparing", lat: safeOrigin.lat, lng: safeOrigin.lng });
  
  const requestRef = useRef();
  const startTimeRef = useRef(null);
  const FLIGHT_DURATION_MS = 20000; // 20 Sec Flight

  useEffect(() => {
    // ✅ Prevent Crash: If coordinates are invalid (NaN), stop immediately
    if (isNaN(safeOrigin.lat) || isNaN(safeOrigin.lng) || isNaN(safeDest.lat) || isNaN(safeDest.lng)) {
        console.error("Invalid Coordinates detected in Tracker");
        return;
    }

    const from = turf.point([safeOrigin.lng, safeOrigin.lat]);
    const to = turf.point([safeDest.lng, safeDest.lat]);
    const totalDistance = turf.distance(from, to);
    const line = turf.lineString([[safeOrigin.lng, safeOrigin.lat], [safeDest.lng, safeDest.lat]]);

    const animate = (time) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const pct = Math.min(elapsed / FLIGHT_DURATION_MS, 1);

      const newPoint = turf.along(line, pct * totalDistance);
      const newLat = newPoint.geometry.coordinates[1];
      const newLng = newPoint.geometry.coordinates[0];

      setCurrentPos({ lat: newLat, lng: newLng });
      setProgress(pct * 100);

      // Physics
      let status = "In Transit";
      let alt = 120;
      let speed = 75 + Math.random() * 5;

      if (pct < 0.1) { status = "Takeoff"; alt = pct * 1200; speed = pct * 750; }
      else if (pct > 0.9) { status = "Landing"; alt = (1-pct) * 1200; speed = (1-pct) * 750; }
      if (pct >= 1) status = "Delivered";

      setStats({
          speed: Math.round(speed),
          alt: Math.round(alt),
          battery: (100 - pct * 20).toFixed(0),
          status: status,
          lat: newLat.toFixed(4),
          lng: newLng.toFixed(4)
      });

      if (pct < 1) requestRef.current = requestAnimationFrame(animate);
      else if (onDeliveryComplete) onDeliveryComplete();
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [origin, destination]);

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border-4 border-slate-900 shadow-2xl bg-slate-900">
      <MapContainer center={safeOrigin} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='&copy; Esri' />
        <Marker position={safeOrigin} icon={hospitalIcon} />
        <Marker position={safeDest} icon={phcIcon} />
        <Polyline positions={[safeOrigin, safeDest]} color="#3b82f6" weight={3} dashArray="10, 10" opacity={0.8} />
        <Marker position={currentPos} icon={droneIcon} />
        <CameraFollow position={currentPos} />
      </MapContainer>

      {/* HUD */}
      <div className="absolute top-4 left-4 z-[1000] w-72 bg-black/80 backdrop-blur-md border border-slate-700 rounded-2xl p-4 text-white font-mono shadow-2xl">
          <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-3">
              <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-bold text-green-400 tracking-widest">LIVE FEED</span>
              </div>
              <span className="text-[10px] text-slate-400">{orderId || 'ID: --'}</span>
          </div>
          <div className="mb-4 bg-blue-900/30 border border-blue-800 p-2 rounded-lg text-center">
              <p className="text-[10px] text-blue-300 uppercase">Destination</p>
              <p className="text-lg font-bold text-white flex items-center justify-center gap-2">
                  <MapPin size={16} className="text-red-500"/> {phcName || "Unknown PHC"}
              </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4 text-center">
              <div><p className="text-[10px] text-slate-400">SPEED</p><p className="text-xl font-bold text-blue-400">{stats.speed} km/h</p></div>
              <div><p className="text-[10px] text-slate-400">ALT</p><p className="text-xl font-bold text-blue-400">{stats.alt} m</p></div>
              <div><p className="text-[10px] text-slate-400">BAT</p><p className="text-xl font-bold text-green-400">{stats.battery}%</p></div>
              <div><p className="text-[10px] text-slate-400">STATUS</p><p className="text-xs font-bold bg-yellow-500/20 text-yellow-400 py-1 rounded">{stats.status}</p></div>
          </div>
      </div>
    </div>
  );
};

export default RealisticFlightTracker;
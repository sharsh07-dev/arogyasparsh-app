import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import { Plane, Navigation, MapPin, Battery, Signal, Clock, Box, AlertOctagon } from "lucide-react";

// 🚁 Custom Icons
const droneIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3165/3165643.png",
  iconSize: [50, 50],
  iconAnchor: [25, 25],
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

// 🎥 Camera Controller (Smooth Follow)
const CameraFollow = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if(position) map.flyTo(position, 16, { animate: true, duration: 1 });
  }, [position, map]);
  return null;
};

const RealisticFlightTracker = ({ origin, destination, orderId, onDeliveryComplete }) => {
  const [currentPos, setCurrentPos] = useState(origin);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    speed: 0,
    alt: 0,
    battery: 100,
    status: "Preparing for Takeoff",
    lat: origin.lat,
    lng: origin.lng
  });
  
  const requestRef = useRef();
  const startTimeRef = useRef(null);

  // ⚙️ FLIGHT CONFIGURATION
  const FLIGHT_DURATION_MS = 20000; // 20 Seconds for Demo (Fast enough to watch)
  
  // Calculate total distance once
  const from = turf.point([origin.lng, origin.lat]);
  const to = turf.point([destination.lng, destination.lat]);
  const totalDistanceKm = turf.distance(from, to);
  const line = turf.lineString([[origin.lng, origin.lat], [destination.lng, destination.lat]]);

  useEffect(() => {
    const animate = (time) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const pct = Math.min(elapsed / FLIGHT_DURATION_MS, 1); // 0.0 to 1.0

      // 📍 Calculate Position
      const newPoint = turf.along(line, pct * totalDistanceKm);
      const newLat = newPoint.geometry.coordinates[1];
      const newLng = newPoint.geometry.coordinates[0];

      setCurrentPos({ lat: newLat, lng: newLng });
      setProgress(pct * 100);

      // 📊 SIMULATE REAL-TIME TELEMETRY
      let currentStatus = "In Flight";
      let currentAlt = 120; // Cruising altitude
      let currentSpeed = 65 + (Math.random() * 5); // 65-70 km/h jitter

      // Phase 1: Takeoff (0-10%)
      if (pct < 0.1) {
        currentStatus = "Preparing for Takeoff";
        currentAlt = pct * 1200; // Climb
        currentSpeed = pct * 600; // Accelerate
      } 
      // Phase 3: Landing (90-100%)
      else if (pct > 0.9) {
        currentStatus = "Landing";
        currentAlt = (1 - pct) * 1200; // Descend
        currentSpeed = (1 - pct) * 600; // Decelerate
      }
      // Phase 4: Delivered
      if (pct >= 1) {
        currentStatus = "Delivered";
        currentAlt = 0;
        currentSpeed = 0;
      }

      // 🔋 Battery Logic (Drains exactly 20% from 100% -> 80%)
      const currentBattery = 100 - (pct * 20);

      setStats({
        speed: Math.round(currentSpeed),
        alt: Math.round(currentAlt),
        battery: currentBattery.toFixed(1),
        status: currentStatus,
        lat: newLat.toFixed(6),
        lng: newLng.toFixed(6)
      });

      if (pct < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        // Mission Complete
        if (onDeliveryComplete) onDeliveryComplete();
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [origin, destination]);

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border-4 border-slate-900 shadow-2xl bg-slate-900">
      
      {/* 🗺️ 3D MAP LAYER */}
      <MapContainer center={origin} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; Esri'
        />
        <Marker position={origin} icon={hospitalIcon} />
        <Marker position={destination} icon={phcIcon} />
        <Polyline positions={[origin, destination]} color="#3b82f6" weight={3} dashArray="10, 10" opacity={0.7} />
        
        {/* Moving Drone */}
        <Marker position={currentPos} icon={droneIcon} />
        <CameraFollow position={currentPos} />
      </MapContainer>

      {/* 📟 PROFESSIONAL HUD (HEADS UP DISPLAY) */}
      <div className="absolute top-4 left-4 z-[1000] w-80 bg-black/80 backdrop-blur-md border border-slate-700 rounded-2xl p-4 text-white font-mono shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-3">
              <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  <span className="text-xs font-bold text-red-400 tracking-widest">LIVE FEED • CAM-04</span>
              </div>
              <span className="text-xs text-slate-400">ID: {orderId ? orderId.slice(-6).toUpperCase() : 'N/A'}</span>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                  <p className="text-[10px] text-slate-400 uppercase">Ground Speed</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.speed} <span className="text-xs text-slate-500">km/h</span></p>
              </div>
              <div>
                  <p className="text-[10px] text-slate-400 uppercase">Altitude</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.alt} <span className="text-xs text-slate-500">m</span></p>
              </div>
              <div>
                  <p className="text-[10px] text-slate-400 uppercase">Battery Level</p>
                  <div className="flex items-center gap-2">
                      <Battery size={16} className={stats.battery < 20 ? "text-red-500" : "text-green-400"} />
                      <p className="text-xl font-bold">{stats.battery}%</p>
                  </div>
              </div>
              <div>
                  <p className="text-[10px] text-slate-400 uppercase">Signal Strength</p>
                  <div className="flex items-center gap-1 text-green-500">
                      <Signal size={16} /> <span className="text-sm font-bold">Strong</span>
                  </div>
              </div>
          </div>

          {/* GPS & Status */}
          <div className="bg-slate-800/50 rounded-xl p-3 space-y-2 border border-slate-700">
              <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">STATUS</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${stats.status === 'Delivered' ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'}`}>
                      {stats.status.toUpperCase()}
                  </span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">GPS LAT</span>
                  <span className="text-xs font-mono text-white">{stats.lat}</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">GPS LNG</span>
                  <span className="text-xs font-mono text-white">{stats.lng}</span>
              </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 relative h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-100" style={{ width: `${progress}%` }}></div>
          </div>
      </div>

    </div>
  );
};

export default RealisticFlightTracker;
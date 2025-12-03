import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import { Battery, Signal, MapPin, Navigation, Clock, Activity } from "lucide-react";

// 🚁 HIGH-RES DRONE ICON
const droneIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3165/3165643.png", 
  iconSize: [60, 60],
  iconAnchor: [30, 30],
  popupAnchor: [0, -30],
  className: "drop-shadow-2xl" // Adds 3D shadow effect
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/4320/4320350.png",
  iconSize: [45, 45],
  iconAnchor: [22, 45],
});

const phcIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [45, 45],
  iconAnchor: [22, 45],
});

// 🎥 SMOOTH CAMERA CONTROLLER
const CameraFollow = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if(position) map.flyTo(position, 16, { animate: true, duration: 0.5, easeLinearity: 0.1 });
  }, [position, map]);
  return null;
};

const RealisticFlightTracker = ({ origin, destination, orderId, phcName, onDeliveryComplete }) => {
  const [currentPos, setCurrentPos] = useState(origin);
  const [progress, setProgress] = useState(0);
  
  // ✅ ALL METRICS INCLUDED
  const [stats, setStats] = useState({ 
      speed: 0, 
      alt: 0, 
      battery: 100, 
      distance: 0,
      status: "Preparing", 
      lat: origin.lat, 
      lng: origin.lng 
  });
  
  const requestRef = useRef();
  const startTimeRef = useRef(null);
  
  // Flight Duration (25 Seconds for better realism)
  const FLIGHT_DURATION_MS = 25000; 

  const from = turf.point([origin.lng, origin.lat]);
  const to = turf.point([destination.lng, destination.lat]);
  const totalDistance = turf.distance(from, to);
  const line = turf.lineString([[origin.lng, origin.lat], [destination.lng, destination.lat]]);

  useEffect(() => {
    const animate = (time) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const pct = Math.min(elapsed / FLIGHT_DURATION_MS, 1);

      // Calculate Position
      const newPoint = turf.along(line, pct * totalDistance);
      const newLat = newPoint.geometry.coordinates[1];
      const newLng = newPoint.geometry.coordinates[0];

      setCurrentPos({ lat: newLat, lng: newLng });
      setProgress(pct * 100);

      // 📊 REALISTIC PHYSICS CALCULATION
      let status = "In Transit";
      let alt = 120; // Cruising Altitude
      let speed = 80 + (Math.sin(pct * 10) * 5); // Speed fluctuates slightly

      // Takeoff Logic
      if (pct < 0.1) { 
          status = "Ascending"; 
          alt = pct * 1200; 
          speed = pct * 800; 
      }
      // Landing Logic
      else if (pct > 0.9) { 
          status = "Descending"; 
          alt = (1-pct) * 1200; 
          speed = (1-pct) * 800; 
      }
      
      if (pct >= 1) status = "Delivered";

      // Live Distance Remaining
      const distRemaining = (totalDistance * (1 - pct)).toFixed(2);

      setStats({
          speed: Math.round(speed),
          alt: Math.round(alt),
          battery: (100 - pct * 20).toFixed(1), // Drains 20% exactly
          distance: distRemaining,
          status: status,
          lat: newLat.toFixed(5),
          lng: newLng.toFixed(5)
      });

      if (pct < 1) {
          requestRef.current = requestAnimationFrame(animate);
      } else if (onDeliveryComplete) {
          onDeliveryComplete();
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [origin, destination]);

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border-4 border-slate-900 shadow-2xl bg-slate-900 group">
      
      {/* 🗺️ MAP LAYER */}
      <MapContainer center={origin} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        {/* ESRI SATELLITE TILES */}
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='&copy; Esri' />
        
        <Marker position={origin} icon={hospitalIcon} />
        <Marker position={destination} icon={phcIcon} />
        
        {/* Flight Path Line */}
        <Polyline positions={[origin, destination]} color="#3b82f6" weight={3} dashArray="10, 10" opacity={0.6} />
        
        {/* 🚁 MOVING DRONE */}
        <Marker position={currentPos} icon={droneIcon} />
        <CameraFollow position={currentPos} />
      </MapContainer>

      {/* 📟 MISSION CONTROL HUD */}
      <div className="absolute top-4 left-4 z-[1000] w-72 bg-black/80 backdrop-blur-md border border-slate-700 rounded-2xl p-4 text-white font-mono shadow-2xl transition-opacity">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-3">
              <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-bold text-green-400 tracking-widest">LIVE FEED</span>
              </div>
              <span className="text-[10px] text-slate-400">{orderId || 'ID: --'}</span>
          </div>
          
          {/* 🏥 DESTINATION INFO */}
          <div className="mb-4 bg-blue-900/20 border border-blue-800 p-2 rounded-lg text-center">
              <p className="text-[9px] text-blue-300 uppercase tracking-wider">DESTINATION TARGET</p>
              <p className="text-sm font-bold text-white flex items-center justify-center gap-2 mt-1">
                  <MapPin size={14} className="text-red-500"/> {phcName || "Unknown PHC"}
              </p>
          </div>

          {/* 📊 TELEMETRY GRID */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-center mb-2">
              <div>
                  <p className="text-[9px] text-slate-500 uppercase">GROUND SPEED</p>
                  <p className="text-xl font-bold text-blue-400">{stats.speed} <span className="text-[10px] text-slate-400">km/h</span></p>
              </div>
              <div>
                  <p className="text-[9px] text-slate-500 uppercase">ALTITUDE</p>
                  <p className="text-xl font-bold text-blue-400">{stats.alt} <span className="text-[10px] text-slate-400">m</span></p>
              </div>
              <div>
                  <p className="text-[9px] text-slate-500 uppercase">DISTANCE LEFT</p>
                  <p className="text-xl font-bold text-yellow-400">{stats.distance} <span className="text-[10px] text-slate-400">km</span></p>
              </div>
              <div>
                  <p className="text-[9px] text-slate-500 uppercase">BATTERY</p>
                  <div className="flex items-center justify-center gap-1 text-green-400">
                      <Battery size={14} /> <span className="text-xl font-bold">{stats.battery}%</span>
                  </div>
              </div>
          </div>

          {/* 🌍 GPS DATA */}
          <div className="border-t border-slate-700 pt-2 mt-2 text-[10px] text-slate-500 flex justify-between font-mono">
              <span>LAT: {stats.lat}</span>
              <span>LNG: {stats.lng}</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 relative h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-green-400 transition-all duration-100" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-center text-[9px] text-slate-400 mt-1 uppercase">{stats.status}</p>
      </div>
    </div>
  );
};

export default RealisticFlightTracker;
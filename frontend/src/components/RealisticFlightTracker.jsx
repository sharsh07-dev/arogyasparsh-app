import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import { Plane, Navigation, MapPin, Battery, Signal, Clock } from "lucide-react";

// 🚁 Custom Drone Icon (High Quality)
const droneIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3165/3165643.png", // Or your local asset
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  className: "drone-shadow" // We will add CSS for shadow
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

// 🎥 Camera Controller to Follow Drone
const CameraFollow = ({ position, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom(), { animate: false, duration: 0 });
  }, [position, map]);
  return null;
};

const RealisticFlightTracker = ({ origin, destination, onDeliveryComplete }) => {
  const [currentPos, setCurrentPos] = useState(origin);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ speed: 0, alt: 0, dist: 0 });
  const requestRef = useRef();
  
  // Flight Configuration
  const FLIGHT_TIME_MS = 30000; // 30 Seconds for Demo (Increase for realism)
  const TOTAL_DIST_KM = turf.distance(
      turf.point([origin.lng, origin.lat]), 
      turf.point([destination.lng, destination.lat])
  );

  useEffect(() => {
    const startTime = performance.now();
    const startPoint = turf.point([origin.lng, origin.lat]);
    const endPoint = turf.point([destination.lng, destination.lat]);
    const line = turf.lineString([
        [origin.lng, origin.lat],
        [destination.lng, destination.lat]
    ]);

    const animate = (time) => {
      const elapsed = time - startTime;
      const pct = Math.min(elapsed / FLIGHT_TIME_MS, 1);
      
      // Calculate new position along the line
      // Using Turf to interpolate position accurately on Earth's curvature
      const newCoords = turf.along(line, pct * TOTAL_DIST_KM).geometry.coordinates;
      const newLat = newCoords[1];
      const newLng = newCoords[0];

      setCurrentPos({ lat: newLat, lng: newLng });
      setProgress(pct * 100);

      // 📊 Fake Real-Time Physics Telemetry
      const speed = pct < 0.1 || pct > 0.9 ? 25 : 120 + (Math.random() * 10); // Slow start/stop
      const alt = pct < 0.1 || pct > 0.9 ? pct * 1000 : 120; // Takeoff/Landing altitude
      const distLeft = (TOTAL_DIST_KM * (1 - pct)).toFixed(2);

      setStats({
        speed: Math.round(speed),
        alt: Math.round(alt),
        dist: distLeft
      });

      if (pct < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        // 🎯 LANDED! Trigger System Update
        onDeliveryComplete(); 
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [origin, destination]);

  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl">
      
      <MapContainer center={origin} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        
        {/* 🌍 1. REAL SATELLITE TILES (Esri World Imagery) */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; Esri'
        />

        {/* 📍 Markers & Path */}
        <Marker position={origin} icon={hospitalIcon} />
        <Marker position={destination} icon={phcIcon} />
        <Polyline positions={[origin, destination]} color="#3b82f6" weight={4} dashArray="10, 10" opacity={0.6} />

        {/* 🚁 The Drone */}
        <Marker position={currentPos} icon={droneIcon} zIndexOffset={1000}>
        </Marker>

        <CameraFollow position={currentPos} />
      </MapContainer>

      {/* 📟 HUD OVERLAY (Heads Up Display) */}
      <div className="absolute top-4 left-4 z-[1000] bg-black/80 backdrop-blur-md p-4 rounded-xl border border-slate-600 text-green-400 font-mono w-64 shadow-xl">
        <div className="flex items-center gap-2 mb-2 border-b border-green-900 pb-2">
            <Signal className="animate-pulse" size={16}/> 
            <span className="text-xs font-bold">LIVE DATA LINK: STABLE</span>
        </div>
        <div className="grid grid-cols-2 gap-y-3 text-xs">
            <div>
                <p className="text-slate-400">GROUND SPEED</p>
                <p className="text-lg font-bold text-white">{stats.speed} <span className="text-[10px]">km/h</span></p>
            </div>
            <div>
                <p className="text-slate-400">ALTITUDE</p>
                <p className="text-lg font-bold text-white">{stats.alt} <span className="text-[10px]">m</span></p>
            </div>
            <div>
                <p className="text-slate-400">DIST. REMAINING</p>
                <p className="text-lg font-bold text-yellow-400">{stats.dist} <span className="text-[10px]">km</span></p>
            </div>
            <div>
                <p className="text-slate-400">BATTERY</p>
                <p className="text-lg font-bold text-green-400 flex items-center gap-1">
                    <Battery size={14} fill="currentColor"/> {Math.max(20, 100 - Math.round(progress / 1.5))}%
                </p>
            </div>
        </div>
        <div className="mt-3 bg-green-900/30 h-1.5 rounded-full overflow-hidden border border-green-900">
            <div className="bg-green-500 h-full transition-all duration-100" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-[10px] text-center mt-1 text-green-600">MISSION PROGRESS</p>
      </div>

    </div>
  );
};

export default RealisticFlightTracker;
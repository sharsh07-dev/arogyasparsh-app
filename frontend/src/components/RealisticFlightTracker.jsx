import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import { Battery, Signal, MapPin } from "lucide-react";

// 🚁 EMBEDDED DRONE ICON (Base64 - Works Offline/Instantly)
const droneImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADlElEQVR4nO2ZTWgTQRTH/7Oz2dZKE7FqS6m1B/WgB8GLF8GLB0FvKooXPXjwouBBEERE8KB48CAIEvAgKHotKCp48KAeFExFq9WmtZqm2d3xJTO72WyT7E6y2YIPxvdmZ9/835t582YnQAAAAAAAAAAA/xOq0Q50g2J5M4jIy0S0lYg2EdEGIqok/t1CRH8S/m4S0Tci+k5E7/L5/Jt6vX7baD+6RSF/gYi2JkT0BhH9JKJd+Xz+fr1e32+wn92gIAeI6CgRbU/I5AcR3cnnyd4+2t0tCnKCiE4mZPKTiM7l8/m99Xp9u8F+dgpDPk9E5xMy+UVEp/L5/N16vb7TYD87QSEPEtH5hEx+ENGJfD5/u16v7zbYz05QyNNE9CAhk59EdDyfz1+v1+/20u5uUMgLRLQrIZNfRHQ0n89fr9fvGuxnJyjkaSI6kpDJTyI6nM/nr9fr9Z0G+9kJCuH/tT0hk19EdDCfz1+r1+t3G+xnJyjkaSI6mJDJTyI6kM/nr9br9V0G+9kJCrk/eF37RUT78/n8lXq9vttgPztBITeJ6EBCJj+J6EA+n79Sr9d3G+xnJyjk+uB17RcR7cvn85fq9foug/3sBIXcSETHh/n5+T09PT17o9FoT5L+oJBLw+vagyAI9kaj0Z4k/UEhF4noREImv4nodD6fv1Sv13ca7GcnKOQ8EZ1KyOQnEZ3N5/OX6/X6boP97ASFfEtEZxIy+UVE3/L5/OV6vb7LYD87QSHniOhsQia/iOhcPp+/WK/XdxvsZycoxP8d5xIy+UlE5/P5/MV6vb7TYD87QSGfEtH5hEx+EdH5fD5/oV6v7zLYz05QyL+D17XfRPRtYWHhwuzs7I0k/UEhpxLRhYRMfhPRhSAILkaj0Z4k/UEhHxPRpYRMfhPRpSAILkaj0Z4k/UEhHxLR5YRMfhPRlSAILkaj0Z4k/UEhHxDRlYRMfhPR1SAILkaj0Z4k/UEh7xPR1YRMfhPRtSAILkaj0Z4k/UEhbxPRtYRMfhPRtSAILkaj0Z4k/UEhbxLR9YRMfhPR9SAILkaj0Z4k/UEhbxDRjYRMfhPRjSAILkaj0Z4k/UEhbxDRzYRMfhPRzSAILkaj0Z4k/UEhrxPRrYRMfhHRrSAIbkej0Z4k/UEhLxPR7YRMfhHR7SAIbkej0Z4k/UEhLxDRnYRMfhHRnSAIbtbr9V1J+gMAAAAAAAAAAADgX/IDoCVrE827Zc0AAAAASUVORK5CYII=";

const droneIcon = new L.Icon({
  iconUrl: droneImage,
  iconSize: [50, 50], 
  iconAnchor: [25, 25],
  className: "drone-icon"
});

// Use Standard Markers for stability
const hospitalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const phcIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Camera Follower
const CameraFollow = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if(position && position.lat && position.lng) {
        map.flyTo(position, 15, { animate: true, duration: 1, easeLinearity: 0.1 });
    }
  }, [position, map]);
  return null;
};

const RealisticFlightTracker = ({ origin, destination, orderId, phcName, onDeliveryComplete }) => {
  // Safety Check: Convert to Numbers to prevent crashes
  const safeOrigin = { lat: Number(origin?.lat || 19.9260), lng: Number(origin?.lng || 79.9033) };
  const safeDest = { lat: Number(destination?.lat || 19.9280), lng: Number(destination?.lng || 79.9050) };

  const [currentPos, setCurrentPos] = useState(safeOrigin);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ speed: 0, alt: 0, battery: 100, status: "Preparing", lat: safeOrigin.lat, lng: safeOrigin.lng });
  
  const requestRef = useRef();
  const startTimeRef = useRef(null);
  const FLIGHT_DURATION_MS = 20000; 

  useEffect(() => {
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
      <MapContainer center={safeOrigin} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='&copy; Esri' />
        
        <Marker position={safeOrigin} icon={hospitalIcon} />
        <Marker position={safeDest} icon={phcIcon} />
        <Polyline positions={[safeOrigin, safeDest]} color="#3b82f6" weight={3} dashArray="10, 10" opacity={0.8} />
        
        {/* ✅ DRONE MARKER */}
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
          <div className="relative h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-100" style={{ width: `${progress}%` }}></div>
          </div>
      </div>
    </div>
  );
};

export default RealisticFlightTracker;
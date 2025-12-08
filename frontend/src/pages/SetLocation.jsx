import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { Save, ArrowLeft, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet Marker Icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const SetLocation = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userInfo")) || {};
  
  // Default to existing coords or a central point (Gadchiroli)
  const defaultPosition = user.landingCoordinates 
    ? [parseFloat(user.landingCoordinates.lat), parseFloat(user.landingCoordinates.lng)] 
    : [19.9280, 79.9050];

  const [position, setPosition] = useState(defaultPosition);

  // Component to handle map clicks/drags
  function LocationMarker() {
    const markerRef = useRef(null);
    
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });

    return (
      <Marker
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const newPos = marker.getLatLng();
            setPosition([newPos.lat, newPos.lng]);
          },
        }}
        position={position}
        ref={markerRef}
      >
        <Popup>
          <span className="font-bold text-blue-600">Drone Landing Zone</span>
          <br />
          Drag to adjust.
        </Popup>
      </Marker>
    );
  }

  const handleSave = () => {
    // 1. Update Local Storage
    const updatedUser = {
      ...user,
      landingCoordinates: { lat: position[0], lng: position[1] }
    };
    localStorage.setItem("userInfo", JSON.stringify(updatedUser));

    // 2. (Optional) You could also send this to the Backend API here to save permanently
    
    alert(`✅ Landing Zone Updated!\nLat: ${position[0].toFixed(4)}\nLng: ${position[1].toFixed(4)}`);
    navigate("/phc-dashboard");
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50">
      
      {/* Header */}
      <div className="bg-white p-4 shadow-md z-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate("/phc-dashboard")} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="text-red-500"/> Set Landing Zone
                </h1>
                <p className="text-sm text-slate-500">Drag the marker to your exact PHC drop-off point.</p>
            </div>
        </div>
        <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95"
        >
            <Save size={18} /> Confirm Location
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative z-0">
        <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
        
        {/* Floating Info Box */}
        <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur p-4 rounded-xl shadow-xl border border-slate-200 z-[1000]">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Current Selection</p>
            <p className="font-mono text-lg font-bold text-slate-800">{position[0].toFixed(5)}, {position[1].toFixed(5)}</p>
        </div>
      </div>
    </div>
  );
};

export default SetLocation;
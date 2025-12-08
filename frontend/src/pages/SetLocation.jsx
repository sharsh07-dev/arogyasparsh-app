import React, { useState, useRef, useEffect } from "react";
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
  
  // ✅ CRASH-PROOF COORDINATE LOADER
  const getSafePosition = () => {
    try {
      const user = JSON.parse(localStorage.getItem("userInfo")) || {};
      
      // Check if coordinates exist
      if (user.landingCoordinates && user.landingCoordinates.lat) {
        const lat = parseFloat(user.landingCoordinates.lat);
        const lng = parseFloat(user.landingCoordinates.lng);

        // Verify they are actual numbers (Not NaN)
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng];
        }
      }
    } catch (e) {
      console.error("Error reading location:", e);
    }
    // Fallback Default (Gadchiroli Center)
    return [19.9280, 79.9050];
  };

  const [position, setPosition] = useState(getSafePosition());

  // Handle Map Clicks
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
          <span className="font-bold text-blue-600">Landing Zone</span>
          <br />Drag to adjust.
        </Popup>
      </Marker>
    );
  }

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem("userInfo")) || {};
    
    // 1. Update Local Storage
    const updatedUser = {
      ...user,
      landingCoordinates: { lat: position[0], lng: position[1] }
    };
    localStorage.setItem("userInfo", JSON.stringify(updatedUser));

    // 2. Update Backend
    try {
        await fetch(`https://arogyasparsh-backend.onrender.com/api/auth/update-location`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email: user.email, 
                coordinates: { lat: position[0], lng: position[1] } 
            })
        });
        alert(`✅ Landing Zone Saved!\nLat: ${position[0].toFixed(4)}\nLng: ${position[1].toFixed(4)}`);
        navigate("/phc-dashboard");
    } catch (e) {
        alert("Saved locally (Offline Mode).");
        navigate("/phc-dashboard");
    }
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
                <p className="text-xs text-slate-500">Drag marker to exact drop location.</p>
            </div>
        </div>
        <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 text-sm"
        >
            <Save size={16} /> Confirm
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
        
        <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur p-3 rounded-xl shadow-xl border border-slate-200 z-[1000]">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Selected Coordinates</p>
            <p className="font-mono text-sm font-bold text-slate-800">{position[0].toFixed(5)}, {position[1].toFixed(5)}</p>
        </div>
      </div>
    </div>
  );
};

export default SetLocation;
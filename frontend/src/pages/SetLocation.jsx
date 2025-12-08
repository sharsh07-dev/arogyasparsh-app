import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { Save, ArrowLeft, MapPin, Loader } from "lucide-react";
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
  
  // ✅ SMART COORDINATE PARSER
  // This extracts your exact coordinates even if they are 'stringified'
  const getSavedPosition = () => {
    try {
      const user = JSON.parse(localStorage.getItem("userInfo")) || {};
      let coords = user.landingCoordinates;

      // 1. If stored as a string (JSON), parse it
      if (typeof coords === 'string') {
          try { coords = JSON.parse(coords); } catch (e) {}
      }

      // 2. Validate Numbers
      if (coords && coords.lat && coords.lng) {
        const lat = parseFloat(coords.lat);
        const lng = parseFloat(coords.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng]; // ✅ RETURN EXACT SAVED LOCATION
        }
      }
    } catch (e) {
      console.error("Error reading location:", e);
    }
    
    // ⚠️ CRITICAL: Map MUST have a center to open.
    // If your data is corrupted (NaN), we start at Gadchiroli so you can drag to fix it.
    // This is ONLY used if your saved data is broken.
    return [19.9280, 79.9050]; 
  };

  const [position, setPosition] = useState(getSavedPosition());

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
          <span className="font-bold text-blue-600">Selected Landing Zone</span>
          <br />Exact Coords: {position[0].toFixed(4)}, {position[1].toFixed(4)}
        </Popup>
      </Marker>
    );
  }

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem("userInfo")) || {};
    
    // 1. Save as CLEAN OBJECT (Fixes the NaN issue for future)
    const updatedUser = {
      ...user,
      landingCoordinates: { lat: position[0], lng: position[1] } // Saving as Object, not string
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
        alert(`✅ Location Secured!\nLatitude: ${position[0]}\nLongitude: ${position[1]}`);
        navigate("/phc-dashboard");
    } catch (e) {
        alert("Saved locally (Offline Mode).");
        navigate("/phc-dashboard");
    }
  };

  if (isNaN(position[0]) || isNaN(position[1])) {
      return <div className="h-screen flex items-center justify-center text-red-500">Error: Invalid Coordinates. Clear Cache.</div>;
  }

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
                    <MapPin className="text-blue-600"/> Set Exact Landing Zone
                </h1>
                <p className="text-xs text-slate-500">Pinpoint your exact PHC location for drone delivery.</p>
            </div>
        </div>
        <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 text-sm transition-all"
        >
            <Save size={18} /> Confirm Location
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative z-0">
        <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
        
        {/* Coordinate Display */}
        <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur p-4 rounded-xl shadow-xl border border-slate-200 z-[1000] min-w-[200px]">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Target Coordinates</p>
            <div className="font-mono text-sm font-bold text-slate-800 flex justify-between">
                <span>LAT:</span> <span>{position[0].toFixed(6)}</span>
            </div>
            <div className="font-mono text-sm font-bold text-slate-800 flex justify-between">
                <span>LNG:</span> <span>{position[1].toFixed(6)}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SetLocation;
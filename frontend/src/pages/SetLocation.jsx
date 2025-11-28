import React, { useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Marker Icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Default Center (India/Maharashtra approx) or get from Browser Geolocation
const DEFAULT_CENTER = [19.9280, 79.9050]; 

const LocationMarker = ({ setPos }) => {
  const [position, setPosition] = useState(DEFAULT_CENTER);
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      setPos({ lat: e.latlng.lat, lng: e.latlng.lng });
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const SetLocation = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const [selectedPos, setSelectedPos] = useState({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] });
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
        const res = await fetch('https://arogyasparsh-backend.onrender.com/api/auth/set-landing-zone', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user._id, lat: selectedPos.lat, lng: selectedPos.lng })
        });

        if (res.ok) {
            // Update local storage user data
            const updatedUser = { ...user, landingCoordinates: { lat: selectedPos.lat, lng: selectedPos.lng, set: true } };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            
            alert("✅ Landing Zone Confirmed! Redirecting to Dashboard...");
            navigate('/phc-dashboard');
        } else {
            alert("Failed to save location.");
        }
    } catch (err) {
        alert("Network Error");
    }
    setIsLoading(false);
  };

  return (
    <div className="h-screen flex flex-col relative">
      {/* Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] bg-white p-4 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="text-red-500" /> Set Drone Landing Zone
            </h2>
            <p className="text-xs text-slate-500">Tap on the map to mark exact drop location.</p>
        </div>
      </div>

      {/* Map */}
      <MapContainer center={DEFAULT_CENTER} zoom={13} scrollWheelZoom={true} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker setPos={setSelectedPos} />
      </MapContainer>

      {/* Footer Confirmation */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-white rounded-t-3xl shadow-2xl z-[1000] border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
            <div>
                <p className="text-xs text-slate-400 uppercase font-bold">Selected Coordinates</p>
                <p className="text-sm font-mono font-bold text-slate-700">
                    {selectedPos.lat.toFixed(4)}, {selectedPos.lng.toFixed(4)}
                </p>
            </div>
            <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                <Navigation size={24} />
            </div>
        </div>
        <button 
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
        >
            {isLoading ? "Saving..." : <><CheckCircle /> Confirm Landing Spot</>}
        </button>
      </div>
    </div>
  );
};

export default SetLocation;
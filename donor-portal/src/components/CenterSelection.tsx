import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Check, ArrowLeft } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ensureLeafletIcon } from '../utils/mapDefaults';
import '../styles.css';

// Ensure leaflet icons are set up
ensureLeafletIcon();

interface DonationCenter {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  position: { lat: number; lng: number };
  nextAvailable?: string;
  isUrgent?: boolean;
  isDefault?: boolean;
}

interface CenterSelectionProps {
  onCenterSelect?: (centerId: string) => void;
  onContinue?: (centerId: string) => void;
  onBack?: () => void;
}

// Custom marker icons
const createTerracottaIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px;
      height: 24px;
      background-color: #D97757;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const createMediterraneanBlueIcon = () => {
  return L.divIcon({
    className: 'custom-marker-selected',
    html: `<div style="
      width: 32px;
      height: 32px;
      background-color: #5B9BD5;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(91, 155, 213, 0.5);
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Map updater component with zoom animation
const MapViewUpdater = ({ position, zoom }: { position: [number, number]; zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, zoom || 13, {
      animate: true,
      duration: 0.6,
    });
  }, [map, position, zoom]);
  return null;
};

function CenterSelection({ onCenterSelect, onContinue, onBack }: CenterSelectionProps) {
  const navigate = useNavigate();
  const [postalCode, setPostalCode] = useState('');
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([45.4642, 9.19]); // Milan default
  const selectedCardRef = useRef<HTMLDivElement>(null);

  // Mock data - in real app, fetch from API
  const [centers] = useState<DonationCenter[]>([
    {
      id: '1',
      name: 'AVIS Cadoneghe',
      address: 'Via Roma 15, 35010 Cadoneghe, PD',
      distanceKm: 2.3,
      position: { lat: 45.4642, lng: 9.19 },
      nextAvailable: 'Tuesday 3 December',
      isDefault: true,
    },
    {
      id: '2',
      name: 'Centro Donazioni Duomo',
      address: 'Via Torino 18, 20123 Milano, MI',
      distanceKm: 5.1,
      position: { lat: 45.4627, lng: 9.1859 },
      nextAvailable: 'Wednesday 4 December',
    },
    {
      id: '3',
      name: 'Ospedale San Raffaele',
      address: 'Via Olgettina 60, 20132 Milano, MI',
      distanceKm: 8.7,
      position: { lat: 45.5014, lng: 9.2589 },
      nextAvailable: 'Thursday 5 December',
    },
    {
      id: '4',
      name: 'Centro Trasfusionale Niguarda',
      address: 'Piazza Ospedale Maggiore 3, 20162 Milano, MI',
      distanceKm: 12.4,
      position: { lat: 45.5152, lng: 9.1896 },
      isUrgent: true,
    },
  ]);

  const steps = [
    { id: 1, label: 'Center', current: true, completed: false },
    { id: 2, label: 'Date & Time', current: false, completed: false },
    { id: 3, label: 'Your Details', current: false, completed: false },
    { id: 4, label: 'Health Check', current: false, completed: false },
    { id: 5, label: 'Confirmation', current: false, completed: false },
  ];

  const defaultCenter = centers.find((c) => c.isDefault);
  const selectedCenter = centers.find((c) => c.id === selectedCenterId) || defaultCenter;

  useEffect(() => {
    if (defaultCenter && !selectedCenterId) {
      setSelectedCenterId(defaultCenter.id);
      setMapCenter([defaultCenter.position.lat, defaultCenter.position.lng]);
    }
  }, [defaultCenter, selectedCenterId]);

  const handleSelectCenter = (centerId: string) => {
    setSelectedCenterId(centerId);
    const center = centers.find((c) => c.id === centerId);
    if (center) {
      setMapCenter([center.position.lat, center.position.lng]);
      onCenterSelect?.(centerId);

      // Scroll to selected card
      setTimeout(() => {
        selectedCardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  };

  const handleContinue = () => {
    if (selectedCenterId) {
      onContinue?.(selectedCenterId);
      // In real app, navigate to next step
      // navigate('/book/date-time');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const currentStepIndex = steps.findIndex((s) => s.current);

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Indicator */}
      <div className="bg-cream border-b border-taupe/20 py-4 px-4 md:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="hidden md:flex items-center justify-between">
            {steps.map((step, index) => {
              const isCurrent = step.current;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                        isCurrent
                          ? 'bg-terracotta text-white shadow-md'
                          : isCompleted
                            ? 'bg-olive-green text-white'
                            : 'border-2 border-taupe text-taupe bg-white'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center ${
                        isCurrent ? 'text-espresso font-semibold' : 'text-taupe'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-olive-green'
                          : 'bg-mediterranean-blue'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Progress Dots */}
          <div className="flex items-center justify-center gap-2 md:hidden">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step.current
                    ? 'bg-terracotta w-8'
                    : index < currentStepIndex
                      ? 'bg-olive-green w-2'
                      : 'bg-taupe w-2'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-taupe hover:text-espresso border border-taupe hover:border-espresso px-4 py-2 rounded-lg transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-[32px] font-bold text-espresso mb-3 leading-tight">
            Where would you like to donate?
          </h1>
          <p className="text-base text-taupe leading-relaxed">
            Your default center is AVIS Cadoneghe. You can select a different center if needed.
          </p>
        </div>

        {/* Location Input */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-taupe" />
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Enter your postal code to see nearby centers"
              className="w-full pl-12 pr-4 py-3 bg-cream border-2 border-transparent focus:border-mediterranean-blue rounded-lg text-espresso placeholder-taupe transition-all duration-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Map Info Text */}
        <p className="text-sm text-taupe mb-4">
          We'll always show you the closest options available today
        </p>

        {/* Map View */}
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg h-[300px] md:h-[500px] mediterranean-map-container">
          <MapContainer
            center={mapCenter}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            className="warm-map"
          >
            {selectedCenter && (
              <MapViewUpdater
                position={[selectedCenter.position.lat, selectedCenter.position.lng]}
                zoom={selectedCenterId === selectedCenter.id ? 14 : 13}
              />
            )}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {centers.map((center) => {
              const isSelected = center.id === selectedCenterId;
              const icon = isSelected ? createMediterraneanBlueIcon() : createTerracottaIcon();
              return (
                <Marker
                  key={center.id}
                  position={[center.position.lat, center.position.lng]}
                  icon={icon}
                  eventHandlers={{
                    click: () => handleSelectCenter(center.id),
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <strong className="text-espresso">{center.name}</strong>
                      <p className="text-sm text-taupe mt-1">{center.address}</p>
                      <button
                        onClick={() => handleSelectCenter(center.id)}
                        className="mt-2 text-sm text-mediterranean-blue hover:underline font-semibold"
                      >
                        Select this center
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Center Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {centers.map((center) => {
            const isSelected = center.id === selectedCenterId;
            return (
              <div
                key={center.id}
                ref={isSelected ? selectedCardRef : null}
                onClick={() => handleSelectCenter(center.id)}
                className={`mediterranean-card bg-white border rounded-lg p-6 cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'border-2 border-mediterranean-blue bg-mediterranean-blue/5 shadow-lg'
                    : 'border border-taupe hover:border-mediterranean-blue/50 hover:shadow-md hover:bg-cream/30'
                } ${center.isDefault && !isSelected ? 'border-l-4 border-l-terracotta' : ''}`}
              >
                {/* Default Badge */}
                {center.isDefault && (
                  <div className="mb-3">
                    <span className="inline-block bg-terracotta text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      Your Default Center
                    </span>
                  </div>
                )}

                {/* Center Name */}
                <h3 className="text-[18px] font-bold text-espresso mb-2 leading-tight">{center.name}</h3>

                {/* Address */}
                <p className="text-sm text-taupe mb-4 leading-relaxed">{center.address}</p>

                {/* Distance */}
                <div className="flex items-center gap-2 text-sm text-taupe mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{center.distanceKm.toFixed(1)} km away</span>
                </div>

                {/* Availability */}
                <div className="mb-4">
                  {center.isUrgent ? (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-burnt-orange" />
                      <span className="text-burnt-orange font-semibold">High demand</span>
                    </div>
                  ) : center.nextAvailable ? (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-olive-green" />
                      <span className="text-taupe">
                        Next available: <span className="font-medium">{center.nextAvailable}</span>
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Select Button */}
                {isSelected ? (
                  <button
                    className="w-full bg-mediterranean-blue text-white font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-sm"
                    disabled
                  >
                    <Check className="w-4 h-4" />
                    <span>Selected</span>
                  </button>
                ) : (
                  <button
                    className="w-full border-2 border-mediterranean-blue text-mediterranean-blue hover:bg-mediterranean-blue hover:text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCenter(center.id);
                    }}
                  >
                    Select
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleContinue}
            disabled={!selectedCenterId}
            className={`px-8 py-3 rounded-lg font-bold text-base transition-all duration-300 ${
              selectedCenterId
                ? 'bg-terracotta hover:bg-[#C5694A] text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                : 'bg-taupe/30 text-taupe cursor-not-allowed opacity-50'
            }`}
          >
            Continue to Date & Time →
          </button>
        </div>
      </div>
    </div>
  );
}

export default CenterSelection;


import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Search,
} from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ensureLeafletIcon } from '../utils/mapDefaults';
import '../styles.css';

ensureLeafletIcon();

type AvailabilityStatus = 'available' | 'limited' | 'none';

interface DonationCenter {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  position: { lat: number; lng: number };
  nextAvailable: string;
  availabilityStatus?: AvailabilityStatus;
  isDefault?: boolean;
}

interface CenterSelectionProps {
  onCenterSelect?: (centerId: string) => void;
  onContinue?: (centerId: string) => void;
  onBack?: () => void;
}

const palette = {
  terracotta: '#D97757',
  mediterraneanBlue: '#5B9BD5',
  oliveGreen: '#9CAF88',
  cream: '#FDF6E9',
  espresso: '#3E2723',
  taupe: '#A1887F',
  burntOrange: '#E67E22',
};

const createMarkerIcon = (color: string, size = 24, pulse = false) =>
  L.divIcon({
    className: pulse ? 'selected-marker' : 'regular-marker',
    html: `
      <div class="marker-dot ${pulse ? 'marker-dot-selected' : ''}" style="
        width:${size}px;
        height:${size}px;
        background:${color};
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 4px 12px rgba(0,0,0,0.25);
      "></div>
      ${pulse ? '<div class="marker-pulse-ring"></div>' : ''}
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });

const MapViewUpdater = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 13, { animate: true, duration: 0.5 });
  }, [map, position]);
  return null;
};

function CenterSelection({ onCenterSelect, onContinue, onBack }: CenterSelectionProps) {
  const navigate = useNavigate();
  const [postalCode, setPostalCode] = useState('');
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([45.13, 10.02]);
  const [announcement, setAnnouncement] = useState('');
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  const centers = useMemo<DonationCenter[]>(
    () => [
      {
        id: 'avis-casalmaggiore',
        name: 'AVIS Casalmaggiore',
        address: 'Via Marconi 15',
        distanceKm: 2.3,
        position: { lat: 45.0149, lng: 10.4104 },
        nextAvailable: 'Tuesday 9 December',
        availabilityStatus: 'available',
        isDefault: true,
      },
      {
        id: 'avis-calvatone',
        name: 'AVIS Calvatone',
        address: 'Piazza della Repubblica 3',
        distanceKm: 6.4,
        position: { lat: 45.0924, lng: 10.4666 },
        nextAvailable: 'Thursday 11 December',
        availabilityStatus: 'limited',
      },
      {
        id: 'avis-gussola',
        name: 'AVIS Gussola',
        address: 'Piazza Garibaldi 8',
        distanceKm: 9.1,
        position: { lat: 45.0323, lng: 10.2861 },
        nextAvailable: 'Friday 12 December',
        availabilityStatus: 'available',
      },
      {
        id: 'avis-piadena',
        name: 'AVIS Piadena',
        address: 'Corso Vittorio Emanuele 12',
        distanceKm: 12.8,
        position: { lat: 45.1206, lng: 10.3799 },
        nextAvailable: 'Monday 15 December',
        availabilityStatus: 'limited',
      },
      {
        id: 'avis-rivarolo',
        name: 'AVIS Rivarolo del Re',
        address: 'Via Nazionale 45',
        distanceKm: 15.2,
        position: { lat: 45.0269, lng: 10.4555 },
        nextAvailable: 'Wednesday 17 December',
        availabilityStatus: 'available',
      },
      {
        id: 'avis-scandolara',
        name: 'AVIS Scandolara-Ravara',
        address: 'Via della Libertà 7',
        distanceKm: 17.3,
        position: { lat: 45.0875, lng: 10.3151 },
        nextAvailable: 'Friday 19 December',
        availabilityStatus: 'available',
      },
      {
        id: 'avis-viadana',
        name: 'AVIS Viadana',
        address: 'Via Roma 22',
        distanceKm: 18.0,
        position: { lat: 44.9293, lng: 10.5203 },
        nextAvailable: 'Monday 22 December',
        availabilityStatus: 'available',
      },
    ],
    [],
  );

  const defaultCenter = centers.find((c) => c.isDefault);

  useEffect(() => {
    if (defaultCenter && !selectedCenterId) {
      setSelectedCenterId(defaultCenter.id);
      setMapCenter([defaultCenter.position.lat, defaultCenter.position.lng]);
    }
  }, [defaultCenter, selectedCenterId]);

  useEffect(() => {
    if (!announcement || !liveRegionRef.current) return;
    liveRegionRef.current.textContent = announcement;
  }, [announcement]);

  const filteredCenters = useMemo(() => {
    if (!postalCode.trim()) return centers;
    const query = postalCode.trim().toLowerCase();
    return centers.filter((center) =>
      `${center.address} ${center.name}`.toLowerCase().includes(query),
    );
  }, [centers, postalCode]);

  const selectedCenter = useMemo(
    () => centers.find((c) => c.id === selectedCenterId) || defaultCenter || centers[0],
    [centers, defaultCenter, selectedCenterId],
  );

  const handleSelectCenter = (centerId: string) => {
    const center = centers.find((c) => c.id === centerId);
    if (!center) return;
    setSelectedCenterId(centerId);
    setMapCenter([center.position.lat, center.position.lng]);
    onCenterSelect?.(centerId);
    setAnnouncement(`${center.name} selected. ${center.distanceKm.toFixed(1)} kilometers away.`);

    requestAnimationFrame(() => {
      cardRefs.current[centerId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const currentIndex = filteredCenters.findIndex((c) => c.id === selectedCenterId);
    if (currentIndex === -1) return;

    const columns = 2;
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = Math.min(filteredCenters.length - 1, currentIndex + 1);
        break;
      case 'ArrowLeft':
        nextIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowDown':
        nextIndex = Math.min(filteredCenters.length - 1, currentIndex + columns);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(0, currentIndex - columns);
        break;
      default:
        return;
    }

    if (nextIndex !== currentIndex) {
      event.preventDefault();
      handleSelectCenter(filteredCenters[nextIndex].id);
    }
  };

  const handleContinue = () => {
    if (!selectedCenterId) return;
    onContinue?.(selectedCenterId);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(-1);
  };

  const steps = [
    { id: 1, label: 'Select Center', state: 'current' as const },
    { id: 2, label: 'Date & Time', state: 'upcoming' as const },
    { id: 3, label: 'Your Details', state: 'upcoming' as const },
    { id: 4, label: 'Health Check', state: 'upcoming' as const },
    { id: 5, label: 'Confirmation', state: 'upcoming' as const },
  ];

  const terracottaMarker = useMemo(() => createMarkerIcon(palette.terracotta, 26), []);
  const selectedMarker = useMemo(
    () => createMarkerIcon(palette.mediterraneanBlue, 30, true),
    [],
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="sr-only" aria-live="polite" ref={liveRegionRef} />
      {/* Progress Indicator */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-taupe/20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-center">
          <div className="hidden md:flex w-full items-center gap-3">
            {steps.map((step, index) => {
              const isCurrent = step.state === 'current';
              const isCompleted = index < steps.findIndex((s) => s.state === 'current');
              const nextStep = steps[index + 1];
              return (
                <div className="flex items-center flex-1" key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                        isCurrent
                          ? 'bg-terracotta text-white shadow-md'
                          : isCompleted
                          ? 'bg-olive-green text-white'
                          : 'bg-cream text-taupe border border-taupe/50'
                      }`}
                    >
                      {isCompleted ? '✓' : step.id}
                    </div>
                    <span
                      className={`text-xs mt-2 ${
                        isCurrent ? 'text-espresso font-semibold' : 'text-taupe'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {nextStep && (
                    <div
                      className={`flex-1 h-[3px] mx-3 rounded-full transition-all duration-300 ${
                        isCurrent ? 'bg-terracotta' : 'bg-taupe/60'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="md:hidden flex items-center gap-2">
            {steps.map((step) => (
              <span
                key={step.id}
                className={`w-2.5 h-2.5 rounded-full ${
                  step.state === 'current' ? 'bg-terracotta w-4' : 'bg-taupe/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
        {/* Step Indicator Card */}
        <section className="bg-cream border-l-4 border-terracotta rounded-lg p-4 flex items-start gap-3">
          <div className="mt-1 text-terracotta">
            <MapPin className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-espresso">Step 1: Select Center</p>
            <p className="text-sm text-taupe">Choose your preferred donation center</p>
          </div>
        </section>

        {/* Heading */}
        <header className="space-y-2">
          <h1 className="text-3xl md:text-[32px] font-bold text-espresso">
            Where would you like to donate?
          </h1>
          <p className="text-base text-taupe max-w-3xl">
            Your default center is AVIS Casalmaggiore. You can select a different center if needed.
          </p>
        </header>

        {/* Postal code search */}
        <section className="space-y-2">
          <label className="text-base font-medium text-espresso">
            Enter your postal code to see nearby centers
          </label>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-mediterranean-blue"
              size={18}
              aria-hidden="true"
            />
            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="e.g. 20122"
              className="w-full h-12 pl-11 pr-4 rounded-lg border border-taupe focus:border-2 focus:border-mediterranean-blue focus:outline-none text-espresso placeholder-taupe"
            />
          </div>
          <p className="text-sm text-taupe italic">
            We&apos;ll always show you the closest options available today.
          </p>
        </section>

        {/* Map */}
        <section className="space-y-3">
          <div className="rounded-xl overflow-hidden shadow-md border border-taupe/25">
            <MapContainer
              key={`${mapCenter[0]}-${mapCenter[1]}`}
              center={mapCenter}
              zoom={12}
              scrollWheelZoom
              className="h-[300px] md:h-[400px] mediterranean-map"
            >
              {selectedCenter && (
                <MapViewUpdater position={[selectedCenter.position.lat, selectedCenter.position.lng]} />
              )}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredCenters.map((center) => {
                const isSelected = center.id === selectedCenterId;
                return (
                  <Marker
                    key={center.id}
                    position={[center.position.lat, center.position.lng]}
                    icon={isSelected ? selectedMarker : terracottaMarker}
                    eventHandlers={{ click: () => handleSelectCenter(center.id) }}
                  >
                    <Popup>
                      <div className="space-y-1">
                        <p className="font-semibold text-espresso">{center.name}</p>
                        <p className="text-sm text-taupe">{center.address}</p>
                        <button
                          className="text-sm text-mediterranean-blue font-semibold hover:underline"
                          onClick={() => handleSelectCenter(center.id)}
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
          <p className="text-xs text-taupe text-right">Map data © OpenStreetMap contributors</p>
        </section>

        {/* Center cards */}
        <section
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
          role="radiogroup"
          aria-label="Donation centers"
          onKeyDown={handleKeyDown}
        >
          {filteredCenters.map((center) => {
            const isSelected = center.id === selectedCenterId;
            const badgeColor =
              center.availabilityStatus === 'limited' ? palette.burntOrange : palette.oliveGreen;
            const badgeText =
              center.availabilityStatus === 'limited'
                ? 'Limited slots'
                : 'Slots available';

            return (
              <article
                key={center.id}
                ref={(el) => (cardRefs.current[center.id] = el)}
                tabIndex={0}
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelectCenter(center.id)}
                onFocus={() => setSelectedCenterId(center.id)}
                className={`relative bg-white border ${
                  isSelected ? 'border-terracotta' : 'border-taupe'
                } rounded-xl p-6 shadow-sm transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mediterranean-blue ${
                  isSelected ? 'shadow-lg selected-card-pulse' : 'hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                {center.isDefault && (
                  <span className="absolute top-4 right-4 bg-terracotta text-white text-xs font-semibold px-3 py-1 rounded-md inline-flex items-center gap-1">
                    <Heart size={14} /> Your Default Center
                  </span>
                )}
                <div className="absolute left-0 top-0 h-full w-2 rounded-l-xl bg-terracotta" aria-hidden="true" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-espresso">{center.name}</h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-taupe">
                      <MapPin className="w-4 h-4 text-mediterranean-blue" aria-hidden="true" />
                      <span>{center.address}</span>
                    </div>
                    <p className="mt-2 text-sm text-taupe">{center.distanceKm.toFixed(1)} km away</p>
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold"
                    style={{ backgroundColor: `${badgeColor}1A`, color: badgeColor }}
                  >
                    <Calendar size={14} />
                    {badgeText}
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-olive-green flex items-center gap-2">
                  <Calendar size={16} className="text-olive-green" aria-hidden="true" />
                  Next available: {center.nextAvailable}
                </p>
                <div className="mt-4">
                  <button
                    className={`w-full h-10 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                      isSelected
                        ? 'bg-terracotta text-white shadow-md'
                        : 'border-2 border-mediterranean-blue text-mediterranean-blue hover:bg-mediterranean-blue hover:text-white'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCenter(center.id);
                    }}
                  >
                    <CheckCircle2 className={isSelected ? 'text-white' : 'text-mediterranean-blue'} size={18} />
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {/* Navigation */}
        <section className="flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-stretch md:items-center pt-4">
          <button
            onClick={handleBack}
            className="h-12 md:h-12 px-4 md:px-6 rounded-lg border-2 border-taupe text-taupe hover:text-espresso hover:border-espresso flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mediterranean-blue"
          >
            <ChevronLeft size={18} />
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedCenterId}
            className={`h-12 md:h-12 px-4 md:px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mediterranean-blue ${
              selectedCenterId
                ? 'bg-terracotta text-white hover:bg-[#C5694A] shadow-md'
                : 'bg-taupe text-white/80 cursor-not-allowed opacity-60'
            }`}
          >
            Continue to Date &amp; Time
            <ChevronRight size={18} />
          </button>
        </section>
      </main>
    </div>
  );
}

export default CenterSelection;


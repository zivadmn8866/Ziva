
import React, { useState, useEffect, useMemo } from 'react';
import { User, Service, Role } from '../../types';
import ServiceList from './ServiceList';
import Map from './Map';
import { MapPin, LocateFixed, AlertCircle } from 'lucide-react';

interface LocationDiscoveryProps {
  services: Service[];
  users: User[];
  selectedServices: Service[];
  onSelectService: (service: Service) => void;
  addNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    0.5 - Math.cos(dLat) / 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    (1 - Math.cos(dLon)) / 2;
  return R * 2 * Math.asin(Math.sqrt(a));
};

const LocationDiscovery: React.FC<LocationDiscoveryProps> = ({ services, users, selectedServices, onSelectService, addNotification }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [radius, setRadius] = useState(10); // in km
  const [showInstantOnly, setShowInstantOnly] = useState(false);
  const [showHomeServiceOnly, setShowHomeServiceOnly] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
        setIsLoadingLocation(false);
      },
      (error) => {
        setLocationError("Could not get your location. Please enable location services. Showing all providers.");
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);
  
  const providers = useMemo(() => users.filter(u => u.role === Role.PROVIDER), [users]);

  const nearbyProviders = useMemo(() => {
    if (!userLocation) {
        return locationError ? providers : [];
    }
    return providers.filter(p => {
      if (p.latitude && p.longitude) {
        const distance = getDistance(userLocation.lat, userLocation.lon, p.latitude, p.longitude);
        return distance <= radius;
      }
      return false;
    });
  }, [userLocation, radius, providers, locationError]);

  const servicesFromNearbyProviders = useMemo(() => {
    const nearbyProviderIds = new Set(nearbyProviders.map(p => p.id));
    let filtered = locationError ? services : services.filter(s => nearbyProviderIds.has(s.providerId));

    if (showInstantOnly) {
      filtered = filtered.filter(s => s.isInstant);
    }
    if (showHomeServiceOnly) {
      filtered = filtered.filter(s => s.isHomeService);
    }
    return filtered;
  }, [nearbyProviders, services, showInstantOnly, showHomeServiceOnly, locationError]);

  if (isLoadingLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-400">
        <LocateFixed className="w-10 h-10 animate-pulse text-pink-400" />
        <p className="mt-4 text-lg">Finding nearby barbers...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
        <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold flex items-center gap-2"><MapPin className="text-pink-400" /> Location-Based Discovery</h2>
             {locationError && (
                 <div className="mt-3 text-yellow-400 bg-yellow-900/50 p-3 rounded-md text-sm flex items-center gap-2">
                     <AlertCircle className="w-5 h-5" /> {locationError}
                 </div>
             )}
             {userLocation && (
                <div className="mt-4">
                    <label htmlFor="radius" className="block text-sm font-medium text-gray-300 mb-2">
                        Search radius: <span className="font-bold text-pink-400">{radius} km</span>
                    </label>
                    <input
                        id="radius"
                        type="range"
                        min="1"
                        max="50"
                        value={radius}
                        onChange={e => setRadius(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                </div>
             )}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center">
                    <input type="checkbox" id="instant" checked={showInstantOnly} onChange={e => setShowInstantOnly(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-600"/>
                    <label htmlFor="instant" className="ml-2 text-sm font-medium text-gray-300">⚡️ Instant Only</label>
                </div>
                 <div className="flex items-center">
                    <input type="checkbox" id="home" checked={showHomeServiceOnly} onChange={e => setShowHomeServiceOnly(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-600"/>
                    <label htmlFor="home" className="ml-2 text-sm font-medium text-gray-300">🏠 Home Service</label>
                </div>
            </div>
        </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Map
            userLocation={userLocation}
            providers={nearbyProviders}
            radius={radius}
          />
        </div>
        <div className="lg:col-span-2">
           { (servicesFromNearbyProviders.length > 0 || locationError) ? (
            <ServiceList
                services={servicesFromNearbyProviders}
                selectedServices={selectedServices}
                onSelectService={onSelectService}
            />
           ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gray-900 rounded-lg p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-600 mb-4"/>
                <h3 className="text-lg font-bold">No Barbers Found Nearby</h3>
                <p className="text-gray-400">Try adjusting your filters or increasing the search radius.</p>
                <p className="text-xs text-gray-500 mt-4">(Note: Demo providers are located in the San Francisco Bay Area.)</p>
            </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default LocationDiscovery;

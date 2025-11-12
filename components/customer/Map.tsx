import React from 'react';
import { User } from '../../types';
import { Home, MapPin } from 'lucide-react';

interface MapProps {
  userLocation: { lat: number; lon: number } | null;
  providers: User[];
  radius: number;
}

const SCALE = 1500;

const Map: React.FC<MapProps> = ({ userLocation, providers, radius }) => {
  if (!userLocation) {
    return (
        <div className="aspect-square w-full bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
            <p>Location not available</p>
        </div>
    );
  }

  const centerLat = userLocation.lat;
  const centerLon = userLocation.lon;
  
  const radiusInDegrees = radius / 111;
  const radiusInPixels = radiusInDegrees * SCALE * 2;

  return (
    <div className="aspect-square w-full bg-gray-800 rounded-lg relative overflow-hidden border border-gray-700">
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
        title="Your Location"
        >
        <Home className="w-6 h-6 text-blue-400 bg-black/50 rounded-full p-1"/>
      </div>
      
       <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-pink-500/50 rounded-full z-10 transition-all duration-300"
        style={{
            width: `${radiusInPixels}px`,
            height: `${radiusInPixels}px`,
        }}
      ></div>

      {providers.map(provider => {
        if (!provider.latitude || !provider.longitude) return null;

        const dLat = provider.latitude - centerLat;
        const dLon = provider.longitude - centerLon;
        
        const VIEWBOX_DEGREES = 0.5;
        const top = 50 - (dLat / VIEWBOX_DEGREES) * 50;
        const left = 50 + (dLon / VIEWBOX_DEGREES) * 50;
        
        if (top < -10 || top > 110 || left < -10 || left > 110) {
            return null; // Don't render pins way outside the viewport
        }

        return (
          <div
            key={provider.id}
            className="absolute -translate-y-full z-30 transition-all duration-500"
            style={{
              top: `${top}%`,
              left: `${left}%`,
            }}
            title={provider.shopName}
          >
            <div className="flex flex-col items-center cursor-pointer group">
                <MapPin className="w-8 h-8 text-pink-500 drop-shadow-lg transition-transform group-hover:scale-125" />
                <span className="text-xs font-bold bg-black/70 text-white px-2 py-1 rounded-md whitespace-nowrap -mt-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {provider.shopName}
                </span>
            </div>
          </div>
        );
      })}

      <div className="absolute inset-0 z-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(100, 116, 139, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 116, 139, 0.5) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
      }}></div>
    </div>
  );
};

export default Map;

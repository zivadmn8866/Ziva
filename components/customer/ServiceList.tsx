import React, { useState } from 'react';
import { Service } from '../../types';
import { Search } from 'lucide-react';
import Card from '../common/Card';

interface ServiceListProps {
  services: Service[];
  selectedServices: Service[];
  onSelectService: (service: Service) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, selectedServices, onSelectService }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(services.map(s => s.category))];

  const filteredServices = services
    .filter(service => 
      selectedCategory === 'All' || service.category === selectedCategory
    )
    .filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-pink-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Search for services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.length > 0 ? filteredServices.map(service => {
          const isSelected = selectedServices.some(s => s.id === service.id);
          const Icon = service.icon;
          return (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all duration-300 flex flex-col justify-between ${isSelected ? 'ring-2 ring-pink-500 bg-gray-800' : 'hover:bg-gray-800'}`}
              onClick={() => onSelectService(service)}
            >
              <div>
                <div className="flex items-center gap-4">
                  <div className="bg-pink-500 p-3 rounded-full">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{service.name}</h3>
                    <p className="text-gray-400 text-sm">{service.description}</p>
                    <p className="text-pink-400 font-semibold mt-2">₹{service.price}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700/50">
                {service.isInstant && (
                  <span className="text-xs font-medium bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">⚡️ Instant</span>
                )}
                {service.isHomeService && (
                  <span className="text-xs font-medium bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">🏠 Home Service (+₹{service.homeServiceFee})</span>
                )}
              </div>
            </Card>
          );
        }) : (
          <p className="text-gray-400 col-span-full text-center">No services found for this category.</p>
        )}
      </div>
    </div>
  );
};

export default ServiceList;
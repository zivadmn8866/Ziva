
import React, { useState } from 'react';
import { Service } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { generateServiceDescription } from '../../services/geminiService';
import { HaircutIcon, ShaveIcon, FacialIcon, MassageIcon, ManicureIcon } from '../icons';
import { Briefcase } from 'lucide-react';

interface ManageServicesProps {
  providerId: string;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  addNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const getIconForCategory = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('hair')) return HaircutIcon;
    if (cat.includes('beard') || cat.includes('shave')) return ShaveIcon;
    if (cat.includes('skin') || cat.includes('facial')) return FacialIcon;
    if (cat.includes('nail') || cat.includes('manicure')) return ManicureIcon;
    if (cat.includes('relax') || cat.includes('massage')) return MassageIcon;
    return Briefcase; // A sensible default icon
};

const ManageServices: React.FC<ManageServicesProps> = ({ providerId, services, setServices, addNotification }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const myServices = services.filter(s => s.providerId === providerId);

  const handleOpenModal = (service: Partial<Service> | null = null) => {
    setCurrentService(service || { providerId, duration: 30, category: 'General', isInstant: false, isHomeService: false, homeServiceFee: 0 });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentService(null);
  };

  const handleSave = () => {
    if (!currentService || !currentService.name || !currentService.price || !currentService.duration || !currentService.category) {
      addNotification('Please fill all required fields.', 'error');
      return;
    }

    const serviceToSave = {
        ...currentService,
        icon: getIconForCategory(currentService.category || 'General'),
    }

    if (currentService.id) { // Edit
      setServices(prev => prev.map(s => s.id === currentService.id ? { ...s, ...serviceToSave } as Service : s));
      addNotification('Service updated successfully!', 'success');
    } else { // Add
      const newService: Service = {
        id: `service-${Date.now()}`,
        name: currentService.name,
        price: currentService.price,
        description: currentService.description || '',
        duration: currentService.duration,
        category: currentService.category,
        providerId,
        isInstant: currentService.isInstant,
        isHomeService: currentService.isHomeService,
        homeServiceFee: currentService.homeServiceFee,
        icon: getIconForCategory(currentService.category),
      };
      setServices(prev => [...prev, newService]);
      addNotification('Service added successfully!', 'success');
    }
    handleCloseModal();
  };

  const handleGenerateDescription = async () => {
      if (!currentService || !currentService.name) {
          addNotification('Please enter a service name first.', 'error');
          return;
      }
      setIsGenerating(true);
      const description = await generateServiceDescription(currentService.name);
      setCurrentService(prev => ({ ...prev, description }));
      setIsGenerating(false);
  }

  const handleDelete = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
    addNotification('Service deleted!', 'success');
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-pink-400">My Services</h2>
        <Button onClick={() => handleOpenModal()}>Add Service</Button>
      </div>
      <div className="space-y-3">
        {myServices.map(service => (
          <div key={service.id} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <p className="font-bold">{service.name} - ₹{service.price}</p>
                {service.isInstant && (
                  <span className="text-xs font-medium bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">⚡️ Instant</span>
                )}
                {service.isHomeService && (
                  <span className="text-xs font-medium bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">🏠 Home Service</span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">{service.description}</p>
            </div>
            <div className="space-x-2 flex-shrink-0">
              <Button onClick={() => handleOpenModal(service)} variant="secondary" className="text-sm">Edit</Button>
              <Button onClick={() => handleDelete(service.id)} variant="danger" className="text-sm">Delete</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentService?.id ? 'Edit Service' : 'Add Service'}>
        <div className="space-y-4">
          <Input label="Service Name" value={currentService?.name || ''} onChange={e => setCurrentService(p => ({ ...p, name: e.target.value }))} required/>
          <Input label="Price (₹)" type="number" value={currentService?.price || ''} onChange={e => setCurrentService(p => ({ ...p, price: Number(e.target.value) }))} required/>
          <Input label="Category" value={currentService?.category || ''} onChange={e => setCurrentService(p => ({ ...p, category: e.target.value }))} required/>
          <Input label="Duration (minutes)" type="number" value={currentService?.duration || ''} onChange={e => setCurrentService(p => ({ ...p, duration: Number(e.target.value) }))} required/>
           <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={currentService?.description || ''}
                onChange={e => setCurrentService(p => ({ ...p, description: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <Button 
                variant="secondary" 
                className="mt-2 text-sm" 
                onClick={handleGenerateDescription}
                isLoading={isGenerating}>
                ✨ Generate with AI
              </Button>
           </div>
           <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="isInstant" className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-600" checked={currentService?.isInstant || false} onChange={e => setCurrentService(p => ({ ...p, isInstant: e.target.checked }))} />
                    <label htmlFor="isInstant" className="text-sm text-gray-300">Instant Booking Available</label>
                </div>
                 <div className="flex items-center gap-2">
                    <input type="checkbox" id="isHomeService" className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-600" checked={currentService?.isHomeService || false} onChange={e => setCurrentService(p => ({ ...p, isHomeService: e.target.checked }))} />
                    <label htmlFor="isHomeService" className="text-sm text-gray-300">Offer Home Service</label>
                </div>
                {currentService?.isHomeService && (
                    <Input label="Home Service Fee (₹)" type="number" value={currentService?.homeServiceFee || ''} onChange={e => setCurrentService(p => ({...p, homeServiceFee: Number(e.target.value) }))} />
                )}
           </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default ManageServices;
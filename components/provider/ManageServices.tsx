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
  const cat = (category || '').toLowerCase();
  if (cat.includes('hair')) return HaircutIcon;
  if (cat.includes('shave')) return ShaveIcon;
  if (cat.includes('facial')) return FacialIcon;
  if (cat.includes('manicure')) return ManicureIcon;
  if (cat.includes('massage')) return MassageIcon;
  return Briefcase;
};

const ManageServices: React.FC<ManageServicesProps> = ({
  providerId,
  services,
  setServices,
  addNotification
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const openAddServiceModal = () => {
    setCurrentService({
      providerId,
      title: '',
      description: '',
      category: '',
      duration: '',
      price: ''
    });
    setIsModalOpen(true);
  };

  const openEditServiceModal = (service: Service) => {
    setCurrentService({ ...service });
    setIsModalOpen(true);
  };

  const handleGenerateDescription = async () => {
    if (!currentService?.title || !currentService?.category) {
      addNotification('Please fill in title and category before generating.', 'error');
      return;
    }
    try {
      setIsGenerating(true);
      const generated = await generateServiceDescription(
        String(currentService.title),
        String(currentService.category)
      );
      setCurrentService({ ...currentService, description: generated });
      addNotification('AI description generated!', 'success');
    } catch (err) {
      console.error(err);
      addNotification('Failed to generate description', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveService = () => {
    if (!currentService?.title || !currentService?.price) {
      addNotification('Title and price are required.', 'error');
      return;
    }

    if (currentService.id) {
      // update
      const updated = services.map(s => (s.id === currentService.id ? (currentService as Service) : s));
      setServices(updated);
      addNotification('Service updated!', 'success');
    } else {
      // create
      const newService: Service = {
        ...(currentService as Service),
        id: Math.random().toString(36).slice(2, 9)
      };
      setServices([...services, newService]);
      addNotification('Service added!', 'success');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Manage Services</h2>

      <Button label="Add New Service" onClick={openAddServiceModal} className="mt-4" />

      <div className="grid grid-cols-1 gap-4 mt-4">
        {services.map((service) => {
          const Icon = getIconForCategory(service.category || '');
          return (
            <Card key={service.id}>
              <div className="flex items-center gap-2">
                <Icon size={20} />
                <h3 className="font-semibold">{service.title}</h3>
              </div>
              <p className="text-gray-600">{service.description}</p>
              <p className="font-semibold mt-2">₹{service.price}</p>
              <div className="mt-2">
                <Button label="Edit" onClick={() => openEditServiceModal(service)} />
              </div>
            </Card>
          );
        })}
      </div>

      {isModalOpen && currentService && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <h3 className="text-lg font-semibold mb-2">
            {currentService.id ? 'Edit Service' : 'Add Service'}
          </h3>

          <Input
            label="Title"
            value={currentService.title || ''}
            onChange={(e) => setCurrentService({ ...currentService, title: e.target.value })}
          />

          <Input
            label="Category"
            value={currentService.category || ''}
            onChange={(e) => setCurrentService({ ...currentService, category: e.target.value })}
          />

          <Input
            label="Duration (min)"
            value={currentService.duration || ''}
            onChange={(e) => setCurrentService({ ...currentService, duration: e.target.value })}
          />

          <Input
            label="Price"
            value={currentService.price || ''}
            onChange={(e) => setCurrentService({ ...currentService, price: e.target.value })}
          />

          <div className="mt-3">
            <Button
              label={isGenerating ? 'Generating...' : 'Generate AI Description'}
              disabled={isGenerating}
              onClick={handleGenerateDescription}
            />
          </div>

          <Input
            label="Description"
            value={currentService.description || ''}
            onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
            textarea
          />

          <div className="mt-4">
            <Button label="Save" onClick={saveService} />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManageServices;

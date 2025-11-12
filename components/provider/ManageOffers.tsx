
import React, { useState } from 'react';
import { Offer } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';

interface ManageOffersProps {
  providerId: string;
  offers: Offer[];
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
  addNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const ManageOffers: React.FC<ManageOffersProps> = ({ providerId, offers, setOffers, addNotification }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOffer, setCurrentOffer] = useState<Partial<Offer> | null>(null);

    const myOffers = offers.filter(o => o.providerId === providerId);

    const handleOpenModal = (offer: Partial<Offer> | null = null) => {
        setCurrentOffer(offer || { providerId });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentOffer(null);
    };

    const handleSave = () => {
        if (!currentOffer || !currentOffer.title || !currentOffer.discountPercentage) {
            addNotification('Please fill all fields.', 'error');
            return;
        }

        if (currentOffer.id) { // Edit
            setOffers(prev => prev.map(o => o.id === currentOffer.id ? { ...o, ...currentOffer } as Offer : o));
            addNotification('Offer updated successfully!', 'success');
        } else { // Add
            const newOffer: Offer = {
                id: `offer-${Date.now()}`,
                title: currentOffer.title,
                description: currentOffer.description || '',
                discountPercentage: currentOffer.discountPercentage,
                serviceIds: [],
                providerId,
            };
            setOffers(prev => [...prev, newOffer]);
            addNotification('Offer added successfully!', 'success');
        }
        handleCloseModal();
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-pink-400">My Offers</h2>
                <Button onClick={() => handleOpenModal()}>Add Offer</Button>
            </div>
            <div className="space-y-3">
                {myOffers.map(offer => (
                    <div key={offer.id} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-bold">{offer.title} - {offer.discountPercentage}% OFF</p>
                            <p className="text-sm text-gray-400">{offer.description}</p>
                        </div>
                        <Button onClick={() => handleOpenModal(offer)} variant="secondary" className="text-sm">Edit</Button>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentOffer?.id ? 'Edit Offer' : 'Add Offer'}>
                <div className="space-y-4">
                    <Input label="Offer Title" value={currentOffer?.title || ''} onChange={e => setCurrentOffer(p => ({ ...p, title: e.target.value }))} />
                    <Input label="Discount (%)" type="number" value={currentOffer?.discountPercentage || ''} onChange={e => setCurrentOffer(p => ({ ...p, discountPercentage: Number(e.target.value) }))} />
                    <Input label="Description" value={currentOffer?.description || ''} onChange={e => setCurrentOffer(p => ({ ...p, description: e.target.value }))} />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </div>
                </div>
            </Modal>
        </Card>
    );
};

export default ManageOffers;
   
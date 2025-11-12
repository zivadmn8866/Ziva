
import React, { useState } from 'react';
import { User, Offer, Query, PlatformFeeConfig } from '../../types';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import ChangePasswordModal from '../common/ChangePasswordModal';
import { Settings, Tag, HelpCircle } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  users: User[];
  onUpdateUser: (user: User) => void;
  addNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
  offers: Offer[];
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
  platformFeeConfig: PlatformFeeConfig;
  setPlatformFeeConfig: (config: PlatformFeeConfig) => void;
  queries: Query[];
}

type ActiveView = 'settings' | 'offers' | 'queries';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, users, onUpdateUser, addNotification, offers, setOffers, platformFeeConfig, setPlatformFeeConfig, queries }) => {
  const [activeView, setActiveView] = useState<ActiveView>('settings');
  const [feeType, setFeeType] = useState<PlatformFeeConfig['type']>(platformFeeConfig.type);
  const [feeValue, setFeeValue] = useState(platformFeeConfig.value);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleFeeUpdate = () => {
    if (feeType !== 'none' && feeValue < 0) {
      addNotification('Fee value cannot be negative.', 'error');
      return;
    }
    const newConfig = { type: feeType, value: feeType === 'none' ? 0 : Number(feeValue) };
    setPlatformFeeConfig(newConfig);
    addNotification('Platform fee updated successfully!', 'success');
  };
  
  const handleOfferDelete = (offerId: string) => {
      setOffers(prev => prev.filter(o => o.id !== offerId));
      addNotification('Offer removed by admin.', 'success');
  }
  
  const handlePasswordSave = (newPassword: string) => {
    onUpdateUser({ ...user, password: newPassword });
    addNotification('Admin password changed successfully!', 'success');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'settings':
        return (
          <Card>
            <h2 className="text-xl font-bold mb-4 text-pink-400">Platform Settings</h2>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Platform Fee</h3>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center">
                  <input type="radio" id="fee-none" name="feeType" value="none" checked={feeType === 'none'} onChange={() => setFeeType('none')} className="h-4 w-4 text-pink-600 bg-gray-700 border-gray-600 focus:ring-pink-500" />
                  <label htmlFor="fee-none" className="ml-2 block text-sm text-gray-300">None (0% Fee)</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="fee-percentage" name="feeType" value="percentage" checked={feeType === 'percentage'} onChange={() => setFeeType('percentage')} className="h-4 w-4 text-pink-600 bg-gray-700 border-gray-600 focus:ring-pink-500" />
                  <label htmlFor="fee-percentage" className="ml-2 block text-sm text-gray-300">Percentage (%)</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="fee-fixed" name="feeType" value="fixed" checked={feeType === 'fixed'} onChange={() => setFeeType('fixed')} className="h-4 w-4 text-pink-600 bg-gray-700 border-gray-600 focus:ring-pink-500" />
                  <label htmlFor="fee-fixed" className="ml-2 block text-sm text-gray-300">Fixed Amount (₹)</label>
                </div>
              </div>
              
              {feeType !== 'none' && (
                <div className="max-w-xs">
                  <Input 
                    label={`Fee Value ${feeType === 'percentage' ? '(%)' : '(₹ per person)'}`}
                    id="feeValue"
                    type="number" 
                    value={feeValue} 
                    onChange={e => setFeeValue(Number(e.target.value))} 
                    min="0"
                  />
                </div>
              )}
              
              <Button onClick={handleFeeUpdate} className="w-auto">Update Fee</Button>
            </div>
             <div className="mt-8 border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-2">Admin Account</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <button onClick={() => setIsPasswordModalOpen(true)} className="mt-2 text-pink-400 hover:underline">Change Password</button>
            </div>
          </Card>
        );
      case 'offers':
        return (
          <Card>
            <h2 className="text-xl font-bold mb-4 text-pink-400">Manage All Offers</h2>
            <div className="space-y-3">
                {offers.map(offer => (
                    <div key={offer.id} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-bold">{offer.title} - {offer.discountPercentage}% OFF</p>
                            <p className="text-sm text-gray-400">Provider ID: {offer.providerId}</p>
                        </div>
                        <Button onClick={() => handleOfferDelete(offer.id)} variant="danger">Remove</Button>
                    </div>
                ))}
            </div>
          </Card>
        );
      case 'queries':
        return (
          <Card>
            <h2 className="text-xl font-bold mb-4 text-pink-400">User Queries</h2>
            <div className="space-y-3">
                {queries.map(query => {
                    const queryUser = users.find(u => u.id === query.userId);
                    return (
                        <div key={query.id} className="p-4 bg-gray-800 rounded-lg">
                            <p className="font-bold">{query.subject}</p>
                            <p className="text-sm text-gray-400">From: {query.userName} ({queryUser?.mobile}) - {query.createdAt.toLocaleDateString()}</p>
                            <p className="mt-2">{query.message}</p>
                        </div>
                    )
                })}
            </div>
          </Card>
        );
      default:
        return null;
    }
  };
  
  const navItems = [
      { view: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5"/> },
      { view: 'offers', label: 'Offers', icon: <Tag className="w-5 h-5"/> },
      { view: 'queries', label: 'Queries', icon: <HelpCircle className="w-5 h-5"/> },
  ];

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
        <nav className="flex space-x-2 bg-gray-900 p-2 rounded-lg">
            {navItems.map(item => (
                 <button
                    key={item.view}
                    onClick={() => setActiveView(item.view as ActiveView)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeView === item.view ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    {item.icon}
                    {item.label}
                 </button>
            ))}
        </nav>
      </div>
      {renderContent()}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        onSave={handlePasswordSave}
      />
    </div>
  );
};

export default AdminDashboard;
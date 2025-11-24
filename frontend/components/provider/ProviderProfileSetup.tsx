
import React, { useState } from 'react';
import { User } from '../../types';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import ChangePasswordModal from '../common/ChangePasswordModal';

interface ProviderProfileSetupProps {
  user: User;
  onSave: (updatedUser: User) => void;
}

const ProviderProfileSetup: React.FC<ProviderProfileSetupProps> = ({ user, onSave }) => {
  const [shopName, setShopName] = useState(user.shopName || '');
  const [shopAddress, setShopAddress] = useState(user.shopAddress || '');
  const [email, setEmail] = useState(user.email || '');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const isFirstTime = !user.shopName || !user.shopAddress;

  const handleSave = () => {
    const updatedUser = { ...user, shopName, shopAddress, email };
    onSave(updatedUser);
  };
  
  const handlePasswordSave = (newPassword: string) => {
    onSave({ ...user, password: newPassword });
  };

  return (
    <Card className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-pink-400">
        {isFirstTime ? 'Complete Your Profile' : 'Edit Profile'}
      </h2>
      {isFirstTime && <p className="text-gray-400 mb-4">Please enter your shop details to continue.</p>}
      <div className="space-y-4">
        <Input label="Shop Name" id="shopName" value={shopName} onChange={e => setShopName(e.target.value)} required />
        <Input label="Shop Address" id="shopAddress" value={shopAddress} onChange={e => setShopAddress(e.target.value)} required />
        <Input label="Email (Optional)" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <Button onClick={handleSave} className="w-full">Save Profile</Button>
        <button onClick={() => setIsPasswordModalOpen(true)} className="mt-4 text-pink-400 hover:underline w-full text-center">Change Password</button>
      </div>
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        onSave={handlePasswordSave}
      />
    </Card>
  );
};

export default ProviderProfileSetup;

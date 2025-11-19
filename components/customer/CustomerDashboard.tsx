
import React, { useState } from 'react';
import { User, Service, Booking, Query, PlatformFeeConfig, GroupMemberServices, Transaction, Review } from '../../types';
import { MOCK_TRANSACTIONS } from '../../constants';
import LocationDiscovery from './LocationDiscovery';
import BookingSummary from './BookingSummary';
import MyBookings from './MyBookings';
import RaiseQuery from './RaiseQuery';
import PaymentConfirmation from './PaymentConfirmation';
import RazorpayPopup from './RazorpayPopup';
import Wallet from './Wallet';
import LoyaltyRewards from './LoyaltyRewards';
import ChangePasswordModal from '../common/ChangePasswordModal';
import CustomerOnboarding from './CustomerOnboarding';
import { ShoppingCart, Calendar, HelpCircle, User as UserIcon, Wallet as WalletIcon, Crown } from 'lucide-react';
import Card from '../common/Card';

interface CustomerDashboardProps {
  user: User;
  users: User[];
  onUpdateUser: (user: User) => void;
  addNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
  services: Service[];
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  platformFeeConfig: PlatformFeeConfig;
  queries: Query[];
  setQueries: React.Dispatch<React.SetStateAction<Query[]>>;
  reviews: Review[];
  onAddReview: (review: Review) => void;
}

type ActiveView = 'services' | 'bookings' | 'query' | 'profile' | 'wallet' | 'loyalty';

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ 
    user, 
    users, 
    onUpdateUser, 
    addNotification, 
    services, 
    bookings, 
    setBookings, 
    platformFeeConfig, 
    queries, 
    setQueries,
    reviews,
    onAddReview
}) => {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMemberServices[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('services');
  const [isBooking, setIsBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isHomeServiceRequested, setIsHomeServiceRequested] = useState(false);
  // State for wallet
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  
  const [bookingDateTime, setBookingDateTime] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0); // Default to tomorrow at 10:00 AM
    return d;
  });

  if (!user.hasOnboarded) {
    return <CustomerOnboarding user={user} onDone={() => onUpdateUser({ ...user, hasOnboarded: true })} />;
  }

  const handleSelectService = (service: Service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        if (prev.length > 0 && prev[0].providerId !== service.providerId) {
          addNotification('All services in a booking must be from the same provider.', 'error');
          return prev;
        }
        return [...prev, service];
      }
    });
  };

  const handleProceedToPayment = () => {
    if (!bookingDateTime) {
      addNotification('Please select a valid date and time.', 'error');
      return;
    }
    setShowRazorpay(true);
  };
  
  const handleProceedToBook = () => {
    setGroupMembers([{
        name: 'Person 1',
        serviceIds: selectedServices.map(s => s.id),
    }]);
    setIsBooking(true);
  };

  const handleAddMoney = (amount: number) => {
      const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          userId: user.id,
          amount: amount,
          type: 'credit',
          description: 'Wallet Top-up',
          date: new Date()
      };
      setTransactions(prev => [newTx, ...prev]);
      onUpdateUser({ ...user, walletBalance: (user.walletBalance || 0) + amount });
      addNotification(`₹${amount} added to wallet!`, 'success');
  };

  const handleConfirmBooking = (finalGroupMembers: GroupMemberServices[]) => {
    const allServiceIds = finalGroupMembers.flatMap(member => member.serviceIds);
    const servicesForSubtotal = allServiceIds.map(id => services.find(s => s.id === id)).filter((s): s is Service => s !== undefined);

    const subtotal = servicesForSubtotal.reduce((sum, s) => sum + s.price, 0);

    let fee = 0;
    if (platformFeeConfig.type === 'percentage') {
      fee = subtotal * (platformFeeConfig.value / 100);
    } else if (platformFeeConfig.type === 'fixed') {
      fee = platformFeeConfig.value * finalGroupMembers.length;
    }

    const homeServiceFee = isHomeServiceRequested
      ? servicesForSubtotal.reduce((sum, s) => sum + (s.homeServiceFee || 0), 0)
      : 0;
      
    const totalAmount = subtotal + fee + homeServiceFee;
    const uniqueServiceIds = [...new Set(allServiceIds)];

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      serviceIds: uniqueServiceIds,
      customerId: user.id,
      providerId: selectedServices[0]?.providerId,
      dateTime: bookingDateTime,
      totalAmount: totalAmount,
      platformFee: fee,
      status: 'upcoming',
      peopleCount: finalGroupMembers.length,
      rescheduled: false,
      isHomeService: isHomeServiceRequested,
      groupDetails: finalGroupMembers,
    };

    // Deduct from wallet if sufficient (logic for Payment Gateway simulation)
    // For now, we assume Razorpay handles it or wallet is just a visual
    
    // Add loyalty points (10 points = 1 RS spent) and update Tier
    const pointsEarned = Math.floor(totalAmount * 10);
    const newPoints = (user.loyaltyPoints || 0) + pointsEarned;
    let newTier: User['tier'] = user.tier || 'Silver';
    
    if (newPoints > 2000) newTier = 'Platinum';
    else if (newPoints > 500) newTier = 'Gold';

    onUpdateUser({ 
        ...user, 
        loyaltyPoints: newPoints,
        tier: newTier
    });
    
    setBookings(prev => [newBooking, ...prev]);
    addNotification(`Booking confirmed! You earned ${pointsEarned} loyalty points.`, 'success');
    if (newTier !== user.tier) {
        addNotification(`Congratulations! You've been upgraded to ${newTier} Tier!`, 'success');
    }
    
    setShowRazorpay(false);
    setConfirmedBooking(newBooking);
    
    setSelectedServices([]);
    setGroupMembers([]);
    setIsBooking(false);
    setIsHomeServiceRequested(false);
  };
  
  const handlePasswordSave = (newPassword: string) => {
      onUpdateUser({ ...user, password: newPassword });
      addNotification('Password changed successfully!', 'success');
  };

  const handleConfirmationDone = () => {
    setConfirmedBooking(null);
    setActiveView('bookings');
  };
  
  const handlePaymentSuccess = (finalGroupMembers: GroupMemberServices[]) => {
      handleConfirmBooking(finalGroupMembers);
  };

  const renderContent = () => {
    if (confirmedBooking) {
      const provider = users.find(u => u.id === confirmedBooking.providerId);
      return (
        <PaymentConfirmation
          booking={confirmedBooking}
          services={services}
          provider={provider}
          onDone={handleConfirmationDone}
        />
      );
    }

    if (showRazorpay) {
        const allServiceIdsInGroup = groupMembers.flatMap(member => member.serviceIds);
        const servicesForTotal = allServiceIdsInGroup.map(id => services.find(s => s.id === id)).filter((s): s is Service => s !== undefined);
        const subtotal = servicesForTotal.reduce((sum, s) => sum + s.price, 0);

        let fee = 0;
        if (platformFeeConfig.type === 'percentage') {
            fee = subtotal * (platformFeeConfig.value / 100);
        } else if (platformFeeConfig.type === 'fixed') {
            fee = platformFeeConfig.value * groupMembers.length;
        }
        const homeServiceFee = isHomeServiceRequested
            ? servicesForTotal.reduce((sum, s) => sum + (s.homeServiceFee || 0), 0)
            : 0;
        const totalAmount = subtotal + fee + homeServiceFee;

      return (
        <RazorpayPopup
          totalAmount={totalAmount}
          onSuccess={() => handlePaymentSuccess(groupMembers)}
          onClose={() => setShowRazorpay(false)}
        />
      );
    }
    
    if (isBooking) {
      return (
        <BookingSummary
          selectedServices={selectedServices}
          groupMembers={groupMembers}
          setGroupMembers={setGroupMembers}
          bookingDateTime={bookingDateTime}
          setBookingDateTime={setBookingDateTime}
          platformFeeConfig={platformFeeConfig}
          onProceedToPayment={handleProceedToPayment}
          onBack={() => setIsBooking(false)}
          isHomeServiceRequested={isHomeServiceRequested}
          setIsHomeServiceRequested={setIsHomeServiceRequested}
        />
      );
    }

    switch (activeView) {
      case 'services':
        return <LocationDiscovery
          services={services}
          users={users}
          selectedServices={selectedServices}
          onSelectService={handleSelectService}
          addNotification={addNotification}
        />;
      case 'bookings':
        return <MyBookings 
            customerId={user.id} 
            bookings={bookings} 
            setBookings={setBookings} 
            services={services} 
            addNotification={addNotification}
            onAddReview={onAddReview}
        />;
      case 'wallet':
          return <Wallet user={user} transactions={transactions} onAddMoney={handleAddMoney} />;
      case 'loyalty':
          return <LoyaltyRewards user={user} />;
      case 'query':
        return <RaiseQuery user={user} queries={queries} setQueries={setQueries} addNotification={addNotification} />;
      case 'profile':
        return <Card>
          <h2 className="text-xl font-bold mb-4 text-pink-400">Profile</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Mobile:</strong> {user.mobile}</p>
            <p><strong>Wallet Balance:</strong> ₹{user.walletBalance?.toFixed(2) || '0.00'}</p>
            <p><strong>Loyalty Tier:</strong> {user.tier || 'Silver'}</p>
          </div>
          <button onClick={() => setIsPasswordModalOpen(true)} className="mt-4 text-pink-400 hover:underline">Change Password</button>
        </Card>;
      default:
        return null;
    }
  };
  
  const navItems: { view: ActiveView, label: string, icon: React.ReactNode }[] = [
      { view: 'services', label: 'Services', icon: <ShoppingCart className="w-5 h-5" /> },
      { view: 'bookings', label: 'My Bookings', icon: <Calendar className="w-5 h-5" /> },
      { view: 'wallet', label: 'Wallet', icon: <WalletIcon className="w-5 h-5" /> },
      { view: 'loyalty', label: 'Rewards', icon: <Crown className="w-5 h-5" /> },
      { view: 'query', label: 'Support', icon: <HelpCircle className="w-5 h-5" /> },
      { view: 'profile', label: 'Profile', icon: <UserIcon className="w-5 h-5" /> },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6 overflow-x-auto pb-2">
        <nav className="flex space-x-2 bg-gray-900 p-2 rounded-lg">
            {navItems.map(item => (
                 <button
                    key={item.view}
                    onClick={() => { setActiveView(item.view); setIsBooking(false); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeView === item.view ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    {item.icon}
                    {item.label}
                 </button>
            ))}
        </nav>
        {!isBooking && activeView === 'services' && selectedServices.length > 0 && (
          <button
            onClick={handleProceedToBook}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ml-4 whitespace-nowrap"
          >
            <ShoppingCart className="w-5 h-5" />
            Book Now ({selectedServices.length})
          </button>
        )}
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

export default CustomerDashboard;

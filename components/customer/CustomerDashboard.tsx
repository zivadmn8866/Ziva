import React, { useState } from 'react';
import { User, Service, Booking, Query, PlatformFeeConfig } from '../../types';
import LocationDiscovery from './LocationDiscovery';
import BookingSummary from './BookingSummary';
import MyBookings from './MyBookings';
import RaiseQuery from './RaiseQuery';
import PaymentConfirmation from './PaymentConfirmation';
import RazorpayPopup from './RazorpayPopup';
import ChangePasswordModal from '../common/ChangePasswordModal';
import CustomerOnboarding from './CustomerOnboarding'; // Import the new component
import { ShoppingCart, Calendar, HelpCircle, User as UserIcon } from 'lucide-react';
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
}

type ActiveView = 'services' | 'bookings' | 'query' | 'profile';

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, users, onUpdateUser, addNotification, services, bookings, setBookings, platformFeeConfig, queries, setQueries }) => {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [peopleCount, setPeopleCount] = useState(1);
  const [activeView, setActiveView] = useState<ActiveView>('services');
  const [isBooking, setIsBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isHomeServiceRequested, setIsHomeServiceRequested] = useState(false);
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

  const handleConfirmBooking = () => {
    const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0) * peopleCount;
    
    let fee = 0;
    if (platformFeeConfig.type === 'percentage') {
      fee = subtotal * (platformFeeConfig.value / 100);
    } else if (platformFeeConfig.type === 'fixed') {
      fee = platformFeeConfig.value * peopleCount;
    }

    const homeServiceFee = isHomeServiceRequested
      ? selectedServices.reduce((sum, s) => sum + (s.homeServiceFee || 0), 0) * peopleCount
      : 0;

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      serviceIds: selectedServices.map(s => s.id),
      customerId: user.id,
      providerId: selectedServices[0]?.providerId,
      dateTime: bookingDateTime,
      totalAmount: subtotal + fee + homeServiceFee,
      platformFee: fee,
      status: 'upcoming',
      peopleCount,
      rescheduled: false,
      isHomeService: isHomeServiceRequested,
    };
    
    setBookings(prev => [newBooking, ...prev]);
    addNotification('Booking confirmed successfully!', 'success');
    
    setShowRazorpay(false);
    setConfirmedBooking(newBooking);
    
    setSelectedServices([]);
    setPeopleCount(1);
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
      const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0) * peopleCount;
      let fee = 0;
      if (platformFeeConfig.type === 'percentage') {
        fee = subtotal * (platformFeeConfig.value / 100);
      } else if (platformFeeConfig.type === 'fixed') {
        fee = platformFeeConfig.value * peopleCount;
      }
      const homeServiceFee = isHomeServiceRequested
        ? selectedServices.reduce((sum, s) => sum + (s.homeServiceFee || 0), 0) * peopleCount
        : 0;

      const totalAmount = subtotal + fee + homeServiceFee;

      return (
        <RazorpayPopup
          totalAmount={totalAmount}
          onSuccess={handleConfirmBooking}
          onClose={() => setShowRazorpay(false)}
        />
      );
    }
    
    if (isBooking) {
      return (
        <BookingSummary
          selectedServices={selectedServices}
          peopleCount={peopleCount}
          setPeopleCount={setPeopleCount}
          bookingDateTime={bookingDateTime}
          setBookingDateTime={setBookingDateTime}
          platformFeeConfig={platformFeeConfig}
          onConfirm={handleProceedToPayment}
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
        return <MyBookings customerId={user.id} bookings={bookings} setBookings={setBookings} services={services} addNotification={addNotification} />;
      case 'query':
        return <RaiseQuery user={user} queries={queries} setQueries={setQueries} addNotification={addNotification} />;
      case 'profile':
        return <Card>
          <h2 className="text-xl font-bold mb-4 text-pink-400">Profile</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Mobile:</strong> {user.mobile}</p>
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
      { view: 'query', label: 'Raise Query', icon: <HelpCircle className="w-5 h-5" /> },
      { view: 'profile', label: 'Profile', icon: <UserIcon className="w-5 h-5" /> },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <nav className="flex space-x-2 bg-gray-900 p-2 rounded-lg">
            {navItems.map(item => (
                 <button
                    key={item.view}
                    onClick={() => { setActiveView(item.view); setIsBooking(false); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeView === item.view ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    {item.icon}
                    {item.label}
                 </button>
            ))}
        </nav>
        {!isBooking && activeView === 'services' && selectedServices.length > 0 && (
          <button
            onClick={() => setIsBooking(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
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
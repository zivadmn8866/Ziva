
import React, { useState } from 'react';
import { User, Service, Offer, Booking, Query } from '../../types';
import ManageServices from './ManageServices';
import ManageOffers from './ManageOffers';
import ProviderProfileSetup from './ProviderProfileSetup';
import RaiseQuery from '../customer/RaiseQuery'; // Reusable component
import Card from '../common/Card';
import Button from '../common/Button';
import RescheduleModal from '../common/RescheduleModal';
import { Briefcase, Tag, Calendar, HelpCircle, User as UserIcon } from 'lucide-react';


interface ProviderDashboardProps {
  user: User;
  users: User[];
  onUpdateUser: (user: User) => void;
  addNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  offers: Offer[];
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  queries: Query[];
  setQueries: React.Dispatch<React.SetStateAction<Query[]>>;
}

type ActiveView = 'dashboard' | 'services' | 'offers' | 'bookings' | 'query' | 'profile';

const ProviderDashboard: React.FC<ProviderDashboardProps> = (props) => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);

  const providerBookings = props.bookings.filter(b => b.providerId === props.user.id);
  
  if (!props.user.shopName || !props.user.shopAddress) {
    return <ProviderProfileSetup user={props.user} onSave={props.onUpdateUser} />;
  }
  
  const canReschedule = (bookingDate: Date) => {
    const now = new Date();
    const twoHoursBefore = new Date(bookingDate.getTime() - 2 * 60 * 60 * 1000);
    return now < twoHoursBefore;
  };
  
  const handleConfirmReschedule = (newDateTime: Date) => {
    if (!rescheduleBooking) return;
    
    props.setBookings(prev => prev.map(b => b.id === rescheduleBooking.id ? { ...b, dateTime: newDateTime, rescheduled: true } : b));
    props.addNotification('Booking rescheduled successfully!', 'success');
    setRescheduleBooking(null);
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Card>
            <h2 className="text-xl font-bold mb-4 text-pink-400">Dashboard</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-400">Upcoming Bookings</p>
                    <p className="text-2xl font-bold">{providerBookings.filter(b => b.status === 'upcoming').length}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-400">Total Services</p>
                    <p className="text-2xl font-bold">{props.services.filter(s => s.providerId === props.user.id).length}</p>
                </div>
            </div>
        </Card>;
      case 'services':
        return <ManageServices providerId={props.user.id} services={props.services} setServices={props.setServices} addNotification={props.addNotification} />;
      case 'offers':
        return <ManageOffers providerId={props.user.id} offers={props.offers} setOffers={props.setOffers} addNotification={props.addNotification} />;
      case 'bookings':
        return (
            <Card>
                <h2 className="text-xl font-bold mb-4 text-pink-400">All Bookings</h2>
                 {providerBookings.map(booking => {
                    const customer = props.users.find(u => u.id === booking.customerId);
                    return (
                        <div key={booking.id} className="p-4 bg-gray-800 rounded-lg mb-2">
                            <p><strong>Customer:</strong> {customer?.name || 'N/A'}</p>
                            <p><strong>Date:</strong> {booking.dateTime.toLocaleString()}</p>
                            <p><strong>Status:</strong> {booking.status}</p>
                            <p><strong>Amount:</strong> ₹{booking.totalAmount}</p>
                            {booking.rescheduled && <p className="text-sm text-yellow-400 mt-2">This booking has been rescheduled.</p>}
                            {booking.status === 'upcoming' && !booking.rescheduled && canReschedule(booking.dateTime) && (
                               <Button onClick={() => setRescheduleBooking(booking)} className="mt-2 text-sm">Reschedule</Button>
                            )}
                        </div>
                    );
                 })}
            </Card>
        );
      case 'query':
          return <RaiseQuery user={props.user} queries={props.queries} setQueries={props.setQueries} addNotification={props.addNotification}/>
      case 'profile':
          return <ProviderProfileSetup user={props.user} onSave={props.onUpdateUser} />;
      default:
        return null;
    }
  };

  const navItems = [
      { view: 'dashboard', label: 'Dashboard', icon: <Briefcase className="w-5 h-5"/> },
      { view: 'services', label: 'My Services', icon: <Briefcase className="w-5 h-5"/> },
      { view: 'offers', label: 'Offers', icon: <Tag className="w-5 h-5"/> },
      { view: 'bookings', label: 'Bookings', icon: <Calendar className="w-5 h-5"/> },
      { view: 'query', label: 'Support', icon: <HelpCircle className="w-5 h-5"/> },
      { view: 'profile', label: 'Profile', icon: <UserIcon className="w-5 h-5"/> },
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
      {rescheduleBooking && (
        <RescheduleModal 
            isOpen={!!rescheduleBooking}
            onClose={() => setRescheduleBooking(null)}
            onReschedule={handleConfirmReschedule}
            booking={rescheduleBooking}
        />
      )}
    </div>
  );
};

export default ProviderDashboard;
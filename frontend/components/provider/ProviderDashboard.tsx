
import React, { useState } from 'react';
import { User, Service, Offer, Booking, Query, Review } from '../../types';
import ManageServices from './ManageServices';
import ManageOffers from './ManageOffers';
import ProviderProfileSetup from './ProviderProfileSetup';
import ProviderAnalytics from './ProviderAnalytics';
import ProviderCRM from './ProviderCRM';
import RaiseQuery from '../customer/RaiseQuery';
import Card from '../common/Card';
import Button from '../common/Button';
import RescheduleModal from '../common/RescheduleModal';
import { Briefcase, Tag, Calendar, HelpCircle, User as UserIcon, BarChart2, Users, AlertTriangle } from 'lucide-react';


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
  reviews: Review[];
}

type ActiveView = 'dashboard' | 'services' | 'offers' | 'bookings' | 'crm' | 'analytics' | 'query' | 'profile';

const ProviderDashboard: React.FC<ProviderDashboardProps> = (props) => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);

  const providerBookings = props.bookings.filter(b => b.providerId === props.user.id);
  
  if (!props.user.shopName || !props.user.shopAddress) {
    return <ProviderProfileSetup user={props.user} onSave={props.onUpdateUser} />;
  }

  if (props.user.isVerified === false) { 
     return (
         <div className="h-screen flex items-center justify-center">
             <Card className="text-center max-w-md">
                 <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                 <h2 className="text-2xl font-bold mb-2">Verification Pending</h2>
                 <p className="text-gray-400">Your account is currently under review by the admin. You will be able to access the dashboard once verified.</p>
                 <p className="text-sm text-gray-500 mt-4">Admin Demo Login: zivadmn@gmail.com</p>
             </Card>
         </div>
     );
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
        return (
            <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-gray-400">Upcoming Bookings</p>
                        <p className="text-2xl font-bold">{providerBookings.filter(b => b.status === 'upcoming').length}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-gray-400">Total Services</p>
                        <p className="text-2xl font-bold">{props.services.filter(s => s.providerId === props.user.id).length}</p>
                    </div>
                </div>
                <ProviderAnalytics providerId={props.user.id} bookings={props.bookings} reviews={props.reviews} />
            </>
        );
      case 'services':
        return <ManageServices providerId={props.user.id} services={props.services} setServices={props.setServices} addNotification={props.addNotification} />;
      case 'offers':
        return <ManageOffers providerId={props.user.id} offers={props.offers} setOffers={props.setOffers} addNotification={props.addNotification} />;
      case 'bookings':
        return (
            <Card>
                <h2 className="text-xl font-bold mb-4 text-pink-400">All Bookings</h2>
                 {providerBookings.sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime()).map(booking => {
                    const customer = props.users.find(u => u.id === booking.customerId);
                    return (
                        <div key={booking.id} className="p-4 bg-gray-800 rounded-lg mb-2">
                            <div className="flex justify-between">
                                <div>
                                    <p><strong>Customer:</strong> {customer?.name || 'N/A'}</p>
                                    <p className="text-sm text-gray-400">{booking.dateTime.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p>₹{booking.totalAmount.toFixed(2)}</p>
                                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${booking.status === 'upcoming' ? 'bg-blue-900 text-blue-200' : 'bg-green-900 text-green-200'}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                            {booking.rescheduled && <p className="text-sm text-yellow-400 mt-2">This booking has been rescheduled.</p>}
                            {booking.status === 'upcoming' && !booking.rescheduled && canReschedule(booking.dateTime) && (
                               <Button onClick={() => setRescheduleBooking(booking)} className="mt-2 text-sm">Reschedule</Button>
                            )}
                        </div>
                    );
                 })}
            </Card>
        );
      case 'crm':
          return <ProviderCRM providerId={props.user.id} bookings={props.bookings} users={props.users} />;
      case 'analytics':
          return <ProviderAnalytics providerId={props.user.id} bookings={props.bookings} reviews={props.reviews} />;
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
      { view: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5"/> },
      { view: 'crm', label: 'My Customers', icon: <Users className="w-5 h-5"/> },
      { view: 'services', label: 'Services', icon: <Briefcase className="w-5 h-5"/> },
      { view: 'offers', label: 'Offers', icon: <Tag className="w-5 h-5"/> },
      { view: 'bookings', label: 'Bookings', icon: <Calendar className="w-5 h-5"/> },
      { view: 'query', label: 'Support', icon: <HelpCircle className="w-5 h-5"/> },
      { view: 'profile', label: 'Profile', icon: <UserIcon className="w-5 h-5"/> },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6 overflow-x-auto pb-2">
        <nav className="flex space-x-2 bg-gray-900 p-2 rounded-lg">
            {navItems.map(item => (
                 <button
                    key={item.view}
                    onClick={() => setActiveView(item.view as ActiveView)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeView === item.view ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
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

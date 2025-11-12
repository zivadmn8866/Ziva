
import React, { useState } from 'react';
import { Booking, Service } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import RescheduleModal from '../common/RescheduleModal';

interface MyBookingsProps {
  customerId: string;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  services: Service[];
  addNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const MyBookings: React.FC<MyBookingsProps> = ({ customerId, bookings, setBookings, services, addNotification }) => {
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  
  const myBookings = bookings.filter(b => b.customerId === customerId).sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime());

  const canReschedule = (bookingDate: Date) => {
    const now = new Date();
    const twoHoursBefore = new Date(bookingDate.getTime() - 2 * 60 * 60 * 1000);
    return now < twoHoursBefore;
  };

  const handleRescheduleClick = (booking: Booking) => {
    setRescheduleBooking(booking);
  };
  
  const handleConfirmReschedule = (newDateTime: Date) => {
    if (!rescheduleBooking) return;
    
    setBookings(prev => prev.map(b => b.id === rescheduleBooking.id ? { ...b, dateTime: newDateTime, rescheduled: true } : b));
    addNotification('Booking rescheduled successfully!', 'success');
    setRescheduleBooking(null);
  }

  const getServiceNames = (serviceIds: string[]) => {
    return serviceIds.map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(', ');
  };
  
  const upcomingBookings = myBookings.filter(b => b.status === 'upcoming');
  const pastBookings = myBookings.filter(b => b.status !== 'upcoming');

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 text-pink-400">My Bookings</h2>
      
      <h3 className="text-lg font-semibold mb-2 border-b border-gray-700 pb-1">Upcoming</h3>
      {upcomingBookings.length > 0 ? (
        <div className="space-y-4">
          {upcomingBookings.map(booking => (
            <div key={booking.id} className="p-4 bg-gray-800 rounded-lg">
              <div className="flex justify-between items-start">
                  <div>
                    <p><strong>Services:</strong> {getServiceNames(booking.serviceIds)}</p>
                    <p><strong>Date:</strong> {booking.dateTime.toLocaleString()}</p>
                    <p><strong>Total:</strong> ₹{booking.totalAmount.toFixed(2)}</p>
                    <p><strong>For:</strong> {booking.peopleCount} {booking.peopleCount > 1 ? 'people' : 'person'}</p>
                  </div>
                  {booking.isHomeService && (
                      <span className="text-xs font-medium bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full flex-shrink-0">🏠 Home Service</span>
                  )}
              </div>
              {booking.rescheduled && <p className="text-sm text-yellow-400 mt-2">This booking has been rescheduled.</p>}
              {canReschedule(booking.dateTime) && !booking.rescheduled && (
                <Button onClick={() => handleRescheduleClick(booking)} className="mt-2 text-sm">Reschedule</Button>
              )}
            </div>
          ))}
        </div>
      ) : <p className="text-gray-400">No upcoming bookings.</p>}

      <h3 className="text-lg font-semibold my-4 border-b border-gray-700 pb-1">Past</h3>
        {pastBookings.length > 0 ? (
            <div className="space-y-4">
                {pastBookings.map(booking => (
                    <div key={booking.id} className="p-4 bg-gray-800 rounded-lg opacity-70">
                        <div className="flex justify-between items-start">
                            <div>
                                <p><strong>Services:</strong> {getServiceNames(booking.serviceIds)}</p>
                                <p><strong>Date:</strong> {booking.dateTime.toLocaleString()}</p>
                                <p><strong>Status:</strong> <span className="capitalize">{booking.status}</span></p>
                            </div>
                            {booking.isHomeService && (
                                <span className="text-xs font-medium bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full flex-shrink-0">🏠 Home Service</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        ) : <p className="text-gray-400">No past bookings.</p>}
        
        {rescheduleBooking && (
          <RescheduleModal 
            isOpen={!!rescheduleBooking}
            onClose={() => setRescheduleBooking(null)}
            onReschedule={handleConfirmReschedule}
            booking={rescheduleBooking}
          />
        )}
    </Card>
  );
};

export default MyBookings;
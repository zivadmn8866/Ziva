
import React, { useState } from 'react';
import { Booking, Service, Review } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import RescheduleModal from '../common/RescheduleModal';
import Modal from '../common/Modal';
import { Star } from 'lucide-react';

interface MyBookingsProps {
  customerId: string;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  services: Service[];
  addNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
  onAddReview: (review: Review) => void;
}

const MyBookings: React.FC<MyBookingsProps> = ({ customerId, bookings, setBookings, services, addNotification, onAddReview }) => {
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
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

  const handleSubmitReview = () => {
      if (!reviewBookingId) return;
      
      const booking = bookings.find(b => b.id === reviewBookingId);
      if (!booking) return;

      const newReview: Review = {
          id: `rev-${Date.now()}`,
          bookingId: booking.id,
          providerId: booking.providerId,
          customerId: customerId,
          rating,
          comment,
          date: new Date()
      };

      onAddReview(newReview);
      addNotification('Thank you for your feedback!', 'success');
      setReviewBookingId(null);
      setComment('');
      setRating(5);
  };

  const getServiceNames = (serviceIds: string[]) => {
    return serviceIds.map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(', ');
  };
  
  const renderBookingDetails = (booking: Booking) => (
      <div>
        {booking.groupDetails && booking.groupDetails.length > 1 ? (
          <>
            <p><strong>Group Booking:</strong> {booking.peopleCount} people</p>
            <ul className="list-disc list-inside text-sm text-gray-400 mt-1">
              {booking.groupDetails.map((member, index) => (
                <li key={index}><strong>{member.name}:</strong> {getServiceNames(member.serviceIds)}</li>
              ))}
            </ul>
          </>
        ) : (
          <p><strong>Services:</strong> {getServiceNames(booking.serviceIds)}</p>
        )}
        <p className="mt-1"><strong>Date:</strong> {booking.dateTime.toLocaleString()}</p>
        <p><strong>Total:</strong> ₹{booking.totalAmount.toFixed(2)}</p>
      </div>
  );

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
                  {renderBookingDetails(booking)}
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
                    <div key={booking.id} className="p-4 bg-gray-800 rounded-lg opacity-70 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-start">
                            {renderBookingDetails(booking)}
                            <div className="text-right">
                                <p><strong>Status:</strong> <span className="capitalize">{booking.status}</span></p>
                                {booking.isHomeService && (
                                    <span className="text-xs mt-1 inline-block font-medium bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full flex-shrink-0">🏠 Home Service</span>
                                )}
                           </div>
                        </div>
                        {booking.status === 'completed' && !booking.reviewId && (
                            <Button 
                                variant="secondary" 
                                className="mt-3 w-full text-sm"
                                onClick={() => setReviewBookingId(booking.id)}
                            >
                                Rate & Review
                            </Button>
                        )}
                         {booking.status === 'completed' && booking.reviewId && (
                            <p className="text-sm text-green-400 mt-2 text-center">✓ Reviewed</p>
                        )}
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

        {/* Review Modal */}
        <Modal 
            isOpen={!!reviewBookingId} 
            onClose={() => setReviewBookingId(null)} 
            title="Rate your Experience"
        >
            <div className="space-y-4">
                <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                            key={star} 
                            onClick={() => setRating(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <Star className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                        </button>
                    ))}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Comments</label>
                    <textarea 
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Tell us what you liked..."
                    />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setReviewBookingId(null)}>Cancel</Button>
                    <Button onClick={handleSubmitReview}>Submit Review</Button>
                </div>
            </div>
        </Modal>
    </Card>
  );
};

export default MyBookings;

import React from 'react';
import { Booking, Service, User } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { CheckCircle } from 'lucide-react';

interface PaymentConfirmationProps {
  booking: Booking;
  services: Service[];
  provider: User | undefined;
  onDone: () => void;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({ booking, services, provider, onDone }) => {
  
  const getServiceNames = (serviceIds: string[]) => {
    return serviceIds.map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(', ');
  };
  
  const homeServiceFee = booking.isHomeService 
    ? booking.serviceIds.reduce((sum, id) => {
        const service = services.find(s => s.id === id);
        return sum + (service?.homeServiceFee || 0);
      }, 0) 
    : 0;
    
  const subtotal = booking.totalAmount - booking.platformFee - homeServiceFee;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-40 p-4">
      <Card className="max-w-md w-full text-center animate-fade-in-up">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-green-400">Booking Confirmed!</h2>
        <p className="text-gray-400 mb-6">Your payment was successful and your appointment is booked.</p>
        
        <div className="text-left bg-gray-800 p-4 rounded-lg space-y-2 border border-gray-700">
           <div className="flex justify-between">
            <span className="text-gray-400">Booking ID:</span>
            <span className="font-mono text-sm">{booking.id}</span>
          </div>
           <div className="flex justify-between">
            <span className="text-gray-400">Provider:</span>
            <strong>{provider?.shopName || 'N/A'}</strong>
          </div>
          {booking.groupDetails && booking.groupDetails.length > 0 ? (
             <div className="pt-1">
                <span className="text-gray-400">Group Booking ({booking.peopleCount} people):</span>
                {booking.groupDetails.map((member, index) => (
                  <div key={index} className="pl-4 text-sm mt-1">
                    <strong>{member.name}:</strong>
                    <span className="text-gray-300 ml-2">{getServiceNames(member.serviceIds)}</span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex justify-between">
                <span className="text-gray-400">Services:</span>
                <strong className="text-right">{getServiceNames(booking.serviceIds)}</strong>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">Appointment:</span>
            <strong>{booking.dateTime.toLocaleString()}</strong>
          </div>
          {booking.isHomeService && (
             <div className="flex justify-between text-blue-300">
                <span className="text-gray-400">Service Type:</span>
                <strong>🏠 Home Service</strong>
             </div>
          )}
        </div>
        
        <div className="text-left bg-gray-800 p-4 rounded-lg space-y-2 border border-gray-700 mt-4">
            <div className="flex justify-between">
                <span className="text-gray-400">Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {homeServiceFee > 0 && (
                <div className="flex justify-between">
                    <span className="text-gray-400">Home Service Fee:</span>
                    <span>₹{homeServiceFee.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between">
                <span className="text-gray-400">Platform Fee:</span>
                <span>₹{booking.platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-600 pt-2 mt-2">
                <span>Total Paid:</span>
                <span className="text-pink-400">₹{booking.totalAmount.toFixed(2)}</span>
            </div>
        </div>

        <Button onClick={onDone} className="w-full mt-8">
          View My Bookings
        </Button>
      </Card>
    </div>
  );
};

export default PaymentConfirmation;

import React from 'react';
import { Service, PlatformFeeConfig } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import { AlertTriangle, Users, Calendar, Home } from 'lucide-react';

interface BookingSummaryProps {
  selectedServices: Service[];
  peopleCount: number;
  setPeopleCount: (count: number) => void;
  bookingDateTime: Date;
  setBookingDateTime: (date: Date) => void;
  platformFeeConfig: PlatformFeeConfig;
  onConfirm: () => void;
  onBack: () => void;
  isHomeServiceRequested: boolean;
  setIsHomeServiceRequested: (isRequested: boolean) => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  selectedServices,
  peopleCount,
  setPeopleCount,
  bookingDateTime,
  setBookingDateTime,
  platformFeeConfig,
  onConfirm,
  onBack,
  isHomeServiceRequested,
  setIsHomeServiceRequested,
}) => {
  const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0) * peopleCount;
  
  let fee = 0;
  let feeLabel = 'Platform Fee';
  if (platformFeeConfig.type === 'percentage') {
    fee = subtotal * (platformFeeConfig.value / 100);
    feeLabel = `Platform Fee (${platformFeeConfig.value}%)`;
  } else if (platformFeeConfig.type === 'fixed') {
    fee = platformFeeConfig.value * peopleCount;
    feeLabel = `Platform Fee (₹${platformFeeConfig.value} x ${peopleCount})`;
  }
  
  const allServicesSupportHomeService = selectedServices.length > 0 && selectedServices.every(s => s.isHomeService);

  const homeServiceFee = (isHomeServiceRequested && allServicesSupportHomeService)
    ? selectedServices.reduce((sum, s) => sum + (s.homeServiceFee || 0), 0) * peopleCount
    : 0;

  const total = subtotal + fee + homeServiceFee;

  const formatDateTimeLocal = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
        setBookingDateTime(new Date(e.target.value));
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-pink-400 text-center">Booking Summary</h2>
      
      <div className="space-y-3 mb-4">
        {selectedServices.map(service => (
          <div key={service.id} className="flex justify-between items-center text-gray-300">
            <span>{service.name} (x{peopleCount})</span>
            <span className="font-semibold">₹{service.price * peopleCount}</span>
          </div>
        ))}
      </div>

      <div className="space-y-6 my-6">
        <div className="flex items-center gap-4">
          <label htmlFor="peopleCount" className="font-medium flex items-center gap-2"><Users className="w-5 h-5"/> For how many people?</label>
          <input 
              type="number"
              id="peopleCount"
              value={peopleCount}
              onChange={e => setPeopleCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              min="1"
              className="w-20 bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <div className="flex items-center gap-4">
            <label htmlFor="bookingDateTime" className="font-medium flex items-center gap-2"><Calendar className="w-5 h-5"/> Select Date & Time</label>
            <input
                type="datetime-local"
                id="bookingDateTime"
                value={formatDateTimeLocal(bookingDateTime)}
                onChange={handleDateChange}
                min={formatDateTimeLocal(new Date())}
                className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
        </div>
         {allServicesSupportHomeService && (
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <label htmlFor="homeService" className="font-medium flex items-center gap-2"><Home className="w-5 h-5 text-blue-400"/> Request Home Service?</label>
                <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="homeService" className="sr-only peer" checked={isHomeServiceRequested} onChange={(e) => setIsHomeServiceRequested(e.target.checked)}/>
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-pink-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </div>
            </div>
        )}
      </div>

      <div className="border-t border-gray-700 pt-4 mt-4 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>{feeLabel}</span>
          <span>₹{fee.toFixed(2)}</span>
        </div>
        {homeServiceFee > 0 && (
           <div className="flex justify-between text-blue-300">
             <span>Home Service Fee</span>
             <span>+ ₹{homeServiceFee.toFixed(2)}</span>
           </div>
        )}
        <div className="flex justify-between text-xl font-bold text-pink-400">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-300 text-sm flex items-center gap-2">
        <AlertTriangle className="w-5 h-5"/>
        <span>Payment for cancelled bookings is non-refundable.</span>
      </div>

      <div className="mt-8 flex gap-4">
        <Button variant="secondary" onClick={onBack} className="w-full">Back</Button>
        <Button onClick={onConfirm} className="w-full">Proceed to Payment</Button>
      </div>
    </Card>
  );
};

export default BookingSummary;
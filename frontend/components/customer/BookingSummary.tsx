import React from 'react';
import { Service, PlatformFeeConfig, GroupMemberServices } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import { AlertTriangle, Calendar, Home, Trash2, PlusCircle } from 'lucide-react';

interface BookingSummaryProps {
  selectedServices: Service[];
  groupMembers: GroupMemberServices[];
  setGroupMembers: (members: GroupMemberServices[]) => void;
  bookingDateTime: Date;
  setBookingDateTime: (date: Date) => void;
  platformFeeConfig: PlatformFeeConfig;
  onProceedToPayment: () => void;
  onBack: () => void;
  isHomeServiceRequested: boolean;
  setIsHomeServiceRequested: (isRequested: boolean) => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  selectedServices,
  groupMembers,
  setGroupMembers,
  bookingDateTime,
  setBookingDateTime,
  platformFeeConfig,
  onProceedToPayment,
  onBack,
  isHomeServiceRequested,
  setIsHomeServiceRequested,
}) => {
  const allServiceIdsInGroup = groupMembers.flatMap(member => member.serviceIds);
  const servicesForSubtotal = allServiceIdsInGroup.map(id => selectedServices.find(s => s.id === id)).filter((s): s is Service => s !== undefined);
    
  const subtotal = servicesForSubtotal.reduce((sum, s) => sum + s.price, 0);
  
  let fee = 0;
  let feeLabel = 'Platform Fee';
  if (platformFeeConfig.type === 'percentage') {
    fee = subtotal * (platformFeeConfig.value / 100);
    feeLabel = `Platform Fee (${platformFeeConfig.value}%)`;
  } else if (platformFeeConfig.type === 'fixed') {
    fee = platformFeeConfig.value * groupMembers.length;
    feeLabel = `Platform Fee (₹${platformFeeConfig.value} x ${groupMembers.length})`;
  }
  
  const allServicesSupportHomeService = selectedServices.length > 0 && selectedServices.every(s => s.isHomeService);

  const homeServiceFee = (isHomeServiceRequested && allServicesSupportHomeService)
    ? servicesForSubtotal.reduce((sum, s) => sum + (s.homeServiceFee || 0), 0)
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
  
  const handleAddPerson = () => {
    setGroupMembers([
        ...groupMembers,
        { name: `Person ${groupMembers.length + 1}`, serviceIds: [] }
    ]);
  };

  const handleRemovePerson = (index: number) => {
    const updatedMembers = groupMembers.filter((_, i) => i !== index).map((member, i) => ({ ...member, name: `Person ${i + 1}` }));
    setGroupMembers(updatedMembers);
  };

  const handleMemberServiceChange = (memberIndex: number, serviceId: string) => {
    const updatedMembers = [...groupMembers];
    const member = updatedMembers[memberIndex];
    const serviceIndex = member.serviceIds.indexOf(serviceId);

    if (serviceIndex > -1) {
        member.serviceIds.splice(serviceIndex, 1);
    } else {
        member.serviceIds.push(serviceId);
    }
    setGroupMembers(updatedMembers);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-pink-400 text-center">Booking Summary</h2>
      
        <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-300">Group Details ({groupMembers.length} People)</h3>
            {groupMembers.map((member, memberIndex) => (
                <div key={memberIndex} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                        <p className="font-bold">{member.name}</p>
                        {groupMembers.length > 1 && (
                            <button onClick={() => handleRemovePerson(memberIndex)} className="text-red-400 hover:text-red-300">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Select services for this person:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {selectedServices.map(service => (
                            <label key={service.id} className={`flex items-center gap-2 p-2 rounded-md cursor-pointer text-sm transition-colors ${member.serviceIds.includes(service.id) ? 'bg-pink-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                <input 
                                    type="checkbox"
                                    checked={member.serviceIds.includes(service.id)}
                                    onChange={() => handleMemberServiceChange(memberIndex, service.id)}
                                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-pink-500 focus:ring-pink-600 shrink-0"
                                />
                                <span>{service.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
            <Button onClick={handleAddPerson} variant="secondary" className="w-full flex items-center justify-center gap-2">
                <PlusCircle className="w-5 h-5" /> Add Another Person
            </Button>
        </div>


      <div className="space-y-6 my-6">
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
      
       {groupMembers.some(m => m.serviceIds.length === 0) && (
          <p className="text-red-400 text-sm text-center mt-4">
              Each person in the group must have at least one service selected.
          </p>
      )}

      <div className="mt-6 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-300 text-sm flex items-center gap-2">
        <AlertTriangle className="w-5 h-5"/>
        <span>Payment for cancelled bookings is non-refundable.</span>
      </div>

      <div className="mt-8 flex gap-4">
        <Button variant="secondary" onClick={onBack} className="w-full">Back</Button>
        <Button 
            onClick={onProceedToPayment} 
            className="w-full"
            disabled={groupMembers.some(m => m.serviceIds.length === 0)}
        >
            Proceed to Payment
        </Button>
      </div>
    </Card>
  );
};

export default BookingSummary;


import React from 'react';
import { User, Booking } from '../../types';
import Card from '../common/Card';
import { Phone, Calendar, User as UserIcon } from 'lucide-react';

interface ProviderCRMProps {
  providerId: string;
  bookings: Booking[];
  users: User[];
}

const ProviderCRM: React.FC<ProviderCRMProps> = ({ providerId, bookings, users }) => {
  // Extract unique customers who have booked with this provider
  const myCustomerIds = Array.from(new Set(bookings.filter(b => b.providerId === providerId).map(b => b.customerId)));
  
  const customers = users.filter(u => myCustomerIds.includes(u.id));

  return (
    <div className="animate-fade-in-up">
        <Card>
            <h2 className="text-xl font-bold mb-6 text-pink-400 flex items-center gap-2">
                <UserIcon className="w-6 h-6"/> My Customers ({customers.length})
            </h2>
            
            <div className="grid gap-4">
                {customers.map(customer => {
                    const customerBookings = bookings.filter(b => b.customerId === customer.id && b.providerId === providerId);
                    const lastBooking = customerBookings.sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime())[0];

                    return (
                        <div key={customer.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-pink-500 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold">{customer.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-400 mt-1">
                                        <Phone className="w-4 h-4"/> {customer.mobile}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="bg-pink-900/50 text-pink-300 text-xs px-2 py-1 rounded-full">
                                        {customerBookings.length} Visits
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-700 text-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar className="w-4 h-4"/> Last Visit:
                                    <span className="text-white">{lastBooking?.dateTime.toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {customers.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No customers found yet. Wait for your first booking!</p>
                )}
            </div>
        </Card>
    </div>
  );
};

export default ProviderCRM;


import React from 'react';
import { Booking, Review } from '../../types';
import Card from '../common/Card';
import { TrendingUp, Users, Star, IndianRupee, Clock } from 'lucide-react';

interface ProviderAnalyticsProps {
  providerId: string;
  bookings: Booking[];
  reviews: Review[];
}

const ProviderAnalytics: React.FC<ProviderAnalyticsProps> = ({ providerId, bookings, reviews }) => {
  const myBookings = bookings.filter(b => b.providerId === providerId);
  const completedBookings = myBookings.filter(b => b.status === 'completed');
  
  // Financials
  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const platformFees = completedBookings.reduce((sum, b) => sum + b.platformFee, 0);
  const netEarnings = totalRevenue - platformFees;
  
  // Performance
  const myReviews = reviews.filter(r => r.providerId === providerId);
  const averageRating = myReviews.length > 0 
    ? (myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1) 
    : 'N/A';

  // Peak Hours (Simple mock logic based on booking times)
  const hours = myBookings.map(b => b.dateTime.getHours());
  const peakHour = hours.sort((a,b) => hours.filter(v => v===a).length - hours.filter(v => v===b).length).pop();
  
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center gap-4">
            <div className="bg-green-500/20 p-3 rounded-full text-green-400">
                <IndianRupee className="w-6 h-6"/>
            </div>
            <div>
                <p className="text-gray-400 text-sm">Net Earnings</p>
                <p className="text-2xl font-bold">₹{netEarnings.toFixed(0)}</p>
            </div>
         </div>
         <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-full text-blue-400">
                <Users className="w-6 h-6"/>
            </div>
            <div>
                <p className="text-gray-400 text-sm">Total Bookings</p>
                <p className="text-2xl font-bold">{myBookings.length}</p>
            </div>
         </div>
         <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center gap-4">
            <div className="bg-yellow-500/20 p-3 rounded-full text-yellow-400">
                <Star className="w-6 h-6"/>
            </div>
            <div>
                <p className="text-gray-400 text-sm">Avg Rating</p>
                <p className="text-2xl font-bold">{averageRating}</p>
            </div>
         </div>
         <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center gap-4">
            <div className="bg-purple-500/20 p-3 rounded-full text-purple-400">
                <Clock className="w-6 h-6"/>
            </div>
            <div>
                <p className="text-gray-400 text-sm">Peak Hour</p>
                <p className="text-2xl font-bold">{peakHour ? `${peakHour}:00` : 'N/A'}</p>
            </div>
         </div>
      </div>

      {/* Earnings Chart Placeholder (Visual Mock) */}
      <Card>
         <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5"/> Revenue Trends</h3>
         <div className="h-40 flex items-end gap-2">
             {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
                 <div key={i} className="flex-1 bg-gray-700 hover:bg-pink-600 transition-colors rounded-t-md relative group" style={{ height: `${h}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{h * 100}
                    </div>
                 </div>
             ))}
         </div>
         <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
             <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
         </div>
      </Card>

      {/* Reviews List */}
      <Card>
        <h3 className="text-lg font-bold mb-4 text-pink-400">Customer Reviews</h3>
        {myReviews.length > 0 ? (
            <div className="space-y-4">
                {myReviews.map(review => (
                    <div key={review.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex justify-between mb-2">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                                ))}
                            </div>
                            <span className="text-xs text-gray-400">{review.date.toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-300">"{review.comment}"</p>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-gray-500 text-center py-4">No reviews yet.</p>
        )}
      </Card>
    </div>
  );
};

export default ProviderAnalytics;

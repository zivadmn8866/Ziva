
import React from 'react';
import { User } from '../../types';
import Card from '../common/Card';
import { Crown, Star, Gift } from 'lucide-react';

interface LoyaltyRewardsProps {
  user: User;
}

const LoyaltyRewards: React.FC<LoyaltyRewardsProps> = ({ user }) => {
  const points = user.loyaltyPoints || 0;
  const tier = user.tier || 'Silver';

  const tiers = {
    Silver: { min: 0, max: 500, color: 'text-gray-300', bg: 'bg-gray-500' },
    Gold: { min: 501, max: 2000, color: 'text-yellow-400', bg: 'bg-yellow-500' },
    Platinum: { min: 2001, max: 10000, color: 'text-cyan-400', bg: 'bg-cyan-500' }
  };

  const nextTier = tier === 'Silver' ? 'Gold' : tier === 'Gold' ? 'Platinum' : 'Platinum';
  const progress = Math.min(100, ((points - tiers[tier].min) / (tiers[tier].max - tiers[tier].min)) * 100);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Status Card */}
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl text-center relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 ${tiers[tier].bg}`}></div>
        <Crown className={`w-16 h-16 mx-auto mb-4 ${tiers[tier].color}`} />
        <h2 className="text-3xl font-bold text-white">{tier} Member</h2>
        <p className="text-gray-400 mt-2">You have <span className="text-pink-400 font-bold">{points}</span> loyalty points</p>
        
        {tier !== 'Platinum' && (
           <div className="mt-6 max-w-xs mx-auto">
             <div className="flex justify-between text-xs text-gray-400 mb-1">
               <span>{points}</span>
               <span>{tiers[tier].max} ({nextTier})</span>
             </div>
             <div className="w-full bg-gray-800 rounded-full h-2.5">
               <div className={`h-2.5 rounded-full ${tiers[tier].bg}`} style={{ width: `${progress}%` }}></div>
             </div>
             <p className="text-xs text-gray-500 mt-2">{tiers[tier].max - points} points needed for {nextTier}</p>
           </div>
        )}
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-2 gap-4">
         <Card className="flex items-center gap-4">
            <div className="bg-yellow-500/20 p-3 rounded-full">
                <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
                <h3 className="font-bold">Earn Points</h3>
                <p className="text-sm text-gray-400">Get 10 points for every ₹1 spent on services.</p>
            </div>
         </Card>
         <Card className="flex items-center gap-4">
            <div className="bg-purple-500/20 p-3 rounded-full">
                <Gift className="w-6 h-6 text-purple-400" />
            </div>
            <div>
                <h3 className="font-bold">Referral Bonus</h3>
                <p className="text-sm text-gray-400">Earn 500 points for every friend you refer.</p>
            </div>
         </Card>
      </div>

      {/* Redeem Section (Mock) */}
      <h3 className="text-xl font-bold text-pink-400 mt-4">Redeem Rewards</h3>
      <div className="space-y-3">
         {[
             { name: '₹100 Off Coupon', cost: 1000 },
             { name: 'Free Head Massage', cost: 2500 },
             { name: 'Priority Booking Access', cost: 5000 }
         ].map((reward, i) => (
             <div key={i} className="flex justify-between items-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                 <span className="font-medium">{reward.name}</span>
                 <button 
                    disabled={points < reward.cost}
                    className={`px-4 py-2 rounded-lg text-sm font-bold ${points >= reward.cost ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                 >
                    {reward.cost} pts
                 </button>
             </div>
         ))}
      </div>
    </div>
  );
};

export default LoyaltyRewards;

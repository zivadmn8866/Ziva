
import React, { useState } from 'react';
import { User, Transaction } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon } from 'lucide-react';

interface WalletProps {
  user: User;
  transactions: Transaction[];
  onAddMoney: (amount: number) => void;
}

const Wallet: React.FC<WalletProps> = ({ user, transactions, onAddMoney }) => {
  const [amount, setAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    const val = parseFloat(amount);
    if (val > 0) {
      onAddMoney(val);
      setAmount('');
      setIsAdding(false);
    }
  };

  const userTransactions = transactions
    .filter(t => t.userId === user.id)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Digital Wallet Card */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-700 p-6 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-pink-200 text-sm font-medium">Total Balance</p>
              <h2 className="text-4xl font-bold text-white mt-1">₹{user.walletBalance?.toFixed(2) || '0.00'}</h2>
            </div>
            <WalletIcon className="w-10 h-10 text-pink-200 opacity-80" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-pink-200 font-mono">•••• •••• •••• {user.mobile.slice(-4)}</p>
            <Button 
              onClick={() => setIsAdding(!isAdding)} 
              className="bg-white text-pink-700 hover:bg-gray-100 border-none text-sm py-1 px-3"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Money
            </Button>
          </div>
        </div>
      </div>

      {/* Add Money Section */}
      {isAdding && (
        <Card className="animate-fade-in-up border-pink-500 border">
          <h3 className="font-bold mb-3">Add Money to Wallet</h3>
          <div className="flex gap-2">
            <div className="flex-1">
               <Input 
                  label="" 
                  placeholder="Enter Amount (₹)" 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  autoFocus
               />
            </div>
            <Button onClick={handleAdd} className="mt-1">Pay & Add</Button>
          </div>
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
             {[100, 500, 1000, 2000].map(val => (
                 <button 
                    key={val} 
                    onClick={() => setAmount(val.toString())}
                    className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300 hover:bg-gray-700 border border-gray-600"
                 >
                    + ₹{val}
                 </button>
             ))}
          </div>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <h3 className="text-xl font-bold mb-4 text-pink-400 flex items-center gap-2">
            <CreditCard className="w-5 h-5"/> Transaction History
        </h3>
        <div className="space-y-4">
          {userTransactions.length > 0 ? (
            userTransactions.map(tx => (
              <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                     {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold">{tx.description}</p>
                    <p className="text-xs text-gray-400">{tx.date.toLocaleDateString()} at {tx.date.toLocaleTimeString()}</p>
                  </div>
                </div>
                <span className={`font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-white'}`}>
                  {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transactions yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Wallet;

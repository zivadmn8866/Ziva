import React, { useState } from 'react';
import Button from '../common/Button';

interface RazorpayPopupProps {
  totalAmount: number;
  onSuccess: () => void;
  onClose: () => void;
}

const RazorpayPopup: React.FC<RazorpayPopupProps> = ({ totalAmount, onSuccess, onClose }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            onSuccess();
        }, 3000); // Simulate 3s payment processing
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-sm border border-gray-700 p-6">
                {isProcessing ? (
                    <div className="text-center py-8">
                        <svg className="animate-spin h-10 w-10 text-pink-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 text-lg">Processing your payment...</p>
                        <p className="text-gray-400">Please do not refresh the page.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-center text-pink-400 mb-2">Confirm Payment</h2>
                        <p className="text-center text-gray-400 mb-6">You are about to pay ₹{totalAmount.toFixed(2)}</p>
                        <div className="p-4 bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-400">Pay using Razorpay (Test Mode)</p>
                            <p className="text-xs text-gray-500 mt-2">[This is a simulated payment gateway for testing purposes. No real payment will be made.]</p>
                        </div>
                        <div className="mt-8 flex gap-4">
                            <Button variant="secondary" onClick={onClose} className="w-full">Cancel</Button>
                            <Button onClick={handlePayment} className="w-full">Pay Now</Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RazorpayPopup;

import React from 'react';
import { User } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { PartyPopper } from 'lucide-react';

interface CustomerOnboardingProps {
    user: User;
    onDone: () => void;
}

const CustomerOnboarding: React.FC<CustomerOnboardingProps> = ({ user, onDone }) => {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full text-center animate-fade-in-up">
                <PartyPopper className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Welcome to ZIVA, {user.name}!</h2>
                <p className="text-gray-400 mb-6">We're excited to have you. Your next great salon experience is just a few clicks away.</p>
                <Button onClick={onDone} className="w-full">
                    Let's Get Started
                </Button>
            </Card>
        </div>
    );
};

export default CustomerOnboarding;

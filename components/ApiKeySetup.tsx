import React, { useState } from 'react';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import { KeyRound } from 'lucide-react';

interface ApiKeySetupProps {
  onKeySubmit: (apiKey: string) => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onKeySubmit }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onKeySubmit(key.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="max-w-md w-full animate-fade-in-up">
        <div className="text-center">
            <KeyRound className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-pink-400">Gemini API Key Required</h2>
            <p className="text-gray-400 mt-2 mb-6">
                To enable AI-powered features like automatic service description generation, please provide your Google Gemini API key.
            </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Your Gemini API Key" 
            id="apiKey" 
            type="password" 
            value={key} 
            onChange={e => setKey(e.target.value)} 
            placeholder="Enter your API key here"
            required 
          />
          <Button type="submit" className="w-full">Save and Continue</Button>
        </form>
        <div className="text-center text-xs text-gray-500 mt-4">
            <p>Your API key is stored only in your browser's local storage.</p>
            <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-pink-400 hover:underline mt-2 inline-block"
            >
                Get your API Key from Google AI Studio &rarr;
            </a>
        </div>
      </Card>
    </div>
  );
};

export default ApiKeySetup;

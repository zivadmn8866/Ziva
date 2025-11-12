
import React, { useState, useRef } from 'react';
import { User } from '../types';
// Fix: Changed the import for `qrcode.react` to use the named export `QRCodeCanvas` and aliased it as `QRCode`. This resolves the "not a valid JSX element" error which is likely due to module interop issues with the default export.
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import Button from './common/Button';
import Input from './common/Input';
import Card from './common/Card';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  mockUsers: User[];
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, mockUsers }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const qrCodeContainerRef = useRef<HTMLDivElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      const user = mockUsers.find(
        u => (u.mobile === identifier || u.email === identifier) && u.password === password
      );
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials. Please check your mobile/email and password.');
      }
      setIsLoading(false);
    }, 1000);
  };
  
  const handleDownloadQR = () => {
    if (qrCodeContainerRef.current) {
      const canvas = qrCodeContainerRef.current.querySelector('canvas');
      if (canvas) {
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = 'ziva-qr-code.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    }
  };

  const appUrl = window.location.href;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="grid md:grid-cols-2 gap-16 items-center max-w-4xl w-full">
        <Card className="w-full">
          <h2 className="text-3xl font-bold text-center mb-2 text-pink-400">ZIVA</h2>
          <p className="text-center text-gray-400 mb-6">Your Personal Salon Experience</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input label="Mobile Number or Email" id="identifier" type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} required />
            <Input label="Password" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" isLoading={isLoading}>Login</Button>
          </form>
          <div className="text-center text-xs text-gray-500 mt-4 space-y-1">
              <p className="font-bold">Demo Logins (Identifier / Password):</p>
              <p>Customer: 1112223330 / password123</p>
              <p>Provider: 4445556660 / password123</p>
              <p>Admin: zivadmn@gmail.com / admin123</p>
          </div>
        </Card>
        <div className="text-center hidden md:block">
            <h3 className="text-xl font-bold mb-4">Get the App</h3>
            <div className="bg-white p-4 inline-block rounded-lg" ref={qrCodeContainerRef}>
                <QRCode value={appUrl} size={160} />
            </div>
            <p className="text-gray-400 mt-4">Scan this QR code to open on your phone or share with friends.</p>
            <button 
                onClick={handleDownloadQR}
                className="mt-4 inline-block bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
            >
                Download QR
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;


import React, { useState, useCallback, useEffect } from 'react';
import { User, Role, Notification, PlatformFeeConfig } from './types';
import { MOCK_USERS, MOCK_SERVICES, MOCK_BOOKINGS, MOCK_OFFERS, MOCK_QUERIES } from './constants';
import AuthScreen from './components/AuthScreen';
import CustomerDashboard from './components/customer/CustomerDashboard';
import ProviderDashboard from './components/provider/ProviderDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import NotificationPopup from './components/common/NotificationPopup';
import { Home, User as UserIcon, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Centralized state management for all app data
  const [users, setUsers] = useState(MOCK_USERS);
  const [services, setServices] = useState(MOCK_SERVICES);
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [offers, setOffers] = useState(MOCK_OFFERS);
  const [queries, setQueries] = useState(MOCK_QUERIES);
  const [platformFeeConfig, setPlatformFeeConfig] = useState<PlatformFeeConfig>({ type: 'none', value: 0 });

  useEffect(() => {
    // Simulate checking for a logged-in user
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
     addNotification('Profile updated successfully!', 'success');
  };

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
    const newNotif = { id: Date.now().toString(), message, type };
    setNotifications(prev => [...prev, newNotif]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 5000);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    addNotification(`Welcome back, ${user.name}!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  const renderDashboard = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case Role.CUSTOMER:
        return <CustomerDashboard user={currentUser} users={users} addNotification={addNotification} services={services} bookings={bookings} setBookings={setBookings} platformFeeConfig={platformFeeConfig} queries={queries} setQueries={setQueries} onUpdateUser={handleUpdateUser} />;
      case Role.PROVIDER:
        return <ProviderDashboard user={currentUser} users={users} onUpdateUser={handleUpdateUser} addNotification={addNotification} services={services} setServices={setServices} offers={offers} setOffers={setOffers} bookings={bookings} setBookings={setBookings} queries={queries} setQueries={setQueries} />;
      case Role.ADMIN:
        return <AdminDashboard user={currentUser} users={users} onUpdateUser={handleUpdateUser} addNotification={addNotification} offers={offers} setOffers={setOffers} platformFeeConfig={platformFeeConfig} setPlatformFeeConfig={setPlatformFeeConfig} queries={queries} />;
      default:
        return <div>Invalid user role.</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white text-2xl font-bold animate-pulse">ZIVA</div>
      </div>
    );
  }

  return (
    <div className="bg-black text-gray-100 min-h-screen font-sans">
      <main className="container mx-auto p-4 max-w-7xl">
        {currentUser ? (
          <>
            <header className="flex justify-between items-center mb-6 p-4 bg-gray-900 rounded-lg shadow-lg">
              <h1 className="text-2xl font-bold text-pink-400">ZIVA</h1>
              <div className="flex items-center space-x-4">
                 <div className="flex items-center gap-2">
                   {currentUser.role === Role.CUSTOMER && <Home className="w-5 h-5 text-gray-400"/>}
                   {currentUser.role === Role.PROVIDER && <UserIcon className="w-5 h-5 text-gray-400"/>}
                   {currentUser.role === Role.ADMIN && <Shield className="w-5 h-5 text-gray-400"/>}
                   <span className="text-sm font-medium">{currentUser.name} ({currentUser.role})</span>
                 </div>
                <button
                  onClick={handleLogout}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-sm"
                >
                  Logout
                </button>
              </div>
            </header>
            {renderDashboard()}
          </>
        ) : (
          <AuthScreen onLogin={handleLogin} mockUsers={users} />
        )}
      </main>
      <div className="fixed top-5 right-5 z-50 space-y-2">
        {notifications.map(notif => (
          // Fix: Spread the `notif` object to pass all required props, including `id`, to NotificationPopup.
          <NotificationPopup key={notif.id} {...notif} onClose={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))} />
        ))}
      </div>
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { User, Query } from '../../types';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';

interface RaiseQueryProps {
  user: User;
  queries: Query[];
  setQueries: React.Dispatch<React.SetStateAction<Query[]>>;
  addNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const RaiseQuery: React.FC<RaiseQueryProps> = ({ user, queries, setQueries, addNotification }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuery: Query = {
      id: `query-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      subject,
      message,
      createdAt: new Date(),
    };
    setQueries(prev => [newQuery, ...prev]);
    addNotification('Your query has been submitted!', 'success');
    setSubject('');
    setMessage('');
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 text-pink-400">Contact Support</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Subject"
          id="subject"
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          required
        />
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
          <textarea
            id="message"
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <Button type="submit" className="w-full">Submit Query</Button>
      </form>
    </Card>
  );
};

export default RaiseQuery;
   
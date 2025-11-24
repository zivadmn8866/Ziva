import React, { useState, useEffect } from 'react';
import { Booking } from '../../types';
import Modal from './Modal';
import Button from './Button';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (newDateTime: Date) => void;
  booking: Booking;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({ isOpen, onClose, onReschedule, booking }) => {
  const [time, setTime] = useState('');
  const [minTime, setMinTime] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Set initial time from booking
      const hours = booking.dateTime.getHours().toString().padStart(2, '0');
      const minutes = booking.dateTime.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);

      const now = new Date();
      const bookingDate = new Date(booking.dateTime);
    
      // Check if the booking is for today
      if (
        bookingDate.getFullYear() === now.getFullYear() &&
        bookingDate.getMonth() === now.getMonth() &&
        bookingDate.getDate() === now.getDate()
      ) {
        // If it's today, prevent rescheduling to a past time
        const currentHours = now.getHours().toString().padStart(2, '0');
        const currentMinutes = now.getMinutes().toString().padStart(2, '0');
        setMinTime(`${currentHours}:${currentMinutes}`);
      } else {
        setMinTime(''); // No restriction for future dates
      }
    }
  }, [isOpen, booking.dateTime]);

  const handleSave = () => {
    if (!time) {
        // Simple validation
        alert('Please select a time.');
        return;
    }
    const [hours, minutes] = time.split(':').map(Number);
    const newDateTime = new Date(booking.dateTime);
    newDateTime.setHours(hours, minutes, 0, 0);

    onReschedule(newDateTime);
  };
  
  const bookingDate = booking.dateTime.toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reschedule Appointment">
      <div className="space-y-4">
        <p>You can reschedule for a different time on the same day.</p>
        <p className="font-bold text-pink-400">{bookingDate}</p>
        <div>
          <label htmlFor="rescheduleTime" className="block text-sm font-medium text-gray-300 mb-1">
            Select New Time
          </label>
          <input
            id="rescheduleTime"
            type="time"
            value={time}
            min={minTime}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Confirm Reschedule</Button>
        </div>
      </div>
    </Modal>
  );
};

export default RescheduleModal;

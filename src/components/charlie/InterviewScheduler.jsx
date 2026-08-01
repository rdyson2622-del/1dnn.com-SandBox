import React, { useState } from 'react';
import { appClient } from '@/api/appClient';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_TIMES = [
  '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
];

export default function InterviewScheduler({ client, onComplete }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate next 14 days of available dates (skip weekends)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date);
      }
    }
    return dates;
  };

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    setLoading(true);
    try {
      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

      await appClient.entities.Interview.create({
        client_id: client.id,
        client_name: client.full_name,
        client_email: client.email,
        scheduled_date: scheduledDateTime.toISOString()
      });

      toast.success('Interview scheduled! We\'ll confirm via email.');
      onComplete();
    } catch (error) {
      toast.error('Failed to schedule interview');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const availableDates = getAvailableDates();
  const dateStr = selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : null;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5" style={{ color: '#D4AF37' }} />
        <h3 className="text-xl font-bold text-white">Schedule Your Interview</h3>
      </div>

      <p className="text-sm text-slate-300 mb-6">
        Before we dive into your Gemini session, let's have a 30-minute conversation with our team. We'll understand your family, timeline, and what matters most.
      </p>

      {/* Date picker */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-400 block mb-3">Pick a date</label>
        <div className="grid grid-cols-3 gap-2">
          {availableDates.slice(0, 9).map(date => {
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-yellow-500 text-black'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time picker */}
      {selectedDate && (
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-400 block mb-3 flex items-center gap-2">
            <Clock className="w-3 h-3" /> Pick a time (PT)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {AVAILABLE_TIMES.map(time => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-yellow-500 text-black'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation */}
      {selectedDate && selectedTime && (
        <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-white font-semibold">{dateStr} at {selectedTime}</p>
              <p className="text-slate-300 text-xs mt-1">We'll send a confirmation email with the call-in details</p>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handleSchedule}
        disabled={!selectedDate || !selectedTime || loading}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
      >
        {loading ? 'Scheduling...' : 'Confirm Interview'}
      </Button>
    </div>
  );
}
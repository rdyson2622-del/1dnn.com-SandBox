import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Phone, Calendar, Clock, CheckCircle2 } from 'lucide-react';

const GOLD = '#D4AF37';

// Generate next 7 weekdays
function getAvailableDays() {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let d = new Date();
  d.setDate(d.getDate() + 1); // start tomorrow
  while (days.length < 7) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) { // skip weekends
      days.push({
        label: `${dayNames[d.getDay()]} ${monthNames[d.getMonth()]} ${d.getDate()}`,
        value: d.toISOString().split('T')[0],
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM',
];

export default function IntroCallScheduler({ form, onBack, onScheduled }) {
  const DAYS = getAvailableDays();
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const canConfirm = selectedDay && selectedTime;

  const handleConfirm = () => {
    setConfirmed(true);
    // Brief delay then advance
    setTimeout(() => {
      onScheduled({ day: selectedDay, time: selectedTime });
    }, 1800);
  };

  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-10 text-center"
        style={{ background: '#000', border: `2px solid ${GOLD}` }}
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(212,175,55,0.15)', border: `2px solid ${GOLD}` }}>
          <CheckCircle2 className="w-8 h-8" style={{ color: GOLD }} />
        </div>
        <h2 className="font-bold mb-2" style={{ color: '#fff', fontSize: '1.5rem' }}>Call Scheduled!</h2>
        <p className="mb-1" style={{ color: GOLD, fontSize: '1rem' }}>{selectedDay.label} at {selectedTime} (Pacific)</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>Moving to service agreement...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-8"
      style={{ background: '#000', border: '1px solid rgba(212,175,55,0.25)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Phone className="w-6 h-6" style={{ color: GOLD }} />
        <h2 className="font-bold" style={{ color: '#fff', fontSize: '2rem' }}>Let's Talk First</h2>
      </div>
      <p className="mb-6" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem' }}>
        Before you commit to anything, let's have a real conversation. Pick a 15-minute slot — Bob Dyson's team will call you personally.
      </p>

      {/* Who's calling */}
      <div className="rounded-xl p-4 mb-6 flex items-start gap-3"
        style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
          style={{ background: GOLD, color: '#000' }}>BD</div>
        <div>
          <p className="font-bold" style={{ color: '#fff', fontSize: '1rem' }}>Bob Dyson's Team • 15-Min Intro Call</p>
          <p className="mt-0.5" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
            We'll call <span style={{ color: GOLD }}>(858) 353-1200</span> — no pressure, just answers.
          </p>
        </div>
      </div>

      {/* Day picker */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4" style={{ color: GOLD }} />
          <span className="font-bold tracking-wider" style={{ color: GOLD, fontSize: '0.875rem' }}>CHOOSE A DAY</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DAYS.map(day => (
            <button
              key={day.value}
              onClick={() => { setSelectedDay(day); setSelectedTime(null); }}
              className="px-3 py-2.5 rounded-xl font-medium text-left transition-all"
              style={{ fontSize: '0.95rem' }}
              style={{
                background: selectedDay?.value === day.value ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${selectedDay?.value === day.value ? GOLD : 'rgba(255,255,255,0.1)'}`,
                color: selectedDay?.value === day.value ? GOLD : 'rgba(255,255,255,0.7)',
              }}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time picker — only shows after day selected */}
      {selectedDay && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" style={{ color: GOLD }} />
            <span className="font-bold tracking-wider" style={{ color: GOLD, fontSize: '0.875rem' }}>CHOOSE A TIME (PACIFIC)</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {TIME_SLOTS.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className="px-2 py-2 rounded-xl font-medium transition-all text-center"
                style={{ fontSize: '0.95rem' }}
                style={{
                  background: selectedTime === t ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedTime === t ? GOLD : 'rgba(255,255,255,0.1)'}`,
                  color: selectedTime === t ? GOLD : 'rgba(255,255,255,0.7)',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '1rem' }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="gold-btn px-7 py-2.5 rounded-full font-bold tracking-wide flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontSize: '1rem' }}
        >
          Confirm Call <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-center mt-4" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.875rem' }}>
        You can still skip ahead to the service agreement if you prefer.{' '}
        <button onClick={() => onScheduled(null)} className="underline hover:opacity-70" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Skip for now
        </button>
      </p>
    </motion.div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, MapPin, Users, Calendar, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const GOLD = '#D4AF37';

export default function InterviewSummary({ clientInfo, sessionResult }) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 flex flex-col items-center justify-center p-8 gap-6 max-w-2xl mx-auto w-full"
    >
      {/* Success Badge */}
      <motion.div variants={itemVariants} className="text-6xl">
        🎉
      </motion.div>

      {/* Main Heading */}
      <motion.div variants={itemVariants} className="text-center space-y-2">
        <h2 className="text-3xl font-bold" style={{ color: '#fff' }}>
          Your Profile is Ready
        </h2>
        <p className="text-sm" style={{ color: '#888' }}>
          We've captured your relocation details and built your personalized move plan.
        </p>
      </motion.div>

      {/* Captured Info Summary */}
      <motion.div
        variants={itemVariants}
        className="w-full rounded-2xl p-5 space-y-4"
        style={{ background: '#111', border: `1px solid ${GOLD}33` }}
      >
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>
          Your Relocation Profile
        </p>

        <div className="space-y-3">
          {/* Name & Email */}
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4" style={{ color: GOLD }} />
            <div>
              <p className="text-xs text-gray-400">Name</p>
              <p className="text-sm font-medium text-gray-200">{clientInfo?.name}</p>
            </div>
          </div>

          {/* Destination */}
          {sessionResult?.destination_city && (
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4" style={{ color: GOLD }} />
              <div>
                <p className="text-xs text-gray-400">Moving To</p>
                <p className="text-sm font-medium text-gray-200">
                  {sessionResult.destination_city}, {sessionResult.destination_state}
                </p>
              </div>
            </div>
          )}

          {/* Move Timeline */}
          {sessionResult?.move_date && (
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4" style={{ color: GOLD }} />
              <div>
                <p className="text-xs text-gray-400">Planned Move Date</p>
                <p className="text-sm font-medium text-gray-200">
                  {new Date(sessionResult.move_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Budget */}
          {sessionResult?.budget && (
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4" style={{ color: GOLD }} />
              <div>
                <p className="text-xs text-gray-400">Budget Range</p>
                <p className="text-sm font-medium text-gray-200">
                  {sessionResult.budget.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Generated Tasks */}
      {sessionResult?.tasks?.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="w-full rounded-2xl p-5 space-y-3"
          style={{ background: '#111', border: `1px solid ${GOLD}33` }}
        >
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>
            Your Move Plan ({sessionResult.tasks.length} action items)
          </p>
          <div className="space-y-2">
            {sessionResult.tasks.slice(0, 6).map((task, i) => (
              <div key={i} className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
                <div>
                  <p className="text-sm font-medium text-gray-200">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {sessionResult.tasks.length > 6 && (
            <p className="text-xs text-gray-500 pt-2 border-t border-gray-700">
              +{sessionResult.tasks.length - 6} more tasks in your dashboard
            </p>
          )}
        </motion.div>
      )}

      {/* Next Steps */}
      <motion.div
        variants={itemVariants}
        className="w-full rounded-2xl p-5"
        style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}33` }}
      >
        <p className="text-sm font-bold text-gray-100 mb-2">What happens next:</p>
        <ul className="space-y-1.5 text-xs text-gray-300">
          <li>✓ Your concierge team reviews your profile</li>
          <li>✓ We match you with local agents in your destination</li>
          <li>✓ You'll receive a personalized introduction within 24 hours</li>
          <li>✓ Your move plan updates as you complete tasks</li>
        </ul>
      </motion.div>

      {/* CTAs */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full pt-4">
        <Link to="/Dashboard" className="w-full">
          <button
            className="w-full h-11 rounded-xl font-bold text-sm transition-all hover:opacity-90"
            style={{ background: GOLD, color: '#000' }}
          >
            View My Dashboard →
          </button>
        </Link>
        <Link to="/Chat" className="w-full">
          <button
            className="w-full h-11 rounded-xl font-bold text-sm transition-all hover:opacity-80"
            style={{ background: 'transparent', border: `1px solid ${GOLD}44`, color: '#888' }}
          >
            Back to Charlie
          </button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
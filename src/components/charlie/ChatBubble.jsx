import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function ChatBubble({ message }) {
  const isCharlie = message.role === 'charlie';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`flex ${isCharlie ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isCharlie ? 'rounded-bl-sm' : 'rounded-br-sm'
        }`}
        style={isCharlie
          ? { background: '#1a1a1a', color: '#e8e8e8', border: '1px solid #2a2a2a' }
          : { background: 'linear-gradient(135deg, #D4AF37, #B8860B)', color: '#000', fontWeight: 500 }
        }
      >
        {isCharlie && message.type === 'video' ? (
          <div>
            {message.content && <p className="my-1 text-gray-200">{message.content}</p>}
            <div className="mt-2 w-44 h-44 rounded-full overflow-hidden mx-auto"
              style={{ border: '3px solid #D4AF37', background: '#0d0d0d' }}>
              <video
                src={message.videoUrl}
                autoPlay
                playsInline
                className="w-full h-full object-cover cursor-pointer"
                style={{ transform: 'scale(1.35)' }}
                onClick={(e) => e.target.paused ? e.target.play() : e.target.pause()}
              />
            </div>
            <p className="mt-2 text-center text-[10px] font-black tracking-[0.2em]" style={{ color: '#D4AF37' }}>
              BOB DYSON · FOUNDER
            </p>
          </div>
        ) : isCharlie ? (
          <ReactMarkdown
            className="prose prose-sm max-w-none"
            components={{
              p: ({ children }) => <p className="my-1 text-gray-200">{children}</p>,
              strong: ({ children }) => <strong style={{ color: '#D4AF37' }}>{children}</strong>,
              ul: ({ children }) => <ul className="my-1 ml-3 list-disc text-gray-300">{children}</ul>,
              li: ({ children }) => <li className="my-0.5">{children}</li>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        ) : (
          <p>{message.content}</p>
        )}
      </div>
    </motion.div>
  );
}
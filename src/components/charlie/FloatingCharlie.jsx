import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface from './ChatInterface';

const DYSON_LOGO = "/assets/dyson-logo.png";

export default function FloatingCharlie() {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && !expanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]"
            style={{ maxHeight: 'calc(100vh - 7rem)', overflowY: 'auto' }}
          >
            <ChatInterface
              onClose={() => setIsOpen(false)}
              expanded={false}
              onToggleExpand={() => setExpanded(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded view */}
      <AnimatePresence>
        {isOpen && expanded && (
          <ChatInterface
            expanded={true}
            onToggleExpand={() => setExpanded(false)}
            onClose={() => {
              setIsOpen(false);
              setExpanded(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating button */}
      {!expanded && (
        <motion.div
          className="fixed bottom-20 right-3 md:bottom-6 md:right-6 z-[60]"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="relative">
            {!isOpen && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden sm:block absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg"
              >
                Meet Charlie — your site guide 👋
                <div className="absolute top-1/2 -translate-y-1/2 right-[-6px] w-3 h-3 bg-slate-900 rotate-45" />
              </motion.div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="block"
            >
              <img src={DYSON_LOGO} alt="Dyson & Dyson" className="h-12 md:h-16 w-auto" />
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}

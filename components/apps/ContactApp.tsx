import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ContactApp: React.FC = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const Tape = ({ className }: { className?: string }) => (
    <div
      className={`absolute w-16 h-4 bg-tape/90 backdrop-blur-[1px] shadow-sm z-50 pointer-events-none ${className}`}
    >
      <div className="w-full h-full opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
    </div>
  );

  return (
    <div className="flex items-center justify-center h-full overflow-y-auto p-4">
      <div className="bg-[#fffacc] w-full max-w-sm p-8 shadow-paper relative rotate-[-1deg] border border-yellow-200">
        <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
        <h3 className="font-hand text-2xl font-bold mb-6 text-center">Drop a Note! ✏️</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div className="relative">
            <input required type="text" placeholder="Name" className="w-full bg-transparent border-b-2 border-ink/10 focus:border-ink outline-none py-2 font-hand text-xl placeholder-ink/30 transition-colors" />
          </div>
          <div className="relative">
            <input required type="email" placeholder="Email" className="w-full bg-transparent border-b-2 border-ink/10 focus:border-ink outline-none py-2 font-hand text-xl placeholder-ink/30 transition-colors" />
          </div>
          <div className="relative">
             <textarea required rows={3} placeholder="Write something nice..." className="w-full bg-transparent border-b-2 border-ink/10 focus:border-ink outline-none py-2 font-hand text-xl placeholder-ink/30 resize-none transition-colors"></textarea>
          </div>
          <button className="mt-6 w-full bg-ink text-white font-bold py-3 rounded-sm hover:bg-gray-800 transition-colors font-sans text-sm tracking-widest uppercase shadow-sm">
            Send It
          </button>
        </form>

        <AnimatePresence>
          {sent && (
            <motion.div 
              initial={{ scale: 2, opacity: 0, rotate: -20 }} 
              animate={{ scale: 1, opacity: 1, rotate: -12 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <div className="border-4 border-red-600 text-red-600 px-6 py-2 font-black text-5xl uppercase tracking-widest opacity-80 mix-blend-multiply border-double bg-white/50 backdrop-blur-sm transform rotate-[-12deg]">
                SENT
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

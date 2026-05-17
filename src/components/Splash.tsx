import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

export default function Splash({ logo }: { logo: string }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
        >
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <motion.div 
               animate={{ 
                 scale: [1, 1.2, 1],
                 opacity: [0.1, 0.2, 0.1],
                 rotate: [0, 90, 0]
               }}
               transition={{ duration: 10, repeat: Infinity }}
               className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/20 blur-[120px] rounded-full" 
             />
             <motion.div 
               animate={{ 
                 scale: [1.2, 1, 1.2],
                 opacity: [0.1, 0.2, 0.1],
                 rotate: [0, -90, 0]
               }}
               transition={{ duration: 8, repeat: Infinity }}
               className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" 
             />
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col items-center"
          >
            {/* Logo Container */}
            <div className="relative group">
               <div className="absolute inset-0 blur-3xl bg-cyan-400/40 rounded-full animate-pulse" />
               <div className="w-44 h-44 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center relative z-10 border border-white/5 rgb-search-shadow">
                  <span className="text-9xl font-black text-cyan-400 tracking-tighter select-none">W</span>
               </div>
            </div>

            {/* Branding */}
            <div className="mt-12 text-center space-y-2">
               <motion.h1
                 initial={{ opacity: 0, letterSpacing: "0.5em" }}
                 animate={{ opacity: 1, letterSpacing: "0.1em" }}
                 transition={{ delay: 0.4, duration: 1 }}
                 className="text-6xl font-black text-white uppercase tracking-tighter"
               >
                 NEXGEN<span className="text-cyan-400">.OS</span>
               </motion.h1>
               <motion.p 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 0.3 }}
                 transition={{ delay: 1 }}
                 className="text-[10px] font-black uppercase tracking-[0.5em] text-white"
               >
                 Neural Visual Database // Ver 4.0
               </motion.p>
            </div>

            {/* Status Bar */}
            <div className="mt-16 w-48 h-1 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)]"
                />
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 text-[9px] font-black italic text-cyan-400/60 uppercase tracking-widest"
            >
              Establishing secure uplink...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

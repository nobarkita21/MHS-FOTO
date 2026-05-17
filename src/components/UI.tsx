import { motion } from "motion/react";

export default function RippleButton({ children, onClick, className = "", color = "primary" }: { children: React.ReactNode, onClick?: () => void, className?: string, color?: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative overflow-hidden px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:shadow-inner ${className} ${
        color === "primary" ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white" : "bg-white/10 backdrop-blur-md text-white border border-white/20"
      }`}
    >
      {children}
    </motion.button>
  );
}

export function Badge({ type }: { type: 'none' | 'new' | 'viral' | 'trending' }) {
  if (type === 'none') return null;
  const colors = {
    new: "badge-pulse-new",
    viral: "badge-pulse-viral",
    trending: "badge-pulse-trending"
  };
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`absolute top-3 left-3 z-20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest text-white ${colors[type]}`}
    >
      {type}
    </motion.div>
  );
}

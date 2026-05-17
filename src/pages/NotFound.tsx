import { motion } from "motion/react";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
       {/* Rotating Background */}
       <div className="absolute inset-0 opacity-20 scale-150 rotate-45">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-transparent to-pink-500 animate-pulse" />
       </div>

       <motion.div
         initial={{ scale: 0.5, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         className="relative z-10 flex flex-col items-center text-center"
       >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="mb-8"
          >
             <Compass className="w-40 h-40 text-indigo-500 opacity-20" />
          </motion.div>
          <h1 className="text-[12rem] font-black tracking-tighter leading-none opacity-10 absolute -top-24 select-none">404</h1>
          <h2 className="text-5xl font-black mb-4 tracking-tighter">Lokasi Tidak Ditemukan</h2>
          <p className="text-white/40 max-w-sm mb-12">Sepertinya Anda tersesat di samudra visual kami yang sangat luas ini.</p>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-500 rounded-3xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-indigo-500/40"
          >
            <ArrowLeft className="w-5 h-5" /> Kembali Berlayar
          </button>
       </motion.div>
    </div>
  );
}

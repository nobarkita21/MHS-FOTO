import { motion } from "motion/react";
import { Hammer, CloudLightning as Lightning, Wind } from "lucide-react";

export default function Maintenance({ message, logo }: { message: string, logo: string }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 overflow-hidden flex flex-col items-center justify-center text-white p-6">
      {/* Lightning Effect */}
      <motion.div
        animate={{ opacity: [0, 0.5, 0, 0.8, 0, 0.3, 0] }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.15, 0.18, 0.2, 0.8, 1] }}
        className="absolute inset-0 bg-white z-0"
      />

      {/* Sea and Waves */}
      <div className="absolute bottom-0 w-full h-[60vh] opacity-20 pointer-events-none">
         <motion.div
            animate={{ x: [-20, 20, -20], y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/abhisheknaiidu/awesome-github-profile-readme/master/wave.svg')] bg-repeat-x bg-[length:1000px_100%] filter hue-rotate-180"
         />
      </div>

      {/* Ship / Logo Floating */}
      <motion.div
        animate={{ 
          rotate: [-5, 5, -5],
          y: [-10, 10, -10]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 mb-12"
      >
        <img src={logo} className="w-32 h-32 drop-shadow-[0_0_50px_rgba(99,102,241,0.5)]" />
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-4 bg-black/40 blur-xl rounded-full" />
      </motion.div>

      <div className="relative z-10 text-center space-y-6 max-w-xl">
         <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-500/20"
         >
            <Lightning className="w-4 h-4 fill-white" />
            Mode Pemeliharaan Aktif
         </motion.div>
         <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">Kami Sedang <br /><span className="text-rose-500">Berlabuh...</span></h1>
         <p className="text-white/40 text-lg font-medium leading-relaxed italic">"{message}"</p>
         
         <div className="pt-12 flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
               <Wind className="w-8 h-8 text-indigo-400 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Badai Sesaat</span>
            </div>
            <div className="h-12 w-[1px] bg-white/10" />
            <p className="text-left text-sm opacity-60">Kembali lagi dalam beberapa waktu.<br />Admin sedang bekerja keras.</p>
         </div>
      </div>
    </div>
  );
}

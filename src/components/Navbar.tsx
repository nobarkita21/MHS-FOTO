import { motion } from "motion/react";
import { Sun, Moon, LayoutDashboard, LogIn, LogOut, Search, User as UserIcon } from "lucide-react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { AppUser } from "../types";

export default function Navbar({ 
  user, 
  onThemeToggle, 
  theme, 
  logo,
  siteName,
  onOpenSearch
}: { 
  user: AppUser | null, 
  onThemeToggle: () => void, 
  theme: 'light' | 'dark',
  logo: string,
  siteName: string,
  onOpenSearch: () => void
}) {
  const isAdmin = user && ['Admin', 'Owner', 'Relawan'].includes(user.badge);

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto glass-panel px-6 py-3 rounded-2xl">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="font-bold text-xl text-black">W</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase">
            {siteName}<span className="text-cyan-400">.X</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={onOpenSearch} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Search className="w-5 h-5 text-gray-400" />
          </button>

          <button onClick={onThemeToggle} className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
            <motion.div
              initial={false}
              animate={{ rotate: theme === 'dark' ? 180 : 0, scale: theme === 'dark' ? 0 : 1 }}
              className="absolute inset-0 flex items-center justify-center p-2"
            >
              <Sun className="w-5 h-5 text-amber-500" />
            </motion.div>
            <motion.div
              initial={false}
              animate={{ rotate: theme === 'dark' ? 0 : -180, scale: theme === 'dark' ? 1 : 0 }}
              className="flex items-center justify-center"
            >
              <Moon className="w-5 h-5 text-cyan-400" />
            </motion.div>
          </button>

          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              {isAdmin && (
                <button 
                  onClick={() => window.location.href = '/admin'}
                  className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:bg-cyan-400 transition-all shadow-lg"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  DASHBOARD
                </button>
              )}
              <div className="relative group">
                <div className="w-10 h-10 rounded-full border-2 border-cyan-400 p-0.5">
                  <img src={user.photoURL || ""} alt="User" className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="absolute top-full right-0 mt-4 hidden group-hover:block transition-all z-50">
                  <div className="glass-panel p-4 rounded-2xl min-w-[200px] shadow-2xl backdrop-blur-2xl">
                    <p className="font-bold text-sm text-white">{user.displayName}</p>
                    <p className="text-[10px] text-white/40 mb-3">{user.email}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] bg-cyan-500 px-2 py-0.5 rounded-full text-black font-black uppercase tracking-widest">{user.badge}</span>
                    </div>
                    <button onClick={logout} className="w-full text-left text-rose-500 text-sm font-bold flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Keluar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={login}
              className="px-6 py-2 bg-cyan-400 text-black rounded-full text-xs font-black uppercase tracking-widest border border-cyan-400/50 hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-400/20"
            >
              MASUK
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

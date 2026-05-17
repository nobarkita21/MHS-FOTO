import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldAlert } from 'lucide-react';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Admin from './pages/Admin';
import Maintenance from './pages/Maintenance';
import NotFound from './pages/NotFound';
import { useSiteConfig, useAuth } from './hooks/useFirebase';

export default function App() {
  const config = useSiteConfig();
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user?.isBanned) {
    return (
      <div className="fixed inset-0 z-[10000] bg-red-950 flex flex-col items-center justify-center p-10 text-center">
         <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="mb-8">
            <ShieldAlert className="w-32 h-32 text-red-500" />
         </motion.div>
         <h1 className="text-4xl font-black text-white mb-4 italic">ANDA TELAH DIBANNED</h1>
         <p className="text-red-400 font-bold max-w-md">"Mending anda tidur daripada merusuh web ini."</p>
         <div className="mt-12 p-3 border border-red-500/20 rounded-2xl bg-red-500/5 text-[10px] text-red-500 font-mono tracking-widest">
            UID: {user.uid}
         </div>
      </div>
    );
  }

  // Global Maintenance Lock
  const isOwner = user?.email === 'abibdep@gmail.com' || user?.badge === 'Owner';
  if (config.maintenanceMode && !isOwner) {
    return <Maintenance message={config.maintenanceMessage} logo={config.logoUrl} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/p/:id" element={<PostDetail />} />
        <Route path="/admin" element={['Admin', 'Owner', 'Relawan'].includes(user?.badge || "") ? <Admin /> : <Navigate to="/" />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

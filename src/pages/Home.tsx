import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Post, Category } from "../types";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import SearchOverlay from "../components/SearchOverlay";
import Splash from "../components/Splash";
import { useAuth, useSiteConfig } from "../hooks/useFirebase";
import { motion, AnimatePresence } from "motion/react";
import RippleButton from "../components/UI";
import { ChevronRight } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const config = useSiteConfig();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const qPosts = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
    const unsubPosts = onSnapshot(qPosts, (snap) => {
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Post));
      setLoading(false);
    });

    const qCats = query(collection(db, "categories"), orderBy("count", "desc"));
    const unsubCats = onSnapshot(qCats, (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Category));
    });

    return () => {
      unsubPosts();
      unsubCats();
    };
  }, []);

  const filteredPosts = activeCategory === "Semua" 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen">
      <Splash logo={config.logoUrl} />
      <Navbar 
        user={user} 
        siteName={config.siteName}
        logo={config.logoUrl}
        theme={theme}
        onThemeToggle={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Hero Section */}
      <header className="pt-40 pb-16 px-4 relative">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
           <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full" />
           <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/60"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Wallpaper Premium 2026
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-none"
          >
            NEXGEN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">IMMERSIVE</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto text-sm text-white/40 font-medium leading-relaxed"
          >
            Koleksi video wallpaper 8K dan background smartphone ultra-ekstrim untuk perangkat flagship masa depan.
          </motion.p>

          {/* Categories */}
          <div className="pt-12 overflow-x-auto no-scrollbar category-scroll flex items-center justify-center gap-2 px-4">
             <button
                onClick={() => setActiveCategory("Semua")}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === "Semua" ? "bg-cyan-400 text-black shadow-xl shadow-cyan-400/20" : "bg-white/5 hover:bg-white/10 text-white/60 border border-white/5"
                }`}
             >
                Semua
             </button>
             {categories.map(cat => (
               <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeCategory === cat.name ? "bg-cyan-400 text-black shadow-xl shadow-cyan-400/20" : "bg-white/5 hover:bg-white/10 text-white/60 border border-white/5"
                  }`}
               >
                  {cat.name}
               </button>
             ))}
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 pb-32">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[4/3] bg-white/5 rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>

      {/* Wave Footer */}
      <div className="relative h-64 overflow-hidden -mt-16 pointer-events-none">
        <div className="wave-bg h-40 opacity-50 translate-x-10 animate-pulse" />
        <div className="wave-bg h-48 opacity-30 -translate-x-20" />
      </div>

      <footer className="bg-slate-950 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
              <img src={config.logoUrl} className="w-12 h-12" />
              <div className="text-left">
                <p className="text-2xl font-black tracking-tighter">{config.siteName}</p>
                <p className="text-xs text-white/40">© 2026 {config.siteName} Premium</p>
              </div>
           </div>
           
           <div className="flex gap-8 text-sm font-bold text-white/60">
              <a href="#" className="hover:text-white transition-colors">Tentang Kami</a>
              <a href="#" className="hover:text-white transition-colors">Hak Cipta</a>
              <a href="#" className="hover:text-white transition-colors">Privasi</a>
              <a href="#" className="hover:text-white transition-colors">Syarat</a>
           </div>
        </div>
      </footer>
    </div>
  );
}

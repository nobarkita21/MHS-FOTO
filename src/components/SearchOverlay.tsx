import { motion, AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Post } from "../types";

export default function SearchOverlay({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm) {
      setResults([]);
      return;
    }
    setLoading(true);
    const delay = setTimeout(async () => {
      const q = query(
        collection(db, "posts"),
        where("title", ">=", searchTerm),
        where("title", "<=", searchTerm + "\uf8ff"),
        limit(5)
      );
      const snap = await getDocs(q);
      setResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Post));
      setLoading(false);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
        >
          <div className="w-full max-w-2xl">
            <div className="flex justify-end mb-4">
              <button onClick={onClose} className="p-3 bg-white/10 rounded-full hover:bg-white/20">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="rgb-search-shadow glass-panel rounded-2xl overflow-hidden p-8 backdrop-blur-3xl">
                <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                  <Search className="w-8 h-8 text-cyan-400" />
                  <input
                    autoFocus
                    placeholder="Search visuals..."
                    className="flex-1 bg-transparent text-4xl font-black text-white outline-none placeholder:text-white/10 uppercase tracking-tighter"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {loading && <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />}
                </div>

                <div className="mt-8 space-y-3">
                  {results.length > 0 ? results.map(post => (
                    <motion.div
                      key={post.id}
                      whileHover={{ x: 10 }}
                      className="flex items-center gap-4 p-4 rounded-xl cursor-pointer group bg-white/5 hover:bg-cyan-400/10 transition-all border border-transparent hover:border-cyan-400/30"
                      onClick={() => window.location.href = `/p/${post.id}`}
                    >
                      <img src={post.thumbnailUrl || post.mediaUrl} className="w-20 h-20 rounded-lg object-cover border border-white/10" />
                      <div>
                        <p className="text-white font-black uppercase tracking-widest text-[10px] text-cyan-400 mb-1">{post.category}</p>
                        <p className="text-white font-bold text-lg leading-none">{post.title}</p>
                      </div>
                    </motion.div>
                  )) : searchTerm && !loading ? (
                    <p className="text-center text-white/20 py-12 font-black uppercase tracking-[0.2em] text-xs">No Results Found</p>
                  ) : (
                    <div className="text-center text-white/20 py-12 font-black uppercase tracking-[0.2em] text-xs">Start typing to explore...</div>
                  )}
                </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

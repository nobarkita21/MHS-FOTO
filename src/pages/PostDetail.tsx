import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, increment, collection, query, where, limit, getDocs } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Post, AppUser } from "../types";
import Navbar from "../components/Navbar";
import { useAuth, useSiteConfig } from "../hooks/useFirebase";
import { motion } from "motion/react";
import { Eye, Heart, MessageCircle, Share2, Download, User, Calendar, ShieldCheck } from "lucide-react";
import { formatCount } from "../lib/utils";
import RippleButton from "../components/UI";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const config = useSiteConfig();
  const [post, setPost] = useState<Post | null>(null);
  const [theme, setTheme] = useState<'light'|'dark'>('dark');
  const [related, setRelated] = useState<Post[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      const docRef = doc(db, "posts", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as Post;
        setPost({ id: snap.id, ...data });
        // Increment views
        updateDoc(docRef, { views: increment(1) });

        // Fetch related
        const q = query(collection(db, "posts"), where("category", "==", data.category), limit(4));
        const relSnap = await getDocs(q);
        setRelated(relSnap.docs.filter(d => d.id !== id).map(d => ({ id: d.id, ...d.data() }) as Post));
      }
    };
    fetchPost();
  }, [id]);

  if (!post) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-400 selection:text-black">
      <Navbar 
        user={user} 
        logo={config.logoUrl} 
        siteName={config.siteName} 
        theme="dark" 
        onThemeToggle={() => {}} 
        onOpenSearch={() => {}} 
      />

      <div className="pt-24 min-h-screen flex flex-col items-center">
        {/* Background Blur */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img src={post.thumbnailUrl || post.mediaUrl} className="w-full h-full object-cover blur-[120px] opacity-20 scale-125" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/80 to-black" />
        </div>

        <main className="relative z-10 w-full max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
          {/* Media View */}
          <div className="flex-1 space-y-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative rounded-3xl overflow-hidden glass-panel p-2 shadow-2xl"
            >
              <div className="rounded-[1.4rem] overflow-hidden">
                {post.type === 'video' ? (
                  <video src={post.mediaUrl} controls autoPlay className="w-full aspect-[4/3] object-cover" />
                ) : (
                  <img src={post.mediaUrl} className="w-full aspect-[4/3] object-cover" />
                )}
              </div>
            </motion.div>

            <div className="flex items-center justify-between p-6 glass-panel rounded-2xl">
              <div className="flex items-center gap-6">
                 <div className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="p-3 bg-white/5 rounded-xl group-hover:bg-rose-500/20 group-hover:text-rose-500 transition-all border border-white/5">
                      <Heart className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black opacity-40">{formatCount(post.likes)}</span>
                 </div>
                 <div className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="p-3 bg-white/5 rounded-xl group-hover:bg-cyan-400 group-hover:text-black transition-all border border-white/5">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black opacity-40">{formatCount(post.shares)}</span>
                 </div>
                 <div className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white group-hover:text-black transition-all border border-white/5">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black opacity-40">CHAT</span>
                 </div>
              </div>

              <div className="rgb-border">
                <button
                  className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-cyan-400 hover:text-black transition-all"
                  onClick={() => window.open(post.mediaUrl, '_blank')}
                >
                  <Download className="w-4 h-4" />
                  UNDUH 8K
                  <span className="text-[8px] opacity-40 ml-1">{post.fileSize}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="w-full lg:w-96 space-y-6">
            <div className="p-8 glass-panel rounded-3xl space-y-8">
               <div className="space-y-4">
                  <h1 className="text-4xl font-black tracking-tighter leading-none">{post.title}</h1>
                  <p className="text-white/40 text-sm leading-relaxed whitespace-pre-wrap">{post.description || 'Tidak ada deskripsi visual.'}</p>
               </div>

               <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                  <div className="p-1 rounded-full border-2 border-cyan-400">
                    <img src={post.authorPhoto || ""} className="w-12 h-12 rounded-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <p className="font-bold text-sm">{post.authorName}</p>
                       <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-[9px] uppercase font-black tracking-widest text-cyan-400/60">Verified Visual Artist</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                     <p className="text-[8px] text-white/30 uppercase font-black mb-1 tracking-widest">Kategori</p>
                     <p className="font-bold text-[10px] text-cyan-400">{post.category}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                     <p className="text-[8px] text-white/30 uppercase font-black mb-1 tracking-widest">Views</p>
                     <p className="font-bold text-[10px]">{formatCount(post.views)}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                     <p className="text-[8px] text-white/30 uppercase font-black mb-1 tracking-widest">Year</p>
                     <p className="font-bold text-[10px]">2026</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                     <p className="text-[8px] text-white/30 uppercase font-black mb-1 tracking-widest">Type</p>
                     <p className="font-bold text-[10px] uppercase">{post.type}</p>
                  </div>
               </div>
            </div>

            {/* Recommendations */}
            <div className="pt-4">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-6">Discovery Next</p>
               <div className="grid grid-cols-2 gap-3">
                  {related.map(r => (
                    <motion.div
                      key={r.id}
                      whileHover={{ y: -5 }}
                      onClick={() => window.location.href = `/p/${r.id}`}
                      className="aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer relative group border border-white/10"
                    >
                      <img src={r.thumbnailUrl || r.mediaUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </motion.div>
                  ))}
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

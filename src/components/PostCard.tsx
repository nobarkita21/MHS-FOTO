import { motion } from "motion/react";
import { Eye, Heart, MessageCircle, Share2, Play } from "lucide-react";
import { Post } from "../types";
import { Badge } from "./UI";
import { formatCount } from "../lib/utils";

export default function PostCard({ post }: { post: Post }) {
  const isVideo = post.type === 'video';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="relative group bg-slate-900/40 rounded-2xl glossy-card transition-all overflow-hidden border border-white/10 active:scale-95"
      onClick={() => window.location.href = `/p/${post.id}`}
    >
      <div className="relative aspect-[4/5] sm:aspect-[9/16] md:aspect-[4/3] overflow-hidden">
        <img 
          src={post.thumbnailUrl || post.mediaUrl} 
          alt={post.title}
          className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000" 
        />
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-125 transition-transform border border-white/30">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
          </div>
        )}
        
        <Badge type={post.badge} />

        <div className="video-overlay absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <img src={post.authorPhoto || ""} className="w-6 h-6 rounded-full border border-white/20" />
               <span className="text-[11px] font-semibold text-white/90">{post.authorName}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">
            {post.category}
          </span>
          <div className="flex items-center gap-1 text-white/40 group-hover:text-cyan-400 transition-colors">
            <Eye className="w-3 h-3" />
            <span className="text-[10px] font-bold">{formatCount(post.views)} Views</span>
          </div>
        </div>
        
        <h3 className="text-sm font-bold tracking-tight line-clamp-1 mb-3 text-white/90">
          {post.title}
        </h3>

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button className="flex items-center gap-1.5 text-white/40 hover:text-rose-500 transition-colors">
            <Heart className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">{formatCount(post.likes)}</span>
          </button>
          <div className="flex gap-4">
             <MessageCircle className="w-3.5 h-3.5 text-white/40 hover:text-cyan-400 transition-colors cursor-pointer" />
             <Share2 className="w-3.5 h-3.5 text-white/40 hover:text-cyan-400 transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

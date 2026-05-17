import { useState, useEffect, useCallback } from "react";
import { collection, query, onSnapshot, getDocs, doc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp, getDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Post, AppUser, Category, SiteConfig } from "../types";
import { useAuth, useSiteConfig } from "../hooks/useFirebase";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, Image as ImageIcon, BarChart3, Settings, ShieldAlert,
  Plus, Trash2, Edit3, Ban, CheckCircle, Info, Upload, X,
  Clock, Heart, Eye, Share2, Hammer, Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { formatCount } from "../lib/utils";

type Menu = 'overview' | 'gallery' | 'users' | 'settings' | 'maintenance';

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const config = useSiteConfig();
  const [activeMenu, setActiveMenu] = useState<Menu>('overview');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadData, setUploadData] = useState({ title: "", type: "image", category: "Lainnya" });

  const isAdmin = user && ['Admin', 'Owner', 'Relawan'].includes(user.badge);
  const isOwner = user?.badge === 'Owner' || user?.email === 'abibdep@gmail.com';

  useEffect(() => {
    if (!isAdmin) return;
    const unsubPosts = onSnapshot(collection(db, "posts"), (snap) => setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Post)));
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }) as AppUser)));
    const unsubCats = onSnapshot(collection(db, "categories"), (snap) => setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Category)));
    return () => { unsubPosts(); unsubUsers(); unsubCats(); };
  }, [isAdmin]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
     const file = acceptedFiles[0];
     if (!file) return;
     if (file.size > 40 * 1024 * 1024) return alert("File terlalu besar (Max 40MB)");

     const reader = new FileReader();
     reader.readAsDataURL(file);
     reader.onload = async () => {
       setPreviewUrl(reader.result as string);
       setIsUploading(true);
       setUploadProgress(10);

       try {
         const res = await axios.post("/api/upload", {
           file: reader.result,
           fileName: file.name,
           fileType: file.type
         });
         
         if (res.data.url) {
           setUploadProgress(100);
           setPreviewUrl(res.data.url);
         }
       } catch (error) {
         alert("Upload gagal: " + error);
       } finally {
         setIsUploading(false);
       }
     };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [], 'video/*': [] } });

  const handleCreatePost = async () => {
    if (!previewUrl) return;
    const newPost: Post = {
      title: uploadData.title || "Untitled",
      type: uploadData.type as any,
      mediaUrl: previewUrl,
      thumbnailUrl: previewUrl,
      category: uploadData.category,
      authorId: user!.uid,
      authorName: user!.displayName || "Anom",
      authorPhoto: user!.photoURL || "",
      views: 0,
      likes: 0,
      shares: 0,
      badge: 'new',
      createdAt: serverTimestamp(),
      fileSize: "Unknown"
    };

    const docRef = doc(collection(db, "posts"));
    await setDoc(docRef, newPost);
    
    // Update or create category
    const catRef = doc(db, "categories", uploadData.category);
    const catSnap = await getDoc(catRef);
    if (!catSnap.exists()) {
      await setDoc(catRef, { name: uploadData.category, count: 1 });
    } else {
      await updateDoc(catRef, { count: increment(1) });
    }

    setPreviewUrl("");
    setUploadData({ title: "", type: "image", category: "Lainnya" });
  };

  const handleBanUser = async (uid: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "users", uid), { isBanned: !currentStatus });
  };

  if (authLoading) return null;
  if (!isAdmin) return <div className="h-screen flex items-center justify-center p-8 bg-black"><div className="bg-rose-500/10 text-rose-500 p-12 rounded-3xl text-center border border-rose-500/20"><ShieldAlert className="w-20 h-20 mx-auto mb-6" /><h1 className="text-3xl font-black uppercase">Terminated: Access Denied</h1></div></div>;

  const statsData = [
    { name: 'Mon', views: 400 },
    { name: 'Tue', views: 300 },
    { name: 'Wed', views: 800 },
    { name: 'Thu', views: 600 },
    { name: 'Fri', views: 1200 },
    { name: 'Sat', views: 900 },
    { name: 'Sun', views: 1500 },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-80 h-screen sticky top-0 bg-zinc-950 border-r border-white/5 overflow-y-auto p-8 space-y-12">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center font-black text-black shadow-lg shadow-cyan-400/20">W</div>
           <span className="text-xl font-black uppercase tracking-tighter">NEXGEN<span className="text-cyan-400">.OS</span></span>
        </div>

        <nav className="space-y-1">
           <NavItem icon={BarChart3} label="Overview" active={activeMenu === 'overview'} onClick={() => setActiveMenu('overview')} />
           <NavItem icon={ImageIcon} label="Gallery" active={activeMenu === 'gallery'} onClick={() => setActiveMenu('gallery')} />
           <NavItem icon={Users} label="Users" active={activeMenu === 'users'} onClick={() => setActiveMenu('users')} />
           <NavItem icon={Settings} label="System" active={activeMenu === 'settings'} onClick={() => setActiveMenu('settings')} />
           {isOwner && <NavItem icon={Hammer} label="DevMode" active={activeMenu === 'maintenance'} onClick={() => setActiveMenu('maintenance')} color="text-rose-500" />}
        </nav>

        <div className="pt-24">
           <div className="p-6 glass-panel rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                 <img src={user?.photoURL || ""} className="w-10 h-10 rounded-full border border-cyan-400 p-0.5 shadow-lg shadow-cyan-400/10" />
                 <div>
                    <p className="font-bold text-xs truncate w-32">{user?.displayName}</p>
                    <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">{user?.badge}</p>
                 </div>
              </div>
              <button onClick={() => window.location.href = '/'} className="w-full bg-white text-black py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-2">
                 VIEW SITE
              </button>
           </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-12 overflow-y-auto bg-black border-l border-white/5">
         <AnimatePresence mode="wait">
            {activeMenu === 'overview' && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-12">
                 <div className="flex justify-between items-end">
                    <div>
                       <h2 className="text-5xl font-black tracking-tighter uppercase">Nexus Command</h2>
                       <p className="text-white/20 text-xs font-medium tracking-[0.2em] uppercase mt-1">Real-time system synchronization active</p>
                    </div>
                    <div className="flex gap-3">
                       <StatCard icon={ImageIcon} label="Postings" value={posts.length} color="cyan" />
                       <StatCard icon={Users} label="Auth Users" value={users.length} color="blue" />
                       <StatCard icon={Zap} label="Synced" value="100%" color="amber" />
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 p-8 glass-panel rounded-3xl h-[400px]">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2 text-cyan-400"><BarChart3 className="w-4 h-4" /> Visual Throughput</p>
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={statsData}>
                            <defs>
                              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                            <Area type="monotone" dataKey="views" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="p-8 glass-panel rounded-3xl space-y-6">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5 pb-4">Live Logs</p>
                       <div className="space-y-4 overflow-y-auto max-h-[300px] no-scrollbar">
                         {posts.slice(0, 5).map(p => (
                            <div key={p.id} className="flex gap-3 text-[11px] items-center p-2 rounded-lg bg-white/5 border border-white/5">
                               <div className="w-8 h-8 rounded bg-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-400/20"><ImageIcon className="w-4 h-4 text-black" /></div>
                               <div className="flex-1 overflow-hidden">
                                  <p className="font-bold truncate text-white/80">{p.title}</p>
                                  <p className="text-[9px] text-cyan-400/60 font-black uppercase tracking-widest">New Deployment</p>
                               </div>
                            </div>
                         ))}
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeMenu === 'gallery' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                 <div className="flex justify-between items-center">
                    <h2 className="text-4xl font-black tracking-tighter uppercase">Content Core</h2>
                    <div className="flex gap-2">
                       <button className="bg-white/5 p-2 rounded-lg text-white/40"><Settings className="w-5 h-5" /></button>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 glass-panel rounded-3xl space-y-6">
                       <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Intake Terminal</p>
                       <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${isDragActive ? 'border-cyan-400 bg-cyan-400/5' : 'border-white/10 hover:border-cyan-400/40'}`}>
                          <input {...getInputProps()} />
                          <Upload className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Upload Source File</p>
                          <p className="text-[9px] opacity-30 mt-2">UHD 8K / ProRes / Max 40MB</p>
                       </div>

                       {previewUrl && (
                         <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-white/10">
                            {uploadData.type === 'video' ? <video src={previewUrl} className="w-full h-full object-cover" /> : <img src={previewUrl} className="w-full h-full object-cover" />}
                            <button onClick={() => setPreviewUrl("")} className="absolute top-2 right-2 p-1.5 bg-rose-500 rounded-full shadow-lg shadow-rose-500/20"><X className="w-3 h-3 text-white" /></button>
                            {isUploading && (
                               <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8">
                                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                     <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-cyan-400" />
                                  </div>
                                  <p className="text-[9px] font-black mt-3 tracking-[0.3em] text-cyan-400">UPLOADING... {uploadProgress}%</p>
                               </div>
                            )}
                         </div>
                       )}

                       <div className="grid grid-cols-2 gap-3">
                          <input 
                            placeholder="Visual ID / Title" 
                            className="col-span-2 bg-white/5 px-5 py-4 rounded-xl outline-none focus:ring-1 ring-cyan-400 text-sm font-bold placeholder:text-white/10"
                            value={uploadData.title}
                            onChange={e => setUploadData(d => ({ ...d, title: e.target.value }))}
                          />
                          <select 
                            className="bg-white/5 px-5 py-4 rounded-xl outline-none text-[10px] font-black uppercase tracking-widest custom-select"
                            value={uploadData.type}
                            onChange={e => setUploadData(d => ({ ...d, type: e.target.value as any }))}
                          >
                             <option value="image">Image Engine</option>
                             <option value="video">Video Engine</option>
                          </select>
                          <input 
                            placeholder="Tag Section" 
                            className="bg-white/5 px-5 py-4 rounded-xl outline-none text-[10px] font-black uppercase tracking-widest"
                            value={uploadData.category}
                            onChange={e => setUploadData(d => ({ ...d, category: e.target.value }))}
                          />
                       </div>
                       <button 
                         onClick={handleCreatePost}
                         disabled={!previewUrl || isUploading}
                         className="w-full py-5 bg-cyan-400 text-black rounded-xl font-black tracking-[0.2em] uppercase text-xs hover:bg-cyan-300 disabled:opacity-20 transition-all shadow-lg shadow-cyan-400/20"
                       >
                         Initialize Publication
                       </button>
                    </div>

                    <div className="p-8 glass-panel rounded-3xl space-y-6 overflow-y-auto h-[700px] no-scrollbar">
                       <p className="text-[10px] font-black uppercase tracking-widest sticky top-0 bg-zinc-950/80 backdrop-blur-md py-2 border-b border-white/5 text-cyan-400 animate-pulse">Deployed Syncs ({posts.length})</p>
                       <div className="grid gap-3">
                          {posts.map(p => (
                            <div key={p.id} className="flex gap-4 p-3 bg-white/5 rounded-xl group relative border border-white/5 hover:border-cyan-400/30 transition-all shadow-lg shadow-black/40">
                               <img src={p.thumbnailUrl || p.mediaUrl} className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                               <div className="flex-1 overflow-hidden">
                                  <p className="font-bold text-xs truncate mb-1">{p.title}</p>
                                  <div className="flex gap-4 text-[9px] uppercase font-black text-white/30">
                                     <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-cyan-400" /> {formatCount(p.views)}</span>
                                     <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-500" /> {formatCount(p.likes)}</span>
                                  </div>
                               </div>
                               <button onClick={() => deleteDoc(doc(db, "posts", p.id!))} className="p-2 h-fit bg-rose-500/10 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white">
                                    <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeMenu === 'users' && (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-8">
                  <h2 className="text-4xl font-black tracking-tighter uppercase">Nexus Citizens</h2>
                  <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
                     <table className="w-full text-left">
                        <thead className="bg-white/5">
                           <tr>
                              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">User Identity</th>
                              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Credential</th>
                              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Status</th>
                              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Operations</th>
                           </tr>
                        </thead>
                        <tbody>
                           {users.map(u => (
                             <tr key={u.uid} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-6">
                                   <div className="flex items-center gap-4">
                                      <img src={u.photoURL || ""} className="w-10 h-10 rounded-full border border-cyan-400 p-0.5 shadow-lg shadow-cyan-400/20" />
                                      <div>
                                         <p className="font-bold text-xs">{u.displayName}</p>
                                         <p className="text-[10px] text-white/20">{u.email}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="p-6">
                                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.badge === 'Owner' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/20'}`}>
                                      {u.badge}
                                   </span>
                                </td>
                                <td className="p-6">
                                   {u.isBanned ? <span className="text-rose-500 text-[10px] font-black uppercase flex items-center gap-2"><Ban className="w-4 h-4" /> Terminated</span> : <span className="text-cyan-400 text-[10px] font-black uppercase flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Active</span>}
                                </td>
                                <td className="p-6">
                                   <button 
                                     onClick={() => handleBanUser(u.uid, u.isBanned)}
                                     className={`p-2 rounded-lg transition-all ${u.isBanned ? 'bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400 hover:text-black' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'}`}
                                   >
                                     <Ban className="w-4 h-4" />
                                   </button>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </motion.div>
            )}

            {activeMenu === 'settings' && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl space-y-8">
                  <h2 className="text-4xl font-black tracking-tighter uppercase">Core Config</h2>
                  <div className="p-8 glass-panel rounded-3xl space-y-8">
                     <div className="space-y-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Global Parameters</p>
                        <div className="flex flex-col gap-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Nexus Designation</label>
                           <input 
                             className="bg-white/5 p-5 rounded-xl outline-none focus:ring-1 ring-cyan-400 text-sm font-bold shadow-inner" 
                             defaultValue={config.siteName}
                             onBlur={(e) => updateDoc(doc(db, "siteConfig", "global"), { siteName: e.target.value })}
                           />
                        </div>
                        <div className="flex flex-col gap-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Logo Asset Matrix (URL)</label>
                           <input 
                             className="bg-white/5 p-5 rounded-xl outline-none focus:ring-1 ring-cyan-400 text-sm font-bold shadow-inner" 
                             defaultValue={config.logoUrl}
                             onBlur={(e) => updateDoc(doc(db, "siteConfig", "global"), { logoUrl: e.target.value })}
                           />
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeMenu === 'maintenance' && isOwner && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl space-y-8">
                  <h2 className="text-4xl font-black tracking-tighter text-rose-500 uppercase">Emergency Override</h2>
                  <div className="p-8 glass-panel rounded-3xl space-y-8 border border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.05)]">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="font-black text-sm uppercase tracking-widest">Freeze Protocol</p>
                           <p className="text-[10px] text-white/20 mt-1 uppercase">Redirect all uplink traffic to maintenance layer.</p>
                        </div>
                        <button 
                          onClick={() => updateDoc(doc(db, "siteConfig", "global"), { maintenanceMode: !config.maintenanceMode })}
                          className={`w-14 h-7 rounded-full relative transition-colors ${config.maintenanceMode ? 'bg-rose-500 shadow-lg shadow-rose-500/40' : 'bg-white/10'}`}
                        >
                           <motion.div 
                             animate={{ x: config.maintenanceMode ? 28 : 4 }}
                             className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg" 
                           />
                        </button>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Status Broadcast Message</label>
                        <textarea 
                          rows={4}
                          className="w-full bg-white/5 p-5 rounded-xl outline-none focus:ring-1 ring-rose-500 text-sm font-bold shadow-inner" 
                          defaultValue={config.maintenanceMessage}
                          onBlur={(e) => updateDoc(doc(db, "siteConfig", "global"), { maintenanceMessage: e.target.value })}
                        />
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick, color }: { icon: any, label: string, active: boolean, onClick: () => void, color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all relative overflow-hidden group ${
        active ? 'bg-cyan-400 text-black shadow-xl shadow-cyan-400/20' : `hover:bg-white/5 text-white/40 ${color}`
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-black' : 'text-cyan-400/60 group-hover:text-cyan-400'}`} />
      {label}
      {active && <motion.div layoutId="nav-active" className="absolute left-0 top-0 bottom-0 w-1 bg-white" />}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: any, color: string }) {
  const colors: any = {
    cyan: "border-cyan-400/30 text-cyan-400 bg-cyan-400/5 shadow-lg shadow-cyan-400/5",
    blue: "border-blue-500/30 text-blue-400 bg-blue-500/5 shadow-lg shadow-blue-500/5",
    amber: "border-amber-500/30 text-amber-400 bg-amber-500/5 shadow-lg shadow-amber-500/5"
  };
  return (
    <div className={`p-5 rounded-2xl min-w-[140px] border glass-panel ${colors[color]}`}>
       <div className="flex items-center gap-2 mb-2">
          <Icon className="w-3 h-3" />
          <p className="text-[8px] font-black uppercase tracking-widest opacity-60">{label}</p>
       </div>
       <p className="text-2xl font-black tracking-tighter">{value}</p>
    </div>
  );
}

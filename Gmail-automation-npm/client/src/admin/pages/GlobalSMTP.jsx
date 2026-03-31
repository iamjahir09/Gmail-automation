import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Server, 
  Mail, 
  RefreshCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const GlobalSMTP = () => {
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 587,
    email: '',
    password: '',
    fromName: '',
    assignedUserId: ''
  });
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAccounts();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('${import.meta.env.VITE_API_URL}/api/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('${import.meta.env.VITE_API_URL}/api/accounts');
      setAccounts(res.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('${import.meta.env.VITE_API_URL}/api/accounts', formData);
      setMsg({ type: 'success', text: 'SMTP relay added successfully!' });
      setFormData({ name: '', host: '', port: 587, email: '', password: '', fromName: '', assignedUserId: '' });
      setShowForm(false);
      fetchAccounts();
    } catch (error) {
      setMsg({ type: 'error', text: error.response?.data?.error || 'Failed to add SMTP account' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently disconnect this SMTP node?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/accounts/${id}`);
      fetchAccounts();
    } catch (error) {
      console.error("Delete failed:", error);
      setMsg({ type: 'error', text: 'Failed to delete SMTP relay' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
            <Server className="w-8 h-8 mr-3 text-indigo-400" />
            Global SMTP Relays
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Manage master delivery nodes shared across the platform infrastructure.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:scale-105 transition-all"
        >
          {showForm ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Cancel Connection' : 'Register New SMTP'}</span>
        </button>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-xl flex items-center font-mono text-sm ${
          msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mr-3" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0 mr-3" />}
          <span>{msg.text}</span>
          <button onClick={() => setMsg({ type: '', text: '' })} className="ml-auto hover:text-white transition-colors"><XCircle className="w-4 h-4" /></button>
        </div>
      )}

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-slide-up max-w-3xl">
          <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4 flex items-center">
            <Server className="w-5 h-5 mr-3 text-indigo-400" />
            Node Connection Parameters
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Node Identifier (Friendly Name)</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-700"
                  placeholder="e.g. AWS SES Node A"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Sender Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-700"
                  placeholder="e.g. OrbitX Communications"
                  value={formData.fromName}
                  onChange={(e) => setFormData({...formData, fromName: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SMTP Host URI</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-700 font-mono"
                  placeholder="smtp.provider.com"
                  value={formData.host}
                  onChange={(e) => setFormData({...formData, host: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Port Configuration</label>
                <input 
                  type="number" 
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-700 font-mono"
                  placeholder="587"
                  value={formData.port}
                  onChange={(e) => setFormData({...formData, port: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-2">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Authentication Email</label>
                 <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input 
                     type="email" 
                     required
                     className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-700 font-mono"
                     placeholder="postmaster@domain.com"
                     value={formData.email}
                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                   />
                 </div>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Credential</label>
                 <div className="relative">
                   <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input 
                     type="password" 
                     required
                     className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-700 font-mono"
                     placeholder="••••••••••••"
                     value={formData.password}
                     onChange={(e) => setFormData({...formData, password: e.target.value})}
                   />
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-5 py-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assign Node Ownership (Optional)</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-700"
                  value={formData.assignedUserId}
                  onChange={(e) => setFormData({...formData, assignedUserId: e.target.value})}
                >
                  <option value="">-- Assign Globally to Admins --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name || u.email} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest mt-4 hover:bg-indigo-500 transition-colors flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>{isSubmitting ? 'Verifying Parameters...' : 'Initialize Node Connection'}</span>
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             <div className="col-span-full py-20 text-center text-slate-500 italic font-mono">Pinging SMTP nodes...</div>
        ) : accounts.length > 0 ? (
          accounts.map((acc) => (
            <div key={acc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 group hover:border-slate-700 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Server className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              </div>

              <h4 className="font-bold text-white text-lg tracking-tight mb-1">{acc.name}</h4>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono">HOST: {acc.host}</p>
              <div className="mt-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg inline-block text-[10px] uppercase tracking-widest font-black text-indigo-400">
                OWNER: {acc.user?.name || acc.user?.email || 'GLOBAL ADMIN'}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="w-[70%]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center">
                    <Mail className="w-3 h-3 mr-1" /> Bound Address
                  </p>
                  <p className="text-sm font-medium text-slate-300 truncate font-mono">
                    {acc.email}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <button className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all">
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(acc.id)}
                    disabled={deletingId === acc.id}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === acc.id ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-slate-900/50 py-20 rounded-2xl border-dashed border-2 border-slate-800 flex flex-col items-center justify-center">
            <Server className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-white">Cluster Empty</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
              Deploy your first SMTP delivery node to initialize the global email scheduling pool.
            </p>
            <button 
               onClick={() => setShowForm(true)}
               className="mt-6 text-indigo-400 font-bold text-sm bg-indigo-500/10 border border-indigo-500/20 px-6 py-2.5 rounded-xl hover:bg-indigo-500/20 transition-all font-mono"
            >
              Init SMTP Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSMTP;

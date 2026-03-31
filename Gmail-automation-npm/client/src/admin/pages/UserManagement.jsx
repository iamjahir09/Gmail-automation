import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  X,
  CreditCard
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, formData);
      setMsg({ type: 'success', text: 'System user provisioned successfully.' });
      setShowForm(false);
      setFormData({ name: '', email: '', password: '', role: 'USER' });
      fetchUsers();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to provision user' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('IRREVERSIBLE ACTION: Are you sure you want to delete this user and all their campaigns?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
            <Users className="w-8 h-8 mr-3 text-indigo-400" />
            User Access Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Control platform access, provision accounts, and manage system roles.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:scale-105 transition-all"
        >
          {showForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>{showForm ? 'Cancel Provisioning' : 'Provision User'}</span>
        </button>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-xl flex items-center font-mono text-sm ${
          msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>{msg.text}</span>
          <button onClick={() => setMsg({ type: '', text: '' })} className="ml-auto hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
      )}

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-slide-up max-w-3xl">
          <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4">New Account Configuration</h3>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Display Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-700"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Login Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-700 font-mono"
                  placeholder="john@orbitx.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Initial Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-white placeholder-slate-700 font-mono"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">System Clearance</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-white"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="USER">USER - Standard Campaign Access</option>
                  <option value="ADMIN">ADMIN - Global System Override</option>
                </select>
              </div>
            </div>
            
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest mt-4 hover:bg-indigo-500 transition-colors">
              Deploy User Account
            </button>
          </form>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <h3 className="font-bold text-white flex items-center">
              <Users className="w-4 h-4 mr-2 text-indigo-400" />
              Active Users Database
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search identities..." className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500/50" />
            </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-slate-950/50 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identity</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Clearance Level</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Provision Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-20 italic text-slate-500 font-mono">Querying database...</td></tr>
            ) : users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${
                        u.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {u.name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">{u.name || 'Anonymous Identifier'}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      u.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {u.role === 'ADMIN' ? <ShieldCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                      <span>{u.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500 font-mono">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 text-right flex justify-end space-x-2">
                     <button className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                        <CreditCard className="w-4 h-4" />
                     </button>
                    {u.role !== 'ADMIN' && (
                      <button 
                        onClick={() => handleDelete(u.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center py-20 text-slate-500 italic">No external identities found in cluster.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;

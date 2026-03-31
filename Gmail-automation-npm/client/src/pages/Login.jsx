import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  Loader2
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('${import.meta.env.VITE_API_URL}/api/auth/login', { email, password });
      login(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary flex items-center justify-center rounded-2xl shadow-xl shadow-blue-500/20 mb-6 group hover:rotate-6 transition-transform">
            <Send className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            OrbitX Mail
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Production-Grade Bulk Automation
          </p>
        </div>

        <div className="card-premium p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center space-x-3 text-red-600 dark:text-red-400 text-sm animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white placeholder-slate-400"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Password</label>
                <a href="#" className="text-xs font-bold text-primary hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white placeholder-slate-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-4 text-lg shadow-xl shadow-blue-500/20 flex items-center justify-center space-x-2 group active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Unlock Workspace</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
             New user? <span className="text-primary font-bold">Contact your admin</span> for credentials.
          </p>
          <div className="pt-4 flex items-center justify-center space-x-6 text-xs text-slate-400 font-medium">
             <span className="hover:text-primary cursor-pointer">Security Center</span>
             <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
             <span className="hover:text-primary cursor-pointer">Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

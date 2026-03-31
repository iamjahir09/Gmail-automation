import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  Search, 
  ShieldCheck, 
  ChevronDown
} from 'lucide-react';

const AdminNavbar = () => {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
      <div className="flex-1 max-w-xl relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
        <input 
          type="text" 
          placeholder="Search users, SMTP logs, or audit trails..." 
          className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm text-white placeholder-slate-600"
        />
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative p-2 text-slate-400 hover:bg-slate-800 rounded-xl transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-800"></div>

        <div className="flex items-center space-x-4 group cursor-pointer">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-white uppercase tracking-tighter">
              {user?.name || 'Administrator'}
            </p>
            <div className="flex items-center justify-end space-x-1">
               <ShieldCheck className="w-3 h-3 text-indigo-400" />
               <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none">
                 {user?.role || 'ADMIN'}
               </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform border border-indigo-400/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;

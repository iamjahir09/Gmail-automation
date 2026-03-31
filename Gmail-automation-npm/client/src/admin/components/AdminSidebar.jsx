import React from 'react';
import { 
  BarChart3, 
  Settings, 
  Users, 
  Mail, 
  ChevronRight,
  LogOut,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ currentTab, setCurrentTab }) => {
  const { logout } = useAuth();

  const adminItems = [
    { id: 'dashboard', icon: BarChart3, label: 'System Overview' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'smtp', icon: Mail, label: 'Global SMTP Pool' },
    { id: 'audit', icon: Activity, label: 'Audit Logs' },
    { id: 'settings', icon: Settings, label: 'System Settings' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 transition-colors duration-300">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 bg-indigo-600 flex items-center justify-center rounded-xl shadow-lg shadow-indigo-500/20">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          OrbitX Admin
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Command Center</p>
        {adminItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
              currentTab === item.id 
                ? 'bg-indigo-500/10 text-indigo-400' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-[15px]">{item.label}</span>
            </div>
            {currentTab === item.id && <ChevronRight className="w-4 h-4" />}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={logout}
          className="w-full flex items-center space-x-3 p-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-[15px]">Secure Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

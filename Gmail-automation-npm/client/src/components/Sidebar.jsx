import React from 'react';
import { 
  BarChart3, 
  Send, 
  Settings, 
  Users, 
  Mail, 
  PieChart, 
  Layers,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'overview', icon: PieChart, label: 'Overview' },
    { id: 'inbox', icon: Inbox, label: 'Master Inbox' },
    { id: 'campaigns', icon: Send, label: 'Campaigns' },
    { id: 'templates', icon: Layers, label: 'Templates' },
    { id: 'leads', icon: Users, label: 'Leads' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-72 h-screen bg-transparent flex flex-col fixed left-0 top-0 transition-all duration-300 z-50 animate-precision-reveal p-4">
      <div className="precision-card h-full flex flex-col overflow-hidden">
        
        <div className="p-8 flex items-center space-x-3">
          <div className="w-10 h-10 bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center rounded-xl shadow-lg">
            <Send className="text-white dark:text-neutral-900 w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-black dark:text-white">
            OrbitX
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 group ${
                currentTab === item.id 
                  ? 'bg-neutral-100 dark:bg-[#16181b] text-black dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/[0.08]' 
                  : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-white/[0.03] hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-4">
                <item.icon className={`w-5 h-5 ${currentTab === item.id ? 'text-primary' : 'opacity-70'}`} />
                <span className="font-bold text-[14px] tracking-tight">{item.label}</span>
              </div>
              {currentTab === item.id && <ChevronRight className="w-4 h-4 opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-black/5 dark:border-white/[0.06]">
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-3 p-3 rounded-xl text-neutral-400 hover:bg-red-50 dark:hover:bg-red-500/5 hover:text-red-500 transition-all duration-200 font-bold text-xs uppercase tracking-widest"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Settings as SettingsIcon, 
  Database, 
  Bell, 
  Shield, 
  Save, 
  ShieldCheck,
  Mail,
  Zap
} from 'lucide-react';

const Settings = () => {
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Platform Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Configure your workspace, security, and global delivery limits.
          </p>
        </div>
        <button className="btn-primary flex items-center space-x-2 px-6 shadow-lg shadow-blue-500/20 opacity-80 cursor-not-allowed">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8">
        <div className="w-full md:w-64 space-y-1">
          {[
            { id: 'profile', label: 'Profile Settings', icon: User },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                activeSubTab === item.id 
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-primary font-bold border-l-4 border-primary' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-6">
          <div className="card-premium">
             <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-primary rounded-xl">
                   <User className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Account Personalization</h3>
                   <span className="text-xs text-slate-400">Settings applied to your current active profile.</span>
                </div>
             </div>

             <div className="flex flex-col space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={user?.name || 'AgenticOrbitx User'}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-slate-400 text-slate-500 font-medium cursor-not-allowed opacity-70"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue={user?.email || 'user@agenticorbitx.com'}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-slate-400 text-slate-500 font-medium cursor-not-allowed opacity-70"
                    disabled
                  />
                </div>
             </div>
          </div>

          <div className="card-premium">
             <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl">
                   <Mail className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Global Sending Safeguards</h3>
                   <span className="text-xs text-slate-400">Rules applied to all automated campaigns.</span>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                   <div className="flex items-center space-x-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">Enable Daily Safety Limit</p>
                        <p className="text-xs text-slate-400">Automatically pause sending when daily limit is reached.</p>
                      </div>
                   </div>
                   <div 
                     onClick={() => alert("Global safeguards are strictly managed by AgenticOrbitx administrators to ensure your domain reputation safety. Please contact support to adjust limits.")}
                     className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer hover:shadow-lg transition-all"
                   >
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                   </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                   <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">Email Notifications</p>
                        <p className="text-xs text-slate-400">Get alerted for campaign completion or SMTP errors.</p>
                      </div>
                   </div>
                   <div 
                     onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                     className={`w-12 h-6 rounded-full relative cursor-pointer hover:shadow-lg transition-all ${notificationsEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-800'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${notificationsEnabled ? 'left-7' : 'left-1'}`}></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

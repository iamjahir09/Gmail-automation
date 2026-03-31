import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Bell, 
  Search, 
  User, 
  ChevronDown,
  Shield,
  Sun,
  Moon
} from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="h-20 bg-transparent flex items-center justify-between px-10 sticky top-0 z-40 transition-all duration-300 animate-precision-reveal border-b border-black/5 dark:border-white/[0.06]">
      <div className="flex-1 max-w-2xl relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400 group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full pl-12 pr-6 py-2.5 bg-neutral-100 dark:bg-white/[0.03] border border-transparent focus:border-black/5 dark:focus:border-white/10 rounded-xl outline-none transition-all text-sm font-medium dark:text-white placeholder-neutral-400"
        />
      </div>

      <div className="flex items-center space-x-6">
        <button 
          onClick={toggleTheme}
          className="relative p-2.5 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.05] rounded-xl transition-all duration-200"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="relative p-2.5 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.05] rounded-xl transition-all duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-[#08090a]"></span>
        </button>

        <div className="h-8 w-[1px] bg-black/5 dark:bg-white/10"></div>

        <div className="flex items-center space-x-4 group cursor-pointer">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-black dark:text-white tracking-tight">
              {user?.name || 'User'}
            </p>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none">
              {user?.role || 'Explorer'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg shadow-black/10 transition-transform duration-300">
            <User className="w-6 h-6" />
          </div>
          <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;

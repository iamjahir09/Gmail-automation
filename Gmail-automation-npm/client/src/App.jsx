import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Overview from './pages/Overview';
import CampaignBuilder from './pages/CampaignBuilder';
import Leads from './pages/Leads';
import Templates from './pages/Templates';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import AdminLayout from './admin/AdminLayout';
import Inbox from './pages/Inbox';
import { DataProvider, useData } from './context/DataContext';

const DashboardLayout = () => {
  const [draftTemplate, setDraftTemplate] = useState(null);
  const { isInitialized } = useData();
  const [currentTab, setCurrentTab] = useState(() => {
    return localStorage.getItem('orbitx_user_tab') || 'overview';
  });

  // Smart Skip: If we have cached data, don't show full loading handshake
  const hasCache = localStorage.getItem('ox_stats_v1') || localStorage.getItem('ox_logs_v1');
  const wasReady = sessionStorage.getItem('ox_v1_init') === 'true';
  const showOverlay = !isInitialized && !wasReady && !hasCache;

  React.useEffect(() => {
    localStorage.setItem('orbitx_user_tab', currentTab);
  }, [currentTab]);

  return (
    <div className="flex min-h-screen bg-transparent transition-colors duration-300">
      {/* Global Loading Overlay - Upgraded Dark Professional */}
      {showOverlay && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center space-y-12 overflow-hidden">
           
           {/* Moving Dark Gradient Background */}
           <div className="absolute inset-0 opacity-40 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] animate-slow-float-1" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-slow-float-2" />
           </div>

           <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Pulsing Outer Ring */}
              <div className="absolute inset-0 border-[1px] border-white/5 rounded-full animate-ping-slow" />
              <div className="absolute inset-0 border-[1px] border-white/10 rounded-full animate-pulse-slow" />
              
              {/* Rotating Progress Segment */}
              <div className="absolute inset-[-10px] rounded-full border-t-[3px] border-blue-500/40 animate-spin-slow" />

              <div className="relative group">
                 <span className="text-4xl font-black text-white italic tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">OX</span>
              </div>
           </div>

           <div className="flex flex-col items-center space-y-2 relative z-10">
              <h2 className="text-2xl font-bold text-white tracking-[0.2em] uppercase opacity-90">Initializing</h2>
              <div className="h-[2px] w-48 bg-slate-900 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500/50 animate-progress-indeterminate" />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 animate-pulse-slow">OrbitX Core Network Ready</p>
           </div>
        </div>
      )}

      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <main className="flex-1 ml-72 flex flex-col min-h-screen relative">
        <Navbar />
        
        <div className={`flex-1 ${currentTab === 'inbox' ? 'p-0' : 'p-10 pb-20'} relative z-10 animate-precision-reveal stagger-1`}>
          {currentTab === 'overview' && <Overview setCurrentTab={setCurrentTab} />}
          {currentTab === 'inbox' && <Inbox />}
          {currentTab === 'campaigns' && <CampaignBuilder draftTemplate={draftTemplate} setDraftTemplate={setDraftTemplate} />}
          {currentTab === 'leads' && <Leads />}
          {currentTab === 'templates' && <Templates setCurrentTab={setCurrentTab} setDraftTemplate={setDraftTemplate} />}
          {currentTab === 'settings' && <Settings />}
          {currentTab === 'analytics' && <Analytics />}
        </div>
      </main>
    </div>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Login />;
  }

  if (user.role === 'ADMIN') {
    return <AdminLayout />;
  }

  return (
    <DataProvider>
      <DashboardLayout />
    </DataProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;

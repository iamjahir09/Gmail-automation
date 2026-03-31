import React, { useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminNavbar from './components/AdminNavbar';
import AdminOverview from './pages/AdminOverview';
import UserManagement from './pages/UserManagement';
import GlobalSMTP from './pages/GlobalSMTP';
import AuditLog from './pages/AuditLog';

const AdminLayout = () => {
  const [currentTab, setCurrentTab] = useState(() => {
    return localStorage.getItem('orbitx_admin_tab') || 'dashboard';
  });

  React.useEffect(() => {
    localStorage.setItem('orbitx_admin_tab', currentTab);
  }, [currentTab]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30">
      <AdminSidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <main className="flex-1 ml-64 flex flex-col min-h-screen overflow-x-hidden overflow-y-auto">
        <AdminNavbar />
        
        <div className="p-8 pb-12 flex-1">
          {currentTab === 'dashboard' && <AdminOverview />}
          {currentTab === 'users' && <UserManagement />}
          {currentTab === 'smtp' && <GlobalSMTP />}
          {currentTab === 'audit' && <AuditLog />}
          {currentTab === 'settings' && (
             <div className="flex flex-col items-center justify-center p-20 text-slate-500 border border-slate-800 border-dashed rounded-xl mt-10">
                <p>System settings panel construction underway.</p>
             </div>
          )}
        </div>

        <footer className="px-8 py-4 bg-slate-900 border-t border-slate-800 transition-colors duration-300">
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
            <p>&copy; 2026 OrbitX Secure Admin Portal.</p>
            <div className="flex space-x-6 text-indigo-400">
              <span className="cursor-pointer hover:underline">Vulnerability Report</span>
              <span className="cursor-pointer hover:underline">API Logs</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminLayout;

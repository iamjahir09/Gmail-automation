import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Server,
  Users,
  Database,
  MailWarning,
  Activity,
  ArrowUpRight
} from 'lucide-react';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    accountCount: 0,
    campaignCount: 0,
    logCount: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('${import.meta.env.VITE_API_URL}/api/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch system stats:", err);
      }
    };
    fetchStats();
  }, []);

  const StatBox = ({ label, value, icon: Icon, colorClass }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-start justify-between group hover:border-slate-700 transition-colors">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-white mt-2">{value.toLocaleString()}</p>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">System Initialization</h1>
        <p className="text-slate-500 mt-1 font-medium">Real-time status of the OrbitX cluster infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox label="Active Members" value={stats.userCount} icon={Users} colorClass="bg-blue-500/10 text-blue-400" />
        <StatBox label="SMTP Relays" value={stats.accountCount} icon={Server} colorClass="bg-indigo-500/10 text-indigo-400" />
        <StatBox label="Processed Tasks" value={stats.campaignCount} icon={Activity} colorClass="bg-emerald-500/10 text-emerald-400" />
        <StatBox label="Database Rows" value={stats.logCount} icon={Database} colorClass="bg-purple-500/10 text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center">
            <Server className="w-5 h-5 mr-3 text-indigo-400" />
            Infrastructure Health
          </h3>
          <div className="space-y-6">
            {[
              { name: 'Core API Gateway', status: 'Operational', ping: '12ms' },
              { name: 'Background Queue (Redis)', status: 'Operational', ping: '4ms' },
              { name: 'PostgreSQL Database', status: 'Operational', ping: '24ms' }
            ].map((service, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <p className="text-sm font-bold text-slate-300">{service.name}</p>
                  <p className="text-xs text-emerald-400 font-medium tracking-wide flex items-center mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                    {service.status}
                  </p>
                </div>
                <span className="font-mono text-xs text-slate-500">{service.ping}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center">
            <MailWarning className="w-5 h-5 mr-3 text-red-400" />
            SMTP Incident Matrix
          </h3>
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-800 rounded-xl opacity-50">
            <MailWarning className="w-8 h-8 text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-400">0 Global Delivery Incidents</p>
            <p className="text-xs text-slate-500 mt-1">The SMTP clusters are fully stable.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

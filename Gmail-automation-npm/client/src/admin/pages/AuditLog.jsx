import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  Terminal, 
  Cpu, 
  Database,
  Lock
} from 'lucide-react';

const AuditLog = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for system audit trails
  const mockLogs = [
    { id: 1, type: 'AUTH', action: 'Admin Login Successful', user: 'admin@orbitx.com', ip: '192.168.1.101', time: '5m ago', icon: Lock, color: 'emerald' },
    { id: 2, type: 'DB_SYNC', action: 'Database Migration v3 Applied', user: 'SYSTEM', ip: 'localhost', time: '12m ago', icon: Database, color: 'blue' },
    { id: 3, type: 'SMTP', action: 'Primary Gmail Pool Checked', user: 'SYSTEM_WORKER', ip: 'internal-cluster', time: '1h ago', icon: Terminal, color: 'indigo' },
    { id: 4, type: 'API', action: 'Webhook Endpoint Timeout', user: 'N/A', ip: '10.0.0.5', time: '2h ago', icon: Cpu, color: 'red' },
    { id: 5, type: 'USER_MGMT', action: 'New User Sarah Connor Created', user: 'admin@orbitx.com', ip: '192.168.1.101', time: '5h ago', icon: Lock, color: 'purple' },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
          <Activity className="w-8 h-8 mr-3 text-indigo-400" />
          Audit & Security Logs
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Immutable system trails for compliance and troubleshooting.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input 
          type="text" 
          placeholder="Filter logs by IP, User, or Action..." 
          className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm text-white placeholder-slate-600 shadow-md font-mono"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-950 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Event Trace</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actor / IP</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {mockLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/20 transition-colors font-mono group">
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 bg-${log.color}-500/10 text-${log.color}-400 rounded-lg group-hover:scale-110 transition-transform`}>
                      <log.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-300">{log.action}</p>
                      <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase mt-0.5 opacity-70">
                        CLASS: {log.type}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <p className="text-xs text-indigo-300 font-medium">{log.user}</p>
                   <p className="text-[10px] text-slate-500 tracking-wider">IPv4: {log.ip}</p>
                </td>
                <td className="px-6 py-5 text-sm text-slate-500 tracking-wider">
                  {log.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;

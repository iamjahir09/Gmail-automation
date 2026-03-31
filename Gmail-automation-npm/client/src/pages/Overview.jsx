import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Mail, 
  MousePointer2, 
  Eye, 
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';

const Overview = ({ setCurrentTab }) => {
  const { stats, isInitialized } = useData();
  
  const handleExportReport = () => {
    if (!stats) return;
    
    // Create CSV Content
    let csv = "Metric,Value\n";
    csv += `Total Emails Sent,${stats.sent}\n`;
    csv += `Open Rate,${stats.openRate.toFixed(1)}%\n`;
    csv += `Click Rate,${stats.clickRate.toFixed(1)}%\n`;
    csv += `Reply Rate,${stats.replyRate.toFixed(1)}%\n`;
    csv += `Total Campaigns,${stats.campaignCount}\n\n`;
    
    csv += "Recent Activity Log\n";
    csv += "User,Action,Time\n";
    stats.recentActivity.forEach(act => {
      csv += `"${act.user}","${act.action}","${act.time}"\n`;
    });
    
    // Trigger Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `OrbitX_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isInitialized || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
           <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
           <p className="text-slate-400 text-sm font-medium animate-pulse">Syncing Overview Statistics...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <div className="precision-card group p-6 hover:ring-1 hover:ring-primary/30 transition-all duration-300 animate-precision-reveal">
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-xl bg-blue-500/10 text-blue-500`}>
          <Icon className="w-6 h-6" />
        </div>
        {(trendValue !== undefined && trendValue !== 0) && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend === 'up' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-black mt-1 text-black dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-precision-reveal mt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-black dark:text-white tracking-tight italic">
            DASHBOARD
          </h1>
          <p className="text-neutral-500 mt-1 text-sm font-medium">
            System status: <span className="text-emerald-500 font-bold">Synchronized</span>
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleExportReport}
            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Export Report
          </button>
          <button 
            onClick={() => setCurrentTab?.('campaigns')}
            className="btn-primary flex items-center space-x-2 px-6 shadow-lg shadow-blue-500/20"
          >
            <Mail className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Emails Sent" value={stats.sent.toLocaleString()} icon={Mail} trend="up" trendValue={0} color="blue" />
        <StatCard title="Average Open Rate" value={`${stats.openRate.toFixed(1)}%`} icon={Eye} trend="up" trendValue={0} color="indigo" />
        <StatCard title="Click Through Rate" value={`${stats.clickRate.toFixed(1)}%`} icon={MousePointer2} trend="up" trendValue={0} color="violet" />
        <StatCard title="Reply Rate" value={`${stats.replyRate.toFixed(1)}%`} icon={CheckCircle2} trend="up" trendValue={0} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 precision-card !p-0 overflow-hidden min-h-[400px]">
          <div className="p-6 border-b border-black/5 dark:border-white/[0.06] flex justify-between items-center">
            <h3 className="font-bold text-base text-black dark:text-white">Performance Trends</h3>
            <div className="flex space-x-3">
              <span className="flex items-center text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div> Sent</span>
              <span className="flex items-center text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></div> Opens</span>
            </div>
          </div>
          <div className="h-80 w-full p-6">
            {stats.trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trends}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#0f172a', color: '#fff' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
                  <Area type="monotone" dataKey="opens" stroke="#818cf8" strokeWidth={3} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">
                No activity data yet. Start a campaign to see trends.
              </div>
            )}
          </div>
        </div>

        <div className="precision-card h-full flex flex-col p-6">
          <h3 className="font-bold text-base text-black dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-6 flex-1 overflow-y-auto">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => {
                const Icon = activity.type === 'open' ? Eye : activity.type === 'click' ? MousePointer2 : CheckCircle2;
                return (
                  <div key={activity.id} className="flex items-start space-x-4 animate-slide-up">
                    <div className={`p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-bold text-slate-700 dark:text-slate-200">{activity.user}</span> 
                        <span className="text-slate-500 dark:text-slate-400 ml-1">{activity.action}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-50">
                <Clock className="w-8 h-8 mb-2 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">Waiting for activity...</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setCurrentTab?.('analytics')}
            className="w-full mt-8 py-2 text-primary font-bold text-sm bg-blue-50 dark:bg-blue-500/10 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
          >
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overview;

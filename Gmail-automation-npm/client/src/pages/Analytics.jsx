import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useData } from '../context/DataContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  Download,
  Mail,
  Eye,
  MousePointer2,
  CheckCircle2
} from 'lucide-react';

const COLORS = ['#2563eb', '#818cf8', '#34d399', '#facc15', '#f87171'];

const bounceData = [
  { name: 'Hard Bounce', count: 0, fill: '#ef4444' },
  { name: 'Soft Bounce', count: 0, fill: '#f97316' },
  { name: 'Complaint', count: 0, fill: '#eab308' },
  { name: 'Unsubscribe', count: 0, fill: '#8b5cf6' },
];

const Analytics = () => {
  const { stats, isInitialized } = useData();
  const data = stats?.trends || [];

  if (!isInitialized || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
           <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
           <p className="text-slate-400 text-sm font-medium animate-pulse">Syncing Advanced Analytics...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon }) => (
    <div className="precision-card p-6 flex flex-col justify-between hover:ring-1 hover:ring-primary/20 transition-all">
      <div className="p-2 w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 mb-4 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">{title}</h3>
        <p className="text-xl font-black mt-0.5 text-black dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Advanced Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Deep dive into your campaign performance metrics.
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300">
             <Calendar className="w-4 h-4" />
             <span>Last 30 Days</span>
          </div>
          <button className="btn-primary flex items-center space-x-2 px-6 shadow-lg shadow-blue-500/20">
            <Download className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <StatCard title="Total Sent" value={stats.sent.toLocaleString()} icon={Mail} />
         <StatCard title="Open Rate" value={`${stats.openRate.toFixed(1)}%`} icon={Eye} />
         <StatCard title="Click Rate" value={`${stats.clickRate.toFixed(1)}%`} icon={TrendingUp} />
         <StatCard title="Reply Rate" value={`${stats.replyRate.toFixed(1)}%`} icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="precision-card h-[450px] flex flex-col p-6">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Engagement Velocity</h3>
            <div className="flex space-x-3 text-xs font-bold text-slate-400">
               <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div> Sent</span>
               <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-indigo-400 mr-1"></div> Opens</span>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.length > 0 ? data : [
                { name: 'Week 1', sent: 0, opens: 0 },
                { name: 'Week 2', sent: 0, opens: 0 },
                { name: 'Week 3', sent: 0, opens: 0 },
                { name: 'Week 4', sent: 0, opens: 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#0f172a', color: '#fff' }}
                />
                <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="opens" stroke="#818cf8" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="precision-card h-[450px] flex flex-col p-6">
           <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tighter mb-8">Campaign Distribution</h3>
           <div className="flex-1 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.campaignDist ? stats.campaignDist : [{ name: 'Awaiting Data', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {(stats?.campaignDist || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    {!stats?.campaignDist?.length && <Cell fill="#f1f5f9" />}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                 <span className="text-3xl font-black text-black dark:text-white">
                   {stats?.campaignCount || '0'}
                 </span>
                 <span className="text-[10px] uppercase font-bold text-neutral-400">Campaigns</span>
              </div>
           </div>
        </div>
      </div>

      <div className="precision-card h-[350px] flex flex-col mb-6 p-6">
         <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tighter mb-6">Error & Bounce Taxonomy</h3>
         <div className="flex-1 w-full pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bounceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <Tooltip cursor={{fill: '#f1f5f9', opacity: 0.1}} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={60}>
                  {bounceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

    </div>
  );
};

export default Analytics;

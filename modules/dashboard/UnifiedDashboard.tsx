import React, { useState, useEffect } from 'react';
import { User, UserRole, Lead, JobPost, Candidate } from '../../types';
import { StorageService } from '../../services/storageService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, FileText, CheckCircle, Calendar, Bell, Briefcase, DollarSign } from 'lucide-react';

interface DashboardProps {
  currentUser: User;
}

interface ActivityItem {
  id: string;
  text: string;
  subText?: string;
  time: string; // Display string
  rawDate: Date; // For sorting
  type: 'success' | 'info' | 'warning' | 'error';
}

export const UnifiedDashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [selectedUser, setSelectedUser] = useState<string>(currentUser.name);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  
  // Role-based Logic for Dropdown
  const canViewOthers = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER;

  useEffect(() => {
    const loadData = () => {
      const l = StorageService.getLeads();
      const j = StorageService.getJobs();
      const c = StorageService.getCandidates();
      setLeads(l);
      setJobs(j);
      setCandidates(c);
      generateActivityFeed(l, j, c);
    };
    
    loadData();
    // Simple poll to keep dashboard fresh if other tabs update local storage
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const generateActivityFeed = (l: Lead[], j: JobPost[], c: Candidate[]) => {
    const items: ActivityItem[] = [];

    // 1. Recent Leads
    l.forEach(lead => {
      items.push({
        id: `act-lead-${lead.id}`,
        text: `New Lead: ${lead.companyName}`,
        subText: `Value: ₹${(lead.value/100000).toFixed(1)}L`,
        time: new Date(lead.createdAt).toLocaleDateString(),
        rawDate: new Date(lead.createdAt),
        type: 'info'
      });
    });

    // 2. Recent Jobs
    j.forEach(job => {
      items.push({
        id: `act-job-${job.id}`,
        text: `Job Posted: ${job.title}`,
        subText: job.clientName,
        time: new Date(job.createdAt || Date.now()).toLocaleDateString(),
        rawDate: new Date(job.createdAt || Date.now()),
        type: 'success'
      });
    });

    // 3. Candidates (Simulate date based on ID or assumption as created recently for demo)
    c.forEach((cand, idx) => {
      // Mocking a 'recent' date for demo purposes if createdAt missing
      const date = new Date(); 
      date.setHours(date.getHours() - idx * 2);
      
      items.push({
        id: `act-cand-${cand.id}`,
        text: `Candidate Applied: ${cand.fullName}`,
        subText: `Role: ${cand.expectedRole}`,
        time: "Today",
        rawDate: date,
        type: 'warning'
      });
    });

    // Sort by Date Descending
    items.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
    setActivityFeed(items.slice(0, 10));
  };

  const getKpiData = () => {
    if (currentUser.role === UserRole.SALES) {
      const totalValue = leads.reduce((acc, curr) => acc + curr.value, 0);
      const converted = leads.filter(l => l.status === 'Converted').length;
      
      return [
        { label: 'Total Pipeline Value', value: `₹${(totalValue/10000000).toFixed(2)} Cr`, icon: DollarSign, color: 'bg-green-500' },
        { label: 'Active Leads', value: leads.filter(l => l.status !== 'Lost' && l.status !== 'Converted').length.toString(), icon: TrendingUp, color: 'bg-blue-500' },
        { label: 'Converted Clients', value: converted.toString(), icon: CheckCircle, color: 'bg-purple-500' },
      ];
    }
    
    // Recruiter / Admin Default
    const activeJobs = jobs.filter(j => j.status !== 'Closed').length;
    const sourcingCands = candidates.filter(c => c.status === 'New' || c.status === 'Screening').length;
    const interviewCands = candidates.filter(c => c.status === 'Interview').length;

    return [
      { label: 'Active Jobs', value: activeJobs.toString(), icon: Briefcase, color: 'bg-blue-500' },
      { label: 'Candidates Sourced', value: candidates.length.toString(), icon: Users, color: 'bg-indigo-500' },
      { label: 'In Interviews', value: interviewCands.toString(), icon: Calendar, color: 'bg-orange-500' },
    ];
  };

  const getFunnelData = () => {
    if (currentUser.role === UserRole.SALES) {
        const statusCounts = { New: 0, Contacted: 0, Qualified: 0, Converted: 0 };
        leads.forEach(l => {
            if (l.status in statusCounts) statusCounts[l.status as keyof typeof statusCounts]++;
        });
        return Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key as keyof typeof statusCounts] }));
    }

    // Recruiter Funnel
    const statusCounts = { New: 0, Screening: 0, Interview: 0, Offer: 0, Rejected: 0 };
    candidates.forEach(c => {
        // Map complex statuses to simple funnel
        if (c.status in statusCounts) statusCounts[c.status as keyof typeof statusCounts]++;
        else statusCounts['New']++; 
    });
    // Filter out rejected for the main funnel view usually
    return [
        { name: 'New', value: statusCounts.New },
        { name: 'Screening', value: statusCounts.Screening },
        { name: 'Interview', value: statusCounts.Interview },
        { name: 'Offer', value: statusCounts.Offer },
    ];
  };

  const funnelData = getFunnelData();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Top Bar: User Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-sm text-slate-500">Real-time overview of your recruitment pipeline.</p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border">
            <span className="text-sm text-slate-500">Viewing Data For:</span>
            <select 
              disabled={!canViewOthers}
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className={`bg-transparent font-medium outline-none ${!canViewOthers ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <option value={currentUser.name}>{currentUser.name} (Me)</option>
              {canViewOthers && (
                <>
                  <option value="Sales Team">Sales Team</option>
                  <option value="Recruiting Team">Recruiting Team</option>
                </>
              )}
            </select>
          </div>
          
          <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative">
             <Bell size={20} />
             <span className="absolute top-1 right-1 w-2 h-2 bg-red-50 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Widget Row 1: KPIs & Target */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* KPIs */}
        {getKpiData().map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-slate-500 text-sm font-medium">{kpi.label}</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{kpi.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${kpi.color} text-white shadow-md`}>
              <kpi.icon size={24} />
            </div>
          </div>
        ))}

        {/* Widget 2: Target vs Achievement */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-slate-500 mb-4">Monthly Target</h3>
            <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-slate-900">68%</span>
                <span className="text-sm text-slate-400 mb-1">Achieved</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '68%' }}></div>
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium">Only 4 more to reach goal!</p>
          </div>
          <TrendingUp className="absolute -right-4 -bottom-4 text-slate-50 opacity-50" size={100} />
        </div>
      </div>

      {/* Widget Row 2: Charts & Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Widget 3: Funnel Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2 min-h-[350px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-lg text-slate-800">
                {currentUser.role === UserRole.SALES ? 'Lead Conversion Funnel' : 'Candidate Pipeline'}
             </h3>
             <button className="text-blue-600 text-sm font-bold hover:underline">View Details</button>
          </div>
          
          <div className="flex-1 w-full">
            {funnelData.reduce((a,b) => a + b.value, 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={50}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#6366f1', '#8b5cf6', '#10b981'][index % 4]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400 flex-col gap-2">
                    <FileText size={40} className="opacity-20" />
                    <p>No data available yet.</p>
                </div>
            )}
          </div>
        </div>

        {/* Widget 4: Activity Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-800">Live Feed</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full animate-pulse">Live</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-0 custom-scrollbar relative">
             <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
             
             {activityFeed.length > 0 ? activityFeed.map((item) => (
              <div key={item.id} className="flex gap-4 items-start py-3 relative group">
                <div className={`w-8 h-8 rounded-full shrink-0 z-10 border-4 border-white flex items-center justify-center shadow-sm ${
                  item.type === 'success' ? 'bg-green-500 text-white' : 
                  item.type === 'info' ? 'bg-blue-500 text-white' : 
                  item.type === 'warning' ? 'bg-orange-500 text-white' : 'bg-slate-500 text-white'
                }`}>
                   {item.type === 'success' ? <CheckCircle size={14} /> : item.type === 'info' ? <FileText size={14}/> : <Bell size={14} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">{item.text}</p>
                  {item.subText && <p className="text-xs text-slate-500 mt-0.5">{item.subText}</p>}
                  <span className="text-[10px] text-slate-400 block mt-1 font-medium uppercase tracking-wide">{item.time}</span>
                </div>
              </div>
            )) : (
                <div className="py-10 text-center text-slate-400">
                    <p>No recent activity.</p>
                </div>
            )}
          </div>
          
          <div className="pt-4 mt-2 border-t text-center">
              <button className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider">View All Activity</button>
          </div>
        </div>
      </div>
    </div>
  );
};
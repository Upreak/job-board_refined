import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Users, FileText, CheckCircle, Calendar, Bell } from 'lucide-react';

interface DashboardProps {
  currentUser: User;
}

// Mock Data for Widgets
const ACTIVITY_FEED = [
  { id: 1, text: "Candidate 'Rahul Verma' replied to chatbot", time: "10 mins ago", type: "success" },
  { id: 2, text: "You submitted 3 candidates to 'TechFlow Inc'", time: "1 hour ago", type: "info" },
  { id: 3, text: "Job 'Senior React Dev' moved to Interview Stage", time: "3 hours ago", type: "warning" },
  { id: 4, text: "New client 'Alpha Corp' signed", time: "Yesterday", type: "success" },
];

const FUNNEL_DATA = [
  { name: 'New', value: 40 },
  { name: 'Sourcing', value: 30 },
  { name: 'Review', value: 20 },
  { name: 'Offer', value: 10 },
];

export const UnifiedDashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [selectedUser, setSelectedUser] = useState<string>(currentUser.name);
  
  // Role-based Logic for Dropdown
  const canViewOthers = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER;

  const getKpiData = () => {
    if (currentUser.role === UserRole.SALES) {
      return [
        { label: 'New Clients', value: '4', icon: Users, color: 'bg-purple-500' },
        { label: 'Jobs Created', value: '12', icon: FileText, color: 'bg-blue-500' },
        { label: 'Active Jobs', value: '8', icon: TrendingUp, color: 'bg-green-500' },
      ];
    }
    // Recruiter Default
    return [
      { label: 'Candidates Sourced', value: '145', icon: Users, color: 'bg-blue-500' },
      { label: 'Submitted', value: '32', icon: CheckCircle, color: 'bg-indigo-500' },
      { label: 'Interviews', value: '12', icon: Calendar, color: 'bg-orange-500' },
    ];
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Bar: User Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        
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
                  <option value="Sales Rep 1">Sales Rep 1</option>
                  <option value="Recruiter A">Recruiter A</option>
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
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">{kpi.label}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{kpi.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${kpi.color} text-white shadow-md`}>
              <kpi.icon size={24} />
            </div>
          </div>
        ))}

        {/* Widget 2: Target vs Achievement */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-slate-500 mb-4">Monthly Goal</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold text-slate-900">75%</span>
            <span className="text-sm text-slate-400 mb-1">Achieved</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className="bg-green-500 h-full rounded-full" style={{ width: '75%' }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-2">3 placements pending to hit target</p>
        </div>
      </div>

      {/* Widget Row 2: Charts & Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Widget 3: Funnel Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Active Pipeline</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FUNNEL_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Widget 4: Activity Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {ACTIVITY_FEED.map((item) => (
              <div key={item.id} className="flex gap-3 items-start pb-3 border-b border-slate-50 last:border-0">
                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                  item.type === 'success' ? 'bg-green-500' : 
                  item.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-sm text-slate-700 leading-snug">{item.text}</p>
                  <span className="text-xs text-slate-400 block mt-1">{item.time}</span>
                </div>
              </div>
            ))}
            {/* Simulating pagination loader */}
            <div className="text-center py-2">
               <span className="text-xs text-blue-500 cursor-pointer hover:underline">Load More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
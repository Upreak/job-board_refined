
import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Save, Users, Building, UserCheck, 
  Phone, Mail, Calendar, Clock, CheckSquare, 
  DollarSign, X, AlertCircle,
  Search, ChevronRight, Edit, UploadCloud, FileText
} from 'lucide-react';
import { Client, ClientContact, Lead, LeadStatus, ActivityLog, CorporateDetails } from '../../types';

// --- Mock Data ---

const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-1',
    companyName: 'Nexus Innovations',
    contactPerson: 'Sarah Connor',
    email: 'sarah@nexus.com',
    phone: '9876543210',
    status: 'New',
    value: 1200000,
    source: 'LinkedIn',
    nextFollowUp: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    activities: [],
    tasks: [{ id: 't1', title: 'Send introductory deck', isCompleted: false, dueDate: '2023-10-25' }],
    createdAt: '2023-10-20'
  },
  {
    id: 'lead-2',
    companyName: 'Cyberdyne Systems',
    contactPerson: 'Miles Dyson',
    email: 'miles@cyberdyne.com',
    phone: '9123456789',
    status: 'Contacted',
    value: 5000000,
    source: 'Referral',
    nextFollowUp: '2023-10-01', // Past date (At Risk)
    activities: [
      { id: 'a1', type: 'Call', description: 'Discussed AI requirements', date: '2023-10-01', performedBy: 'Me' }
    ],
    tasks: [],
    createdAt: '2023-09-15'
  },
  {
    id: 'lead-3',
    companyName: 'Globex Corp',
    contactPerson: 'Hank Scorpio',
    email: 'hank@globex.com',
    phone: '5551234567',
    status: 'Qualified',
    value: 3500000,
    source: 'Website',
    nextFollowUp: new Date(Date.now() + 172800000).toISOString().split('T')[0], // 2 days later
    activities: [],
    tasks: [],
    createdAt: '2023-10-05'
  },
  {
    id: 'lead-4',
    companyName: 'Acme Corp',
    contactPerson: 'Wile E. Coyote',
    email: 'coyote@acme.com',
    phone: '5550000000',
    status: 'New',
    value: 800000,
    source: 'Cold Call',
    nextFollowUp: '',
    activities: [],
    tasks: [],
    createdAt: '2023-10-22'
  },
  {
    id: 'lead-5',
    companyName: 'Stark Industries',
    contactPerson: 'Tony Stark',
    email: 'tony@stark.com',
    phone: '9998887777',
    status: 'Qualified',
    value: 15000000,
    source: 'Event',
    nextFollowUp: new Date().toISOString().split('T')[0],
    activities: [],
    tasks: [],
    createdAt: '2023-10-10'
  }
];

const MOCK_CLIENTS: Client[] = [
  { 
    id: 'cl-1', 
    name: 'TechFlow Inc', 
    address: '123 Tech Park, Bangalore, KA 560103', 
    assignedRecruiter: 'Recruiter Jane',
    activeProjectsCount: 2,
    corporateDetails: {
        gst: '29ABCDE1234F1Z5',
        pan: 'ABCDE1234F'
    },
    contacts: [
        { name: 'John Smith', email: 'john@techflow.com', phone: '9876543210', position: 'CTO', department: 'Engineering', isSpoc: true },
        { name: 'Alice Doe', email: 'alice@techflow.com', phone: '9876543211', position: 'HR Manager', department: 'HR', isSpoc: false }
    ] 
  }
];

export const SalesCRM: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'pipeline' | 'clients'>('pipeline');
  const [view, setView] = useState<'list' | 'form'>('list'); 
  
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  
  // Client Filter State
  const [clientSearch, setClientSearch] = useState('');

  // Selected Lead for Modal
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId), [leads, selectedLeadId]);

  // Client Form State
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [formClient, setFormClient] = useState<Partial<Client>>({ name: '', address: '', assignedRecruiter: '' });
  const [formCorporate, setFormCorporate] = useState<CorporateDetails>({});
  const [formContacts, setFormContacts] = useState<ClientContact[]>([{ name: '', email: '', phone: '', position: '', department: '', isSpoc: true }]);

  // --- Lead Management Functions ---

  const moveLead = (id: string, newStatus: LeadStatus) => {
    setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date(new Date().toISOString().split('T')[0]);
  };

  const handleAddActivity = (leadId: string, type: ActivityLog['type'], desc: string, nextDate: string) => {
    const newActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      type,
      description: desc,
      date: new Date().toISOString().split('T')[0],
      performedBy: 'Me'
    };
    setLeads(leads.map(l => {
      if (l.id === leadId) {
        return { 
          ...l, 
          activities: [newActivity, ...l.activities],
          nextFollowUp: nextDate || l.nextFollowUp 
        };
      }
      return l;
    }));
  };

  const convertLeadToClient = (lead: Lead) => {
    // 1. Pre-fill client form with Lead Data
    setFormClient({
      name: lead.companyName,
      address: '', 
      assignedRecruiter: '' 
    });
    setFormCorporate({});
    setFormContacts([{
      name: lead.contactPerson,
      email: lead.email,
      phone: lead.phone,
      position: 'Primary Contact',
      department: '',
      isSpoc: true
    }]);
    setEditingClientId(null); // New Client
    
    // 2. Close Modal & Switch
    setSelectedLeadId(null);
    setActiveTab('clients');
    setView('form');
    
    // 3. Update Lead Status
    moveLead(lead.id, 'Converted');
  };

  // --- Client Management Functions ---

  const handleCreateClient = () => {
      setEditingClientId(null);
      setFormClient({ name: '', address: '', assignedRecruiter: '' });
      setFormCorporate({});
      setFormContacts([{ name: '', email: '', phone: '', position: '', department: '', isSpoc: true }]);
      setView('form');
  };

  const handleEditClient = (client: Client) => {
      setEditingClientId(client.id);
      setFormClient({ 
          name: client.name, 
          address: client.address, 
          assignedRecruiter: client.assignedRecruiter 
      });
      setFormCorporate({ ...client.corporateDetails });
      setFormContacts(client.contacts.map(c => ({...c}))); // Deep copy to prevent direct mutation
      setView('form');
  };

  const handleSaveClient = () => {
    if (!formClient.name || !formClient.address) {
      alert("Client Name and Address are required.");
      return;
    }

    const newClientData: Client = {
      id: editingClientId || `CL-${Math.floor(Math.random() * 10000)}`,
      name: formClient.name!,
      address: formClient.address!,
      assignedRecruiter: formClient.assignedRecruiter || 'Unassigned',
      activeProjectsCount: editingClientId ? (clients.find(c => c.id === editingClientId)?.activeProjectsCount || 0) : 0,
      corporateDetails: formCorporate,
      contacts: formContacts
    };

    if (editingClientId) {
        setClients(clients.map(c => c.id === editingClientId ? newClientData : c));
    } else {
        setClients([...clients, newClientData]);
    }
    
    // Reset and go back
    setView('list');
    setEditingClientId(null);
  };

  const handleContactChange = (index: number, field: keyof ClientContact, value: any) => {
    const updated = [...formContacts];
    updated[index] = { ...updated[index], [field]: value };
    setFormContacts(updated);
  };

  const handleSpocChange = (index: number) => {
      // Mutual exclusion: Set the selected index to true, all others to false
      const updated = formContacts.map((c, i) => ({
          ...c,
          isSpoc: i === index
      }));
      setFormContacts(updated);
  };

  const addContactBlock = () => {
      setFormContacts([...formContacts, { name: '', email: '', phone: '', position: '', department: '', isSpoc: false }]);
  };

  const removeContactBlock = (index: number) => {
      const updated = [...formContacts];
      updated.splice(index, 1);
      
      // Safety check: If we removed the SPOC, make the new first one SPOC (if exists)
      if (updated.length > 0 && !updated.find(c => c.isSpoc)) {
          updated[0].isSpoc = true;
      } else if (updated.length === 0) {
          // Should probably prevent removing last contact, but if they do:
          // Logic handles empty array fine, but validation might be needed later.
      }
      setFormContacts(updated);
  };

  // --- Sub-Components ---

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <div 
      onClick={() => setSelectedLeadId(lead.id)}
      className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-400 transition-all cursor-pointer mb-3 group flex flex-col"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-slate-800 line-clamp-1" title={lead.companyName}>{lead.companyName}</h4>
        {lead.value > 2000000 && <DollarSign size={14} className="text-green-600 shrink-0" />}
      </div>
      <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
        <Users size={12} /> <span className="truncate">{lead.contactPerson}</span>
      </div>
      <div className="flex justify-between items-center border-t pt-3 mt-auto">
        <span className="text-xs font-bold text-green-600">₹{(lead.value / 100000).toFixed(1)} L</span>
        {lead.nextFollowUp && (
          <div className={`flex items-center gap-1 text-xs ${isOverdue(lead.nextFollowUp) ? 'text-red-600 font-bold bg-red-50 px-2 py-1 rounded' : 'text-slate-400'}`}>
            <Clock size={12} />
            {isOverdue(lead.nextFollowUp) ? 'Overdue' : new Date(lead.nextFollowUp!).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}
          </div>
        )}
      </div>
    </div>
  );

  const LeadDetailModal = ({ lead }: { lead: Lead }) => {
    const [note, setNote] = useState('');
    const [nextDate, setNextDate] = useState(lead.nextFollowUp || '');
    const [activeType, setActiveType] = useState<ActivityLog['type']>('Call');

    if (!lead) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
          
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center bg-slate-50 shrink-0">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">{lead.companyName}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  lead.status === 'New' ? 'bg-blue-100 text-blue-700' : 
                  lead.status === 'Converted' ? 'bg-green-100 text-green-700' :
                  lead.status === 'Lost' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>{lead.status}</span>
              </div>
              <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                <Users size={14} /> {lead.contactPerson} • {lead.email} • {lead.phone}
              </p>
            </div>
            <button onClick={() => setSelectedLeadId(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Left: Info & Actions */}
            <div className="w-full md:w-1/3 border-r bg-slate-50/50 p-6 overflow-y-auto custom-scrollbar">
               <div className="mb-8">
                 <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Lead Value</h3>
                 <div className="space-y-3 bg-white p-4 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-slate-500">Potential Revenue</span>
                      <span className="text-lg font-bold text-slate-900">₹{lead.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Source</span>
                      <span className="text-sm font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{lead.source}</span>
                    </div>
                 </div>
               </div>

               <div className="mb-8">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Workflow Actions</h3>
                  <div className="space-y-3">
                    {lead.status !== 'Converted' && (
                      <button 
                        onClick={() => convertLeadToClient(lead)}
                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all transform active:scale-95"
                      >
                        <CheckSquare size={18} /> Convert to Client
                      </button>
                    )}
                    {lead.status !== 'Lost' && lead.status !== 'Converted' && (
                      <button 
                        onClick={() => { moveLead(lead.id, 'Lost'); setSelectedLeadId(null); }}
                        className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"
                      >
                        <AlertCircle size={18} /> Mark as Lost
                      </button>
                    )}
                  </div>
               </div>

               <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tasks</h3>
                    <button className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Plus size={16}/></button>
                  </div>
                  <div className="space-y-2">
                     {lead.tasks.length === 0 && <div className="text-sm text-slate-400 italic p-2">No pending tasks</div>}
                     {lead.tasks.map(t => (
                       <div key={t.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border hover:border-blue-300 transition-colors">
                         <input type="checkbox" defaultChecked={t.isCompleted} className="rounded text-blue-600 w-4 h-4 cursor-pointer" />
                         <span className={`text-sm ${t.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>{t.title}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Right: Activity Feed */}
            <div className="w-full md:w-2/3 p-6 overflow-y-auto custom-scrollbar bg-white">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-8 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-slate-800">Log Interaction</h3>
                   <div className="flex bg-white rounded-lg p-1 border">
                      {['Call', 'Email', 'Meeting', 'Note'].map((type) => (
                        <button 
                          key={type}
                          onClick={() => setActiveType(type as any)}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                            activeType === type ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                   </div>
                </div>
                
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={`Enter details about the ${activeType.toLowerCase()}...`}
                  className="w-full border border-slate-300 p-3 rounded-lg mb-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white min-h-[80px]"
                ></textarea>
                
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border hover:border-blue-400 transition-colors cursor-pointer">
                     <Calendar size={16} className="text-blue-600" />
                     <span className="text-xs text-slate-500 font-medium">Next Follow-up:</span>
                     <input 
                       type="date" 
                       value={nextDate}
                       onChange={(e) => setNextDate(e.target.value)}
                       className="text-sm bg-transparent outline-none text-slate-700 cursor-pointer" 
                     />
                   </div>
                   <button 
                     onClick={() => { handleAddActivity(lead.id, activeType, note, nextDate); setNote(''); }}
                     disabled={!note}
                     className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                   >
                     Save Activity
                   </button>
                </div>
              </div>

              {/* Timeline */}
              <h3 className="font-bold text-slate-800 mb-6 pl-2">Activity History</h3>
              <div className="relative pl-6 border-l-2 border-slate-100 space-y-8 ml-2">
                {lead.activities.map((activity) => (
                  <div key={activity.id} className="relative group">
                    <div className={`absolute -left-[33px] w-9 h-9 rounded-full border-4 border-white flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110 ${
                      activity.type === 'Call' ? 'bg-blue-500' : 
                      activity.type === 'Meeting' ? 'bg-purple-500' : 
                      activity.type === 'Email' ? 'bg-orange-500' : 'bg-slate-500'
                    }`}>
                      {activity.type === 'Call' ? <Phone size={14}/> : activity.type === 'Meeting' ? <Users size={14} /> : activity.type === 'Email' ? <Mail size={14} /> : <FileText size={14}/>}
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                         <span className="font-bold text-slate-800">{activity.type}</span>
                         <span className="text-xs text-slate-400 font-medium">{activity.date}</span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">{activity.description}</p>
                      <div className="text-xs text-slate-400 mt-2 font-medium">Logged by {activity.performedBy}</div>
                    </div>
                  </div>
                ))}
                {lead.activities.length === 0 && (
                  <div className="text-slate-400 text-sm italic pl-2">No activity recorded yet. Start by logging a call or email.</div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Views ---

  const renderPipeline = () => {
    const columns: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'];
    
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-50/50 border-t border-slate-200 pb-4">
          <div className="flex h-full p-4 gap-4 min-w-[1600px]">
            {columns.map(status => (
              <div key={status} className="flex-1 flex flex-col bg-slate-100/70 rounded-xl border border-slate-200 h-full min-w-[280px] max-w-[350px] shrink-0 shadow-sm">
                <div className={`p-3 border-b flex justify-between items-center rounded-t-xl sticky top-0 z-10 backdrop-blur-sm ${
                   status === 'New' ? 'bg-blue-50/90 border-blue-100' :
                   status === 'Converted' ? 'bg-green-50/90 border-green-100' : 
                   status === 'Lost' ? 'bg-red-50/90 border-red-100' : 'bg-white/90'
                }`}>
                  <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{status}</h3>
                  <span className="bg-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm text-slate-600 border">
                    {leads.filter(l => l.status === status).length}
                  </span>
                </div>
                
                <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                  {leads.filter(l => l.status === status).map(lead => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                  
                  {status === 'New' && (
                     <button 
                       onClick={() => {
                         const newLead: Lead = {
                           id: `lead-${Date.now()}`,
                           companyName: 'New Company',
                           contactPerson: 'New Contact',
                           email: '', phone: '', status: 'New', value: 0, source: 'Manual',
                           createdAt: new Date().toISOString().split('T')[0],
                           activities: [], tasks: []
                         };
                         setLeads([newLead, ...leads]);
                         setSelectedLeadId(newLead.id);
                       }}
                       className="w-full py-3 text-sm text-slate-400 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
                     >
                       <Plus size={16} /> Add New Lead
                     </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderClientForm = () => (
    <div className="h-full overflow-y-auto pb-10 bg-slate-50">
      <div className="bg-white rounded-xl shadow-sm border p-8 max-w-4xl mx-auto mt-6 animate-in slide-in-from-bottom-4">
         <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{editingClientId ? 'Edit Client' : 'New Client'}</h2>
              <p className="text-slate-500 mt-1">Complete corporate identity and contact details.</p>
            </div>
            <button onClick={() => setView('list')} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
         </div>
         
         {/* Section 1: Corporate Identity */}
         <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
             <span className="bg-blue-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs">1</span> Corporate Identity
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="col-span-3 md:col-span-1">
                <label className="block text-sm font-bold mb-1 text-slate-700">Client Name <span className="text-red-500">*</span></label>
                <input 
                  value={formClient.name}
                  onChange={(e) => setFormClient({...formClient, name: e.target.value})}
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
                  placeholder="e.g. Acme Corp"
                />
             </div>
             <div className="col-span-3 md:col-span-1">
                <label className="block text-sm font-bold mb-1 text-slate-700">Assign Recruiter</label>
                <div className="relative">
                  <UserCheck size={18} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    value={formClient.assignedRecruiter}
                    onChange={(e) => setFormClient({...formClient, assignedRecruiter: e.target.value})}
                    className="w-full border border-slate-300 pl-10 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
                    placeholder="Search Recruiter..."
                  />
                </div>
             </div>
             <div className="col-span-3 md:col-span-1">
                 {/* Spacer */}
             </div>
             
             <div className="col-span-3">
                <label className="block text-sm font-bold mb-1 text-slate-700">Address <span className="text-red-500">*</span></label>
                <textarea 
                  value={formClient.address}
                  onChange={(e) => setFormClient({...formClient, address: e.target.value})}
                  className="w-full border border-slate-300 p-2.5 rounded-lg h-20 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm resize-none"
                  placeholder="Enter full corporate address..."
                ></textarea>
             </div>
             
             {/* Corporate IDs Grid */}
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">GST Number</label>
                <input value={formCorporate.gst || ''} onChange={e => setFormCorporate({...formCorporate, gst: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-blue-500 outline-none bg-white" placeholder="Optional" />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PAN Number</label>
                <input value={formCorporate.pan || ''} onChange={e => setFormCorporate({...formCorporate, pan: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-blue-500 outline-none bg-white" placeholder="Optional" />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">TAN Number</label>
                <input value={formCorporate.tan || ''} onChange={e => setFormCorporate({...formCorporate, tan: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-blue-500 outline-none bg-white" placeholder="Optional" />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">MSME Number</label>
                <input value={formCorporate.msme || ''} onChange={e => setFormCorporate({...formCorporate, msme: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-blue-500 outline-none bg-white" placeholder="Optional" />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CIN Number</label>
                <input value={formCorporate.cin || ''} onChange={e => setFormCorporate({...formCorporate, cin: e.target.value})} className="w-full border p-2.5 rounded-lg focus:ring-blue-500 outline-none bg-white" placeholder="Optional" />
             </div>
             <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Agreement Document</label>
                <div className="border border-dashed border-slate-300 rounded-lg p-2.5 flex items-center gap-2 text-slate-500 hover:bg-white hover:border-blue-400 cursor-pointer bg-white transition-colors">
                   <UploadCloud size={18} /> <span className="text-sm">Upload PDF</span>
                </div>
             </div>
           </div>
         </div>

         {/* Section 2: Client Contacts */}
         <div className="space-y-4 mb-8">
           <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <span className="bg-blue-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs">2</span> Client Contacts
           </h3>
           
           {formContacts.map((contact, idx) => (
             <div key={idx} className={`p-6 border rounded-xl relative group shadow-sm transition-colors ${contact.isSpoc ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:border-blue-200'}`}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <h4 className="font-bold text-slate-700">Contact #{idx + 1}</h4>
                        {contact.isSpoc && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">SPOC</span>}
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <span className={`text-xs font-bold ${contact.isSpoc ? 'text-blue-700' : 'text-slate-400'}`}>Make SPOC</span>
                            {/* SPOC Slider Toggle */}
                            <div className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${contact.isSpoc ? 'bg-blue-600' : 'bg-slate-300'}`} onClick={() => handleSpocChange(idx)}>
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${contact.isSpoc ? 'left-5' : 'left-0.5'}`}></div>
                            </div>
                        </label>
                        {formContacts.length > 1 && (
                            <button onClick={() => removeContactBlock(idx)} className="text-slate-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                        )}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name <span className="text-red-500">*</span></label>
                    <input 
                      value={contact.name}
                      onChange={(e) => handleContactChange(idx, 'name', e.target.value)}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email <span className="text-red-500">*</span></label>
                    <input 
                      value={contact.email}
                      onChange={(e) => handleContactChange(idx, 'email', e.target.value)}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone <span className="text-red-500">*</span></label>
                    <input 
                      value={contact.phone}
                      onChange={(e) => handleContactChange(idx, 'phone', e.target.value)}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Position</label>
                    <input 
                      value={contact.position}
                      onChange={(e) => handleContactChange(idx, 'position', e.target.value)}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                    />
                  </div>
                   <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                    <input 
                      value={contact.department || ''}
                      onChange={(e) => handleContactChange(idx, 'department', e.target.value)}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                    />
                  </div>
                </div>
                {contact.isSpoc && <div className="mt-3 text-xs text-blue-600 font-medium flex items-center gap-1"><Mail size={12}/> System notifications will be sent to this contact.</div>}
             </div>
           ))}
           
           <button onClick={addContactBlock} className="text-blue-600 text-sm font-bold flex items-center gap-2 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-dashed border-blue-200 hover:border-blue-300 w-full justify-center">
             <Plus size={16} /> Add Another Contact
           </button>
         </div>

         <div className="flex justify-end gap-4 border-t pt-6">
            <button onClick={() => setView('list')} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-bold transition-colors">
              Cancel
            </button>
            <button onClick={handleSaveClient} className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg hover:shadow-xl transform active:scale-95 transition-all flex items-center gap-2">
              <Save size={18} /> Save Client Information
            </button>
         </div>
      </div>
    </div>
  );

  const renderClientList = () => {
      const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));

      return (
          <div className="h-full flex flex-col bg-slate-50">
              {/* Client Header */}
              <div className="p-6 pb-0 flex items-center justify-between">
                  <div className="flex-1 max-w-md relative">
                     <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                     <input 
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        placeholder="Search clients by name..."
                        className="w-full pl-10 p-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>
                  <button onClick={handleCreateClient} className="ml-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 flex items-center gap-2 transition-all">
                      <Plus size={20} /> Create New Client
                  </button>
              </div>

              {/* Client Cards Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
                  {filteredClients.map(client => {
                      const spoc = client.contacts.find(c => c.isSpoc) || client.contacts[0];
                      return (
                        <div key={client.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all group h-fit flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                                    <Building size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-[10px] font-bold uppercase bg-green-100 text-green-700 px-2 py-1 rounded tracking-wide">Active</span>
                                    <button onClick={() => handleEditClient(client)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit Client">
                                        <Edit size={18} />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-xl text-slate-900 mb-1">{client.name}</h3>
                            <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10">{client.address || 'No address provided'}</p>
                            
                            <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-100">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Primary Point of Contact (SPOC)</div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                                        {spoc?.name.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-slate-800 text-sm truncate">{spoc?.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{spoc?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Active Projects</p>
                                    <p className="text-xl font-bold text-slate-800">{client.activeProjectsCount || 0}</p>
                                </div>
                                <button className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1">
                                    View Projects <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                      );
                  })}
                  
                  {filteredClients.length === 0 && (
                      <div className="col-span-full py-12 text-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                              <Search size={32} />
                          </div>
                          <h3 className="text-slate-900 font-bold text-lg">No clients found</h3>
                          <p className="text-slate-500">Try adjusting your search or create a new client.</p>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col bg-slate-50">
      {/* Header & Navigation */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sales CRM</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{activeTab === 'pipeline' ? 'Leads' : 'Clients'}</span>
            <ChevronRight size={14} />
            <span className="font-medium text-slate-900">
                {activeTab === 'pipeline' ? 'Pipeline Board' : view === 'form' ? (editingClientId ? 'Edit Details' : 'New Client') : 'Client Directory'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1 rounded-lg border shadow-sm">
            <button 
              onClick={() => { setActiveTab('pipeline'); setView('list'); }}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'pipeline' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              Pipeline Board
            </button>
            <button 
              onClick={() => { setActiveTab('clients'); setView('list'); }}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'clients' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              Client List
            </button>
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm relative">
        {activeTab === 'pipeline' ? (
          renderPipeline()
        ) : view === 'form' ? (
          renderClientForm()
        ) : (
          renderClientList()
        )}
      </div>

      {selectedLead && <LeadDetailModal lead={selectedLead} />}
    </div>
  );
};

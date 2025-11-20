
import React, { useState, useMemo } from 'react';
import { JobPost, Candidate, ActionCard, ChatMessage, WorkExperience } from '../../types';
import { 
  Search, Filter, Plus, MapPin, DollarSign, 
  Clock, CheckCircle, X, ChevronRight, Star, Save, 
  MessageSquare, User, Bot, AlertCircle, Send,
  UploadCloud, PlayCircle, Briefcase, Calendar,
  MoreHorizontal, Layout, Settings, Globe, Shield,
  FileText, Eye, File, Trash2, Edit, CheckSquare,
  PauseCircle, MessageCircle, Sparkles, Upload, Image
} from 'lucide-react';

// --- MOCK DATA ---

const MOCK_JOBS: JobPost[] = [
  { 
    id: 'prj-1', 
    title: 'Senior React Developer', 
    clientName: 'TechFlow Inc', 
    clientId: 'cl-1', 
    jobId: 'TF-REACT-01', 
    assignedRecruiterId: 'rec-1',
    status: 'Sourcing', 
    statusRemarks: 'Initial batch sourced from LinkedIn',
    spocName: 'John Smith', 
    candidatesJoined: 0,
    numberOfOpenings: 3, 
    jobSummary: 'Expert React developer needed...',
    employmentType: 'FULL_TIME', 
    workMode: 'Remote', 
    jobLocations: ['Bangalore', 'Remote'],
    minSalary: 2500000, 
    maxSalary: 3500000,
    currency: 'INR',
    salaryUnit: 'YEAR',
    experienceRequired: '5-8 Years',
    educationQualification: 'B.Tech/B.E',
    requiredSkills: ['React', 'TypeScript', 'Redux'],
    preferredSkills: ['Node.js', 'AWS'],
    toolsTechStack: ['Jira', 'Slack'],
    hiringProcessRounds: ['Screening', 'Tech'],
    slugUrl: 'senior-react-dev-techflow',
    metaTitle: 'Senior React Dev',
    metaDescription: 'Join TechFlow',
    benefitsPerks: [],
    stats: { matched: 12, contacted: 8, replied: 3 },
    responsibilities: ['Develop UI', 'Code Review']
  },
  { 
    id: 'prj-2', 
    title: 'Product Manager', 
    clientName: 'Alpha Corp', 
    clientId: 'cl-2', 
    jobId: 'AC-PM-01', 
    assignedRecruiterId: 'rec-1',
    status: 'Interview', 
    statusRemarks: '2 candidates in final round',
    spocName: 'Alice Doe', 
    candidatesJoined: 1,
    numberOfOpenings: 1, 
    jobSummary: 'Product Manager for SaaS...',
    employmentType: 'FULL_TIME', 
    workMode: 'Hybrid', 
    jobLocations: ['Mumbai'],
    minSalary: 4000000, 
    maxSalary: 6000000,
    currency: 'INR',
    salaryUnit: 'YEAR',
    experienceRequired: '8+ Years',
    educationQualification: 'MBA',
    requiredSkills: ['Product Management', 'Agile'],
    preferredSkills: ['SaaS'],
    toolsTechStack: ['Jira', 'Figma'],
    hiringProcessRounds: ['Screening', 'Product', 'HR'],
    slugUrl: 'pm-alpha',
    metaTitle: 'PM Role',
    metaDescription: 'PM at Alpha',
    benefitsPerks: [],
    stats: { matched: 45, contacted: 30, replied: 15 },
    responsibilities: ['Roadmap', 'Stakeholder Mgmt']
  }
];

const MOCK_ACTION_QUEUE: ActionCard[] = [
  { id: 'act-1', type: 'NEW_MATCHES', title: 'Review 5 new matches', description: 'TechFlow - Senior React Dev', priority: 'High', projectId: 'prj-1' },
  { id: 'act-2', type: 'CHAT_FOLLOWUP', title: 'Review chatbot conversation', description: 'Rahul Verma - Reply not understood', priority: 'Medium', candidateId: 'cand-1' },
  { id: 'act-3', type: 'NO_RESPONSE', title: 'Manual follow-up needed', description: 'Sneha Gupta has not responded', priority: 'Low', candidateId: 'cand-2' },
  { id: 'act-4', type: 'INTERVENTION_NEEDED', title: 'Intervention Needed', description: 'Amit requires human chat', priority: 'High', candidateId: 'cand-1' },
];

const MOCK_TRANSCRIPT: ChatMessage[] = [
  { id: 'm1', sender: 'bot', text: 'Hi Amit, I saw your profile and it looks like a great fit for the Senior React Developer role at TechFlow. Are you interested?', timestamp: '10:00 AM' },
  { id: 'm2', sender: 'candidate', text: 'Yes, I am looking for a change. What is the budget?', timestamp: '10:05 AM' },
  { id: 'm3', sender: 'bot', text: 'The budget is up to 35 LPA. Does that meet your expectations?', timestamp: '10:06 AM' },
  { id: 'm4', sender: 'candidate', text: 'That works. Is it remote?', timestamp: '10:10 AM' },
  { id: 'm5', sender: 'bot', text: 'Yes, it is a remote-first role.', timestamp: '10:11 AM' },
  { id: 'm6', sender: 'candidate', text: 'Can we schedule a call? I have some specific questions about the tech stack.', timestamp: '10:15 AM' },
];

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    jobId: 'prj-1',
    professionalSummary: 'Experienced developer with 6 years in React ecosystem. Strong background in scalable web applications.',
    fullName: 'Amit Sharma',
    email: 'amit@example.com',
    phone: '9876543210',
    resumeUrl: 'amit_resume.pdf',
    resumeLastUpdated: '2 days ago',
    isActivelySearching: true,
    highestEducation: 'B.Tech CS',
    secondHighestEducation: 'HSC',
    yearOfPassing: '2017',
    fieldOfStudy: 'Computer Science',
    skills: ['React', 'Node.js', 'AWS'],
    certificates: ['AWS Certified'],
    projects: 'E-commerce Platform, Fintech Dashboard',
    githubUrl: 'github.com/amit',
    totalExperience: 6,
    currentRole: 'Senior Dev',
    expectedRole: 'Lead Dev',
    jobType: 'Full-time',
    currentLocations: ['Bangalore'],
    preferredLocations: ['Remote'],
    readyToRelocate: 'Yes',
    noticePeriod: '30 Days',
    shiftPreference: 'Day',
    workAuthorization: 'Citizen',
    currentCtc: '22 LPA',
    expectedCtc: '30 LPA',
    isCtcNegotiable: true,
    currency: 'INR',
    lookingForJobsAbroad: 'No',
    sectorType: 'Private',
    preferredIndustries: ['IT'],
    gender: 'Male',
    maritalStatus: 'Single',
    dob: '1995-05-15',
    languages: ['English', 'Hindi'],
    reservationCategory: 'General',
    disability: '',
    willingnessToTravel: 'No',
    drivingLicensePassport: true,
    workHistory: [{id: 'w1', jobTitle: 'Dev', companyName: 'Old Corp', startDate: '2020-01-01', endDate: 'Present', isCurrent: true, responsibilities: 'Coding', toolsUsed: ['React']}],
    hasCurrentOffers: false,
    preferredContactMode: 'Call',
    matchScore: 85,
    status: 'Screening',
    automationStatus: 'Intervention Needed',
    chatTranscript: MOCK_TRANSCRIPT,
    aiSummary: 'Strong candidate with relevant experience. Matches all mandatory skills. Recent experience in FinTech.',
    followUpStatus: 'Shortlisted',
    nextFollowUpDate: '2023-10-28',
    followUpRemarks: 'Needs technical round scheduling.'
  },
  {
    id: 'cand-2',
    jobId: 'prj-1',
    professionalSummary: 'Frontend developer passionate about UI/UX.',
    fullName: 'Sneha Gupta',
    email: 'sneha@example.com',
    phone: '9123456780',
    resumeUrl: 'sneha_cv.pdf',
    resumeLastUpdated: '1 week ago',
    isActivelySearching: true,
    highestEducation: 'MCA',
    secondHighestEducation: 'BCA',
    yearOfPassing: '2019',
    fieldOfStudy: 'Computer Applications',
    skills: ['React', 'Redux'],
    certificates: [],
    projects: 'Portfolio Site',
    totalExperience: 4,
    currentRole: 'Frontend Dev',
    expectedRole: 'Senior Frontend Dev',
    jobType: 'Full-time',
    currentLocations: ['Pune'],
    preferredLocations: ['Bangalore'],
    readyToRelocate: 'Yes',
    noticePeriod: '15 Days',
    shiftPreference: 'Flexible',
    currentCtc: '15 LPA',
    expectedCtc: '22 LPA',
    isCtcNegotiable: true,
    currency: 'INR',
    lookingForJobsAbroad: 'No',
    sectorType: 'Private',
    preferredIndustries: ['IT'],
    gender: 'Female',
    maritalStatus: 'Single',
    languages: ['English'],
    reservationCategory: 'General',
    willingnessToTravel: 'Yes',
    drivingLicensePassport: true,
    workHistory: [],
    hasCurrentOffers: true,
    numberOfOffers: 1,
    preferredContactMode: 'Email',
    matchScore: 72,
    status: 'New',
    automationStatus: 'Contacting...',
    aiSummary: 'Good fit but slightly less experience. Strong communication skills.',
    followUpStatus: 'Under follow up'
  }
];

// --- COMPONENTS ---

export const RecruiterWorkspace: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'job-deep-dive'>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [actionQueue, setActionQueue] = useState<ActionCard[]>(MOCK_ACTION_QUEUE);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null); // For Profile View
  const [coPilotCandidate, setCoPilotCandidate] = useState<Candidate | null>(null); // For Chat Modal
  const [showManualSearch, setShowManualSearch] = useState(false);

  // Job Status Management State (List View)
  const [jobs, setJobs] = useState<JobPost[]>(MOCK_JOBS);

  const selectedJob = useMemo(() => jobs.find(j => j.id === selectedJobId), [jobs, selectedJobId]);

  const handleJobStatusUpdate = (jobId: string, newStatus: any, remarks: string) => {
    if (window.confirm("Are you sure you want to update the job status?")) {
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus, statusRemarks: remarks } : j));
      // Show toast success (mock)
      alert("Job status updated successfully!");
    }
  };

  const handleActionDismiss = (id: string) => {
    setActionQueue(actionQueue.filter(a => a.id !== id));
  };

  // --- Sub-Components ---

  const ActionQueueCard = ({ action }: { action: ActionCard }) => (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all mb-3 relative group animate-in slide-in-from-left-2">
      <div className="flex justify-between items-start">
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          action.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {action.type.replace('_', ' ')}
        </div>
        <button onClick={(e) => { e.stopPropagation(); handleActionDismiss(action.id); }} className="text-slate-400 hover:text-slate-600">
          <X size={14} />
        </button>
      </div>
      <h4 className="font-bold text-sm text-slate-800 mt-2">{action.title}</h4>
      <p className="text-xs text-slate-500 mt-1">{action.description}</p>
      <div className="mt-3 pt-2 border-t flex justify-end">
        <button className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
          Take Action <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );

  const JobCard = ({ job }: { job: JobPost }) => {
    const [localStatus, setLocalStatus] = useState(job.status);
    const [localRemarks, setLocalRemarks] = useState(job.statusRemarks || '');

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
        <div className="p-5 flex-1 cursor-pointer" onClick={() => { setSelectedJobId(job.id); setView('job-deep-dive'); }}>
          <div className="flex justify-between items-start mb-2">
             <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
             <span className={`px-2 py-1 rounded text-xs font-bold ${
               job.status === 'Sourcing' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
             }`}>{job.status}</span>
          </div>
          <p className="text-sm text-slate-500 font-medium mb-4">{job.clientName} • {job.spocName}</p>
          
          <div className="flex items-center gap-4 text-sm text-slate-600">
             <div className="flex items-center gap-1">
                <User size={16} className="text-slate-400" />
                <span className="font-bold">{job.candidatesJoined}</span> Joined
             </div>
             <div className="flex items-center gap-1">
                <FileText size={16} className="text-slate-400" />
                <span>{job.numberOfOpenings} Openings</span>
             </div>
          </div>
        </div>

        {/* Footer: Status Management */}
        <div className="bg-slate-50 p-3 border-t rounded-b-xl flex flex-col gap-2">
           <div className="flex items-center gap-2">
              <select 
                value={localStatus} 
                onChange={(e) => setLocalStatus(e.target.value as any)}
                className="text-xs border rounded p-1 bg-white flex-1 font-medium"
              >
                 <option>WIP</option>
                 <option>Sourcing</option>
                 <option>Interview</option>
                 <option>Offer</option>
                 <option>Hold</option>
                 <option>Closed</option>
                 <option>Win</option>
                 <option>Partial Win</option>
              </select>
              <button 
                onClick={() => handleJobStatusUpdate(job.id, localStatus, localRemarks)}
                className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-slate-700"
              >
                Update
              </button>
           </div>
           <input 
              value={localRemarks}
              onChange={(e) => setLocalRemarks(e.target.value)}
              placeholder="Remarks..."
              className="text-xs border rounded p-1.5 w-full bg-white"
           />
        </div>
      </div>
    );
  };

  const CandidateCard = ({ candidate }: { candidate: Candidate }) => {
    const [followUpStatus, setFollowUpStatus] = useState(candidate.followUpStatus || '');
    const [nextDate, setNextDate] = useState(candidate.nextFollowUpDate || '');
    const [remarks, setRemarks] = useState(candidate.followUpRemarks || '');

    const getStatusColor = (status: string) => {
      if (status === 'New') return 'bg-slate-100 text-slate-600';
      if (status.includes('Contacting')) return 'bg-blue-100 text-blue-600';
      if (status.includes('Live Chat')) return 'bg-green-100 text-green-600 animate-pulse';
      if (status.includes('Intervention')) return 'bg-amber-100 text-amber-600';
      return 'bg-slate-100 text-slate-600';
    };

    const handleFollowUpUpdate = () => {
        if(window.confirm("Confirm follow-up status update?")) {
            // Mock API Call
            alert("Success: Candidate follow-up updated.");
        }
    };

    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-3 hover:border-blue-300 transition-all shadow-sm">
         <div className="flex items-start gap-3">
            <input type="checkbox" className="mt-1.5 w-4 h-4 rounded border-slate-300" />
            <div className="flex-1">
               <div className="flex justify-between items-start">
                  <div>
                     <h4 className="font-bold text-slate-900 text-lg">{candidate.fullName}</h4>
                     <p className="text-xs text-slate-500 mb-1">{candidate.currentRole} • {candidate.totalExperience} Yrs • {candidate.currentLocations[0]}</p>
                  </div>
                  <div className="text-right">
                     <div className="text-xl font-bold text-blue-600">{candidate.matchScore}%</div>
                     <div className="text-[10px] text-slate-400 uppercase font-bold">AI Match</div>
                  </div>
               </div>

               <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold mb-3 ${getStatusColor(candidate.automationStatus)}`}>
                  <Bot size={12} />
                  {candidate.automationStatus}
               </div>

               <div className="grid grid-cols-2 gap-2 mb-3">
                   <div className="col-span-2 md:col-span-1 bg-slate-50 p-2 rounded border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Skills</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {candidate.skills.slice(0, 3).map(s => <span key={s} className="text-xs bg-white px-1 border rounded text-slate-600">{s}</span>)}
                      </div>
                   </div>
                   <div className="col-span-2 md:col-span-1 bg-slate-50 p-2 rounded border border-slate-100 flex flex-col justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">AI Summary</p>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-tight">{candidate.aiSummary}</p>
                   </div>
               </div>

               {/* Follow-up Control Panel */}
               <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 mb-3 flex flex-wrap gap-2 items-center">
                  <select 
                    value={followUpStatus}
                    onChange={(e) => setFollowUpStatus(e.target.value)}
                    className="text-xs border rounded p-1 bg-white outline-none min-w-[100px]"
                  >
                     <option value="">Select Status</option>
                     <option>Shortlisted</option>
                     <option>Int-scheduled</option>
                     <option>Offered</option>
                     <option>Joined</option>
                     <option>No Show</option>
                     <option>Under Follow Up</option>
                  </select>
                  <input 
                    type="date" 
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    className="text-xs border rounded p-1 bg-white outline-none" 
                  />
                  <input 
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Remarks..." 
                    className="text-xs border rounded p-1 bg-white outline-none flex-1 min-w-[100px]" 
                  />
                  <button 
                    onClick={handleFollowUpUpdate}
                    className="text-xs bg-white border border-slate-300 px-2 py-1 rounded font-bold hover:bg-slate-100"
                  >
                    Update
                  </button>
               </div>

               {/* Dynamic Action Buttons */}
               <div className="flex gap-2 border-t pt-3">
                  <button 
                    onClick={() => setSelectedCandidate(candidate)}
                    className="flex-1 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 rounded hover:bg-slate-200 flex items-center justify-center gap-1"
                  >
                    <Eye size={14} /> View Profile
                  </button>
                  
                  {candidate.automationStatus === 'New' && (
                     <button className="flex-1 py-1.5 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center justify-center gap-1">
                        <MessageSquare size={14} /> Initiate Chatbot
                     </button>
                  )}
                  
                  {(candidate.automationStatus.includes('Live Chat') || candidate.automationStatus.includes('Intervention')) && (
                     <button 
                        onClick={() => setCoPilotCandidate(candidate)}
                        className="flex-1 py-1.5 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700 flex items-center justify-center gap-1 animate-pulse"
                     >
                        <Bot size={14} /> Open Co-Pilot
                     </button>
                  )}

                  <button className="py-1.5 px-3 text-xs font-bold text-red-600 bg-red-50 rounded hover:bg-red-100">
                     <X size={14} />
                  </button>
               </div>
            </div>
         </div>
      </div>
    );
  };

  // --- Main Views ---

  const DashboardView = () => (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold text-slate-800">Job Post Hub</h1>
         <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Plus size={18} /> Create New Job Post
         </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {jobs.map(job => <JobCard key={job.id} job={job} />)}
      </div>
    </div>
  );

  const JobDeepDiveView = () => {
    if (!selectedJob) return null;

    return (
      <div className="flex flex-col h-full">
         {/* Pinned Header */}
         <div className="bg-white border-b p-4 shadow-sm shrink-0 z-10">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-slate-700"><ChevronRight className="rotate-180" /></button>
                     <h1 className="text-2xl font-bold text-slate-900">{selectedJob.title}</h1>
                  </div>
                  <div className="flex items-center gap-4 mt-1 ml-6 text-sm text-slate-500">
                     <span>{selectedJob.clientName}</span>
                     <span>•</span>
                     <span className="font-mono text-xs bg-slate-100 px-1 rounded">{selectedJob.jobId}</span>
                     <span>•</span>
                     <span className="flex items-center gap-1 text-slate-700 font-medium"><MapPin size={12} /> {selectedJob.jobLocations.join(', ')}</span>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button 
                    onClick={() => setShowManualSearch(true)}
                    className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 flex items-center gap-2"
                  >
                     <Search size={16} /> Manual Search & Add
                  </button>
                  <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-sm">
                     <UploadCloud size={16} /> Upload & Parse
                  </button>
               </div>
            </div>
            
            {/* Non-Negotiable Criteria Strip */}
            <div className="flex flex-wrap gap-3 ml-6">
               {selectedJob.requiredSkills.map(skill => (
                  <div key={skill} className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-1 rounded text-xs font-bold border border-amber-100">
                     <Star size={10} className="fill-amber-500 text-amber-500" /> {skill}
                  </div>
               ))}
               <div className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                  <DollarSign size={10} /> {selectedJob.maxSalary ? `${selectedJob.maxSalary/100000} LPA` : 'N/A'}
               </div>
               <div className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                  <Clock size={10} /> {selectedJob.experienceRequired}
               </div>
            </div>
         </div>

         {/* Content */}
         <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 p-6">
            <div className="flex justify-between items-center mb-4">
               <h2 className="font-bold text-slate-700">Candidates ({MOCK_CANDIDATES.filter(c => c.jobId === selectedJob.id).length})</h2>
               <button className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 border border-blue-200">
                  Submit Selected to Client
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
               {MOCK_CANDIDATES.filter(c => c.jobId === selectedJob.id).length > 0 ? (
                   MOCK_CANDIDATES.filter(c => c.jobId === selectedJob.id).map(cand => <CandidateCard key={cand.id} candidate={cand} />)
               ) : (
                   <div className="text-center py-20 text-slate-400">
                      <p>No candidates yet. Use Manual Search or Upload Resumes.</p>
                   </div>
               )}
            </div>
         </div>
      </div>
    );
  };

  const ManualSearchModal = () => {
    if (!showManualSearch) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
         <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
               <h3 className="font-bold text-lg text-slate-800">Manual Search & Add</h3>
               <button onClick={() => setShowManualSearch(false)}><X className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Position / Role Name <span className="text-red-500">*</span></label>
                  <input className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. React Developer" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Location <span className="text-red-500">*</span></label>
                     <input className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="City" />
                     <button className="text-blue-600 text-xs font-bold mt-1 hover:underline">+ Add Another Location</button>
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Qualification</label>
                     <input className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. B.Tech" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">CTC Range</label>
                     <input className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 10-15 LPA" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Notice Period</label>
                     <select className="w-full border rounded p-2 bg-white outline-none">
                        <option>Any</option>
                        <option>Immediate</option>
                        <option>15 Days</option>
                        <option>30 Days</option>
                        <option>60 Days</option>
                     </select>
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Skills <span className="text-red-500">*</span></label>
                  <input className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Type and press enter to tag" />
               </div>
               
               <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-4">
                  <Search size={18} /> Search Database
               </button>
               
               {/* Mock Results */}
               <div className="mt-6 pt-6 border-t">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Search Results</h4>
                  <div className="space-y-2">
                     {[1, 2].map(i => (
                        <div key={i} className="flex items-center p-3 border rounded hover:bg-blue-50 cursor-pointer">
                           <input type="checkbox" className="mr-3 w-4 h-4" />
                           <div>
                              <p className="font-bold text-sm text-slate-800">Candidate Name {i}</p>
                              <p className="text-xs text-slate-500">Bangalore • 5 Yrs • React, Node</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end">
               <button onClick={() => setShowManualSearch(false)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">
                  Add Selected to Job Post
               </button>
            </div>
         </div>
      </div>
    );
  };

  const CoPilotModal = () => {
    if (!coPilotCandidate || !selectedJob) return null;
    
    const [manualMode, setManualMode] = useState(false);
    const [inputText, setInputText] = useState('');

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
         <div className="bg-white w-full max-w-6xl h-[80vh] rounded-2xl shadow-2xl flex overflow-hidden">
            {/* Left Pane: Context */}
            <div className="w-1/4 bg-slate-50 border-r p-6 flex flex-col">
               <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center text-slate-500">
                     <User size={40} />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900">{coPilotCandidate.fullName}</h3>
                  <p className="text-blue-600 font-medium">{selectedJob.title}</p>
               </div>
               <div className="space-y-4 text-sm">
                   <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Current Role</label>
                      <p className="font-medium">{coPilotCandidate.currentRole}</p>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Location</label>
                      <p className="font-medium">{coPilotCandidate.currentLocations[0]}</p>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Match Score</label>
                      <p className="font-bold text-green-600">{coPilotCandidate.matchScore}%</p>
                   </div>
               </div>
            </div>

            {/* Center Pane: Transcript */}
            <div className="flex-1 flex flex-col bg-white">
               <div className="p-4 border-b flex justify-between items-center shadow-sm">
                  <h3 className="font-bold flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 
                     Live Chat Co-Pilot
                  </h3>
                  <button onClick={() => setCoPilotCandidate(null)}><X className="text-slate-400" /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                  {coPilotCandidate.chatTranscript?.map(msg => (
                     <div key={msg.id} className={`flex ${msg.sender === 'candidate' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                           msg.sender === 'candidate' ? 'bg-white border text-slate-700 rounded-bl-none' : 
                           msg.sender === 'bot' ? 'bg-blue-50 text-blue-800 border border-blue-100 rounded-br-none' : 
                           'bg-green-50 text-green-800 border border-green-100 rounded-br-none'
                        }`}>
                           {msg.text}
                           <div className="text-[10px] opacity-60 mt-1 text-right">{msg.timestamp}</div>
                        </div>
                     </div>
                  ))}
               </div>
               
               {/* Control Panel */}
               <div className="p-4 border-t bg-white">
                  <div className="flex items-center gap-3">
                     <button 
                        onClick={() => setManualMode(!manualMode)}
                        className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition-all flex items-center gap-2 ${
                           manualMode ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white animate-pulse'
                        }`}
                     >
                        {manualMode ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
                        {manualMode ? 'Resume Automation' : 'Intervene'}
                     </button>
                     <div className="flex-1 relative">
                        <input 
                           disabled={!manualMode}
                           value={inputText}
                           onChange={(e) => setInputText(e.target.value)}
                           placeholder={manualMode ? "Type your message..." : "Automation active. Click Intervene to type."}
                           className="w-full border rounded-lg pl-4 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                        />
                        <button disabled={!manualMode} className="absolute right-2 top-2 text-blue-600 disabled:text-slate-400">
                           <Send size={20} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Pane: Briefing */}
            <div className="w-1/5 bg-slate-50 border-l p-6 overflow-y-auto">
               <h4 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
                  <Star size={14} className="text-amber-500 fill-amber-500" /> Non-Negotiables
               </h4>
               <div className="space-y-3">
                  {selectedJob.requiredSkills.map(skill => (
                     <div key={skill} className="text-xs bg-white p-2 rounded border border-slate-200 text-slate-700 font-medium">
                        {skill}
                     </div>
                  ))}
                  <div className="text-xs bg-white p-2 rounded border border-slate-200 text-slate-700 font-medium">
                     Exp: {selectedJob.experienceRequired}
                  </div>
                  <div className="text-xs bg-white p-2 rounded border border-slate-200 text-slate-700 font-medium">
                     Loc: {selectedJob.jobLocations.join(', ')}
                  </div>
               </div>
            </div>
         </div>
      </div>
    );
  };

  const UnifiedProfileView = () => {
    if (!selectedCandidate) return null;
    
    const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');
    const [profile, setProfile] = useState<Candidate>(selectedCandidate);

    // Helper for repeatable fields
    const handleWorkHistoryChange = (index: number, field: keyof WorkExperience, value: any) => {
      const updated = [...profile.workHistory];
      updated[index] = { ...updated[index], [field]: value };
      setProfile({ ...profile, workHistory: updated });
    };

    const addWorkHistory = () => {
      const newWork: WorkExperience = {
        id: `wh-${Date.now()}`,
        jobTitle: '',
        companyName: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        responsibilities: '',
        toolsUsed: [],
        ctc: ''
      };
      setProfile({ ...profile, workHistory: [...profile.workHistory, newWork] });
    };

    const removeWorkHistory = (index: number) => {
      const updated = [...profile.workHistory];
      updated.splice(index, 1);
      setProfile({ ...profile, workHistory: updated });
    };

    return (
      <div className="fixed inset-0 bg-slate-900 z-[70] flex overflow-hidden animate-in fade-in duration-200">
         {/* Left: Resume Viewer (Fixed) */}
         <div className="w-5/12 bg-slate-800 p-4 flex flex-col border-r border-slate-700">
             <div className="flex items-center justify-between text-white mb-4">
                <h3 className="font-bold flex items-center gap-2"><FileText size={20} /> Original Resume</h3>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">PDF Preview</span>
             </div>
             <div className="flex-1 bg-slate-600 rounded-lg flex items-center justify-center text-slate-400">
                <div className="text-center">
                   <File size={48} className="mx-auto mb-2 opacity-50" />
                   <p>PDF Rendering Mock</p>
                   <p className="text-sm opacity-70">{profile.resumeUrl}</p>
                </div>
             </div>
         </div>

         {/* Right: Editable Profile Form (Scrollable) */}
         <div className="w-7/12 bg-white flex flex-col">
             {/* Header */}
             <div className="h-16 border-b flex items-center justify-between px-6 shrink-0">
                <div className="flex gap-6">
                   <button 
                     onClick={() => setActiveTab('details')}
                     className={`text-sm font-bold py-5 border-b-2 transition-colors ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
                   >
                     Candidate Details
                   </button>
                   <button 
                     onClick={() => setActiveTab('chat')}
                     className={`text-sm font-bold py-5 border-b-2 transition-colors ${activeTab === 'chat' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
                   >
                     Full Chat History
                   </button>
                </div>
                <div className="flex items-center gap-2">
                   <button className="p-2 hover:bg-slate-100 rounded-full" onClick={() => setSelectedCandidate(null)}><X size={24} className="text-slate-500" /></button>
                </div>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto p-8 bg-slate-50 custom-scrollbar">
                {activeTab === 'details' ? (
                  <div className="max-w-3xl mx-auto space-y-8">
                      {/* Professional Summary (Top Level) */}
                      <section className="bg-white p-6 rounded-xl border shadow-sm">
                          <h4 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
                             <Sparkles size={18} className="text-purple-500" /> Professional Summary
                          </h4>
                          <textarea 
                             value={profile.professionalSummary} 
                             onChange={e => setProfile({...profile, professionalSummary: e.target.value})} 
                             className="w-full border p-3 rounded-lg h-24 outline-none focus:ring-2 focus:ring-blue-500"
                             placeholder="Enter professional summary..."
                          />
                      </section>

                      {/* Section A: Identity Basics */}
                      <section className="bg-white p-6 rounded-xl border shadow-sm">
                         <h4 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2 flex items-center gap-2">
                             <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">A</span> Identity Basics
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                               <input value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                               <input value={profile.email} readOnly className="w-full border p-2 rounded bg-slate-50" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mobile Number</label>
                               <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">LinkedIn URL</label>
                               <input value={profile.linkedinUrl || ''} onChange={e => setProfile({...profile, linkedinUrl: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Profile Photo</label>
                               <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                                     <User size={20} />
                                  </div>
                                  <button className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                                     <Upload size={12} /> Upload
                                  </button>
                               </div>
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Resume File</label>
                               <div className="flex items-center gap-2 border p-2 rounded bg-slate-50">
                                  <FileText size={16} className="text-slate-400" />
                                  <span className="text-sm text-slate-600 truncate flex-1">{profile.resumeUrl}</span>
                                  <button className="text-xs text-blue-600 font-bold hover:underline">Update</button>
                               </div>
                            </div>
                            <div className="col-span-1 md:col-span-2 flex items-center justify-between bg-slate-50 p-3 rounded border mt-2">
                               <div>
                                   <p className="text-xs font-bold text-slate-500 uppercase">Resume Last Updated</p>
                                   <p className="text-sm font-medium">{profile.resumeLastUpdated}</p>
                               </div>
                               <div className="flex items-center gap-2">
                                   <span className="text-sm font-medium">Actively Searching for Job</span>
                                   <div className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${profile.isActivelySearching ? 'bg-green-500' : 'bg-slate-300'}`} onClick={() => setProfile({...profile, isActivelySearching: !profile.isActivelySearching})}>
                                      <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${profile.isActivelySearching ? 'translate-x-4' : ''}`}></div>
                                   </div>
                               </div>
                            </div>
                         </div>
                      </section>

                      {/* Section B: Education & Skills */}
                      <section className="bg-white p-6 rounded-xl border shadow-sm">
                         <h4 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2 flex items-center gap-2">
                             <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">B</span> Education & Skills
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Highest Education</label>
                               <input value={profile.highestEducation} onChange={e => setProfile({...profile, highestEducation: e.target.value})} className="w-full border p-2 rounded" placeholder='e.g. "M.Sc Computer Science"' />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Second Highest Education</label>
                               <input value={profile.secondHighestEducation || ''} onChange={e => setProfile({...profile, secondHighestEducation: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Field of Study</label>
                               <input value={profile.fieldOfStudy || ''} onChange={e => setProfile({...profile, fieldOfStudy: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Year of Passing (Highest)</label>
                               <input value={profile.yearOfPassing || ''} onChange={e => setProfile({...profile, yearOfPassing: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                            <div className="md:col-span-2">
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Skills</label>
                               <input value={profile.skills.join(', ')} onChange={e => setProfile({...profile, skills: e.target.value.split(',')})} className="w-full border p-2 rounded" placeholder="Comma separated tags" />
                            </div>
                            <div className="md:col-span-2">
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Certificates</label>
                               <input value={profile.certificates.join(', ')} onChange={e => setProfile({...profile, certificates: e.target.value.split(',')})} className="w-full border p-2 rounded" placeholder="Comma separated tags" />
                            </div>
                            <div className="md:col-span-2">
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Projects / Profile</label>
                               <input value={profile.projects || ''} onChange={e => setProfile({...profile, projects: e.target.value})} className="w-full border p-2 rounded" placeholder="Short list or links" />
                            </div>
                             <div className="md:col-span-2">
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">GitHub / Behance / Kaggle URL</label>
                               <input value={profile.githubUrl || ''} onChange={e => setProfile({...profile, githubUrl: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                         </div>
                      </section>

                      {/* Section C: Job Preferences */}
                      <section className="bg-white p-6 rounded-xl border shadow-sm">
                         <h4 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2 flex items-center gap-2">
                             <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">C</span> Job Preferences
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Experience (Years)</label>
                               <input type="number" value={profile.totalExperience} onChange={e => setProfile({...profile, totalExperience: parseFloat(e.target.value)})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Role</label>
                               <input value={profile.currentRole} onChange={e => setProfile({...profile, currentRole: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expected Role</label>
                               <input value={profile.expectedRole} onChange={e => setProfile({...profile, expectedRole: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Job Type</label>
                               <select value={profile.jobType} onChange={e => setProfile({...profile, jobType: e.target.value})} className="w-full border p-2 rounded bg-white">
                                   <option>Full-time</option>
                                   <option>Part-time</option>
                                   <option>Contract</option>
                                   <option>Remote</option>
                                   <option>Hybrid</option>
                               </select>
                            </div>
                             <div className="md:col-span-2">
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Locations</label>
                               <input value={profile.currentLocations.join(', ')} onChange={e => setProfile({...profile, currentLocations: e.target.value.split(',')})} className="w-full border p-2 rounded" />
                            </div>
                            <div className="md:col-span-3">
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preferred Locations</label>
                               <input value={profile.preferredLocations.join(', ')} onChange={e => setProfile({...profile, preferredLocations: e.target.value.split(',')})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ready to Relocate</label>
                               <select value={profile.readyToRelocate} onChange={e => setProfile({...profile, readyToRelocate: e.target.value})} className="w-full border p-2 rounded bg-white">
                                   <option>Yes</option>
                                   <option>No</option>
                                   <option>Open to Discussion</option>
                               </select>
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notice Period</label>
                               <select value={profile.noticePeriod} onChange={e => setProfile({...profile, noticePeriod: e.target.value})} className="w-full border p-2 rounded bg-white">
                                   <option>Immediate</option>
                                   <option>15 Days</option>
                                   <option>30 Days</option>
                                   <option>45 Days</option>
                                   <option>60 Days</option>
                                   <option>90+ Days</option>
                               </select>
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Availability to Join</label>
                               <input type="date" value={profile.availabilityDate || ''} onChange={e => setProfile({...profile, availabilityDate: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Shift Preference</label>
                               <select value={profile.shiftPreference || 'Any'} onChange={e => setProfile({...profile, shiftPreference: e.target.value})} className="w-full border p-2 rounded bg-white">
                                   <option>Day</option>
                                   <option>Night</option>
                                   <option>Flexible</option>
                                   <option>Any</option>
                               </select>
                            </div>
                            <div className="md:col-span-2">
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Work Authorization / Visa</label>
                               <input value={profile.workAuthorization || ''} onChange={e => setProfile({...profile, workAuthorization: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                         </div>
                      </section>

                      {/* Section D: Salary Info */}
                      <section className="bg-white p-6 rounded-xl border shadow-sm">
                         <h4 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2 flex items-center gap-2">
                             <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">D</span> Salary Info
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current CTC (LPA)</label>
                               <input type="number" value={profile.currentCtc.replace(/[^0-9.]/g, '')} onChange={e => setProfile({...profile, currentCtc: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expected CTC (LPA)</label>
                               <input type="number" value={profile.expectedCtc.replace(/[^0-9.]/g, '')} onChange={e => setProfile({...profile, expectedCtc: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Currency</label>
                               <select value={profile.currency} onChange={e => setProfile({...profile, currency: e.target.value})} className="w-full border p-2 rounded bg-white">
                                   <option>INR</option>
                                   <option>USD</option>
                               </select>
                            </div>
                            <div className="flex items-center gap-2 mt-6">
                                <div className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${profile.isCtcNegotiable ? 'bg-blue-500' : 'bg-slate-300'}`} onClick={() => setProfile({...profile, isCtcNegotiable: !profile.isCtcNegotiable})}>
                                      <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${profile.isCtcNegotiable ? 'translate-x-4' : ''}`}></div>
                                </div>
                                <label className="text-sm font-medium">Negotiable</label>
                            </div>
                         </div>
                      </section>

                       {/* Section E: Broader Preferences & Personal Details */}
                      <section className="bg-white p-6 rounded-xl border shadow-sm">
                         <h4 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2 flex items-center gap-2">
                             <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">E</span> Broader Preferences & Personal Details
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Looking for Jobs Abroad</label>
                               <select value={profile.lookingForJobsAbroad} onChange={e => setProfile({...profile, lookingForJobsAbroad: e.target.value})} className="w-full border p-2 rounded bg-white">
                                   <option>Yes</option>
                                   <option>No</option>
                               </select>
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sector Type</label>
                               <select value={profile.sectorType} onChange={e => setProfile({...profile, sectorType: e.target.value})} className="w-full border p-2 rounded bg-white">
                                   <option>Government</option>
                                   <option>Private</option>
                                   <option>Both</option>
                               </select>
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preferred Industries</label>
                               <input value={profile.preferredIndustries.join(', ')} onChange={e => setProfile({...profile, preferredIndustries: e.target.value.split(',')})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                               <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})} className="w-full border p-2 rounded bg-white">
                                   <option>Male</option>
                                   <option>Female</option>
                                   <option>Other</option>
                                   <option>Prefer not to say</option>
                               </select>
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Marital Status</label>
                               <select value={profile.maritalStatus} onChange={e => setProfile({...profile, maritalStatus: e.target.value})} className="w-full border p-2 rounded bg-white">
                                   <option>Single</option>
                                   <option>Married</option>
                                   <option>Other</option>
                               </select>
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Birth</label>
                               <input type="date" value={profile.dob || ''} onChange={e => setProfile({...profile, dob: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Languages Known</label>
                               <input value={profile.languages.join(', ')} onChange={e => setProfile({...profile, languages: e.target.value.split(',')})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reservation Category</label>
                               <select value={profile.reservationCategory || 'General'} onChange={e => setProfile({...profile, reservationCategory: e.target.value})} className="w-full border p-2 rounded bg-white">
                                   <option>General</option>
                                   <option>OBC</option>
                                   <option>SC</option>
                                   <option>ST</option>
                                   <option>EWS</option>
                                   <option>Other</option>
                               </select>
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Willingness to Travel</label>
                               <select value={profile.willingnessToTravel} onChange={e => setProfile({...profile, willingnessToTravel: e.target.value})} className="w-full border p-2 rounded bg-white">
                                   <option>Yes</option>
                                   <option>No</option>
                                   <option>Occasionally</option>
                               </select>
                            </div>
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="border p-3 rounded bg-slate-50">
                                  <div className="flex items-center gap-2 mb-2">
                                      <div className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${!!profile.disability ? 'bg-blue-500' : 'bg-slate-300'}`} onClick={() => setProfile({...profile, disability: profile.disability ? '' : 'Yes'})}>
                                            <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${!!profile.disability ? 'translate-x-4' : ''}`}></div>
                                      </div>
                                      <label className="text-sm font-medium">Disability (if any)</label>
                                  </div>
                                  {!!profile.disability && (
                                      <input 
                                        value={profile.disability === 'Yes' ? '' : profile.disability} 
                                        onChange={e => setProfile({...profile, disability: e.target.value})} 
                                        className="w-full border p-2 rounded text-sm" 
                                        placeholder="Specify disability details..." 
                                      />
                                  )}
                               </div>
                               <div className="border p-3 rounded bg-slate-50 flex items-center gap-2">
                                    <div className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${profile.drivingLicensePassport ? 'bg-blue-500' : 'bg-slate-300'}`} onClick={() => setProfile({...profile, drivingLicensePassport: !profile.drivingLicensePassport})}>
                                            <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${profile.drivingLicensePassport ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <label className="text-sm font-medium">Driving License / Passport</label>
                               </div>
                            </div>
                         </div>
                      </section>

                      {/* Section F: Work History */}
                      <section className="bg-white p-6 rounded-xl border shadow-sm">
                         <h4 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2 flex items-center gap-2">
                             <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">F</span> Work History
                         </h4>
                         <div className="space-y-4">
                             {profile.workHistory.map((work, idx) => (
                                <div key={work.id} className="p-4 border rounded bg-slate-50 relative group">
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Job Title / Role</label>
                                            <input value={work.jobTitle} onChange={e => handleWorkHistoryChange(idx, 'jobTitle', e.target.value)} className="w-full p-2 border rounded bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name</label>
                                            <input value={work.companyName} onChange={e => handleWorkHistoryChange(idx, 'companyName', e.target.value)} className="w-full p-2 border rounded bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                                            <input type="date" value={work.startDate} onChange={e => handleWorkHistoryChange(idx, 'startDate', e.target.value)} className="w-full p-2 border rounded bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                                            <div className="flex gap-2 items-center">
                                                <input type="date" disabled={work.isCurrent} value={work.endDate === 'Present' ? '' : work.endDate} onChange={e => handleWorkHistoryChange(idx, 'endDate', e.target.value)} className="w-full p-2 border rounded bg-white disabled:bg-slate-100" />
                                                <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                                                    <input type="checkbox" checked={work.isCurrent} onChange={e => handleWorkHistoryChange(idx, 'isCurrent', e.target.checked)} /> Present
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Key Responsibilities</label>
                                        <textarea value={work.responsibilities} onChange={e => handleWorkHistoryChange(idx, 'responsibilities', e.target.value)} className="w-full p-2 border rounded bg-white h-20" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                         <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tools / Tech Stack Used</label>
                                            <input value={work.toolsUsed.join(', ')} onChange={e => handleWorkHistoryChange(idx, 'toolsUsed', e.target.value.split(',').map(s => s.trim()))} className="w-full p-2 border rounded bg-white" />
                                         </div>
                                         <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CTC in that Role (optional)</label>
                                            <input value={work.ctc || ''} onChange={e => handleWorkHistoryChange(idx, 'ctc', e.target.value)} className="w-full p-2 border rounded bg-white" />
                                         </div>
                                    </div>
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <button className="p-1 text-slate-300 hover:text-blue-500" title="Edit"><Edit size={14}/></button>
                                        <button onClick={() => removeWorkHistory(idx)} className="p-1 text-slate-300 hover:text-red-500" title="Remove"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                             ))}
                             <button onClick={addWorkHistory} className="w-full py-2 border border-dashed rounded text-slate-500 hover:bg-slate-50 text-sm font-bold">+ Add Past Role</button>
                         </div>
                      </section>

                      {/* Section G: Contact & Availability */}
                      <section className="bg-white p-6 rounded-xl border shadow-sm">
                         <h4 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2 flex items-center gap-2">
                             <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">G</span> Contact & Availability
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Has Current Offers?</label>
                               <select value={profile.hasCurrentOffers ? 'Yes' : 'No'} onChange={e => setProfile({...profile, hasCurrentOffers: e.target.value === 'Yes'})} className="w-full border p-2 rounded bg-white">
                                   <option>Yes</option>
                                   <option>No</option>
                               </select>
                            </div>
                            {profile.hasCurrentOffers && (
                                <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Number of Offers</label>
                                   <input type="number" value={profile.numberOfOffers || 0} onChange={e => setProfile({...profile, numberOfOffers: parseInt(e.target.value)})} className="w-full border p-2 rounded" />
                                </div>
                            )}
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Best Time to Contact</label>
                               <input value={profile.bestTimeToContact || ''} onChange={e => setProfile({...profile, bestTimeToContact: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preferred Mode of Contact</label>
                               <select value={profile.preferredContactMode} onChange={e => setProfile({...profile, preferredContactMode: e.target.value})} className="w-full border p-2 rounded bg-white">
                                   <option>Call</option>
                                   <option>Email</option>
                                   <option>WhatsApp</option>
                               </select>
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alternative Email</label>
                               <input value={profile.alternateEmail || ''} onChange={e => setProfile({...profile, alternateEmail: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alternative Phone</label>
                               <input value={profile.alternatePhone || ''} onChange={e => setProfile({...profile, alternatePhone: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time Zone</label>
                               <select value={profile.timeZone || 'IST'} onChange={e => setProfile({...profile, timeZone: e.target.value})} className="w-full border p-2 rounded bg-white">
                                   <option>IST</option>
                                   <option>PST</option>
                                   <option>EST</option>
                                   <option>UTC</option>
                               </select>
                            </div>
                         </div>
                      </section>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border overflow-hidden">
                     {profile.chatTranscript?.map(msg => (
                        <div key={msg.id} className={`p-4 border-b flex gap-4 ${msg.sender === 'bot' ? 'bg-blue-50/30' : msg.sender === 'recruiter' ? 'bg-green-50/30' : ''}`}>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              msg.sender === 'candidate' ? 'bg-slate-200 text-slate-600' : msg.sender === 'bot' ? 'bg-blue-200 text-blue-700' : 'bg-green-200 text-green-700'
                           }`}>
                              {msg.sender === 'candidate' ? 'C' : msg.sender === 'bot' ? 'AI' : 'R'}
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <span className="font-bold text-sm capitalize">{msg.sender}</span>
                                 <span className="text-xs text-slate-400">{msg.timestamp}</span>
                              </div>
                              <p className="text-slate-700 text-sm">{msg.text}</p>
                           </div>
                        </div>
                     ))}
                     {!profile.chatTranscript && <div className="p-10 text-center text-slate-400">No chat history available.</div>}
                  </div>
                )}
             </div>

             {/* Footer Actions */}
             <div className="p-4 border-t bg-white flex justify-end gap-4 shrink-0">
                <button className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border border-transparent hover:border-red-200 transition-colors">
                   <Trash2 size={16} /> Reject & Delete Profile
                </button>
                <button className="text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg font-bold text-sm border border-slate-300">
                   Save as Draft
                </button>
                <button 
                  onClick={() => { setSelectedCandidate(null); alert('Profile Verified & Saved!'); }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                >
                   <CheckSquare size={16} /> Verify & Save Profile
                </button>
             </div>
         </div>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left Column: Action Queue */}
      <div className="w-1/4 min-w-[300px] max-w-sm border-r bg-slate-50 flex flex-col">
         <div className="p-4 border-b bg-white">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
               <Layout size={18} /> My Action Queue
            </h2>
            <p className="text-xs text-slate-500 mt-1">Prioritized tasks requiring intervention.</p>
         </div>
         <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {actionQueue.length > 0 ? (
               actionQueue.map(action => <ActionQueueCard key={action.id} action={action} />)
            ) : (
               <div className="text-center py-10 text-slate-400 text-sm italic">
                  <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                  <p>All caught up! No pending actions.</p>
               </div>
            )}
         </div>
      </div>

      {/* Right Column: Job Post Hub */}
      <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
         {view === 'dashboard' ? <DashboardView /> : <JobDeepDiveView />}
         
         {/* Modals */}
         <ManualSearchModal />
         <CoPilotModal />
         <UnifiedProfileView />
      </div>
    </div>
  );
};

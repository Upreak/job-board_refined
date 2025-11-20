
import React, { useState, useRef } from 'react';
import { JobApplication, JobPost, User, Candidate, WorkExperience } from '../../types';
import { Briefcase, FileText, CheckCircle, Clock, MapPin, Search, User as UserIcon, Bell, ChevronRight, Upload, Plus, Trash2, Save, Sparkles, Loader2, Edit } from 'lucide-react';
import { parseResumeAI } from '../../services/geminiService';

// Mock Data
const MOCK_CANDIDATE_PROFILE: Candidate = {
  id: 'cand-1',
  fullName: 'Amit Sharma',
  email: 'amit.sharma@example.com',
  phone: '+91 98765 43210',
  resumeUrl: '#',
  resumeLastUpdated: '2 days ago',
  isActivelySearching: true,
  professionalSummary: 'Senior React Developer with 5.5 years of experience in building scalable frontend applications. Proficient in React, TypeScript, and AWS. Proven track record of leading teams.',
  
  // Section A
  linkedinUrl: 'https://linkedin.com/in/amitsharma',
  portfolioUrl: 'https://amit.dev',

  // Section B
  highestEducation: 'B.Tech Computer Science',
  secondHighestEducation: 'HSC',
  fieldOfStudy: 'Computer Engineering',
  yearOfPassing: '2018',
  skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
  certificates: ['AWS Certified Developer', 'Meta Frontend Dev'],
  projects: 'Built an E-commerce platform using MERN stack.',
  githubUrl: 'https://github.com/amitsharma',

  // Section C
  totalExperience: 5.5,
  currentRole: 'Senior Developer',
  expectedRole: 'Tech Lead',
  jobType: 'Full-time',
  currentLocations: ['Bangalore'],
  preferredLocations: ['Bangalore', 'Remote'],
  readyToRelocate: 'Open to Discussion',
  noticePeriod: '30 Days',
  availabilityDate: '2023-11-01',
  shiftPreference: 'Day',
  workAuthorization: 'N/A',

  // Section D
  currentCtc: '2200000',
  expectedCtc: '3000000',
  isCtcNegotiable: true,
  currency: 'INR',

  // Section E
  lookingForJobsAbroad: 'No',
  sectorType: 'Private',
  preferredIndustries: ['IT Services', 'SaaS'],
  gender: 'Male',
  maritalStatus: 'Single',
  dob: '1996-08-15',
  languages: ['English', 'Hindi', 'Kannada'],
  reservationCategory: 'General',
  disability: '',
  willingnessToTravel: 'Occasionally',
  drivingLicensePassport: true,

  // Section F
  workHistory: [
    {
      id: 'wh-1',
      jobTitle: 'Senior Developer',
      companyName: 'TechFlow Inc',
      startDate: '2021-06-01',
      endDate: 'Present',
      isCurrent: true,
      responsibilities: 'Leading the frontend team, migrating legacy code to React.',
      toolsUsed: ['React', 'Redux', 'Jira'],
      ctc: '22 LPA'
    }
  ],

  // Section G
  hasCurrentOffers: false,
  preferredContactMode: 'Email',
  alternateEmail: 'amit.alt@email.com',
  timeZone: 'IST',
  matchScore: 0,
  status: 'New',
  automationStatus: 'New',
  aiSummary: 'Senior React Developer with 5.5 years of experience in building scalable frontend applications. Proficient in React, TypeScript, and AWS.'
};

const MY_APPLICATIONS: JobApplication[] = [
  { id: 'app-1', jobId: 'job-1', jobTitle: 'Senior React Developer', clientName: 'TechFlow Inc', appliedDate: '2 Oct 2023', status: 'Interview', lastUpdate: 'Interview scheduled for tomorrow' },
  { id: 'app-2', jobId: 'job-2', jobTitle: 'Frontend Engineer', clientName: 'StartUp Z', appliedDate: '28 Sep 2023', status: 'Screening', lastUpdate: 'Profile under review by recruiter' },
];

const RECOMMENDED_JOBS: Partial<JobPost>[] = [
  { 
    id: 'job-4', 
    title: 'Full Stack Lead', 
    clientName: 'Enterpise Corp', 
    jobLocations: ['Remote'], 
    minSalary: 3500000, 
    maxSalary: 4500000,
    currency: 'INR' 
  },
  { 
    id: 'job-5', 
    title: 'Product Designer', 
    clientName: 'DesignFirst', 
    jobLocations: ['Bangalore'], 
    minSalary: 1800000, 
    maxSalary: 2500000,
    currency: 'INR' 
  },
];

export const CandidatePortal: React.FC<{ user: User }> = ({ user }) => {
  const [view, setView] = useState<'dashboard' | 'profile' | 'jobs'>('dashboard');
  const [profile, setProfile] = useState<Candidate>(MOCK_CANDIDATE_PROFILE);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      // Simulate extracting text from file (in production this would be client-side OCR or backend call)
      const mockFileText = `Resume of ${user.name}...`; 
      
      // Call AI Service
      const parsedData = await parseResumeAI(mockFileText);

      // Update Profile with parsed data
      setProfile(prev => ({
        ...prev,
        fullName: parsedData.fullName || prev.fullName,
        email: parsedData.email || prev.email,
        phone: parsedData.phone || prev.phone,
        skills: parsedData.skills || prev.skills,
        totalExperience: parsedData.experience || prev.totalExperience,
        currentCtc: parsedData.currentCtc || prev.currentCtc,
        expectedCtc: parsedData.expectedCtc || prev.expectedCtc,
        resumeUrl: file.name,
        resumeLastUpdated: 'Just now',
        // We could also auto-generate the summary here if needed
      }));

    } catch (error) {
      console.error("Failed to parse resume", error);
      alert("Could not parse resume. Please try again.");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // --- Helper Components ---
  const StatusBadge = ({ status }: { status: string }) => {
    const styles = 
      status === 'Interview' ? 'bg-purple-100 text-purple-700' :
      status === 'Offer' ? 'bg-green-100 text-green-700' :
      status === 'Rejected' ? 'bg-red-100 text-red-700' :
      'bg-blue-100 text-blue-700';
    return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles}`}>{status}</span>;
  };

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

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-blue-100 max-w-xl">You have <span className="font-bold text-white">{MY_APPLICATIONS.length} active applications</span>.</p>
        </div>
        <Briefcase size={200} className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800">My Applications</h2>
          <div className="space-y-4">
            {MY_APPLICATIONS.map(app => (
              <div key={app.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{app.jobTitle}</h3>
                    <p className="text-slate-500 text-sm">{app.clientName}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="relative pt-4 pb-2">
                  <div className="flex items-center text-xs text-slate-400 font-medium justify-between mb-2 uppercase tracking-wide">
                     <span className="text-blue-600">Applied</span>
                     <span className={['Screening', 'Interview', 'Offer'].includes(app.status) ? 'text-blue-600' : ''}>Screening</span>
                     <span className={['Interview', 'Offer'].includes(app.status) ? 'text-blue-600' : ''}>Interview</span>
                     <span className={['Offer'].includes(app.status) ? 'text-blue-600' : ''}>Offer</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${app.status === 'Rejected' ? 'bg-red-400 w-full' : 'bg-blue-500'}`}
                      style={{ width: app.status === 'Applied' ? '25%' : app.status === 'Screening' ? '50%' : app.status === 'Interview' ? '75%' : '100%' }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Recommended for You</h2>
          <div className="space-y-4">
             {RECOMMENDED_JOBS.map(job => (
               <div key={job.id} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
                  <h3 className="font-bold text-slate-800">{job.title}</h3>
                  <p className="text-sm text-slate-500 mb-2">{job.clientName}</p>
                  <button className="w-full py-2 rounded-lg border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50">View & Apply</button>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-5xl mx-auto animate-in slide-in-from-right-4 pb-20">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-slate-50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm bg-slate-50/90">
          <div>
             <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
             <p className="text-slate-500 text-sm">Manage your professional identity.</p>
          </div>
          <div className="flex items-center gap-3">
            <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileSelect} 
               className="hidden" 
               accept=".pdf,.doc,.docx"
            />
            <button 
               onClick={triggerFileUpload} 
               disabled={isParsing}
               className="flex items-center gap-2 bg-white border border-blue-200 text-blue-700 px-4 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
               {isParsing ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
               {isParsing ? 'Parsing...' : 'Upload Resume & Auto-fill'}
            </button>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 shadow-sm">
               <Save size={18} /> Save Profile
            </button>
          </div>
        </div>

        <div className="p-8 space-y-10">
           {/* Professional Summary */}
           <section>
              <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-6 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  <Sparkles size={12} />
                </span> 
                Professional Summary
              </h3>
              <div className="relative group">
                  <textarea 
                    value={profile.professionalSummary} 
                    onChange={e => setProfile({...profile, professionalSummary: e.target.value})} 
                    className="w-full p-4 border border-purple-200 rounded-xl bg-purple-50 text-slate-700 leading-relaxed focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all h-32"
                    placeholder="Enter professional summary..."
                  />
              </div>
           </section>

           {/* Section A: Identity Basics */}
           <section>
              <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">A</span> 
                Identity Basics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input value={profile.email} readOnly className="w-full p-2.5 border rounded-lg bg-slate-50" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                    <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
                    <input value={profile.linkedinUrl || ''} onChange={e => setProfile({...profile, linkedinUrl: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="https://linkedin.com/in/..." />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Portfolio URL</label>
                    <input value={profile.portfolioUrl || ''} onChange={e => setProfile({...profile, portfolioUrl: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="https://myportfolio.com" />
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Resume</label>
                        <div className="text-sm text-slate-500 truncate">{profile.resumeUrl !== '#' ? profile.resumeUrl : 'No resume uploaded'}</div>
                        <div className="text-xs text-slate-400">Updated: {profile.resumeLastUpdated}</div>
                    </div>
                 </div>
                 <div className="col-span-2 flex items-center gap-3 bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${profile.isActivelySearching ? 'bg-green-500' : 'bg-slate-300'}`} onClick={() => setProfile({...profile, isActivelySearching: !profile.isActivelySearching})}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${profile.isActivelySearching ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="font-medium text-slate-700">Actively Searching for Jobs</span>
                 </div>
              </div>
           </section>

           {/* Section B: Education & Skills */}
           <section>
              <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">B</span>
                Education & Skills
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Highest Education</label>
                    <input value={profile.highestEducation} onChange={e => setProfile({...profile, highestEducation: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="e.g. M.Sc Computer Science" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Year of Passing (Highest)</label>
                    <input type="number" value={profile.yearOfPassing} onChange={e => setProfile({...profile, yearOfPassing: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Second Highest Education</label>
                    <input value={profile.secondHighestEducation || ''} onChange={e => setProfile({...profile, secondHighestEducation: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Field of Study</label>
                    <input value={profile.fieldOfStudy || ''} onChange={e => setProfile({...profile, fieldOfStudy: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                 </div>
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Skills (Comma separated)</label>
                    <input value={profile.skills.join(', ')} onChange={e => setProfile({...profile, skills: e.target.value.split(',').map(s => s.trim())})} className="w-full p-2.5 border rounded-lg" placeholder="React, Node.js, Python..." />
                 </div>
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Certificates (Comma separated)</label>
                    <input value={profile.certificates.join(', ')} onChange={e => setProfile({...profile, certificates: e.target.value.split(',').map(s => s.trim())})} className="w-full p-2.5 border rounded-lg" placeholder="AWS Certified, PMP..." />
                 </div>
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Projects / Profile</label>
                    <textarea value={profile.projects} onChange={e => setProfile({...profile, projects: e.target.value})} className="w-full p-2.5 border rounded-lg h-20" placeholder="Brief description of key projects or links..." />
                 </div>
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">GitHub / Behance / Kaggle URL</label>
                    <input value={profile.githubUrl || ''} onChange={e => setProfile({...profile, githubUrl: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                 </div>
              </div>
           </section>

           {/* Section C: Job Preferences */}
           <section>
              <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">C</span>
                Job Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Total Experience (Years)</label>
                    <input type="number" value={profile.totalExperience} onChange={e => setProfile({...profile, totalExperience: parseFloat(e.target.value)})} className="w-full p-2.5 border rounded-lg" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Role</label>
                    <input value={profile.currentRole} onChange={e => setProfile({...profile, currentRole: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expected Role</label>
                    <input value={profile.expectedRole} onChange={e => setProfile({...profile, expectedRole: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                    <select value={profile.jobType} onChange={e => setProfile({...profile, jobType: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Remote</option>
                        <option>Hybrid</option>
                    </select>
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Locations</label>
                    <input value={profile.currentLocations.join(', ')} onChange={e => setProfile({...profile, currentLocations: e.target.value.split(',').map(s => s.trim())})} className="w-full p-2.5 border rounded-lg" />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Locations</label>
                    <input value={profile.preferredLocations.join(', ')} onChange={e => setProfile({...profile, preferredLocations: e.target.value.split(',').map(s => s.trim())})} className="w-full p-2.5 border rounded-lg" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ready to Relocate</label>
                    <select value={profile.readyToRelocate} onChange={e => setProfile({...profile, readyToRelocate: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                        <option>Yes</option>
                        <option>No</option>
                        <option>Open to Discussion</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notice Period</label>
                    <select value={profile.noticePeriod} onChange={e => setProfile({...profile, noticePeriod: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                        <option>Immediate</option>
                        <option>15 Days</option>
                        <option>30 Days</option>
                        <option>45 Days</option>
                        <option>60 Days</option>
                        <option>90+ Days</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Availability to Join</label>
                    <input type="date" value={profile.availabilityDate || ''} onChange={e => setProfile({...profile, availabilityDate: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Shift Preference</label>
                    <select value={profile.shiftPreference} onChange={e => setProfile({...profile, shiftPreference: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                        <option>Day</option>
                        <option>Night</option>
                        <option>Flexible</option>
                        <option>Any</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Work Authorization / Visa</label>
                    <input value={profile.workAuthorization || ''} onChange={e => setProfile({...profile, workAuthorization: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="e.g. H1B, Citizen" />
                 </div>
              </div>
           </section>

           {/* Section D: Salary Info */}
           <section>
              <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">D</span>
                Salary Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current CTC</label>
                    <input value={profile.currentCtc} onChange={e => setProfile({...profile, currentCtc: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expected CTC</label>
                    <input value={profile.expectedCtc} onChange={e => setProfile({...profile, expectedCtc: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                    <select value={profile.currency} onChange={e => setProfile({...profile, currency: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                        <option>INR</option>
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                    </select>
                 </div>
                 <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={profile.isCtcNegotiable} onChange={e => setProfile({...profile, isCtcNegotiable: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm font-medium text-slate-700">Negotiable</span>
                    </label>
                 </div>
              </div>
           </section>

           {/* Section E: Broader Preferences & Personal Details */}
           <section>
              <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">E</span>
                Broader Preferences & Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Looking for Jobs Abroad</label>
                     <select value={profile.lookingForJobsAbroad} onChange={e => setProfile({...profile, lookingForJobsAbroad: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                         <option>Yes</option>
                         <option>No</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Sector Type</label>
                     <select value={profile.sectorType} onChange={e => setProfile({...profile, sectorType: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                         <option>Government</option>
                         <option>Private</option>
                         <option>Both</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Industries</label>
                     <input value={profile.preferredIndustries.join(', ')} onChange={e => setProfile({...profile, preferredIndustries: e.target.value.split(',').map(s => s.trim())})} className="w-full p-2.5 border rounded-lg" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                     <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                         <option>Male</option>
                         <option>Female</option>
                         <option>Other</option>
                         <option>Prefer not to say</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Marital Status</label>
                     <select value={profile.maritalStatus} onChange={e => setProfile({...profile, maritalStatus: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                         <option>Single</option>
                         <option>Married</option>
                         <option>Other</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                     <input type="date" value={profile.dob || ''} onChange={e => setProfile({...profile, dob: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Languages Known</label>
                     <input value={profile.languages.join(', ')} onChange={e => setProfile({...profile, languages: e.target.value.split(',').map(s => s.trim())})} className="w-full p-2.5 border rounded-lg" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Reservation Category</label>
                     <select value={profile.reservationCategory || 'General'} onChange={e => setProfile({...profile, reservationCategory: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                         <option>General</option>
                         <option>OBC</option>
                         <option>SC</option>
                         <option>ST</option>
                         <option>EWS</option>
                         <option>Other</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Willingness to Travel</label>
                     <select value={profile.willingnessToTravel} onChange={e => setProfile({...profile, willingnessToTravel: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                         <option>Yes</option>
                         <option>No</option>
                         <option>Occasionally</option>
                     </select>
                  </div>
                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                     <div className="flex flex-col bg-slate-50 p-3 rounded-lg border">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${!!profile.disability ? 'bg-blue-600' : 'bg-slate-300'}`} onClick={() => setProfile({...profile, disability: profile.disability ? '' : 'Yes'})}>
                                <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${!!profile.disability ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <span className="text-sm font-medium text-slate-700">Disability (if any)</span>
                        </div>
                        {!!profile.disability && (
                           <input 
                             value={profile.disability === 'Yes' ? '' : profile.disability} 
                             onChange={e => setProfile({...profile, disability: e.target.value})} 
                             className="w-full p-2 border rounded-lg text-sm" 
                             placeholder="Please specify details..."
                           />
                        )}
                     </div>
                     <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border">
                        <div className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${profile.drivingLicensePassport ? 'bg-blue-600' : 'bg-slate-300'}`} onClick={() => setProfile({...profile, drivingLicensePassport: !profile.drivingLicensePassport})}>
                            <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${profile.drivingLicensePassport ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700">Driving License / Passport</span>
                     </div>
                  </div>
              </div>
           </section>

           {/* Section F: Work History */}
           <section>
              <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">F</span>
                Work History (Repeatable Cards)
              </h3>
              <div className="space-y-4">
                 {profile.workHistory.map((work, idx) => (
                    <div key={work.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative group shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                                  <input type="date" value={work.endDate === 'Present' ? '' : work.endDate} disabled={work.isCurrent} onChange={e => handleWorkHistoryChange(idx, 'endDate', e.target.value)} className="w-full p-2 border rounded bg-white disabled:bg-slate-200" />
                                  <label className="flex items-center gap-1 text-xs whitespace-nowrap cursor-pointer">
                                      <input type="checkbox" checked={work.isCurrent} onChange={e => handleWorkHistoryChange(idx, 'isCurrent', e.target.checked)} className="rounded text-blue-600" /> Present
                                  </label>
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Key Responsibilities</label>
                            <textarea value={work.responsibilities} onChange={e => handleWorkHistoryChange(idx, 'responsibilities', e.target.value)} className="w-full p-2 border rounded bg-white h-20" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tools / Tech Stack Used</label>
                                <input value={work.toolsUsed.join(', ')} onChange={e => handleWorkHistoryChange(idx, 'toolsUsed', e.target.value.split(',').map((s: string) => s.trim()))} className="w-full p-2 border rounded bg-white" placeholder="e.g. Salesforce, Python" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CTC in that Role (Optional)</label>
                                <input type="number" value={work.ctc} onChange={e => handleWorkHistoryChange(idx, 'ctc', e.target.value)} className="w-full p-2 border rounded bg-white" placeholder="e.g. 1200000" />
                            </div>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1">
                             <button className="p-1 text-slate-300 hover:text-blue-500" title="Edit"><Edit size={16}/></button>
                             <button onClick={() => removeWorkHistory(idx)} className="p-1 text-slate-300 hover:text-red-500" title="Remove"><Trash2 size={16}/></button>
                        </div>
                    </div>
                 ))}
                 <button onClick={addWorkHistory} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                    <Plus size={20} /> [+ Add Past Role]
                 </button>
              </div>
           </section>

           {/* Section G: Contact & Availability */}
           <section>
              <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">G</span>
                Contact & Availability
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Has Current Offers?</label>
                     <select value={profile.hasCurrentOffers ? 'Yes' : 'No'} onChange={e => setProfile({...profile, hasCurrentOffers: e.target.value === 'Yes'})} className="w-full p-2.5 border rounded-lg bg-white">
                         <option>Yes</option>
                         <option>No</option>
                     </select>
                  </div>
                  {profile.hasCurrentOffers && (
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Number of Offers</label>
                          <input type="number" value={profile.numberOfOffers || 0} onChange={e => setProfile({...profile, numberOfOffers: parseInt(e.target.value)})} className="w-full p-2.5 border rounded-lg" />
                      </div>
                  )}
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Best Time to Contact</label>
                     <input value={profile.bestTimeToContact || ''} onChange={e => setProfile({...profile, bestTimeToContact: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="e.g. Weekdays 4-6 PM" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Mode of Contact</label>
                     <select value={profile.preferredContactMode} onChange={e => setProfile({...profile, preferredContactMode: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                         <option>Call</option>
                         <option>WhatsApp</option>
                         <option>Email</option>
                     </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Alternative Email</label>
                      <input value={profile.alternateEmail || ''} onChange={e => setProfile({...profile, alternateEmail: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Alternative Phone</label>
                      <input value={profile.alternatePhone || ''} onChange={e => setProfile({...profile, alternatePhone: e.target.value})} className="w-full p-2.5 border rounded-lg" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Time Zone</label>
                      <select value={profile.timeZone || 'IST'} onChange={e => setProfile({...profile, timeZone: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white">
                          <option>IST</option>
                          <option>PST</option>
                          <option>EST</option>
                          <option>UTC</option>
                      </select>
                  </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <span className="text-xl font-bold text-slate-900">sree.ai</span>
          </div>
          
          <nav className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setView('dashboard')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setView('profile')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              My Profile
            </button>
             <button 
              onClick={() => setView('jobs')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'jobs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Jobs
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-4">
               <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">Candidate</p>
               </div>
               <img src={user.avatar} alt="Profile" className="w-9 h-9 rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' && renderDashboard()}
        {view === 'profile' && renderProfile()}
        {view === 'jobs' && (
          <div className="text-center py-20">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search size={32} />
             </div>
             <h3 className="text-xl font-bold text-slate-900">Job Search</h3>
             <p className="text-slate-500 mt-2">Browse and apply to open positions. (Coming Soon)</p>
          </div>
        )}
      </main>
    </div>
  );
};

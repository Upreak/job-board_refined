import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, LogIn, Zap, ExternalLink, Loader2, FileText, DollarSign, ChevronRight, X, UploadCloud, CheckCircle, Clock, List } from 'lucide-react';
import { PublicJob, PublicJobService } from '../../services/publicJobService';
import { StorageService } from '../../services/storageService';
import { useToast } from '../ui/ToastContext';
import { JobPost, Candidate } from '../../types';

interface PublicJobBoardProps {
  onSignInClick: () => void;
  onViewArchitecture: () => void;
}

// Helper to create a basic candidate object from form data
const createCandidateFromApplication = (formData: any, jobId: string): Candidate => {
  return {
    id: `cand-${Date.now()}`,
    jobId: jobId,
    fullName: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    resumeUrl: formData.resume ? formData.resume.name : 'No Resume',
    resumeLastUpdated: new Date().toISOString().split('T')[0],
    isActivelySearching: true,
    status: 'New',
    automationStatus: 'New',
    matchScore: Math.floor(Math.random() * 40) + 60, // Random mock score
    aiSummary: 'Applied via Public Job Board. Waiting for review.',
    // Defaults
    highestEducation: '',
    skills: [],
    certificates: [],
    totalExperience: 0,
    currentRole: '',
    expectedRole: '',
    jobType: 'Full-time',
    currentLocations: [],
    preferredLocations: [],
    readyToRelocate: 'No',
    noticePeriod: 'Immediate',
    currentCtc: '',
    expectedCtc: '',
    isCtcNegotiable: false,
    currency: 'INR',
    lookingForJobsAbroad: 'No',
    sectorType: 'Private',
    preferredIndustries: [],
    gender: 'Male',
    maritalStatus: 'Single',
    languages: [],
    willingnessToTravel: 'No',
    drivingLicensePassport: false,
    workHistory: [],
    hasCurrentOffers: false,
    preferredContactMode: 'Email'
  };
};

interface ApplicationModalProps {
  job: JobPost;
  onClose: () => void;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({ job, onClose }) => {
  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    resume: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create candidate record in "Database"
    setTimeout(() => {
      const newCandidate = createCandidateFromApplication(formData, job.id);
      StorageService.saveCandidate(newCandidate);
      
      setIsSubmitting(false);
      setStep('SUCCESS');
      addToast('Application submitted successfully!', 'success');
    }, 1000);
  };

  if (step === 'SUCCESS') {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 text-center">
           <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <CheckCircle size={32} />
           </div>
           <h3 className="text-2xl font-bold text-slate-900 mb-2">Application Sent!</h3>
           <p className="text-slate-500 mb-6">
             Thanks for applying to <span className="font-bold text-slate-800">{job.clientName}</span>. We have received your resume and will get back to you shortly.
           </p>
           <button 
             onClick={onClose}
             className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
           >
             Close
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b flex justify-between items-center bg-slate-50">
           <div>
             <h3 className="font-bold text-lg text-slate-900">Apply for {job.title}</h3>
             <p className="text-sm text-slate-500">{job.clientName} • {job.jobLocations?.[0]}</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
             <X size={20} />
           </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
           <input type="hidden" name="jobId" value={job.id} />
           
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
             <input 
               required
               value={formData.fullName}
               onChange={e => setFormData({...formData, fullName: e.target.value})}
               className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
               placeholder="e.g. John Doe"
             />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
               <input 
                 type="email"
                 required
                 value={formData.email}
                 onChange={e => setFormData({...formData, email: e.target.value})}
                 className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="john@example.com"
               />
             </div>
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">Phone <span className="text-red-500">*</span></label>
               <input 
                 type="tel"
                 required
                 value={formData.phone}
                 onChange={e => setFormData({...formData, phone: e.target.value})}
                 className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="+91 98765 43210"
               />
             </div>
           </div>

           <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Resume / CV <span className="text-red-500">*</span></label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer relative">
                 <input 
                    type="file" 
                    accept=".pdf,.docx,.doc"
                    required
                    onChange={e => setFormData({...formData, resume: e.target.files?.[0] || null})}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
                 <div className="flex flex-col items-center gap-2 text-slate-500">
                    <UploadCloud size={32} className="text-blue-500" />
                    {formData.resume ? (
                      <span className="font-bold text-blue-600">{formData.resume.name}</span>
                    ) : (
                      <>
                        <span className="font-medium text-slate-700">Click to upload or drag and drop</span>
                        <span className="text-xs">PDF, DOCX up to 5MB</span>
                      </>
                    )}
                 </div>
              </div>
           </div>

           <div className="pt-4">
             <button 
               type="submit" 
               disabled={isSubmitting}
               className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
             >
               {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Application'}
             </button>
           </div>
        </form>
      </div>
    </div>
  );
};

interface JobDetailsModalProps {
  job: JobPost;
  onClose: () => void;
  onApply: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose, onApply }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-start bg-slate-50 sticky top-0 z-10">
          <div>
             <h2 className="text-2xl font-bold text-slate-900">{job.title}</h2>
             <p className="text-slate-500 font-medium mt-1">{job.clientName}</p>
             <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                <div className="flex items-center gap-1"><MapPin size={14}/> {job.jobLocations.join(', ')}</div>
                <div className="flex items-center gap-1"><DollarSign size={14}/> {job.minSalary ? `${job.minSalary/100000}-${job.maxSalary!/100000} LPA` : 'Competitive'}</div>
                <div className="flex items-center gap-1"><Clock size={14}/> {job.employmentType}</div>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-8">
           <div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">About the Role</h3>
              <p className="text-slate-600 leading-relaxed">{job.jobSummary}</p>
           </div>
           
           <div>
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <List size={18} className="text-blue-600" /> Requirements
              </h3>
              <ul className="space-y-2">
                 {/* Combine required and preferred skills into a list for display */}
                 {job.requiredSkills.concat(job.preferredSkills).map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                       <span className="mt-2 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></span>
                       <span>{req}</span>
                    </li>
                 ))}
                 <li className="flex items-start gap-2 text-slate-600">
                     <span className="mt-2 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></span>
                     <span>Experience: {job.experienceRequired}</span>
                 </li>
              </ul>
           </div>
           
           <div>
              <h3 className="text-lg font-bold text-slate-800 mb-3">Tech Stack & Tags</h3>
              <div className="flex flex-wrap gap-2">
                 {job.toolsTechStack.concat(job.requiredSkills).map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">{tag}</span>
                 ))}
              </div>
           </div>
        </div>

        <div className="p-6 border-t bg-slate-50 flex justify-end gap-4">
           <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">
             Cancel
           </button>
           <button 
             onClick={onApply}
             className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
           >
             Apply Now <ChevronRight size={18} />
           </button>
        </div>
      </div>
    </div>
  );
};

export const PublicJobBoard: React.FC<PublicJobBoardProps> = ({ onSignInClick, onViewArchitecture }) => {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Internal Featured Jobs from Storage
  const [featuredJobs, setFeaturedJobs] = useState<JobPost[]>([]);
  
  const [viewingJob, setViewingJob] = useState<JobPost | null>(null);
  const [applyingJob, setApplyingJob] = useState<JobPost | null>(null);

  // Initial Load - Fetch Daily Hot Drops & Featured Internal Jobs
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // 1. Hot Drops (External)
      const hotDrops = await PublicJobService.getDailyHotDrops();
      setJobs(hotDrops);
      
      // 2. Featured Jobs (Internal - Sourcing/WIP only)
      const allJobs = StorageService.getJobs();
      const sourcingJobs = allJobs.filter(j => j.status === 'Sourcing' || j.status === 'WIP');
      setFeaturedJobs(sourcingJobs);
      
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setIsSearching(true);
    const results = await PublicJobService.searchJobs(search + (location ? ` in ${location}` : ''));
    setJobs(results);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <span className="text-xl font-bold text-slate-900">sree.ai</span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={onSignInClick}
              className="px-5 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
            >
              <LogIn size={16} /> Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-blue-600 py-16 text-center px-4 relative overflow-hidden shrink-0">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Find Your Next Career Move</h1>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">Explore opportunities across top tech companies. Automated applications, instant parsing.</p>
          
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-white rounded-full p-2 flex shadow-lg">
            <div className="flex-1 flex items-center px-4 border-r">
              <Search className="text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by role, skills, or industry..." 
                className="w-full p-2 outline-none text-slate-700"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex-1 flex items-center px-4 hidden md:flex">
              <MapPin className="text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Location" 
                className="w-full p-2 outline-none text-slate-700"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={isSearching}
              className="bg-slate-900 text-white px-8 py-2 rounded-full font-medium hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isSearching ? <Loader2 className="animate-spin" size={18} /> : 'Search'}
            </button>
          </form>
          
          {isSearching && (
            <p className="text-blue-200 text-sm mt-4 animate-pulse flex items-center justify-center gap-2">
               <Zap size={14} className="fill-blue-200" /> AI Agent is scanning live job boards...
            </p>
          )}
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full opacity-20 translate-x-1/3 translate-y-1/3 blur-3xl"></div>
      </div>

      {/* Featured Opportunities (Internal Jobs) - Only show when not searching */}
      {!search && !isSearching && featuredJobs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 border-b border-slate-200 w-full">
          <div className="flex items-center gap-3 mb-8">
             <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md">
                <Briefcase size={24} />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-slate-900">Featured Opportunities</h2>
               <p className="text-slate-500 text-sm">Curated roles directly from our partner employers.</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {featuredJobs.slice(0, 6).map((job) => (
                <div 
                  key={job.id} 
                  onClick={() => setViewingJob(job)}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all group flex flex-col cursor-pointer relative overflow-hidden"
                >
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                         <p className="text-slate-500 font-medium">{job.clientName}</p>
                      </div>
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Featured</span>
                   </div>
                   
                   <div className="space-y-3 mb-6 flex-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                         <MapPin size={14} className="text-slate-400"/> {job.jobLocations[0]}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                         <DollarSign size={14} className="text-slate-400"/> {job.minSalary ? `${job.minSalary/100000}LPA+` : 'Competitive'}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                         {job.requiredSkills.slice(0, 2).map(tag => (
                           <span key={tag} className="text-xs bg-slate-50 border border-slate-100 text-slate-600 px-2 py-1 rounded font-medium">{tag}</span>
                         ))}
                      </div>
                   </div>
                   
                   <div className="pt-4 border-t flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(job.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setApplyingJob(job); }}
                        className="text-white bg-blue-600 px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-1 transition-colors shadow-sm z-10"
                      >
                          Apply Now <ChevronRight size={14} />
                      </button>
                   </div>
                   
                   {/* Hover Effect Overlay */}
                   <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/30 transition-colors pointer-events-none"></div>
                </div>
             ))}
          </div>
        </div>
      )}

      {/* Job Listings / Hot Drops */}
      <div className="max-w-7xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             {search ? 'Search Results' : 'Daily Hot Drops'}
             {!search && <Zap className="text-yellow-500 fill-yellow-500" size={24} />}
          </h2>
          {!search && <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">Updated: {new Date().toLocaleDateString()}</span>}
        </div>

        {loading ? (
          <div className="text-center py-20">
             <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={40} />
             <p className="text-slate-500">Fetching the latest opportunities from across the web...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.length > 0 ? jobs.map((job, index) => (
              <div key={job.id || index} className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-6 group flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        job.source === 'AI_Hot_Drop' ? 'bg-yellow-100 text-yellow-700' : 
                        job.source === 'local' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {job.source === 'AI_Hot_Drop' ? 'Hot Drop' : job.source}
                      </span>
                      {job.industry && <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{job.industry}</span>}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">{job.title}</h3>
                    <p className="text-slate-500 text-sm font-medium">{job.company}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{job.location || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-slate-400" />
                    <span>Posted: {job.posted_on || 'Recently'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mb-6 line-clamp-3 bg-slate-50 p-3 rounded-lg flex-1">
                   {job.summary || 'No summary available.'}
                </p>

                <a 
                  href={job.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-lg border border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  View & Apply <ExternalLink size={14} />
                </a>
              </div>
            )) : (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-500">No jobs found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2023 sree.ai Recruitment Platform. All rights reserved.</p>
          <button onClick={onViewArchitecture} className="text-xs mt-2 hover:text-white underline flex items-center justify-center gap-2 mx-auto">
            <FileText size={12} /> View System Architecture
          </button>
        </div>
      </footer>

      {/* Modals */}
      {viewingJob && (
        <JobDetailsModal 
          job={viewingJob} 
          onClose={() => setViewingJob(null)} 
          onApply={() => { setViewingJob(null); setApplyingJob(viewingJob); }}
        />
      )}

      {applyingJob && (
        <ApplicationModal 
          job={applyingJob} 
          onClose={() => setApplyingJob(null)} 
        />
      )}
    </div>
  );
};
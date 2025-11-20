import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Upload, CheckCircle, X, LogIn, Globe, Zap, ExternalLink, Loader2, FileText } from 'lucide-react';
import { PublicJob, PublicJobService } from '../../services/publicJobService';

interface PublicJobBoardProps {
  onSignInClick: () => void;
  onViewArchitecture: () => void;
}

export const PublicJobBoard: React.FC<PublicJobBoardProps> = ({ onSignInClick, onViewArchitecture }) => {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Initial Load - Fetch Daily Hot Drops
  useEffect(() => {
    const loadHotDrops = async () => {
      setLoading(true);
      const hotDrops = await PublicJobService.getDailyHotDrops();
      setJobs(hotDrops);
      setLoading(false);
    };
    loadHotDrops();
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
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <span className="text-xl font-bold text-slate-900">sree.ai</span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={onViewArchitecture}
              className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-2"
            >
              <FileText size={16} /> System Architecture
            </button>
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

      {/* Job Listings */}
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
          <button onClick={onViewArchitecture} className="text-xs mt-2 hover:text-white underline">View System Architecture</button>
        </div>
      </footer>
    </div>
  );
};
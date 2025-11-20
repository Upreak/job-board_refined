import React from 'react';
import { Database, Server, Layers, Cpu, Globe, HardDrive, Zap, ArrowLeft, Shield, FileText, DollarSign, Package, Save } from 'lucide-react';

interface ArchitectureViewProps {
  onBack: () => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-2">
            <ArrowLeft size={18} /> Back to App
          </button>
          <h1 className="text-3xl font-bold text-slate-900">System Architecture Plan</h1>
          <p className="text-slate-500">Budget-Optimized (A2 Hosting / CPU-Based)</p>
        </div>
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border border-green-200">
          <DollarSign size={18} /> Open Source Stack
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* 1. High Level Diagram */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Layers className="text-blue-600" /> Budget-Friendly Data Flow (A2 Hosting)
          </h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
            {/* User Layer */}
            <div className="flex flex-col gap-4 w-full md:w-1/4">
              <div className="p-4 bg-slate-100 rounded-xl border text-center">
                <Globe className="mx-auto text-slate-500 mb-2" />
                <span className="font-bold text-slate-700">Public Job Board</span>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                <Shield className="mx-auto text-indigo-500 mb-2" />
                <span className="font-bold text-indigo-700">Auth Module</span>
              </div>
            </div>

            {/* Core Logic - Single Server */}
            <div className="w-full md:w-1/2 bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold">Node.js Monolith (A2 Hosting)</h3>
                <p className="text-xs text-slate-400">Single CPU / VPS Deployment</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-800 p-3 rounded-lg text-center text-sm border border-slate-700">Sales Module</div>
                <div className="bg-slate-800 p-3 rounded-lg text-center text-sm border border-slate-700">Recruiter Module</div>
              </div>
              
              {/* Embedded Services */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Package size={16} className="text-green-400" /> 
                    <span className="font-bold">LanceDB (Embedded Vector DB)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Save size={16} className="text-yellow-400" /> 
                    <span className="font-bold">Local File Storage (/uploads)</span>
                </div>
              </div>
            </div>

            {/* External & Data */}
            <div className="w-full md:w-1/4 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm">
                <Database className="text-blue-600" />
                <div>
                  <div className="font-bold text-sm">PostgreSQL / MySQL</div>
                  <div className="text-[10px] text-slate-500">Standard DB (Free)</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm">
                <Cpu className="text-purple-600" />
                <div>
                  <div className="font-bold text-sm">Gemini API</div>
                  <div className="text-[10px] text-slate-500">External AI Compute</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Budget Stack Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-700">
               <DollarSign size={20} /> Free & Open Source Components
             </h3>
             <ul className="space-y-4 text-sm text-slate-600">
               <li className="flex gap-3">
                 <div className="bg-green-100 p-2 rounded text-green-700 h-fit"><Package size={16}/></div>
                 <div>
                   <strong className="text-slate-800 block">Vector DB: LanceDB</strong>
                   Running Pinecone is costly. LanceDB runs <em>inside</em> your Node.js app and stores vectors in files. It's lightning fast, free, and requires no separate server.
                 </div>
               </li>
               <li className="flex gap-3">
                 <div className="bg-yellow-100 p-2 rounded text-yellow-700 h-fit"><HardDrive size={16}/></div>
                 <div>
                   <strong className="text-slate-800 block">Storage: Local Filesystem</strong>
                   Instead of AWS S3, save resumes to a secured folder on your A2 server. Serve them via Nginx/Apache with access control.
                 </div>
               </li>
               <li className="flex gap-3">
                 <div className="bg-blue-100 p-2 rounded text-blue-700 h-fit"><Database size={16}/></div>
                 <div>
                   <strong className="text-slate-800 block">Queue: PG-Boss / DB-Queue</strong>
                   Redis costs extra RAM. Use your existing SQL database to handle background job queues (Resume parsing tasks).
                 </div>
               </li>
             </ul>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
               <Server size={20} /> Deployment Strategy (A2 Hosting)
             </h3>
             <div className="space-y-4 text-sm text-slate-600">
                <div className="p-3 bg-slate-50 rounded-lg border">
                   <div className="font-bold text-slate-800 mb-1">1. The "Brain" is External</div>
                   <p>Even on CPU hosting, we are safe because heavy lifting (LLM Inference) happens on Google's servers via Gemini API. Your server just acts as a traffic controller.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border">
                   <div className="font-bold text-slate-800 mb-1">2. Embedded Vectors</div>
                   <p>LanceDB stores embeddings on the disk. This uses Storage (cheap) instead of RAM (expensive).</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border">
                   <div className="font-bold text-slate-800 mb-1">3. Database Choice</div>
                   <p>Use the PostgreSQL or MySQL instance provided with your A2 plan. No need for managed cloud databases.</p>
                </div>
             </div>
          </section>
        </div>

        {/* 3. Updated Workflow */}
        <section className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300">
          <h3 className="font-bold text-lg mb-4">Low-Cost Workflow: Resume Parsing</h3>
          <div className="flex flex-wrap items-center gap-4 text-sm">
             <div className="bg-white px-4 py-2 rounded shadow-sm border">1. Upload</div>
             <span className="text-slate-400">→</span>
             <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded shadow-sm border border-yellow-200">2. Save to /local/uploads</div>
             <span className="text-slate-400">→</span>
             <div className="bg-white px-4 py-2 rounded shadow-sm border">3. Insert Job into SQL Table</div>
             <span className="text-slate-400">→</span>
             <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded shadow-sm border border-purple-200">4. Gemini API extracts Text</div>
             <span className="text-slate-400">→</span>
             <div className="bg-green-100 text-green-800 px-4 py-2 rounded shadow-sm border border-green-200">5. LanceDB saves Vector</div>
          </div>
        </section>

      </div>
    </div>
  );
};
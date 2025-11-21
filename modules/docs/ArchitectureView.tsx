import React, { useState } from 'react';
import { Database, Server, Layers, Cpu, Globe, HardDrive, ArrowLeft, Shield, FileText, DollarSign, Package, Save, Book, Code, GitBranch, BrainCircuit } from 'lucide-react';

interface ArchitectureViewProps {
  onBack: () => void;
}

// Mock content loading - In a real app, these would be imports from the md files
// For this prototype, we inline the text to ensure it works without complex MD loaders
const DOC_CONTENTS = {
  ARCH: 'Visual Architecture Diagram',
  DB: `
# Database Schema Specification

## 1. Users & Authentication
**Table: users**
- id (UUID, PK)
- email (VARCHAR, Unique)
- password_hash (VARCHAR)
- role (ENUM: ADMIN, RECRUITER, SALES, CANDIDATE)
- name (VARCHAR)
- avatar_url (VARCHAR)

## 2. Recruitment Module (ATS)
**Table: jobs**
- id (UUID, PK)
- client_id (FK -> clients)
- title (VARCHAR)
- status (ENUM: Draft, Sourcing, Interview, Closed)
- required_skills (JSONB)
- job_summary (TEXT)

**Table: candidates**
- id (UUID, PK)
- job_id (FK -> jobs)
- full_name (VARCHAR)
- resume_url (VARCHAR)
- match_score (INT)
- status (ENUM: New, Screening, Interview, Offer)

## 3. Sales Module (CRM)
**Table: leads**
- id (UUID, PK)
- company_name (VARCHAR)
- status (ENUM: New, Contacted, Qualified, Converted)
- value (DECIMAL)

**Table: clients**
- id (UUID, PK)
- name (VARCHAR)
- corporate_details (JSONB)
  `,
  API: `
# API Endpoint Specification

## Sales Module
- GET /api/v1/leads - List pipeline
- POST /api/v1/leads - Create lead
- POST /api/v1/clients/convert - Lead -> Client

## Recruiter Module
- GET /api/v1/jobs - List active jobs
- POST /api/v1/candidates/parse - Upload & Parse
- POST /api/v1/copilot/chat - Generate AI response

## Candidate Portal
- GET /api/v1/public/jobs - Fetch open positions
- POST /api/v1/applications - Apply for job
  `,
  WORKFLOW: `
# Module Workflows

## Sales: Lead to Client
1. Lead Entry (Manual/Import)
2. Nurturing (Log Activity)
3. Qualification (Update Status)
4. Conversion (Move to Client Table)

## Recruiter: AI Parsing
1. Upload Resume
2. Gemini API Extraction
3. Match Scoring
4. Ranking & Review

## Candidate: Application
1. Search Job
2. Apply & Auto-fill
3. Submit
  `,
  BRAIN: `
# Brain Module (Gemini Service)

## Resume Parsing
- Model: gemini-2.5-flash
- Output: JSON Schema
- Logic: Extracts skills, exp, contact info

## Co-Pilot Chat
- Model: gemini-2.5-flash
- Context: Job Description + Chat History
- Persona: Professional Recruiter

## Job Search
- Tool: Google Search Grounding
- Logic: Finds real-time jobs from web
  `
};

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'ARCH' | 'DB' | 'API' | 'WORKFLOW' | 'BRAIN'>('ARCH');

  const renderDocContent = (content: string) => (
    <div className="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[600px] shadow-inner border border-slate-700">
      {content.trim()}
    </div>
  );

  const renderArchitectureDiagram = () => (
    <div className="space-y-12 animate-in fade-in duration-500">
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
             </ul>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
               <Server size={20} /> Deployment Strategy (A2 Hosting)
             </h3>
             <div className="space-y-4 text-sm text-slate-600">
                <div className="p-3 bg-slate-50 rounded-lg border">
                   <div className="font-bold text-slate-800 mb-1">1. The "Brain" is External</div>
                   <p>Even on CPU hosting, we are safe because heavy lifting (LLM Inference) happens on Google's servers via Gemini API.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border">
                   <div className="font-bold text-slate-800 mb-1">2. Embedded Vectors</div>
                   <p>LanceDB stores embeddings on the disk. This uses Storage (cheap) instead of RAM (expensive).</p>
                </div>
             </div>
          </section>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-2">
            <ArrowLeft size={18} /> Back to App
          </button>
          <h1 className="text-3xl font-bold text-slate-900">System Documentation & Specs</h1>
          <p className="text-slate-500">Comprehensive architectural and technical reference.</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border border-blue-200">
          <Book size={18} /> v1.0.0
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex gap-8">
        
        {/* Navigation Sidebar */}
        <div className="w-64 shrink-0 space-y-2">
           <button 
             onClick={() => setActiveTab('ARCH')}
             className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center gap-3 transition-colors ${activeTab === 'ARCH' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
           >
             <Layers size={18} /> Architecture
           </button>
           <button 
             onClick={() => setActiveTab('DB')}
             className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center gap-3 transition-colors ${activeTab === 'DB' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
           >
             <Database size={18} /> Database Schema
           </button>
           <button 
             onClick={() => setActiveTab('API')}
             className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center gap-3 transition-colors ${activeTab === 'API' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
           >
             <Code size={18} /> API Endpoints
           </button>
           <button 
             onClick={() => setActiveTab('WORKFLOW')}
             className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center gap-3 transition-colors ${activeTab === 'WORKFLOW' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
           >
             <GitBranch size={18} /> Module Workflows
           </button>
           <button 
             onClick={() => setActiveTab('BRAIN')}
             className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center gap-3 transition-colors ${activeTab === 'BRAIN' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
           >
             <BrainCircuit size={18} /> Brain (AI) Specs
           </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
           {activeTab === 'ARCH' && renderArchitectureDiagram()}
           {activeTab === 'DB' && renderDocContent(DOC_CONTENTS.DB)}
           {activeTab === 'API' && renderDocContent(DOC_CONTENTS.API)}
           {activeTab === 'WORKFLOW' && renderDocContent(DOC_CONTENTS.WORKFLOW)}
           {activeTab === 'BRAIN' && renderDocContent(DOC_CONTENTS.BRAIN)}
        </div>
      </div>
    </div>
  );
};

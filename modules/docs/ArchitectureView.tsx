import React, { useState } from 'react';
import { Database, Server, Layers, Cpu, Globe, HardDrive, ArrowLeft, Shield, FileText, DollarSign, Package, Save, Book, Code, GitBranch, BrainCircuit, ScrollText, ArrowRightCircle } from 'lucide-react';

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
  `,
  RULES: `
# Business Logic & Backend Rules

## 1. Job Board Domain

### A. Job Creation & Validation Rules
1.  **Salary Validation:** max_salary must be greater than or equal to min_salary. Negative values are rejected.
2.  **Location formatting:** Job Locations must be validated against a standard ISO city/country list to ensure searchability.
3.  **Expiry Logic:**
    - Jobs status 'Sourcing' auto-expires to 'Closed' after 45 days unless renewed.
    - 'Draft' jobs are deleted after 90 days of inactivity.
4.  **Slug Generation:** 
    - slug_url must be unique. Pattern: [job-title]-[client-name]-[random-4-char].
    - If a duplicate exists, append a numeric suffix.

### B. Application Constraints
1.  **Duplicate Application Prevention:**
    - A Candidate cannot apply to the same job_id twice within 6 months.
    - Check composite key: (candidate_email, job_id).
    - **Error:** Return 409 Conflict - "You have already applied for this position."
2.  **Internal Candidate Check:**
    - If candidate_email exists in the system but for a different job, link the existing profile to the new application instead of creating a duplicate record.
3.  **Cooldown Period:**
    - If a candidate was Rejected by a Client, they cannot apply to other roles for the same Client for 30 days (optional config per client).

---

## 2. Recruitment Process (ATS)

### A. Status Transition Rules (State Machine)
The status field for Candidates cannot jump arbitrarily.
- **Allowed Transitions:**
  - New -> Screening OR Rejected
  - Screening -> Interview OR Rejected
  - Interview -> Offer OR Rejected
  - Offer -> Joined OR Declined
- **Restricted Transitions:**
  - Cannot move from Rejected to Offer directly (Must go to Screening for re-evaluation).

### B. Access Control (RBAC)
1.  **Data Visibility:**
    - Admin: View ALL data.
    - Recruiter: View only Candidates linked to Jobs where job.assigned_recruiter_id == current_user.id.
    - Sales: View only Jobs/Clients they own. Cannot view Candidate PII (Email/Phone) unless candidate is in 'Interview' stage.
2.  **Modification Rights:**
    - Only Admins can delete Job Posts.
    - Recruiters cannot edit max_salary on a Job Post (Sales/Account Manager privilege).

### C. Resume Parsing Limits
1.  **Rate Limiting:**
    - Max 50 resume parses per recruiter per hour.
    - **Error:** 429 Too Many Requests.
2.  **File Validation:**
    - Max size: 5MB.
    - Allowed Types: .pdf, .docx, .doc.
    - **Security:** Files must be scanned for malware before being stored in S3.

---

## 3. Search & Matching Logic

### A. Search Query Processing
1.  **Keyword Normalization:** "ReactJS", "React.js", "React" -> treated as single token "REACT".
2.  **Location Radius:**
    - Exact match gets 100% weight.
    - Within 50km gets 80% weight.
    - Different location but ready_to_relocate=true gets 50% weight.

### B. AI Match Scoring
1.  **Weighted Formula:**
    - Skills Match: 60%
    - Experience Match: 20% (Target +/- 2 years is ideal).
    - Location/Relocation: 10%
    - Budget Fit: 10%
2.  **Threshold:**
    - Candidates with score < 40 are auto-tagged Low Relevance but NOT rejected automatically (Human in loop).

---

## 4. Standardized Error Handling

### HTTP Status Codes
| Code | Meaning | Use Case |
|:---|:---|:---|
| 400 | Bad Request | Validation failure (e.g., Missing email, Salary min > max). |
| 401 | Unauthorized | Missing or invalid JWT token. |
| 403 | Forbidden | Authenticated, but role doesn't permit action (e.g., Recruiter trying to delete Client). |
| 404 | Not Found | Resource ID does not exist. |
| 409 | Conflict | Duplicate Entry (Email exists, Application exists). |
| 422 | Unprocessable | Logical error (e.g., Moving candidate from 'New' directly to 'Joined'). |
| 429 | Rate Limited | Too many AI calls or API requests. |
| 500 | Server Error | Unhandled exception or Database connection failure. |
  `,
  MIGRATION: `
# Migration Guide: Frontend to Backend

This guide details the technical steps to migrate the current "Prototype" architecture (Frontend-only) to a "Production" architecture (Full-stack), specifically focusing on moving \`geminiService\` and \`StorageService\` to a secure backend.

---

## 🏗️ Architectural Shift

| Feature | Current Prototype (React) | Production Target (Node.js/Python) |
|:---|:---|:---|
| **Data Storage** | \`localStorage\` (Browser) | **PostgreSQL** (Database) |
| **AI Logic** | \`geminiService.ts\` (Client-side) | **/api/ai/** (Server-side Routes) |
| **Secrets** | Exposed in code/env | Hidden in Server \`.env\` |
| **Business Rules** | UI Validation only | **API Controllers + Middleware** |

---

## 🛠️ Phase 1: Migrating the "Brain" (Gemini Service)

Currently, the frontend calls Google directly. This exposes your API Key. We must move this to a server.

### 1. Setup Backend Route
**File:** \`backend/src/routes/aiRoutes.ts\`

\`\`\`typescript
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // Secure Key

// ENDPOINT: POST /api/v1/ai/parse-resume
router.post('/parse-resume', async (req, res) => {
  try {
    const { resumeText } = req.body;
    
    // 1. Define Model & Config (Moved from Frontend)
    const model = 'gemini-2.5-flash';
    const prompt = \`Extract skills, experience, and contact info from: \${resumeText}\`;
    
    // 2. Call AI securely
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    // 3. Return clean JSON to frontend
    res.json(JSON.parse(response.text));
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI Parsing Failed" });
  }
});

export default router;
\`\`\`

### 2. Update Frontend Service
**File:** \`frontend/src/services/geminiService.ts\`

\`\`\`typescript
// OLD: Calling Google Direct
// NEW: Calling your own Backend

export const parseResumeAI = async (text: string) => {
  const response = await fetch('/api/v1/ai/parse-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText: text })
  });
  
  if (!response.ok) throw new Error('Parsing failed');
  return await response.json();
};
\`\`\`

---

## 🛠️ Phase 2: Migrating Storage & Logic

We replace \`StorageService.ts\` with Database Queries. We also implement the **Business Rules** defined in \`business_logic_rules.md\` here.

### 1. Database Model (Prisma/SQL)
**File:** \`schema.prisma\`

\`\`\`prisma
model Job {
  id             String   @id @default(uuid())
  title          String
  minSalary      Int
  maxSalary      Int
  status         String   @default("Draft")
  createdAt      DateTime @default(now())
}
\`\`\`

### 2. Backend Controller (The "Plan" Logic)
**File:** \`backend/src/controllers/jobController.ts\`

Here we enforce the rules defined in your Business Logic document *before* saving to the DB.

\`\`\`typescript
import { Request, Response } from 'express';
import { prisma } from '../db';

export const createJob = async (req: Request, res: Response) => {
  const { title, minSalary, maxSalary, locations } = req.body;

  // --- BUSINESS LOGIC RULE #1: Salary Validation ---
  // (From business_logic_rules.md)
  if (minSalary < 0 || maxSalary < 0) {
    return res.status(400).json({ error: "Salaries cannot be negative" });
  }
  if (maxSalary < minSalary) {
    return res.status(400).json({ error: "Max Salary must be >= Min Salary" });
  }

  // --- BUSINESS LOGIC RULE #2: Location Standardization ---
  const validLocations = ['Bangalore', 'Mumbai', 'Remote']; // Example master list
  const isValidLoc = locations.every(loc => validLocations.includes(loc));
  if (!isValidLoc) {
    return res.status(400).json({ error: "Invalid Location selected" });
  }

  try {
    // Save to PostgreSQL (Replaces localStorage.setItem)
    const job = await prisma.job.create({
      data: { title, minSalary, maxSalary, locations }
    });
    
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: "Database Error" });
  }
};
\`\`\`

### 3. Update Frontend Storage Service
**File:** \`frontend/src/services/storageService.ts\`

\`\`\`typescript
// OLD: localStorage
// NEW: API Calls

export const StorageService = {
  getJobs: async () => {
    const res = await fetch('/api/v1/jobs');
    return await res.json();
  },

  saveJob: async (jobData) => {
    const res = await fetch('/api/v1/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
    // Frontend handles validation errors sent by Backend
    if (res.status === 400) {
      const err = await res.json();
      alert(err.error); // "Max Salary must be >= Min Salary"
    }
  }
}
\`\`\`

---

## 🛠️ Phase 3: Status State Machine

**Rule:** Candidate cannot move from \`Rejected\` directly to \`Offer\`.

**File:** \`backend/src/controllers/candidateController.ts\`

\`\`\`typescript
export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;

  const candidate = await prisma.candidate.findUnique({ where: { id } });
  const oldStatus = candidate.status;

  // --- STATE MACHINE LOGIC ---
  if (oldStatus === 'Rejected' && newStatus === 'Offer') {
    return res.status(422).json({ 
      error: "Illegal Transition: Rejected candidates must go to Screening first." 
    });
  }

  // Proceed with update
  await prisma.candidate.update({
    where: { id },
    data: { status: newStatus }
  });
  
  res.json({ success: true });
};
\`\`\`
  `
};

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'ARCH' | 'DB' | 'API' | 'WORKFLOW' | 'BRAIN' | 'RULES' | 'MIGRATION'>('ARCH');

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
           <button 
             onClick={() => setActiveTab('RULES')}
             className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center gap-3 transition-colors ${activeTab === 'RULES' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
           >
             <ScrollText size={18} /> Logic & Rules
           </button>
           <button 
             onClick={() => setActiveTab('MIGRATION')}
             className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center gap-3 transition-colors ${activeTab === 'MIGRATION' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
           >
             <ArrowRightCircle size={18} /> Migration Guide
           </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
           {activeTab === 'ARCH' && renderArchitectureDiagram()}
           {activeTab === 'DB' && renderDocContent(DOC_CONTENTS.DB)}
           {activeTab === 'API' && renderDocContent(DOC_CONTENTS.API)}
           {activeTab === 'WORKFLOW' && renderDocContent(DOC_CONTENTS.WORKFLOW)}
           {activeTab === 'BRAIN' && renderDocContent(DOC_CONTENTS.BRAIN)}
           {activeTab === 'RULES' && renderDocContent(DOC_CONTENTS.RULES)}
           {activeTab === 'MIGRATION' && renderDocContent(DOC_CONTENTS.MIGRATION)}
        </div>
      </div>
    </div>
  );
};
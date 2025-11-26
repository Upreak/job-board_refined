
# Migration Guide: Frontend to Backend

This guide details the technical steps to migrate the current "Prototype" architecture (Frontend-only) to a "Production" architecture (Full-stack), specifically focusing on moving `geminiService` and `StorageService` to a secure backend.

---

## 🏗️ Architectural Shift

| Feature | Current Prototype (React) | Production Target (Node.js/Python) |
|:---|:---|:---|
| **Data Storage** | `localStorage` (Browser) | **PostgreSQL** (Database) |
| **AI Logic** | `geminiService.ts` (Client-side) | **/api/ai/** (Server-side Routes) |
| **Secrets** | Exposed in code/env | Hidden in Server `.env` |
| **Business Rules** | UI Validation only | **API Controllers + Middleware** |

---

## 🛠️ Phase 1: Migrating the "Brain" (Gemini Service)

Currently, the frontend calls Google directly. This exposes your API Key. We must move this to a server.

### 1. Setup Backend Route
**File:** `backend/src/routes/aiRoutes.ts`

```typescript
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
    const prompt = `Extract skills, experience, and contact info from: ${resumeText}`;
    
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
```

### 2. Update Frontend Service
**File:** `frontend/src/services/geminiService.ts`

```typescript
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
```

---

## 🛠️ Phase 2: Migrating Storage & Logic

We replace `StorageService.ts` with Database Queries. We also implement the **Business Rules** defined in `business_logic_rules.md` here.

### 1. Database Model (Prisma/SQL)
**File:** `schema.prisma`

```prisma
model Job {
  id             String   @id @default(uuid())
  title          String
  minSalary      Int
  maxSalary      Int
  status         String   @default("Draft")
  createdAt      DateTime @default(now())
}
```

### 2. Backend Controller (The "Plan" Logic)
**File:** `backend/src/controllers/jobController.ts`

Here we enforce the rules defined in your Business Logic document *before* saving to the DB.

```typescript
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
```

### 3. Update Frontend Storage Service
**File:** `frontend/src/services/storageService.ts`

```typescript
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
```

---

## 🛠️ Phase 3: Status State Machine

**Rule:** Candidate cannot move from `Rejected` directly to `Offer`.

**File:** `backend/src/controllers/candidateController.ts`

```typescript
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
```

---

## Summary Checklist

1.  [ ] **Initialize Backend:** `npm init`, `npm install express pg prisma`.
2.  [ ] **Setup DB:** Install PostgreSQL, run migrations.
3.  [ ] **Move Secrets:** Create `.env` file on server with `API_KEY`.
4.  [ ] **Port AI:** Copy code from `geminiService.ts` to `aiRoutes.ts`.
5.  [ ] **Port Logic:** Copy rules from `business_logic_rules.md` to Controllers.
6.  [ ] **Update React:** Change `services/*.ts` to use `fetch()` instead of `localStorage`.

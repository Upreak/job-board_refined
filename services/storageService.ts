import { JobPost, Candidate, Lead, Client, ChatMessage } from '../types';

const KEYS = {
  JOBS: 'sree_jobs',
  CANDIDATES: 'sree_candidates',
  LEADS: 'sree_leads',
  CLIENTS: 'sree_clients',
  INIT: 'sree_initialized'
};

// --- SEED DATA ---

const SEED_JOBS: JobPost[] = [
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
    jobSummary: 'We are seeking a visionary Senior Product Designer to lead our core product experience. You will work closely with engineering and product teams to deliver intuitive, user-centric designs.',
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
    responsibilities: ['Develop UI', 'Code Review'],
    createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
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
    responsibilities: ['Roadmap', 'Stakeholder Mgmt'],
    createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
  },
  {
    id: 'prj-3',
    title: 'Backend Tech Lead',
    clientName: 'FinTech Global',
    clientId: 'cl-3',
    jobId: 'FT-BACK-01',
    assignedRecruiterId: 'rec-1',
    status: 'Sourcing',
    statusRemarks: 'Sourcing active',
    spocName: 'Mike Ross',
    candidatesJoined: 0,
    numberOfOpenings: 1,
    jobSummary: 'Join a high-growth FinTech startup as a Backend Tech Lead. You will be responsible for architecting scalable microservices and leading a team of 5 engineers.',
    employmentType: 'FULL_TIME',
    workMode: 'On-site',
    jobLocations: ['Bangalore'],
    minSalary: 4500000,
    maxSalary: 6000000,
    currency: 'INR',
    salaryUnit: 'YEAR',
    experienceRequired: '8+ Years',
    educationQualification: 'B.Tech',
    requiredSkills: ['Node.js', 'AWS', 'Microservices'],
    preferredSkills: ['Go', 'Kubernetes'],
    toolsTechStack: ['AWS', 'Docker'],
    hiringProcessRounds: ['Screening', 'System Design'],
    slugUrl: 'backend-tech-lead',
    metaTitle: 'Backend Lead',
    metaDescription: 'Backend Lead at FinTech Global',
    benefitsPerks: [],
    stats: { matched: 0, contacted: 0, replied: 0 },
    responsibilities: ['Architect Systems', 'Lead Team'],
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  }
];

const MOCK_TRANSCRIPT: ChatMessage[] = [
  { id: 'm1', sender: 'bot', text: 'Hi Amit, I saw your profile and it looks like a great fit for the Senior React Developer role at TechFlow. Are you interested?', timestamp: '10:00 AM' },
  { id: 'm2', sender: 'candidate', text: 'Yes, I am looking for a change. What is the budget?', timestamp: '10:05 AM' },
  { id: 'm3', sender: 'bot', text: 'The budget is up to 35 LPA. Does that meet your expectations?', timestamp: '10:06 AM' },
];

const SEED_CANDIDATES: Candidate[] = [
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
    skills: ['React', 'Node.js', 'AWS'],
    certificates: ['AWS Certified'],
    projects: 'E-commerce Platform, Fintech Dashboard',
    totalExperience: 6,
    currentRole: 'Senior Dev',
    expectedRole: 'Lead Dev',
    jobType: 'Full-time',
    currentLocations: ['Bangalore'],
    preferredLocations: ['Remote'],
    readyToRelocate: 'Yes',
    noticePeriod: '30 Days',
    currentCtc: '22 LPA',
    expectedCtc: '30 LPA',
    isCtcNegotiable: true,
    currency: 'INR',
    lookingForJobsAbroad: 'No',
    sectorType: 'Private',
    preferredIndustries: ['IT'],
    gender: 'Male',
    maritalStatus: 'Single',
    languages: ['English', 'Hindi'],
    willingnessToTravel: 'No',
    drivingLicensePassport: true,
    workHistory: [],
    hasCurrentOffers: false,
    preferredContactMode: 'Call',
    matchScore: 85,
    status: 'Screening',
    automationStatus: 'Intervention Needed',
    chatTranscript: MOCK_TRANSCRIPT,
    aiSummary: 'Strong candidate with relevant experience. Matches all mandatory skills. Recent experience in FinTech.',
  }
];

const SEED_LEADS: Lead[] = [
  {
    id: 'lead-1',
    companyName: 'Nexus Innovations',
    contactPerson: 'Sarah Connor',
    email: 'sarah@nexus.com',
    phone: '9876543210',
    status: 'New',
    value: 1200000,
    source: 'LinkedIn',
    nextFollowUp: new Date(Date.now() + 86400000).toISOString().split('T')[0], 
    activities: [],
    tasks: [{ id: 't1', title: 'Send introductory deck', isCompleted: false, dueDate: '2023-10-25' }],
    createdAt: '2023-10-20'
  }
];

const SEED_CLIENTS: Client[] = [
  { 
    id: 'cl-1', 
    name: 'TechFlow Inc', 
    address: '123 Tech Park, Bangalore, KA 560103', 
    assignedRecruiter: 'Recruiter Jane',
    activeProjectsCount: 2,
    corporateDetails: { gst: '29ABCDE1234F1Z5', pan: 'ABCDE1234F' },
    contacts: [
        { name: 'John Smith', email: 'john@techflow.com', phone: '9876543210', position: 'CTO', department: 'Engineering', isSpoc: true }
    ] 
  }
];

export const StorageService = {
  
  init: () => {
    if (typeof window === 'undefined') return;
    
    if (!localStorage.getItem(KEYS.INIT)) {
      console.log("Seeding Local Storage Database...");
      localStorage.setItem(KEYS.JOBS, JSON.stringify(SEED_JOBS));
      localStorage.setItem(KEYS.CANDIDATES, JSON.stringify(SEED_CANDIDATES));
      localStorage.setItem(KEYS.LEADS, JSON.stringify(SEED_LEADS));
      localStorage.setItem(KEYS.CLIENTS, JSON.stringify(SEED_CLIENTS));
      localStorage.setItem(KEYS.INIT, 'true');
    }
  },

  // --- JOBS ---
  getJobs: (): JobPost[] => {
    const data = localStorage.getItem(KEYS.JOBS);
    return data ? JSON.parse(data) : [];
  },
  
  saveJob: (job: JobPost) => {
    const jobs = StorageService.getJobs();
    const index = jobs.findIndex(j => j.id === job.id);
    if (index >= 0) {
      jobs[index] = job;
    } else {
      jobs.unshift(job);
    }
    localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));
  },

  // --- CANDIDATES ---
  getCandidates: (): Candidate[] => {
    const data = localStorage.getItem(KEYS.CANDIDATES);
    return data ? JSON.parse(data) : [];
  },

  saveCandidate: (candidate: Candidate) => {
    const list = StorageService.getCandidates();
    const index = list.findIndex(c => c.id === candidate.id);
    if (index >= 0) {
      list[index] = candidate;
    } else {
      list.unshift(candidate);
    }
    localStorage.setItem(KEYS.CANDIDATES, JSON.stringify(list));
  },

  // --- LEADS ---
  getLeads: (): Lead[] => {
    const data = localStorage.getItem(KEYS.LEADS);
    return data ? JSON.parse(data) : [];
  },

  saveLead: (lead: Lead) => {
    const list = StorageService.getLeads();
    const index = list.findIndex(l => l.id === lead.id);
    if (index >= 0) {
      list[index] = lead;
    } else {
      list.unshift(lead);
    }
    localStorage.setItem(KEYS.LEADS, JSON.stringify(list));
  },

  // --- CLIENTS ---
  getClients: (): Client[] => {
    const data = localStorage.getItem(KEYS.CLIENTS);
    return data ? JSON.parse(data) : [];
  },

  saveClient: (client: Client) => {
    const list = StorageService.getClients();
    const index = list.findIndex(c => c.id === client.id);
    if (index >= 0) {
      list[index] = client;
    } else {
      list.push(client);
    }
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(list));
  }
};

// Auto-init on import
StorageService.init();
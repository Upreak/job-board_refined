

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  RECRUITER = 'RECRUITER',
  SALES = 'SALES',
  CANDIDATE = 'CANDIDATE',
  PUBLIC = 'PUBLIC'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  managerId?: string; // For hierarchy logic
}

// --- Job / Project Logic ---

export interface JobCriteria {
  value: string;
  isMandatory: boolean; // The "Star" logic
}

// Google for Jobs & SEO Compliant Structure
export interface JobPost {
  id: string;
  
  // Basic Job Details
  clientId: string;
  clientName: string; // Display name (can be confidential)
  aboutCompany?: string; // Client Boilerplate
  title: string; // job_title
  jobId: string; // Internal or External Ref ID
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'TEMPORARY' | 'INTERN' | 'VOLUNTEER' | 'PER_DIEM' | 'OTHER';
  workMode: 'On-site' | 'Remote' | 'Hybrid';
  industry?: string;
  functionalArea?: string;

  // Location & Compensation
  jobLocations: string[]; // Array of City, State, Country
  minSalary?: number;
  maxSalary?: number;
  currency: string; // ISO 4217 (e.g., INR, USD)
  salaryUnit: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  benefitsPerks: string[]; // Medical, Gym, etc.

  // Job Description (Rich Text / Structured)
  jobSummary: string;
  responsibilities: string[]; // Key Duties
  experienceRequired: string; // e.g. "3-5 Years"
  educationQualification: string; // e.g. "B.Tech in CS"
  requiredSkills: string[]; // Mandatory (Yellow Star)
  preferredSkills: string[]; // Good to have (Grey Star)
  toolsTechStack: string[]; // e.g. JIRA, AWS

  // Application Details
  numberOfOpenings: number;
  applicationDeadline?: string; // ISO Date
  hiringProcessRounds: string[]; // ["Screening", "Tech Round 1", "Managerial"]
  
  // Compliance
  noticePeriodAccepted?: string; // e.g. "Immediate to 30 Days"

  // SEO & Metadata
  slugUrl: string;
  metaTitle: string;
  metaDescription: string;

  // System Fields
  status: 'Draft' | 'Sourcing' | 'Interview' | 'Offer' | 'Closed' | 'On Hold' | 'WIP' | 'Win' | 'Partial Win';
  statusRemarks?: string; // For project card footer
  assignedRecruiterId: string;
  spocName?: string; // Primary Contact Person
  spocEmail?: string; 
  candidatesJoined: number; // Metric for card
  
  createdAt?: string; // datePosted
  stats: {
    matched: number;
    contacted: number;
    replied: number;
  };
}

// --- Sales / Client Logic ---

export interface CorporateDetails {
  gst?: string;
  pan?: string;
  tan?: string;
  msme?: string;
  cin?: string;
  agreementDoc?: string; // File name or URL
}

export interface ClientContact {
  name: string;
  email: string;
  phone: string;
  position?: string;
  department?: string;
  isSpoc: boolean; // Single Point of Contact - Slider Logic
}

export interface Client {
  id: string;
  name: string;
  address: string;
  corporateDetails: CorporateDetails;
  assignedRecruiter: string;
  contacts: ClientContact[];
  activeProjectsCount: number;
}

// --- Sales / Lead Logic ---

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost' | 'Converted';

export interface ActivityLog {
  id: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Note';
  description: string;
  date: string; // ISO Date
  performedBy: string;
}

export interface SalesTask {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string;
}

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: LeadStatus;
  value: number; // Potential revenue
  source: string;
  nextFollowUp?: string; // ISO Date
  activities: ActivityLog[];
  tasks: SalesTask[];
  createdAt: string;
}

// --- Recruiter & Candidate Logic ---

export interface WorkExperience {
  id: string;
  jobTitle: string;
  companyName: string;
  startDate: string;
  endDate: string; // or 'Present'
  isCurrent: boolean;
  responsibilities: string;
  toolsUsed: string[];
  ctc?: string;
}

export type AutomationStatus = 'New' | 'Contacting...' | 'Awaiting Reply' | 'Live Chat' | 'Intervention Needed' | 'Completed' | 'Declined';

export interface ChatMessage {
  id: string;
  sender: 'candidate' | 'bot' | 'recruiter';
  text: string;
  timestamp: string;
}

export interface Candidate {
  id: string;
  jobId?: string; // Linked Job for ATS view
  
  // Section A: Identity Basics
  professionalSummary?: string;
  fullName: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  linkedinUrl?: string;
  portfolioUrl?: string; // Projects / Profile link
  resumeUrl?: string;
  resumeLastUpdated: string;
  isActivelySearching: boolean;

  // Section B: Education & Skills
  highestEducation: string;
  secondHighestEducation?: string;
  fieldOfStudy?: string;
  yearOfPassing?: string; // Highest
  skills: string[];
  certificates: string[];
  projects?: string; // Text description or list
  githubUrl?: string;

  // Section C: Job Preferences
  totalExperience: number;
  currentRole: string;
  expectedRole: string;
  jobType: string; // Dropdown
  currentLocations: string[];
  preferredLocations: string[];
  readyToRelocate: string; // Dropdown
  noticePeriod: string; // Dropdown
  availabilityDate?: string;
  shiftPreference?: string;
  workAuthorization?: string;

  // Section D: Salary Info
  currentCtc: string;
  expectedCtc: string;
  isCtcNegotiable: boolean;
  currency: string;

  // Section E: Broader Preferences
  lookingForJobsAbroad: string; // Yes/No
  sectorType: string;
  preferredIndustries: string[];
  gender: string;
  maritalStatus: string;
  dob?: string;
  languages: string[];
  reservationCategory?: string;
  disability?: string; // If present, yes. String is the description.
  willingnessToTravel: string;
  drivingLicensePassport: boolean;

  // Section F: Work History
  workHistory: WorkExperience[];

  // Section G: Contact & Availability
  hasCurrentOffers: boolean;
  numberOfOffers?: number;
  bestTimeToContact?: string;
  preferredContactMode: string;
  alternateEmail?: string;
  alternatePhone?: string;
  timeZone?: string;

  // Metadata
  matchScore: number;
  isRecruiterApproved?: boolean; // Manual override

  // Overall Status (ATS Pipeline)
  status: 'New' | 'Screening' | 'Interview' | 'Offer' | 'Rejected' | 'Verified';
  
  // Automation / Chat Status (The "Engine Room" logic)
  automationStatus: AutomationStatus;
  chatTranscript?: ChatMessage[];
  
  // Manual Follow-up Management
  followUpStatus?: string; // Shortlisted, Int-scheduled, etc.
  nextFollowUpDate?: string;
  followUpRemarks?: string;

  aiSummary: string;
}

export interface ActionCard {
  id: string;
  type: 'NEW_MATCHES' | 'CHAT_FOLLOWUP' | 'NO_RESPONSE' | 'PARSE_FAILURE' | 'INTERVENTION_NEEDED';
  title: string;
  description: string;
  projectId?: string; 
  candidateId?: string;
  priority: 'High' | 'Medium' | 'Low';
}

// --- Candidate Portal Logic ---

export type ApplicationStatus = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  clientName: string;
  appliedDate: string;
  status: ApplicationStatus;
  lastUpdate: string;
}
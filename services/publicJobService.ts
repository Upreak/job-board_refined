import { searchJobsWithAI } from './geminiService';

// Types for the Public Job Board
export interface PublicJob {
  id: string;
  industry?: string;
  title: string;
  company: string;
  location: string;
  posted_on: string;
  summary: string;
  link: string;
  source: 'local' | 'internet' | 'AI_Hot_Drop';
}

const STORAGE_KEY = 'sree_daily_hot_drops';

export const PublicJobService = {
  
  // 1. DAILY AUTOMATED JOB FETCHER
  getDailyHotDrops: async (): Promise<PublicJob[]> => {
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (storedData) {
      const parsed = JSON.parse(storedData);
      // If data is from today, return it (Cache Hit)
      if (parsed.date === today && parsed.jobs.length > 0) {
        return parsed.jobs;
      }
    }

    // Cache Miss or Stale: Fetch from AI
    const prompt = `
      You are a job aggregator. Find exactly one fresh job posting from each of the following industries in India: 
      Tech, Accounting, Marketing, HR, Sales, Finance, Operations, Manufacturing, Logistics, Healthcare.
      
      Rules:
      - Only select jobs posted today or yesterday.
      - Return a JSON array.
      - Structure: [{ "industry": "Tech", "title": "...", "company": "...", "location": "...", "posted_on": "YYYY-MM-DD", "summary": "...", "link": "...", "source": "AI_Hot_Drop" }]
    `;

    try {
      const jobs = await searchJobsWithAI(prompt);
      
      // Add IDs if missing
      const processedJobs = jobs.map((j: any, idx: number) => ({
        ...j,
        id: `hot-drop-${Date.now()}-${idx}`,
        source: 'AI_Hot_Drop'
      }));

      // Store in Local Storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        date: today,
        jobs: processedJobs
      }));

      return processedJobs;
    } catch (e) {
      console.error("Failed to fetch hot drops", e);
      // Return existing stale data if available, or empty
      return storedData ? JSON.parse(storedData).jobs : [];
    }
  },

  // 2. REAL-TIME JOB SEARCH
  searchJobs: async (query: string): Promise<PublicJob[]> => {
    // Step 1: Local Search (Hot Drops)
    const storedData = localStorage.getItem(STORAGE_KEY);
    let localResults: PublicJob[] = [];
    if (storedData) {
      const parsed = JSON.parse(storedData);
      localResults = parsed.jobs.filter((j: PublicJob) => 
        j.title.toLowerCase().includes(query.toLowerCase()) || 
        j.company.toLowerCase().includes(query.toLowerCase()) ||
        j.industry?.toLowerCase().includes(query.toLowerCase())
      ).map((j: PublicJob) => ({ ...j, source: 'local' }));
    }

    // Step 2: Internet Search via AI
    const prompt = `
      Search the internet for job postings in India that match the keywords: "${query}".
      Only show jobs posted in the past 30 days.
      Return a JSON array with at least 5 results.
      Structure: [{ "title": "...", "company": "...", "location": "...", "posted_on": "YYYY-MM-DD", "summary": "...", "link": "...", "source": "internet" }]
    `;

    try {
      const internetResults = await searchJobsWithAI(prompt);
      const processedInternetResults = internetResults.map((j: any, idx: number) => ({
        ...j,
        id: `net-search-${Date.now()}-${idx}`,
        source: 'internet'
      }));

      // Step 3: Merge Results
      return [...localResults, ...processedInternetResults];
    } catch (e) {
      console.error("Failed to search internet jobs", e);
      return localResults;
    }
  }
};
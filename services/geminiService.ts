import { GoogleGenAI, Type } from "@google/genai";

// Initialize AI - In a real app, API_KEY comes from env. 
// For this demo, we gracefully handle missing keys by returning mocks.
const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

// Helper to clean Markdown code blocks from JSON strings
const cleanJsonString = (text: string): string => {
  let clean = text;
  // Remove markdown code blocks (```json ... ``` or just ``` ... ```)
  clean = clean.replace(/```json\s*([\s\S]*?)\s*```/g, '$1');
  clean = clean.replace(/```\s*([\s\S]*?)\s*```/g, '$1');
  return clean.trim();
};

export const parseResumeAI = async (resumeText: string): Promise<any> => {
  if (!ai) {
    console.warn("Gemini API Key not found. Returning mock parse data.");
    return mockParseResume();
  }

  try {
    const model = "gemini-2.5-flash";
    const prompt = `Extract the following details from the resume text: 
    Full Name, Email, Phone, Skills (array), Experience (years), Current CTC, Expected CTC.
    Resume Text: ${resumeText}`;

    // responseMimeType IS supported here because we are NOT using tools.
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            experience: { type: Type.NUMBER },
            currentCtc: { type: Type.STRING },
            expectedCtc: { type: Type.STRING },
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Parse Error:", error);
    return mockParseResume();
  }
};

export const searchJobsWithAI = async (prompt: string): Promise<any[]> => {
  if (!ai) {
    console.warn("Gemini API Key not found. Returning empty list.");
    return [];
  }

  try {
    // We use googleSearch tool for grounding to find real jobs.
    // CRITICAL FIX: Do NOT set responseMimeType: "application/json" when using tools.
    // It causes INVALID_ARGUMENT errors. We must parse the text manually.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json"  <-- REMOVED THIS
      }
    });

    const rawText = response.text || "[]";
    const cleanedJson = cleanJsonString(rawText);
    
    try {
      // Attempt to parse the cleaned string
      const data = JSON.parse(cleanedJson);
      // Ensure it is an array
      return Array.isArray(data) ? data : [];
    } catch (parseError) {
      console.warn("Failed to parse AI response as JSON. Raw:", rawText);
      
      // Fallback regex to extract array if the model chatted before the JSON
      const arrayMatch = rawText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          return JSON.parse(arrayMatch[0]);
        } catch (e) { return []; }
      }
      return [];
    }
  } catch (error) {
    console.error("AI Job Search Error:", error);
    return [];
  }
};

const mockParseResume = () => ({
  fullName: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 555 0199",
  skills: ["React", "TypeScript", "Node.js", "Tailwind"],
  experience: 5,
  currentCtc: "12 LPA",
  expectedCtc: "18 LPA"
});
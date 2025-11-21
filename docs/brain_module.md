# Brain Module Specification (Gemini Service)

The "Brain" (`services/geminiService.ts`) is a stateless microservice wrapper around Google's Gemini API.

## 1. Resume Parsing (`parseResumeAI`)
**Internal Call:** `ai.models.generateContent`
**Model:** `gemini-2.5-flash`
**Prompt Strategy:**
- Input: Raw text extracted from PDF/DOCX.
- System Instruction: "You are an expert ATS parser. Extract structured JSON."
- Schema Enforcement: `responseMimeType: "application/json"`
**Output Schema:**
```json
{
  "fullName": "string",
  "email": "string",
  "skills": ["string"],
  "experience": number,
  "currentCtc": "string"
}
```

## 2. Co-Pilot Chat (`generateChatResponse`)
**Internal Call:** `ai.models.generateContent`
**Model:** `gemini-2.5-flash`
**Logic:**
- Takes `chatHistory` array.
- Injects `systemInstruction`: "You are a professional recruiter interviewing for [Job Title]."
- Maintains persona consistency and professional tone.
- **Safety:** Filters PII requests (asking for passwords, etc).

## 3. Job Search Grounding (`searchJobsWithAI`)
**Internal Call:** `ai.models.generateContent` (with Tools)
**Tool:** `googleSearch`
**Logic:**
- Enables the app to find *real-world* job postings to backfill the board.
- **Constraint:** Does NOT use JSON mode because Tools + JSON mode are mutually exclusive in some SDK versions. Uses regex post-processing to extract job list.

## 4. Data Privacy
- API Keys are stored in environment variables.
- No candidate data is trained on; usage is strictly inference-only.

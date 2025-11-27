const API_BASE_URL = "http://localhost:8000"; // Assuming the backend runs on port 8000

const createTask = async (task_type: string, payload: any): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ task_type, payload }),
    });
    const data = await response.json();
    return data.qid;
};

const pollTaskResult = async (qid: string): Promise<any> => {
    let taskComplete = false;
    let taskResult = null;

    while (!taskComplete) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2 seconds
        const response = await fetch(`${API_BASE_URL}/tasks/${qid}`);
        const data = await response.json();

        if (data.status === "completed") {
            taskComplete = true;
            taskResult = data.result;
        } else if (data.status === "failed") {
            taskComplete = true;
            console.error("Task failed:", data.result);
            throw new Error("Task failed to process");
        }
    }
    return taskResult;
};

export const parseResumeAI = async (resumeText: string): Promise<any> => {
    try {
        const qid = await createTask("resume_parsing", { resume_text: resumeText });
        const result = await pollTaskResult(qid);
        return result;
    } catch (error) {
        console.error("AI Parse Error:", error);
        return mockParseResume();
    }
};

export const generateChatResponse = async (
  history: { sender: string; text: string }[],
  candidateName: string,
  jobTitle: string
): Promise<string> => {
  try {
    const qid = await createTask("chat", { history, candidateName, jobTitle });
    const result = await pollTaskResult(qid);
    return result.message || "I didn't quite catch that, could you rephrase?";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting right now. Let's continue later.";
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

export const searchJobsWithAI = async (prompt: string): Promise<any[]> => {
    try {
        const qid = await createTask("job_search", { query: prompt });
        const result = await pollTaskResult(qid);
        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error("AI Job Search Error:", error);
        return [];
    }
};

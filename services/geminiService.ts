import { GoogleGenAI } from '@google/genai';
import { JournalEntry } from '@/types';

// Helper to check if API key is present
export const isAiAvailable = (): boolean => {
  return !!process.env.NEXT_PUBLIC_GENAI_API_KEY;
};

export const GeminiService = {
  async generateReflection(entry: JournalEntry): Promise<string> {
    if (!process.env.NEXT_PUBLIC_GENAI_API_KEY) {
      throw new Error('API Key not configured');
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.NEXT_PUBLIC_GENAI_API_KEY,
    });
    try {
      const prompt = `
        Act as a supportive, mindful therapist and life coach. 
        Read the following journal entry and provide a brief, warm, and insightful reflection (max 100 words).
        Validate the user's feelings (Mood: ${entry.mood}) and offer a gentle perspective or a question for self-discovery.
        
        Journal Title: ${entry.title}
        Content: ${entry.content}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 }, // Low latency preferred for UI feedback
        },
      });

      return (
        response.text || "I couldn't generate a reflection at this moment."
      );
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate insight.');
    }
  },
};

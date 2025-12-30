import { storageService } from './storageService';

interface ReviewResult {
  approved: boolean;
  reason?: string;
}

export const aiService = {
  reviewIdea: async (text: string): Promise<ReviewResult> => {
    const config = storageService.getConfig();
    const apiKey = config.openRouterApiKey;

    // Mock response if no API Key provided (For demo purposes)
    if (!apiKey) {
      console.warn("No OpenRouter API Key set. Using mock reviewer.");
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate latency
      
      // Simple mock validation logic
      const isTooShort = text.length < 60;
      const isTooLong = text.length > 120;
      const hasUrl = /(https?:\/\/[^\s]+)/g.test(text);
      const hasEmail = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g.test(text);

      if (isTooShort || isTooLong) return { approved: false, reason: "Length requirement not met." };
      if (hasUrl || hasEmail) return { approved: false, reason: "Contains links or personal info." };
      
      return { approved: true };
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin, 
          "X-Title": "IdeaSwipe"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo", // Or any cheap efficient model on OpenRouter
          messages: [
            {
              role: "system",
              content: `You are a strict content moderator for a startup idea platform. 
              Rules:
              1. No PII (emails, phone numbers).
              2. No URLs or links.
              3. Must be a startup idea description.
              4. Length checks are handled by the frontend, focus on content safety.
              5. Return JSON only: { "approved": boolean, "reason": string | null }.`
            },
            {
              role: "user",
              content: `Review this text: "${text}"`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error("AI Service failed");
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      try {
        const result = JSON.parse(content);
        return {
          approved: result.approved,
          reason: result.reason
        };
      } catch (e) {
        return { approved: false, reason: "AI response parsing failed." };
      }

    } catch (error) {
      console.error("AI Review Error:", error);
      return { approved: false, reason: "Service unavailable." };
    }
  }
};

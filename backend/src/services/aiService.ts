import axios from "axios";

interface LLMResponse {
  category: "billing" | "technical" | "feature_request";
  sentiment_score: number;
  urgency: "high" | "medium" | "low";
  draft_reply: string;
}

export class AIService {
  private apiKey: string;
  private provider: string;
  private apiUrl: string;

  constructor() {
    this.provider = process.env.LLM_PROVIDER || "gemini";
    this.apiKey = process.env.LLM_API_KEY || "";

    if (this.provider === "groq") {
      this.apiUrl = "https://api.groq.com/openai/v1/chat/completions";
    } else {
      // Default to Gemini (using Google AI Studio API format)
      this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`;
    }
  }

  /**
   * Analyze ticket content using LLM
   */
  async analyzeTicket(content: string): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error("LLM_API_KEY is not configured");
    }

    const prompt = `
      You are a customer support AI assistant. Analyze the following complaint and return a strictly formatted JSON response.
      
      Complaint: "${content}"
      
      Analyze the complaint for:
      1. Category (billing, technical, or feature_request)
      2. Sentiment score (1-10, where 1 is angry/negative and 10 is happy/positive)
      3. Urgency (high, medium, or low)
      4. Draft a polite, helpful response (max 200 words)
      
      Return ONLY valid JSON in this exact format, with no markdown formatting or code blocks:
      {
        "category": "billing" | "technical" | "feature_request",
        "sentiment_score": number,
        "urgency": "high" | "medium" | "low",
        "draft_reply": "string"
      }
    `;

    try {
      let responseText = "";

      if (this.provider === "groq") {
        const response = await axios.post(
          this.apiUrl,
          {
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful AI assistant that outputs only JSON.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.1,
            response_format: { type: "json_object" },
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
          },
        );
        responseText = response.data.choices[0].message.content;
      } else {
        // Gemini API
        const response = await axios.post(
          this.apiUrl,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
            },
          },
          {
            headers: { "Content-Type": "application/json" },
          },
        );

        if (response.data.candidates && response.data.candidates[0].content) {
          responseText = response.data.candidates[0].content.parts[0].text;
        } else {
          throw new Error("Invalid response from Gemini API");
        }
      }

      // Clean up response text (remove markdown code blocks if present)
      const cleanJson = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      // Parse JSON
      const parsed = JSON.parse(cleanJson);

      // Validate structure
      return this.validateResponse(parsed);
    } catch (error: any) {
      if (error.response) {
        console.error(
          "LLM API Error Data:",
          JSON.stringify(error.response.data, null, 2),
        );
        console.error("LLM API Error Status:", error.response.status);
      } else {
        console.error("LLM API Call Error:", error.message);
      }
      throw error;
    }
  }

  /**
   * Validate the LLM response structure and values
   */
  private validateResponse(data: any): LLMResponse {
    // Validate category
    if (!["billing", "technical", "feature_request"].includes(data.category)) {
      data.category = "technical"; // Fallback
    }

    // Validate urgency
    if (!["high", "medium", "low"].includes(data.urgency)) {
      data.urgency = "medium"; // Fallback
    }

    // Validate sentiment
    if (
      typeof data.sentiment_score !== "number" ||
      data.sentiment_score < 1 ||
      data.sentiment_score > 10
    ) {
      data.sentiment_score = 5; // Fallback
    }

    // Validate draft reply
    if (typeof data.draft_reply !== "string" || !data.draft_reply) {
      data.draft_reply =
        "Thank you for your message. A support agent will review it shortly.";
    }

    return {
      category: data.category,
      sentiment_score: data.sentiment_score,
      urgency: data.urgency,
      draft_reply: data.draft_reply,
    };
  }
}

export const aiService = new AIService();

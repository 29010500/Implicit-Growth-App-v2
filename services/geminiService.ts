
import { GoogleGenAI } from "@google/genai";
import type { FinancialData, GeminiApiResponse, GroundingSource } from '../types';

// IMPORTANT: Replace "YOUR_API_KEY_HERE" with your actual Google Gemini API Key.
// This is the ONLY place you need to change.
const API_KEY = "AIzaSyBL1gyvGJFIZX2w0cBXFAUmxf9iE2Rc1b8";

function buildPrompt(company: string): string {
    return `
You are an expert financial analyst AI.
Your task is to retrieve the latest, most accurate financial data for the company: "${company}".

Prioritize data from these sources in order: Finchat, alphaspread, Tikr.
If data is not available there, use other reputable public financial data providers.

You need to find:
- The official stock ticker symbol.
- The current (or most recent closing) stock price.
- The Free Cash Flow (FCF) per share for the Trailing Twelve Months (TTM).
- The Weighted Average Cost of Capital (WACC).
- The currency of the stock price.

Ensure the WACC is a decimal value (e.g., 8.5% should be 0.085).

IMPORTANT: The final output MUST be ONLY a single, raw JSON object.
Do not include any text, explanations, or markdown formatting (like \`\`\`json) before or after the JSON object.
The JSON object must have these exact keys: "ticker", "price", "fcfPerShare", "wacc", "currency".
If you cannot find a specific value for any field, its value in the JSON MUST be null.
`;
}

export const fetchFinancialData = async (company: string): Promise<GeminiApiResponse> => {
    // Safety check to ensure the developer has replaced the placeholder key.
    if (API_KEY === "YOUR_API_KEY_HERE" || !API_KEY) {
        throw new Error("API Key is missing. Please open services/geminiService.ts and replace 'YOUR_API_KEY_HERE' with your actual Gemini API key.");
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: buildPrompt(company),
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        let text = response.text.trim();
        
        // Sanitize the response to remove markdown wrappers if they exist.
        if (text.startsWith("```json")) {
            text = text.slice(7, -3).trim();
        } else if (text.startsWith("```")) {
            text = text.slice(3, -3).trim();
        }

        let financialData: FinancialData;
        try {
            // Find the JSON part of the response as a fallback.
            const jsonStringMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonStringMatch) {
                console.error("Gemini Response Text:", response.text);
                throw new Error("No valid JSON object found in the AI response.");
            }
            financialData = JSON.parse(jsonStringMatch[0]);
        } catch (e) {
            console.error("Failed to parse JSON from Gemini response:", text);
            throw new Error("The AI returned data in an incorrect format. Please try again.");
        }

        const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const sources: GroundingSource[] = rawSources.map(chunk => ({
            uri: chunk.web?.uri ?? '#',
            title: chunk.web?.title ?? 'Untitled Source'
        })).filter(source => source.uri !== '#');

        const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());
        
        return { financialData, sources: uniqueSources };

    } catch (error) {
        console.error("Error fetching financial data:", error);
        if (error instanceof Error) {
             if (error.message.includes('400 Bad Request')) {
                throw new Error('The request was malformed. This might be a temporary issue with the AI service or a problem with the prompt. Please try again later.');
            }
            throw new Error(`Failed to fetch data from Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred while fetching data.");
    }
};

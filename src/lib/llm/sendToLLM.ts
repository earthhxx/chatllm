import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI(
    { apiKey: process.env.LLM_API_KEY }
);

type SendToLLMOptions = {
    prompt: string;
    contextChunks?: string[];
};

type LLMResponse = {
    answer: unknown;
};

export async function sendToLLM(
    options: SendToLLMOptions
): Promise<LLMResponse> {
    const { prompt, contextChunks = [] } = options;

    console.log("🟢 [sendToLLM] start");
    console.log("🟢 [sendToLLM] prompt:", prompt);
    console.log("🟢 [sendToLLM] context chunks:", contextChunks.length);

    // รวม context จาก PDF
    const contextText = contextChunks.join("\n\n---\n\n");

    const fullPrompt = `
                        คุณคือผู้ช่วย AI
                        ใช้ข้อมูลด้านล่างเพื่อตอบคำถาม หากไม่มีข้อมูลให้ตอบว่า "ไม่พบข้อมูล"

                        [ข้อมูล]
                        ${contextText}

                        [คำถาม]
                        ${prompt}
                        `.trim();

    try {
        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: fullPrompt,
        });

        const text = result.text;

        console.log("🟢 [sendToLLM] success");

        return {
            answer: text,
        };
    } catch (err) {
        console.error("🔴 [sendToLLM] failed", err);
        throw err;
    }
}

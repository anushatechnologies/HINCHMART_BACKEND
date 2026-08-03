"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithCopilot = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const genai_1 = require("@google/genai");
const chatWithCopilot = async (req, res) => {
    try {
        const { message } = req.body;
        const user = req.user;
        if (!message) {
            res.status(400).json({ success: false, message: 'Message is required' });
            return;
        }
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            res.status(500).json({ success: false, message: 'GEMINI_API_KEY is not configured in the backend.' });
            return;
        }
        // 1. Gather Context
        let companyContext = 'No corporate account linked.';
        let orderContext = 'No recent orders.';
        if (user.companyId) {
            const company = await prisma_1.default.company.findUnique({ where: { id: user.companyId } });
            if (company) {
                companyContext = `Company Name: ${company.name}, Credit Limit: ₹${company.creditLimit}, Available Credit: ₹${company.availableCredit}`;
            }
        }
        const order = await prisma_1.default.order.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });
        if (order) {
            orderContext = `Latest Order Number: ${order.orderNumber}, Status: ${order.status}, Total: ₹${order.total}`;
        }
        // 2. Initialize Gemini SDK
        const ai = new genai_1.GoogleGenAI({ apiKey });
        const systemPrompt = `
You are the Hinchmart B2B Copilot, an intelligent procurement assistant.
Be polite, professional, and concise. Format your responses using markdown where helpful.

Here is the context of the user you are talking to:
- User Name: ${user.name || 'Unknown'}
- User Email: ${user.email || 'Unknown'}
- ${companyContext}
- ${orderContext}

Answer the user's question accurately based ONLY on this context. If they ask about something outside this context, politely inform them you don't have that information.
    `.trim();
        // 3. Call the Model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: systemPrompt,
            }
        });
        const reply = response.text || "I'm sorry, I couldn't process that request right now.";
        res.status(200).json({ success: true, reply });
    }
    catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ success: false, message: error.message || 'Failed to communicate with AI' });
    }
};
exports.chatWithCopilot = chatWithCopilot;
//# sourceMappingURL=ai.controller.js.map
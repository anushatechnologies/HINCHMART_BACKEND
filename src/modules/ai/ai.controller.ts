import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { GoogleGenAI } from '@google/genai';

export const chatWithCopilot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    const user = (req as any).user;

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
      const company = await prisma.company.findUnique({ where: { id: user.companyId } });
      if (company) {
        companyContext = `Company Name: ${company.name}, Credit Limit: ₹${company.creditLimit}, Available Credit: ₹${company.availableCredit}`;
      }
    }

    const order = await prisma.order.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    if (order) {
      orderContext = `Latest Order Number: ${order.orderNumber}, Status: ${order.status}, Total: ₹${order.total}`;
    }

    // 2. Initialize Gemini SDK
    const ai = new GoogleGenAI({ apiKey });

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
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ success: false, message: error.message || 'Failed to communicate with AI' });
  }
};

export const getAIRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    let preferredCategoryIds: number[] = [];

    if (userId) {
      // Find top categories purchased by this user
      const userOrderItems = await prisma.orderItem.findMany({
        where: { order: { userId } },
        include: { variant: { include: { product: true } } },
        take: 20
      });

      preferredCategoryIds = userOrderItems
        .map(i => i.variant?.product?.categoryId)
        .filter((id): id is number => typeof id === 'number');
    }

    // Fetch recommended products matching category preferences or top rated
    const recommendations = await prisma.product.findMany({
      where: {
        isActive: true,
        approvalStatus: 'APPROVED',
        ...(preferredCategoryIds.length > 0 ? { categoryId: { in: preferredCategoryIds } } : {})
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
        variants: { take: 1 }
      },
      take: 8,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      message: 'AI Recommendations generated',
      data: recommendations
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to generate recommendations', error: error.message });
  }
};


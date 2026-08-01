import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Utility to simulate network delay for AI generation
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, type } = req.body;
    await delay(1500); // Simulate AI generation time

    let data = {};
    if (type === 'seo') {
      data = {
        title: `Premium ${prompt || 'Product'} | High Quality & Durable`,
        description: `Discover our premium ${prompt || 'product'}. Built with exceptional quality materials, it offers unmatched durability and style. Perfect for everyday use. Order now for fast shipping!`,
        keywords: [prompt || 'product', 'premium', 'high quality', 'buy online', 'best price']
      };
    } else {
      data = {
        description: `Elevate your lifestyle with our expertly crafted ${prompt || 'product'}. Designed to blend seamlessly into your daily routine, it features an ergonomic design, sustainable materials, and a sleek modern aesthetic. Whether you're looking for performance or style, this is the ultimate choice for discerning customers.`,
        features: ['Ergonomic Design', 'Sustainable Materials', 'Sleek Aesthetic', 'Durable Build']
      };
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const analyzePricing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId, category } = req.body;
    await delay(2000);

    const data = {
      suggestedPrice: 1299,
      marketAverage: 1450,
      confidenceScore: 87,
      insights: [
        "Competitors in the 'Electronics' category have lowered prices by 5% this week.",
        "Your current pricing strategy is slightly above market average.",
        "Consider bundling with accessories to maintain current price points."
      ]
    };

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateForecast = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    await delay(2500);

    const data = {
      predictedSales: 450,
      growthRate: "+12.5%",
      inventoryRecommendations: [
        { product: "Wireless Earbuds", currentStock: 12, recommendedOrder: 50, reason: "High demand expected next week" },
        { product: "Smart Watch", currentStock: 5, recommendedOrder: 30, reason: "Low stock alert based on velocity" }
      ],
      businessInsights: [
        "Weekend sales peak between 6 PM and 9 PM.",
        "Products with video descriptions are converting 22% higher.",
        "Customer retention dropped slightly; consider an email campaign."
      ]
    };

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const chatAssistant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    await delay(1200);

    const lowerMessage = message.toLowerCase();
    let reply = "I'm your AI Copilot. How can I help you grow your store today?";
    
    if (lowerMessage.includes('sales')) {
      reply = "Based on recent trends, your sales are up 15% this week. Would you like me to draft a promotional email to keep the momentum going?";
    } else if (lowerMessage.includes('stock') || lowerMessage.includes('inventory')) {
      reply = "You have 3 items running low on stock. I recommend replenishing the 'Wireless Earbuds' immediately before the weekend rush.";
    } else if (lowerMessage.includes('price')) {
      reply = "I can analyze your competitors' pricing. Simply go to the Pricing Insights tab to run a full market comparison.";
    }

    res.status(200).json({ success: true, data: { reply } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

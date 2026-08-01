import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// Testimonials
export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: testimonials });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Blogs
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: blogs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deals
export const getActiveDeals = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const deals = await prisma.deal.findMany({
      where: {
        isActive: true,
        startTime: { lte: now },
        endTime: { gte: now }
      },
      include: {
        product: {
          include: { images: true }
        }
      }
    });
    res.json({ success: true, data: deals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Legal & Corporate Pages (PageContent) ───────────────────────────────────

export const getPageContent = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    let page = await prisma.pageContent.findUnique({ where: { slug } });
    
    if (!page) {
      // Seed default content if not exists
      const titles: any = {
        'privacy-policy': 'Privacy Policy',
        'terms-of-service': 'Terms of Service',
        'shipping-policy': 'Shipping Policy',
        'about': 'About Us'
      };
      if (titles[slug]) {
        page = await prisma.pageContent.create({
          data: {
            slug,
            title: titles[slug],
            content: `<h1>${titles[slug]}</h1>\n<p>This is a placeholder for the ${titles[slug]}. Please update this content in the admin panel.</p>`,
          }
        });
      } else {
        return res.status(404).json({ success: false, message: 'Page not found' });
      }
    }
    
    res.json({ success: true, data: page });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePageContent = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { title, content, isActive } = req.body;
    
    const page = await prisma.pageContent.upsert({
      where: { slug },
      update: { title, content, isActive },
      create: { slug, title, content, isActive: isActive ?? true }
    });
    
    res.json({ success: true, data: page });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

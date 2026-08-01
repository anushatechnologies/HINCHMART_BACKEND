import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// ─── Public: List all published blogs ─────────────────────────────────────────
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '12', search } = req.query as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = { published: true };
    if (search) where.title = { contains: search };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: { id: true, title: true, slug: true, summary: true, imageUrl: true, createdAt: true }
      }),
      prisma.blog.count({ where })
    ]);
    return res.json({ success: true, data: blogs, total, page: parseInt(page) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Public: Single blog by slug ───────────────────────────────────────────────
export const getBlogBySlug = async (req: Request, res: Response) => {
  try {
    const blog = await prisma.blog.findUnique({ where: { slug: req.params.slug } });
    if (!blog || !blog.published) return res.status(404).json({ success: false, message: 'Blog not found' });
    return res.json({ success: true, data: blog });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: List all blogs (published + draft) ────────────────────────────────
export const getAllBlogsAdmin = async (req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: blogs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Create blog ────────────────────────────────────────────────────────
export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, slug, summary, content, imageUrl, published } = req.body;
    if (!title || !slug || !content) {
      return res.status(400).json({ success: false, message: 'title, slug and content are required' });
    }
    const blog = await prisma.blog.create({
      data: { title, slug, summary: summary || '', content, imageUrl, published: published !== false }
    });
    return res.status(201).json({ success: true, data: blog });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Update blog ────────────────────────────────────────────────────────
export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { title, slug, summary, content, imageUrl, published } = req.body;
    const blog = await prisma.blog.update({
      where: { id: parseInt(req.params.id) },
      data: { title, slug, summary, content, imageUrl, published }
    });
    return res.json({ success: true, data: blog });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Delete blog ────────────────────────────────────────────────────────
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    await prisma.blog.delete({ where: { id: parseInt(req.params.id) } });
    return res.json({ success: true, message: 'Blog deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

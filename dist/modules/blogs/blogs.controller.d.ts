import { Request, Response } from 'express';
export declare const getBlogs: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getBlogBySlug: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllBlogsAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createBlog: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateBlog: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteBlog: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=blogs.controller.d.ts.map
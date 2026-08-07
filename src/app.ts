import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './modules/auth/auth.routes';
import categoryRoutes from './modules/categories/categories.routes';
import productRoutes from './modules/products/products.routes';
import cartRoutes from './modules/cart/cart.routes';
import addressRoutes from './modules/addresses/addresses.routes';
import orderRoutes from './modules/orders/orders.routes';
import adminRoutes from './modules/admin/admin.routes';
import reviewRoutes from './modules/reviews/reviews.routes';
import wishlistRoutes from './modules/wishlist/wishlist.routes';
import bannerRoutes from './modules/banners/banners.routes';
import couponRoutes from './modules/coupons/coupons.routes';
import rfqRoutes from './modules/rfq/rfq.routes';
import contentRoutes from './modules/content/content.routes';
import searchRoutes from './modules/search/search.routes';
import filterRoutes from './modules/filters/filters.routes';
import accountRoutes from './modules/account/account.routes';
import companiesRoutes from './modules/companies/companies.routes';
import vendorsRoutes from './modules/vendors/vendors.routes';
import settlementsRoutes from './modules/settlements/settlements.routes';
import logisticsRoutes from './modules/logistics/logistics.routes';
import poRoutes from './modules/po/po.routes';
import aiRoutes from './modules/ai/ai.routes';
import rentalsRoutes from './modules/rentals/rentals.routes';
import erpRoutes from './modules/erp/erp.routes';
import servicesRoutes from './modules/services/services.routes';
import walletRoutes from './modules/wallet/wallet.routes';
import rewardsRoutes from './modules/rewards/rewards.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import blogsRoutes from './modules/blogs/blogs.routes';
import dealsRoutes from './modules/deals/deals.routes';
import buyingGuidesRoutes from './modules/buying-guides/buying-guides.routes';
import supportRoutes from './modules/support/support.routes';
import faqRoutes from './modules/faq/faq.routes';
import contactRoutes from './modules/contact/contact.routes';
import chatRoutes from './modules/chat/chat.routes';
import returnsRoutes from './modules/returns/returns.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import healthRoutes from './modules/health/health.routes';
import auditRoutes from './modules/audit/audit.routes';
import creditRoutes from './modules/credit/credit-lines.routes';
import brandsRoutes from './modules/brands/brands.routes';
import { cacheMiddleware } from './middlewares/cache';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow images to be served cross-origin
}));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global Rate Limiting (Basic)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});
if (process.env.NODE_ENV === 'production') {
  app.use('/api/', limiter);
}

// Strict Rate Limiting for Auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 login/register attempts per minute
  message: { success: false, message: 'Too many authentication attempts, please try again after a minute' }
});

// Middleware
// Configure CORS to use environment variable or fallback to allow all (for development)
const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin) return callback(null, true);

    const isHinchmart = origin.endsWith('hinchmart.com') || origin.includes('localhost') || origin.includes('127.0.0.1');
    if (isHinchmart) {
      return callback(null, true);
    }

    if (process.env.CORS_ORIGIN) {
      const allowedOrigins = process.env.CORS_ORIGIN.split(',').map(url => url.trim());
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
    }

    callback(null, true);
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Generic Local Computer Upload Route (Images & Videos)
import { uploadLocal } from './middlewares/upload';
app.post('/api/upload', uploadLocal.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const fileUrl = `${protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl, filename: req.file.filename });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/categories', cacheMiddleware(120), categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/banners', cacheMiddleware(120), bannerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/rfq', rfqRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/companies', companiesRoutes); // Storefront
app.use('/api/vendors', vendorsRoutes); // Admin / Storefront
app.use('/api/settlements', settlementsRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api', poRoutes); // B2B and Admin POs
app.use('/api/ai', aiRoutes);
app.use('/api/rentals', rentalsRoutes);
app.use('/api/erp', erpRoutes);
app.use('/api', companiesRoutes);
app.use('/api', reviewRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/buying-guides', buyingGuidesRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/admin', auditRoutes);

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'HINCHI API is healthy' });
});

// Global Error Handler (must be last)
app.use(errorHandler);

export default app;

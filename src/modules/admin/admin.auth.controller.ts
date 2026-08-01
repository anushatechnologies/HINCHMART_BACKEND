import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prisma';

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Try to find Admin User
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.passwordHash);
      if (isMatch) {
        const token = jwt.sign(
          { id: admin.id, role: 'ADMIN' },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '1d' }
        );
        return res.json({
          success: true,
          token,
          data: { id: admin.id, name: admin.name, email: admin.email, role: 'ADMIN' }
        });
      }
    }

    // 2. Try to find Vendor
    const vendor = await prisma.vendor.findFirst({ where: { contactEmail: email } });
    if (vendor && vendor.passwordHash) {
      const isMatch = await bcrypt.compare(password, vendor.passwordHash);
      if (isMatch) {
        if (vendor.status !== 'ACTIVE') {
          return res.status(403).json({ success: false, message: 'Vendor account is suspended or pending approval.' });
        }
        
        const token = jwt.sign(
          { id: vendor.id, role: 'VENDOR' },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '1d' }
        );
        return res.json({
          success: true,
          token,
          data: { id: vendor.id, name: vendor.companyName, email: vendor.contactEmail, role: 'VENDOR' }
        });
      }
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

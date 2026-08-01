import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize SES Client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const sendEmailOTP = async (email: string, otp: string) => {
  // If AWS keys are not set, skip actual sending to avoid crashes during local dev
  if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'your_aws_access_key') {
    console.log(`[MOCK AWS SES] Sending OTP ${otp} to EMAIL: ${email}`);
    return;
  }

  const senderEmail = process.env.AWS_SES_SENDER_EMAIL || 'noreply@hinchmart.com';

  const params = {
    Destination: { ToAddresses: [email] },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 10px;">
              <h2 style="color: #dc2626;">HinchMart Verification</h2>
              <p>Your One-Time Password (OTP) for registration is:</p>
              <h1 style="font-size: 32px; letter-spacing: 5px; color: #1e293b;">${otp}</h1>
              <p>This OTP is valid for 10 minutes. Do not share this with anyone.</p>
              <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `
        },
        Text: { Charset: 'UTF-8', Data: `Your HinchMart OTP is ${otp}. It is valid for 10 minutes.` }
      },
      Subject: { Charset: 'UTF-8', Data: 'Your HinchMart OTP' }
    },
    Source: senderEmail
  };

  const command = new SendEmailCommand(params);
  await sesClient.send(command);
  console.log(`[AWS SES] Successfully sent OTP to ${email}`);
};

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { target, type } = req.body;
    
    if (!target || !type) {
      res.status(400).json({ success: false, message: 'Target and type (EMAIL or PHONE) are required' });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await prisma.otp.updateMany({
      where: { target, type, verified: false },
      data: { verified: true }
    });
    
    await prisma.otp.deleteMany({
      where: { target, type, verified: false }
    });

    await prisma.otp.create({
      data: { target, type, otp, expiresAt }
    });

    // Send via AWS if EMAIL
    if (type === 'EMAIL') {
      await sendEmailOTP(target, otp);
    } else {
      // Mock SMS for now, or you can integrate AWS SNS / MSG91 here
      console.log(`[MOCK SMS] Sending OTP ${otp} to PHONE: ${target}`);
    }

    res.status(200).json({ 
      success: true, 
      message: `OTP sent successfully.`,
      mockOtp: otp // Still returning for easier local development
    });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { target, type, otp } = req.body;

    if (!target || !type || !otp) {
      res.status(400).json({ success: false, message: 'Target, type, and OTP are required' });
      return;
    }

    const record = await prisma.otp.findFirst({
      where: {
        target,
        type,
        otp,
        verified: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!record) {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      return;
    }

    // Mark as verified
    await prisma.otp.update({
      where: { id: record.id },
      data: { verified: true }
    });

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP', error: error.message });
  }
};

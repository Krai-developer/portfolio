import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';

dotenv.config();

const updateAdminCredentials = async (): Promise<void> => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_platform';

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured in server/.env.');
  }

  try {
    await mongoose.connect(mongoUri);

    const existingTarget = await User.findOne({ email }).select('+password');
    if (existingTarget && existingTarget.role !== 'admin') {
      throw new Error('The configured admin email already belongs to a non-admin account.');
    }

    const admin = existingTarget || (await User.findOne({ role: 'admin' }).select('+password'));
    if (admin) {
      admin.email = email;
      admin.password = password;
      admin.role = 'admin';
      admin.isActive = true;
      await admin.save();
    } else {
      await User.create({ name: 'Portfolio Administrator', email, password, role: 'admin', isActive: true });
    }

    console.log('Administrator credentials updated from server environment.');
  } finally {
    await mongoose.disconnect();
  }
};

updateAdminCredentials().catch((error: Error) => {
  console.error(`[Admin Credentials] ${error.message}`);
  process.exitCode = 1;
});

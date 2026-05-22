import bcrypt from 'bcryptjs';
import User from '../models/user';

export const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log('👤 Admin account already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('Admin@1234', 10);
    await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('✅ Admin account created!');
    console.log('   Username: admin');
    console.log('   Password: Admin@1234');
  } catch (error) {
    console.error('❌ Failed to seed admin:', error);
  }
};
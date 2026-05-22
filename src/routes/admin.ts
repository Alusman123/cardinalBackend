import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user';
import { authenticate, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require admin
router.use(authenticate, adminOnly);

// Get all users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json({ users });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a user (admin only)
router.post('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ username });
    if (existing)
      return res.status(409).json({ error: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, role: 'user' });

    res.status(201).json({ message: 'User created successfully', userId: user._id });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Disable or enable a user
router.patch('/users/:id/toggle', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isDisabled = !user.isDisabled;
    await user.save();

    res.json({
      message: `User ${user.isDisabled ? 'disabled' : 'enabled'} successfully`,
      isDisabled: user.isDisabled,
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a user
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
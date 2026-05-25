import { Router, Response } from 'express';
import Post from '../models/post';
import { authenticate, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all posts (public)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json({ posts });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single post (public)
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create post (admin only)
router.post('/', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, photo, content } = req.body;

    if (!title || !description || !content)
      return res.status(400).json({ error: 'Title, description and content are required' });

    const post = await Post.create({
      title,
      description,
      photo: photo || '',
      content,
      createdBy: req.user?.userId,
    });

    res.status(201).json({ message: 'Post created successfully', post });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update post (admin only)
router.put('/:id', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, photo, content } = req.body;

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, description, photo, content },
      { new: true }
    );

    if (!post) return res.status(404).json({ error: 'Post not found' });

    res.json({ message: 'Post updated successfully', post });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete post (admin only)
router.delete('/:id', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
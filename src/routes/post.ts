import { Router, Response, Request } from 'express';
import Post from '../models/post';
import User from '../models/user';
import { authenticate, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all posts (public — filters hidden posts)
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;

    const posts = await Post.find({
      isHidden: false,
      ...(userId ? { hiddenFrom: { $nin: [userId] } } : {}),
    }).sort({ createdAt: -1 });

    res.json({ posts });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all posts for admin (shows all including hidden)
router.get('/admin/all', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json({ posts });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single post
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

// Toggle hide from all users
router.patch('/:id/toggle-hide', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.isHidden = !post.isHidden;
    await post.save();

    res.json({
      message: `Post ${post.isHidden ? 'hidden from all users' : 'visible to all users'}`,
      isHidden: post.isHidden,
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Hide/unhide from specific user
router.patch('/:id/hide-from-user', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, hide } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (hide) {
      if (!post.hiddenFrom.includes(userId)) {
        post.hiddenFrom.push(userId);
      }
    } else {
      post.hiddenFrom = post.hiddenFrom.filter(
        (id) => id.toString() !== userId
      );
    }

    await post.save();
    res.json({ message: 'Post visibility updated', hiddenFrom: post.hiddenFrom });
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
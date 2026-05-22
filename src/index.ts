import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { seedAdmin } from './config/seed';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: '✅ Cardinal API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

const start = async () => {
  await connectDB();
  await seedAdmin();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

start();
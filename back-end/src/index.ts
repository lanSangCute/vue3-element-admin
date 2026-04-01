import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import roleRoutes from './routes/role';
import departmentRoutes from './routes/department';
import menuRoutes from './routes/menu';
import logRoutes from './routes/logs';
import dictRoutes from './routes/dict';
import galleryRoutes from './routes/gallery';
import { authenticateToken, AuthRequest } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', authenticateToken, roleRoutes);
app.use('/api/departments', authenticateToken, departmentRoutes);
app.use('/api/menus', authenticateToken, menuRoutes);
app.use('/api/logs', authenticateToken, logRoutes);
app.use('/api/dict', authenticateToken, dictRoutes);
app.use('/api/gallery', authenticateToken, galleryRoutes);

// Protected route example
app.get('/api/dashboard', authenticateToken, (req: AuthRequest, res) => {
  res.json({
    message: 'Welcome to the dashboard!',
    user: req.user
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

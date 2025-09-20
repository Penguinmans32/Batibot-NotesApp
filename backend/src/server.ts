import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { pool } from './config/database';
import './config/auth';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import todoRoutes from './routes/todoRoutes';
import { cleanupExpiredNotes } from './controllers/notesController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/todos', todoRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Run cleanup immediately on startup
  cleanupExpiredNotes();
  
  // Schedule cleanup to run daily (24 hours)
  setInterval(() => {
    cleanupExpiredNotes();
  }, 24 * 60 * 60 * 1000);
});
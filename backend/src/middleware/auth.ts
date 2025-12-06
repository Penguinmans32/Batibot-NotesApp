import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  req.user = {
    id: 1,
    userId: 1,
    name: 'Wallet User',
    email: 'wallet@user.com'
  };

  next();
};
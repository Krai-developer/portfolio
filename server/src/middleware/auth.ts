import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { Project } from '../models/Project';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role: 'client' | 'admin';
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_super_secret_jwt_key_2026';

/**
 * Middleware: Authenticate user via HTTP-only cookie or Authorization header
 */
export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.token;

    // Optional Bearer token header fallback for API clients / tools
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await User.findById(decoded.id).select('+password');
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User account not found or deactivated.'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session.'
    });
  }
};

/**
 * Middleware: Require specific role(s)
 */
export const requireRole = (...roles: Array<'client' | 'admin'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: You do not have permission to perform this action.`
      });
      return;
    }

    next();
  };
};

/**
 * Middleware: Require Admin role specifically
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware: Require Client role specifically
 */
export const requireClient = requireRole('client');

/**
 * Middleware: Check Resource Ownership for Projects
 * If user is client, ensures project.clientId matches req.user._id
 * Admins bypass ownership checks
 */
export const checkProjectOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = req.params.id || req.params.projectId;
    if (!projectId) {
      res.status(400).json({ success: false, message: 'Project ID required.' });
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    // Admin has full access
    if (req.user?.role === 'admin') {
      next();
      return;
    }

    // Client must own the project
    if (
      req.user?.role === 'client' &&
      project.clientId &&
      project.clientId.toString() === req.user._id.toString()
    ) {
      next();
      return;
    }

    // Access denied
    res.status(403).json({
      success: false,
      message: "Forbidden: You don't have permission to access this resource."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error checking resource authorization.'
    });
  }
};

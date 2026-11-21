import { Request, Response } from 'express';
import { Settings } from '../models/Settings';
import { AuthRequest } from '../middleware/auth';
import { isSafeHttpUrl } from '../utils/validation';

const isSafeResumeUrl = (value: unknown): boolean => {
  if (value === '' || value === null || value === undefined) return true;
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('data:application/pdf;base64,')) {
    // Allow uploaded PDF data URLs up to ~7MB base64 (~5MB raw PDF)
    return trimmed.length <= 7_500_000;
  }
  return isSafeHttpUrl(trimmed);
};

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve website settings.' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payload = { ...req.body };

    if (payload.resumeUrl !== undefined) {
      if (!isSafeResumeUrl(payload.resumeUrl)) {
        res.status(400).json({
          success: false,
          message: 'Resume must be a valid http(s) URL or an uploaded PDF file (max 5 MB).'
        });
        return;
      }
      payload.resumeUrl = typeof payload.resumeUrl === 'string' ? payload.resumeUrl.trim() : '';
      payload.resumeUpdatedAt = payload.resumeUrl ? new Date() : null;
      if (!payload.resumeUrl) {
        payload.resumeFileName = '';
      }
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(payload);
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, payload, {
        new: true,
        runValidators: true
      });
    }

    res.status(200).json({
      success: true,
      message: 'Website settings updated successfully.',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update website settings.'
    });
  }
};

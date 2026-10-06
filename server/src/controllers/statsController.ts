import { Request, Response } from 'express';
import { Project } from '../models/Project';
import { Settings } from '../models/Settings';

const completedYears = (startDate: Date | undefined, now = new Date()): number => {
  if (!startDate || Number.isNaN(startDate.getTime()) || startDate > now) return 0;
  let years = now.getFullYear() - startDate.getFullYear();
  const beforeAnniversary =
    now.getMonth() < startDate.getMonth() ||
    (now.getMonth() === startDate.getMonth() && now.getDate() < startDate.getDate());
  if (beforeAnniversary) years -= 1;
  return Math.max(0, years);
};

export const getPublicStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await Settings.findOne().lean();
    if (settings?.statsPublic === false) {
      res.status(200).json({ success: true, data: { enabled: false } });
      return;
    }

    const visibleCompleted = {
      status: 'completed',
      $or: [
        { published: true, isPrivate: false, projectType: 'portfolio' },
        { includeInStats: true }
      ]
    };
    const [projectsCompleted, clients] = await Promise.all([
      Project.countDocuments(visibleCompleted),
      Project.distinct('clientId', { ...visibleCompleted, clientId: { $ne: null } })
    ]);
    const computed = {
      yearsLearning: completedYears(settings?.learningStartDate),
      projectsCompleted,
      happyClients: clients.length,
      dedication: settings?.dedicationPercentage ?? 100
    };
    const overrides = settings?.statsOverrides || {};
    const stats = {
      ...computed,
      ...Object.fromEntries(
        Object.entries(overrides).filter(([, value]) => typeof value === 'number')
      )
    };

    res.set('Cache-Control', 'no-store');
    res.status(200).json({ success: true, data: { enabled: true, ...stats } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to retrieve portfolio statistics.' });
  }
};

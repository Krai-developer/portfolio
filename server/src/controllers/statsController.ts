import { Request, Response } from 'express';
import { Project } from '../models/Project';
import { Skill } from '../models/Skill';
import { Settings } from '../models/Settings';

const DEFAULT_LEARNING_START = new Date('2023-06-01T00:00:00.000Z');

const completedYears = (startDate: Date | undefined, now = new Date()): number => {
  const effectiveStart =
    startDate && !Number.isNaN(startDate.getTime()) && startDate <= now
      ? startDate
      : DEFAULT_LEARNING_START;
  let years = now.getFullYear() - effectiveStart.getFullYear();
  const beforeAnniversary =
    now.getMonth() < effectiveStart.getMonth() ||
    (now.getMonth() === effectiveStart.getMonth() && now.getDate() < effectiveStart.getDate());
  if (beforeAnniversary) years -= 1;
  return Math.max(1, years);
};

export const getPublicStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await Settings.findOne().lean();
    if (settings?.statsPublic === false) {
      res.status(200).json({ success: true, data: { enabled: false } });
      return;
    }

    const countedProjectsFilter = {
      $or: [
        { published: true, isPrivate: false },
        { status: 'completed' },
        { includeInStats: true }
      ]
    };

    const [projects, skillsCount] = await Promise.all([
      Project.find(countedProjectsFilter)
        .select('status progress published projectType technologies')
        .lean(),
      Skill.countDocuments()
    ]);

    const projectsCompleted = projects.length;

    // Count unique technologies across Skills collection and built Projects
    const projectTechSet = new Set<string>();
    for (const p of projects) {
      for (const tech of p.technologies || []) {
        if (tech?.trim()) projectTechSet.add(tech.trim().toLowerCase());
      }
    }
    const technologiesCount = Math.max(skillsCount, projectTechSet.size);

    // Calculate real-time delivery & dedication percentage from project progress
    let computedDedication = 100;
    if (projects.length > 0) {
      const totalScore = projects.reduce((sum, p) => {
        if (p.status === 'completed' || (p.published && p.projectType === 'portfolio')) {
          return sum + 100;
        }
        return sum + Math.max(75, p.progress || 85);
      }, 0);
      computedDedication = Math.round(totalScore / projects.length);
    }

    const savedDedication =
      typeof settings?.dedicationPercentage === 'number' && settings.dedicationPercentage >= 50
        ? settings.dedicationPercentage
        : computedDedication;

    const computed = {
      yearsLearning: completedYears(settings?.learningStartDate),
      projectsCompleted,
      technologiesCount,
      happyClients: technologiesCount,
      dedication: projects.length > 0 ? computedDedication : savedDedication
    };

    const rawOverrides = settings?.statsOverrides || {};
    const validOverrides = Object.fromEntries(
      Object.entries(rawOverrides).filter(([key, value]) => {
        if (typeof value !== 'number' || value <= 0) return false;
        // Ignore accidental tiny dedication override like 2%
        if (key === 'dedication' && value < 50) return false;
        return true;
      })
    );

    const stats = {
      ...computed,
      ...validOverrides
    };

    res.set('Cache-Control', 'no-store');
    res.status(200).json({ success: true, data: { enabled: true, ...stats } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to retrieve portfolio statistics.' });
  }
};

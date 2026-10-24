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

    const [allProjects, skillsCount] = await Promise.all([
      Project.find({})
        .select('status progress published isPrivate projectType includeInStats technologies')
        .lean(),
      Skill.countDocuments()
    ]);

    const countedProjects = allProjects.filter(
      (p) => (p.published && !p.isPrivate) || p.status === 'completed' || p.includeInStats
    );

    const projectsCompleted = countedProjects.length;

    // Count unique technologies across Skills collection and built Projects
    const projectTechSet = new Set<string>();
    for (const p of allProjects) {
      for (const tech of p.technologies || []) {
        if (tech?.trim()) projectTechSet.add(tech.trim().toLowerCase());
      }
    }
    const technologiesCount = Math.max(skillsCount, projectTechSet.size);

    // Real-time Dedication to Growth: average completion/progress rate across all projects
    // Completed projects count as 100%; active projects contribute their live progress (0-100%)
    let computedDedication = 0;
    if (allProjects.length > 0) {
      const totalProgress = allProjects.reduce((sum, p) => {
        if (p.status === 'completed') return sum + 100;
        const progress = typeof p.progress === 'number' ? Math.min(100, Math.max(0, p.progress)) : 0;
        return sum + progress;
      }, 0);
      computedDedication = Math.round(totalProgress / allProjects.length);
    }

    const computed = {
      yearsLearning: completedYears(settings?.learningStartDate),
      projectsCompleted,
      technologiesCount,
      happyClients: technologiesCount,
      dedication: computedDedication
    };

    const rawOverrides = settings?.statsOverrides || {};
    const validOverrides = Object.fromEntries(
      Object.entries(rawOverrides).filter(([key, value]) => {
        if (typeof value !== 'number' || value <= 0) return false;
        if (key === 'dedication' && value === 2) return false;
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

import { Request, Response } from 'express';
import { Project } from '../models/Project';
import { ProjectMilestone } from '../models/ProjectMilestone';
import { ProjectFile } from '../models/ProjectFile';
import { AuthRequest } from '../middleware/auth';

// Helper to make slug
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

/**
 * @route   GET /api/projects
 * @desc    Get all public published portfolio projects
 * @access  Public (Visitors)
 */
export const getPublicProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { featured, category } = req.query;

    const filter: Record<string, any> = {
      published: true,
      projectType: 'portfolio',
      isPrivate: false
    };

    if (featured === 'true') {
      filter.featured = true;
    }

    if (category && typeof category === 'string' && category !== 'All') {
      filter.category = category;
    }

    const projects = await Project.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public projects.'
    });
  }
};

/**
 * @route   GET /api/projects/:slug
 * @desc    Get single public project by slug
 * @access  Public (Visitors)
 */
export const getPublicProjectBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const project = await Project.findOne({
      slug,
      published: true,
      projectType: 'portfolio',
      isPrivate: false
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found or is private.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project.'
    });
  }
};

/**
 * @route   GET /api/admin/projects
 * @desc    Get all projects (both portfolio and client projects)
 * @access  Admin only
 */
export const getAllProjectsAdmin = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find()
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects.'
    });
  }
};

/**
 * @route   POST /api/projects
 * @desc    Create a new project (Portfolio or Client)
 * @access  Admin only
 */
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      slug: customSlug,
      category,
      description,
      image,
      technologies,
      liveUrl,
      githubUrl,
      clientId,
      projectType,
      status,
      progress,
      featured,
      published,
      isPrivate,
      includeInStats,
      problem,
      solution,
      features,
      processNotes,
      screenshots,
      startDate,
      targetEndDate
    } = req.body;

    if (!title || !description) {
      res.status(400).json({ success: false, message: 'Title and description are required.' });
      return;
    }

    let finalSlug = customSlug ? slugify(customSlug) : slugify(title);

    // Ensure slug uniqueness
    const existing = await Project.findOne({ slug: finalSlug });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const project = await Project.create({
      title,
      slug: finalSlug,
      category: category || 'Full-Stack Application',
      description,
      image: image || '',
      technologies: Array.isArray(technologies) ? technologies : [],
      liveUrl: liveUrl || '',
      githubUrl: githubUrl || '',
      clientId: clientId || null,
      projectType: projectType || 'portfolio',
      status: status || 'planning',
      progress: typeof progress === 'number' ? progress : 0,
      featured: Boolean(featured),
      published: published !== undefined ? Boolean(published) : true,
      isPrivate: Boolean(isPrivate),
      includeInStats: Boolean(includeInStats),
      problem: problem || '',
      solution: solution || '',
      features: Array.isArray(features) ? features : [],
      processNotes: Array.isArray(processNotes) ? processNotes : [],
      screenshots: Array.isArray(screenshots) ? screenshots : [],
      startDate: startDate || undefined,
      targetEndDate: targetEndDate || undefined
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message || 'Failed to create project.'
    });
  }
};

/**
 * @route   GET /api/projects/id/:id
 * @desc    Get project details with milestones and files (Admin or authorized)
 * @access  Private
 */
export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id).populate('clientId', 'name email');
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    // RBAC: Client check
    if (req.user?.role === 'client') {
      if (!project.clientId || project.clientId._id.toString() !== req.user._id.toString()) {
        res.status(403).json({
          success: false,
          message: "Forbidden: You don't have permission to access this project."
        });
        return;
      }
    }

    const milestones = await ProjectMilestone.find({ projectId: project._id }).sort({ order: 1 });
    const files = await ProjectFile.find({ projectId: project._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        milestones,
        files
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve project details.'
    });
  }
};

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Admin only
 */
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    const updated = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    }).populate('clientId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message || 'Failed to update project.'
    });
  }
};

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project and its milestones & files
 * @access  Admin only
 */
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    await Project.findByIdAndDelete(id);
    await ProjectMilestone.deleteMany({ projectId: id });
    await ProjectFile.deleteMany({ projectId: id });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete project.'
    });
  }
};

/**
 * Milestone Controllers
 */
export const createMilestone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { title, description, status, dueDate, order } = req.body;

    if (!title) {
      res.status(400).json({ success: false, message: 'Milestone title is required.' });
      return;
    }

    const milestone = await ProjectMilestone.create({
      projectId,
      title,
      description: description || '',
      status: status || 'pending',
      dueDate: dueDate || undefined,
      order: typeof order === 'number' ? order : 0
    });

    res.status(201).json({ success: true, data: milestone });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create milestone.' });
  }
};

export const updateMilestone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { milestoneId } = req.params;
    const updateData = { ...req.body };

    if (updateData.status === 'completed' && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    const milestone = await ProjectMilestone.findByIdAndUpdate(milestoneId, updateData, {
      new: true
    });

    if (!milestone) {
      res.status(404).json({ success: false, message: 'Milestone not found.' });
      return;
    }

    res.status(200).json({ success: true, data: milestone });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update milestone.' });
  }
};

export const deleteMilestone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { milestoneId } = req.params;
    await ProjectMilestone.findByIdAndDelete(milestoneId);
    res.status(200).json({ success: true, message: 'Milestone removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete milestone.' });
  }
};

/**
 * File Controllers
 */
export const uploadProjectFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { name, url, type, size } = req.body;

    if (!name || !url) {
      res.status(400).json({ success: false, message: 'File name and URL are required.' });
      return;
    }

    const file = await ProjectFile.create({
      projectId,
      uploadedBy: req.user!._id,
      name,
      url,
      type: type || 'document',
      size: size || 1024
    });

    res.status(201).json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload project file record.' });
  }
};

export const deleteProjectFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    await ProjectFile.findByIdAndDelete(fileId);
    res.status(200).json({ success: true, message: 'File deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete file.' });
  }
};

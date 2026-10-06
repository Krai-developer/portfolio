import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Project } from '../models/Project';
import { ProjectMilestone } from '../models/ProjectMilestone';
import { ProjectFile } from '../models/ProjectFile';
import { Message } from '../models/Message';
import { User } from '../models/User';

/**
 * @route   GET /api/client/dashboard
 * @desc    Get client overview stats and recent projects
 * @access  Client only (verified via requireClient)
 */
export const getClientDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const clientId = req.user!._id;

    // Fetch projects for this client ONLY
    const projects = await Project.find({ clientId }).sort({ updatedAt: -1 });

    const activeProjects = projects.filter((p) => p.status !== 'completed').length;
    const completedProjects = projects.filter((p) => p.status === 'completed').length;

    // Project IDs for this client
    const projectIds = projects.map((p) => p._id);

    // Unread messages directed to this client
    const unreadMessagesCount = await Message.countDocuments({
      projectId: { $in: projectIds },
      receiverId: clientId,
      read: false
    });

    // Pending milestones for this client's projects
    const pendingMilestonesCount = await ProjectMilestone.countDocuments({
      projectId: { $in: projectIds },
      status: { $in: ['pending', 'in-progress'] }
    });

    // Get current milestone for each of the latest 3 projects
    const recentProjectsWithMilestone = await Promise.all(
      projects.slice(0, 5).map(async (project) => {
        const currentMilestone = await ProjectMilestone.findOne({
          projectId: project._id,
          status: { $in: ['in-progress', 'pending'] }
        }).sort({ order: 1 });

        return {
          ...project.toObject(),
          currentMilestone: currentMilestone ? currentMilestone.title : 'All milestones completed'
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        stats: {
          activeProjects,
          completedProjects,
          unreadMessages: unreadMessagesCount,
          pendingMilestones: pendingMilestonesCount
        },
        recentProjects: recentProjectsWithMilestone
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load client dashboard.'
    });
  }
};

/**
 * @route   GET /api/client/projects
 * @desc    Get all projects belonging to authenticated client
 * @access  Client only
 */
export const getClientProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const clientId = req.user!._id;

    const projects = await Project.find({ clientId }).sort({ updatedAt: -1 });

    // Attach current milestone and counts
    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const currentMilestone = await ProjectMilestone.findOne({
          projectId: project._id,
          status: { $in: ['in-progress', 'pending'] }
        }).sort({ order: 1 });

        const milestoneCount = await ProjectMilestone.countDocuments({ projectId: project._id });
        const fileCount = await ProjectFile.countDocuments({ projectId: project._id });

        return {
          ...project.toObject(),
          currentMilestone: currentMilestone ? currentMilestone.title : 'All milestones completed',
          milestoneCount,
          fileCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: projectsWithDetails.length,
      data: projectsWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load client projects.'
    });
  }
};

/**
 * @route   GET /api/client/projects/:id
 * @desc    Get single client project with milestones and files (Strict ownership verified!)
 * @access  Client only
 */
export const getClientProjectDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clientId = req.user!._id;

    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    // STRICT OWNERSHIP ENFORCEMENT
    if (!project.clientId || project.clientId.toString() !== clientId.toString()) {
      res.status(403).json({
        success: false,
        message: "Forbidden: You don't have permission to access this project."
      });
      return;
    }

    const milestones = await ProjectMilestone.find({ projectId: project._id }).sort({ order: 1 });
    const files = await ProjectFile.find({ projectId: project._id }).sort({ createdAt: -1 });
    const messages = await Message.find({ projectId: project._id })
      .populate('senderId', 'name role avatar')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        milestones,
        files,
        messages
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
 * @route   GET /api/client/files
 * @desc    Get all files belonging to the client's projects
 * @access  Client only
 */
export const getClientFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const clientId = req.user!._id;

    // Find all projects belonging to client
    const projects = await Project.find({ clientId }).select('_id title');
    const projectIds = projects.map((p) => p._id);

    const files = await ProjectFile.find({ projectId: { $in: projectIds } })
      .populate('projectId', 'title')
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve files.'
    });
  }
};

/**
 * @route   GET /api/client/messages
 * @desc    Get all conversations & messages for client
 * @access  Client only
 */
export const getClientMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const clientId = req.user!._id;

    // Find client's projects
    const projects = await Project.find({ clientId }).select('_id title');
    const projectIds = projects.map((p) => p._id);

    const messages = await Message.find({ projectId: { $in: projectIds } })
      .populate('senderId', 'name role avatar')
      .populate('projectId', 'title')
      .sort({ createdAt: 1 });

    // Mark messages sent to this client as read
    await Message.updateMany(
      { projectId: { $in: projectIds }, receiverId: clientId, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      projects,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load client messages.'
    });
  }
};

/**
 * @route   POST /api/client/messages
 * @desc    Send a message from client to admin regarding their project
 * @access  Client only
 */
export const sendClientMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const clientId = req.user!._id;
    const { projectId, content, attachments } = req.body;

    if (!projectId || !content) {
      res.status(400).json({ success: false, message: 'Project ID and content are required.' });
      return;
    }

    // STRICT OWNERSHIP CHECK: Ensure client owns this project
    const project = await Project.findById(projectId);
    if (!project || !project.clientId || project.clientId.toString() !== clientId.toString()) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You can only send messages for your own project.'
      });
      return;
    }

    // Find admin user to receive message
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      res.status(500).json({ success: false, message: 'Platform administrator unavailable.' });
      return;
    }

    const message = await Message.create({
      projectId,
      senderId: clientId,
      receiverId: adminUser._id,
      content,
      attachments: Array.isArray(attachments) ? attachments : [],
      read: false
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'name role avatar')
      .populate('projectId', 'title');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send message.'
    });
  }
};

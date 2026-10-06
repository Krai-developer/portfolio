import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { ClientProfile } from '../models/ClientProfile';
import { ContactMessage } from '../models/ContactMessage';
import { Message } from '../models/Message';
import { Service } from '../models/Service';
import { Skill } from '../models/Skill';
import bcrypt from 'bcryptjs';

/**
 * @route   GET /api/admin/dashboard
 * @desc    Comprehensive stats for Admin Dashboard Overview
 * @access  Admin only
 */
export const getAdminDashboard = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalProjects = await Project.countDocuments();
    const portfolioProjects = await Project.countDocuments({ projectType: 'portfolio' });
    const activeClientProjects = await Project.countDocuments({
      projectType: 'client',
      status: { $ne: 'completed' }
    });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalServices = await Service.countDocuments();
    const totalSkills = await Skill.countDocuments();

    const unreadContactMessages = await ContactMessage.countDocuments({ status: 'new' });
    const unreadClientMessages = await Message.countDocuments({ read: false });

    // Recent 5 contact submissions
    const recentContacts = await ContactMessage.find().sort({ createdAt: -1 }).limit(5);

    // Recent 5 active projects
    const recentProjects = await Project.find()
      .populate('clientId', 'name email')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProjects,
          portfolioProjects,
          activeClientProjects,
          completedProjects,
          totalClients,
          totalServices,
          totalSkills,
          unreadMessages: unreadContactMessages + unreadClientMessages,
          unreadContacts: unreadContactMessages,
          unreadClientChats: unreadClientMessages
        },
        recentContacts,
        recentProjects
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard stats.'
    });
  }
};

/**
 * @route   GET /api/admin/clients
 * @desc    Get all clients with profile and project count
 * @access  Admin only
 */
export const getClients = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const clients = await User.find({ role: 'client' }).select('-password').sort({ createdAt: -1 });

    const clientsWithProfiles = await Promise.all(
      clients.map(async (client) => {
        const profile = await ClientProfile.findOne({ userId: client._id });
        const projectCount = await Project.countDocuments({ clientId: client._id });
        const activeProjects = await Project.countDocuments({
          clientId: client._id,
          status: { $ne: 'completed' }
        });

        return {
          ...client.toObject(),
          profile,
          projectCount,
          activeProjects
        };
      })
    );

    res.status(200).json({
      success: true,
      count: clientsWithProfiles.length,
      data: clientsWithProfiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients.'
    });
  }
};

/**
 * @route   POST /api/admin/clients
 * @desc    Create a new client account directly by Admin
 * @access  Admin only
 */
export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, company, phone, location, bio } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'User with this email already exists.' });
      return;
    }

    const client = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'client'
    });

    const profile = await ClientProfile.create({
      userId: client._id,
      company: company || '',
      phone: phone || '',
      location: location || '',
      bio: bio || ''
    });

    res.status(201).json({
      success: true,
      message: 'Client account created successfully.',
      data: {
        ...client.toObject(),
        profile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message || 'Failed to create client.'
    });
  }
};

/**
 * @route   PUT /api/admin/clients/:id
 * @desc    Update client profile and active status
 * @access  Admin only
 */
export const updateClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, isActive, password, company, phone, location, bio } = req.body;

    const client = await User.findById(id);
    if (!client) {
      res.status(404).json({ success: false, message: 'Client not found.' });
      return;
    }

    if (name) client.name = name;
    if (email) client.email = email.toLowerCase();
    if (typeof isActive === 'boolean') client.isActive = isActive;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      client.password = await bcrypt.hash(password, salt);
    }
    await client.save();

    const profile = await ClientProfile.findOneAndUpdate(
      { userId: client._id },
      { company, phone, location, bio },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Client updated successfully.',
      data: {
        _id: client._id,
        name: client.name,
        email: client.email,
        role: client.role,
        isActive: client.isActive,
        profile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update client.'
    });
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all platform users
 * @access  Admin only
 */
export const getUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Change user role or status (Protected strictly to admin)
 * @access  Admin only
 */
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    if (id === req.user!._id.toString() && role && role !== 'admin') {
      res.status(400).json({ success: false, message: 'Cannot demote your own admin account.' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        ...(role && { role }),
        ...(typeof isActive === 'boolean' && { isActive })
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
};

/**
 * @route   GET /api/admin/messages
 * @desc    Get all client conversations and contact submissions
 * @access  Admin only
 */
export const getAdminMessages = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const clientMessages = await Message.find()
      .populate('senderId', 'name email role avatar')
      .populate('receiverId', 'name email role')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });

    const contactMessages = await ContactMessage.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        clientMessages,
        contactMessages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
};

/**
 * @route   POST /api/admin/messages/reply
 * @desc    Admin sends message to a client for a project
 * @access  Admin only
 */
export const replyClientMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, clientId, content, attachments } = req.body;

    if (!projectId || !clientId || !content) {
      res.status(400).json({
        success: false,
        message: 'Project ID, client ID, and message content are required.'
      });
      return;
    }

    const message = await Message.create({
      projectId,
      senderId: req.user!._id,
      receiverId: clientId,
      content,
      attachments: Array.isArray(attachments) ? attachments : [],
      read: false
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'name email role avatar')
      .populate('receiverId', 'name email')
      .populate('projectId', 'title');

    res.status(201).json({
      success: true,
      message: 'Reply sent successfully.',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send reply.' });
  }
};

/**
 * @route   GET /api/admin/analytics
 * @desc    Comprehensive analytics on projects, status, and inquiries
 * @access  Admin only
 */
export const getAnalytics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Project status breakdown
    const statusCounts = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Project type breakdown
    const typeCounts = await Project.aggregate([
      { $group: { _id: '$projectType', count: { $sum: 1 } } }
    ]);

    // Inquiries status breakdown
    const inquiryCounts = await ContactMessage.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Average project progress
    const avgProgress = await Project.aggregate([
      { $group: { _id: null, avg: { $avg: '$progress' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: statusCounts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        typeBreakdown: typeCounts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        inquiryBreakdown: inquiryCounts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        averageProgress: avgProgress[0]?.avg ? Math.round(avgProgress[0].avg) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to compute analytics.' });
  }
};

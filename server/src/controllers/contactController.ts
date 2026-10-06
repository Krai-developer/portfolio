import { Request, Response } from 'express';
import { ContactMessage } from '../models/ContactMessage';
import { Settings } from '../models/Settings';
import { AuthRequest } from '../middleware/auth';
import { isEmailDeliveryConfigured, sendContactNotification } from '../services/emailService';

const notifyAdmin = async (message: {
  name: string;
  email: string;
  projectBrief: string;
  subject?: string;
}): Promise<boolean> => {
  if (!isEmailDeliveryConfigured()) {
    console.warn('[Contact Email] SMTP is not configured; inquiry was saved to MongoDB only.');
    return false;
  }

  try {
    const settings = await Settings.findOne().select('email').lean();
    const recipient =
      process.env.CONTACT_NOTIFICATION_EMAIL || settings?.email || process.env.ADMIN_EMAIL;
    if (!recipient) throw new Error('No contact notification recipient is configured.');

    await sendContactNotification({ to: recipient, ...message });
    return true;
  } catch (emailError) {
    console.error(
      '[Contact Email] Inquiry saved, but email delivery failed:',
      emailError instanceof Error ? emailError.message : 'Unknown SMTP error.'
    );
    return false;
  }
};

export const submitContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, projectBrief } = req.body;

    if (!name || !email || !projectBrief) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and project brief are required.'
      });
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
      return;
    }

    const message = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      projectBrief: projectBrief.trim(),
      status: 'new'
    });

    const notificationSent = await notifyAdmin({
      name: message.name,
      email: message.email,
      projectBrief: message.projectBrief
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. I will reply within 24 hours.',
      data: message,
      notificationSent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact message. Please try again.'
    });
  }
};

export const submitClientProjectRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Please sign in to send a project request.' });
      return;
    }

    const projectName = typeof req.body.projectName === 'string' ? req.body.projectName.trim() : '';
    const projectBrief = typeof req.body.projectBrief === 'string' ? req.body.projectBrief.trim() : '';
    if (!projectName || !projectBrief) {
      res.status(400).json({ success: false, message: 'Project name and brief are required.' });
      return;
    }
    if (projectName.length > 120 || projectBrief.length > 5000) {
      res.status(400).json({ success: false, message: 'Project name or brief is too long.' });
      return;
    }

    const message = await ContactMessage.create({
      name: req.user.name,
      email: req.user.email,
      projectName,
      projectBrief,
      source: 'client_portal',
      clientId: req.user._id,
      status: 'new'
    });

    const notificationSent = await notifyAdmin({
      name: message.name,
      email: message.email,
      projectBrief: `Project request: ${projectName}\n\n${projectBrief}`,
      subject: `New client project request: ${projectName}`
    });

    res.status(201).json({
      success: true,
      message: 'Your project request was sent to Maron for review.',
      data: message,
      notificationSent
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send project request.' });
  }
};

export const getContactMessages = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve contact messages.' });
  }
};

export const updateContactStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!message) {
      res.status(404).json({ success: false, message: 'Message not found.' });
      return;
    }

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update message status.' });
  }
};

export const deleteContactMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await ContactMessage.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
};

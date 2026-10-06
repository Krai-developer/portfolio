import { Request, Response } from 'express';
import { Service } from '../models/Service';
import { AuthRequest } from '../middleware/auth';

export const getPublicServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.find({ enabled: true }).sort({ order: 1 });
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve services.' });
  }
};

export const getAllServicesAdmin = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const services = await Service.find().sort({ order: 1 });
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve services.' });
  }
};

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, icon, technologies, featured, enabled, order } = req.body;
    if (!title || !description) {
      res.status(400).json({ success: false, message: 'Title and description are required.' });
      return;
    }

    const service = await Service.create({
      title,
      description,
      icon: icon || 'Code',
      technologies: Array.isArray(technologies) ? technologies : [],
      featured: Boolean(featured),
      enabled: enabled !== undefined ? Boolean(enabled) : true,
      order: typeof order === 'number' ? order : 0
    });

    res.status(201).json({ success: true, message: 'Service created.', data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create service.' });
  }
};

export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndUpdate(id, req.body, { new: true });
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Service updated.', data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update service.' });
  }
};

export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Service.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Service deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete service.' });
  }
};

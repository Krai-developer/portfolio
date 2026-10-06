import { Request, Response } from 'express';
import { Skill } from '../models/Skill';
import { AuthRequest } from '../middleware/auth';

export const getPublicSkills = async (_req: Request, res: Response): Promise<void> => {
  try {
    const skills = await Skill.find().sort({ order: 1 });
    res.status(200).json({ success: true, count: skills.length, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve skills.' });
  }
};

export const getAllSkillsAdmin = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const skills = await Skill.find().sort({ category: 1, order: 1 });
    res.status(200).json({ success: true, count: skills.length, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve skills.' });
  }
};

export const createSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, icon, proficiency, featured, order } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Skill name is required.' });
      return;
    }

    const skill = await Skill.create({
      name,
      category: category || 'Frontend',
      icon: icon || 'Code',
      proficiency: typeof proficiency === 'number' ? proficiency : 85,
      featured: featured !== undefined ? Boolean(featured) : true,
      order: typeof order === 'number' ? order : 0
    });

    res.status(201).json({ success: true, message: 'Skill created.', data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create skill.' });
  }
};

export const updateSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const skill = await Skill.findByIdAndUpdate(id, req.body, { new: true });
    if (!skill) {
      res.status(404).json({ success: false, message: 'Skill not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Skill updated.', data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update skill.' });
  }
};

export const deleteSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Skill.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Skill deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete skill.' });
  }
};

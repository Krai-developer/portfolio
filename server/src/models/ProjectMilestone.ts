import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectMilestone extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: Date;
  completedAt?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMilestoneSchema = new Schema<IProjectMilestone>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    dueDate: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const ProjectMilestone = mongoose.model<IProjectMilestone>(
  'ProjectMilestone',
  ProjectMilestoneSchema
);

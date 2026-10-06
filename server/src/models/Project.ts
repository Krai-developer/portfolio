import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  slug: string;
  category: string;
  description: string;
  image: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  clientId?: mongoose.Types.ObjectId;
  projectType: 'portfolio' | 'client';
  status:
    | 'planning'
    | 'design'
    | 'development'
    | 'testing'
    | 'review'
    | 'completed'
    | 'on-hold';
  progress: number; // 0 - 100
  featured: boolean;
  published: boolean;
  isPrivate: boolean;
  includeInStats: boolean;
  problem?: string;
  solution?: string;
  features?: string[];
  processNotes?: string[];
  screenshots?: string[];
  startDate?: Date;
  targetEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Project slug is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Full-Stack Application'
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    image: {
      type: String,
      default: ''
    },
    technologies: {
      type: [String],
      default: []
    },
    liveUrl: {
      type: String,
      default: ''
    },
    githubUrl: {
      type: String,
      default: ''
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    projectType: {
      type: String,
      enum: ['portfolio', 'client'],
      default: 'portfolio'
    },
    status: {
      type: String,
      enum: [
        'planning',
        'design',
        'development',
        'testing',
        'review',
        'completed',
        'on-hold'
      ],
      default: 'development'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    },
    published: {
      type: Boolean,
      default: true
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    includeInStats: {
      type: Boolean,
      default: false
    },
    problem: {
      type: String,
      default: ''
    },
    solution: {
      type: String,
      default: ''
    },
    features: {
      type: [String],
      default: []
    },
    processNotes: {
      type: [String],
      default: []
    },
    screenshots: {
      type: [String],
      default: []
    },
    startDate: {
      type: Date
    },
    targetEndDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Helpful index for fast queries
ProjectSchema.index({ clientId: 1 });
ProjectSchema.index({ published: 1, projectType: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);

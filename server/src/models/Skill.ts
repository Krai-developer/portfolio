import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category:
    | 'Frontend'
    | 'Backend'
    | 'Database'
    | 'DevOps'
    | 'Tools'
    | 'Design'
    | 'Other';
  icon: string;
  proficiency: number; // 0 - 100
  featured: boolean;
  order: number;
  createdAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true
    },
    category: {
      type: String,
      enum: [
        'Frontend',
        'Backend',
        'Database',
        'DevOps',
        'Tools',
        'Design',
        'Other'
      ],
      default: 'Frontend'
    },
    icon: {
      type: String,
      default: 'Code'
    },
    proficiency: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    },
    featured: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const Skill = mongoose.model<ISkill>('Skill', SkillSchema);

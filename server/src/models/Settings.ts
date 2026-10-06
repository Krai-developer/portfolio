import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  name: string;
  title: string;
  bio: string;
  heroHeadline: string;
  heroDescription: string;
  availabilityStatus: string; // e.g. "Available for Projects"
  availabilityPeriod: string; // e.g. "Q4 2026"
  typicalResponseTime: string; // e.g. "Within 24 hours"
  email: string;
  phone?: string;
  location?: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    dribbble?: string;
  };
  learningStartDate?: Date;
  dedicationPercentage: number;
  statsPublic: boolean;
  statsOverrides?: {
    yearsLearning?: number;
    projectsCompleted?: number;
    happyClients?: number;
    dedication?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    name: {
      type: String,
      default: 'Maron Jake Dinopol'
    },
    title: {
      type: String,
      default: 'Freelance Developer & Computer Engineering Student'
    },
    bio: {
      type: String,
      default:
        'Building modern, scalable digital experiences with thoughtful UI and production-ready technology.'
    },
    heroHeadline: {
      type: String,
      default: 'I turn ideas into working websites.'
    },
    heroDescription: {
      type: String,
      default:
        'I’m a Computer Engineering student and freelance developer. I work with you to plan, build, and polish websites and web apps, and keep you in the loop along the way.'
    },
    availabilityStatus: {
      type: String,
      default: 'Available for Projects'
    },
    availabilityPeriod: {
      type: String,
      default: 'Q4 2026'
    },
    typicalResponseTime: {
      type: String,
      default: 'Within 24 hours'
    },
    email: {
      type: String,
      default: 'alex@rivera.dev'
    },
    phone: {
      type: String,
      default: '+1 (555) 234-5678'
    },
    location: {
      type: String,
      default: 'San Francisco, CA / Remote'
    },
    socialLinks: {
      github: { type: String, default: 'https://github.com' },
      linkedin: { type: String, default: 'https://linkedin.com' },
      twitter: { type: String, default: 'https://twitter.com' },
      dribbble: { type: String, default: 'https://dribbble.com' }
    },
    learningStartDate: { type: Date, default: null },
    dedicationPercentage: { type: Number, min: 0, max: 100, default: 100 },
    statsPublic: { type: Boolean, default: true },
    statsOverrides: {
      yearsLearning: { type: Number, min: 0 },
      projectsCompleted: { type: Number, min: 0 },
      happyClients: { type: Number, min: 0 },
      dedication: { type: Number, min: 0, max: 100 }
    }
  },
  {
    timestamps: true
  }
);

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);

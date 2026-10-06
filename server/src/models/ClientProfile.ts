import mongoose, { Document, Schema } from 'mongoose';

export interface IClientProfile extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientProfileSchema = new Schema<IClientProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    company: {
      type: String,
      default: '',
      trim: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    location: {
      type: String,
      default: '',
      trim: true
    },
    bio: {
      type: String,
      default: '',
      trim: true
    },
    avatar: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const ClientProfile = mongoose.model<IClientProfile>(
  'ClientProfile',
  ClientProfileSchema
);

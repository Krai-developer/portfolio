import mongoose, { Document, Schema } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  projectName?: string;
  projectBrief: string;
  source: 'website' | 'client_portal';
  clientId?: mongoose.Types.ObjectId;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    projectName: {
      type: String,
      trim: true
    },
    projectBrief: {
      type: String,
      required: [true, 'Project brief is required'],
      trim: true
    },
    source: {
      type: String,
      enum: ['website', 'client_portal'],
      default: 'website'
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new'
    }
  },
  {
    timestamps: true
  }
);

export const ContactMessage = mongoose.model<IContactMessage>(
  'ContactMessage',
  ContactMessageSchema
);

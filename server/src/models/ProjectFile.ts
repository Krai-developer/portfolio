import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectFile extends Document {
  projectId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectFileSchema = new Schema<IProjectFile>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    url: {
      type: String,
      required: [true, 'File URL is required']
    },
    type: {
      type: String,
      default: 'document'
    },
    size: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const ProjectFile = mongoose.model<IProjectFile>(
  'ProjectFile',
  ProjectFileSchema
);

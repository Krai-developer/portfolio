export type UserRole = 'client' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ClientProfile {
  _id: string;
  userId: string;
  company: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  website?: string;
}

export type ProjectType = 'portfolio' | 'client';
export type ProjectStatus =
  | 'planning'
  | 'design'
  | 'development'
  | 'testing'
  | 'review'
  | 'completed'
  | 'on-hold';

export interface Milestone {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  completedAt?: string;
  order: number;
  createdAt: string;
}

export interface ProjectFile {
  _id: string;
  projectId: string | { _id: string; title: string };
  uploadedBy: string | { _id: string; name: string; role: string };
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export interface Project {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  image: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  clientId?: string | { _id: string; name: string; email: string };
  projectType: ProjectType;
  status: ProjectStatus;
  progress: number;
  featured: boolean;
  published: boolean;
  isPrivate: boolean;
  includeInStats?: boolean;
  problem?: string;
  solution?: string;
  features?: string[];
  processNotes?: string[];
  screenshots?: string[];
  startDate?: string;
  targetEndDate?: string;
  createdAt: string;
  updatedAt: string;
  // Computed / populated for views:
  milestones?: Milestone[];
  files?: ProjectFile[];
  messages?: Message[];
  currentMilestone?: string;
  milestoneCount?: number;
  fileCount?: number;
}

export interface Message {
  _id: string;
  projectId: string | { _id: string; title: string };
  senderId: {
    _id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  receiverId?: {
    _id: string;
    name: string;
    role: string;
  };
  content: string;
  attachments: string[];
  read: boolean;
  createdAt: string;
}

export interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  technologies: string[];
  featured: boolean;
  enabled: boolean;
  order: number;
}

export interface Skill {
  _id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Tools' | 'Design' | 'Other';
  icon: string;
  proficiency: number;
  featured: boolean;
  order: number;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  projectName?: string;
  projectBrief: string;
  source?: 'website' | 'client_portal';
  clientId?: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
}

export interface Settings {
  _id?: string;
  name: string;
  title: string;
  bio: string;
  heroHeadline: string;
  heroDescription: string;
  availabilityStatus: string;
  availabilityPeriod: string;
  typicalResponseTime: string;
  email: string;
  phone?: string;
  location?: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    dribbble?: string;
  };
  learningStartDate?: string;
  dedicationPercentage?: number;
  statsPublic?: boolean;
  statsOverrides?: {
    yearsLearning?: number;
    projectsCompleted?: number;
    happyClients?: number;
    dedication?: number;
  };
}

export interface PortfolioStats {
  enabled: boolean;
  yearsLearning: number;
  projectsCompleted: number;
  happyClients: number;
  dedication: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  user?: User;
  profile?: ClientProfile;
  token?: string;
  messages?: Message[];
  projects?: Project[];
}

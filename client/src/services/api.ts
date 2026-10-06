import { ApiResponse, PortfolioStats } from '../types';

const BASE_URL = '/api';

interface RequestOptions extends RequestInit {
  data?: any;
}

export const request = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const { data, headers, ...customConfig } = options;

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    credentials: 'include', // Essential for HTTP-only cookies
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    ...customConfig
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const responseText = await response.text();
    let result: ApiResponse<T>;

    if (!responseText.trim()) {
      if (response.status === 204) return { success: true };
      throw new Error('The server returned an empty response. Check that the API server is running.');
    }

    try {
      result = JSON.parse(responseText) as ApiResponse<T>;
    } catch {
      throw new Error(`The server returned an unreadable response (status ${response.status}).`);
    }

    if (!response.ok) {
      throw new Error(result.message || `Request failed with status ${response.status}`);
    }

    return result;
  } catch (error) {
    throw error;
  }
};

// API Services Map
export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }, portal: 'client' | 'admin') =>
      request('/auth/login', { data: { ...credentials, portal } }),
    register: (userData: any) =>
      request('/auth/register', { data: userData }),
    requestPasswordReset: (email: string) =>
      request('/auth/forgot-password', { data: { email } }),
    resetPassword: (data: { token: string; password: string; confirmPassword: string }) =>
      request('/auth/reset-password', { data }),
    logout: () =>
      request('/auth/logout', { method: 'POST' }),
    me: () =>
      request('/auth/me'),
    updateProfile: (profileData: any) =>
      request('/auth/profile', { method: 'PUT', data: profileData })
  },

  // Public
  public: {
    getProjects: (params?: { featured?: boolean; category?: string }) => {
      const query = new URLSearchParams();
      if (params?.featured) query.append('featured', 'true');
      if (params?.category) query.append('category', params.category);
      const qStr = query.toString() ? `?${query.toString()}` : '';
      return request(`/projects${qStr}`);
    },
    getProjectBySlug: (slug: string) =>
      request(`/projects/${slug}`),
    getServices: () =>
      request('/services'),
    getSkills: () =>
      request('/skills'),
    getSettings: () =>
      request('/settings'),
    getStats: () =>
      request<PortfolioStats>('/stats'),
    submitContact: (data: { name: string; email: string; projectBrief: string }) =>
      request('/contact', { data })
  },

  // Client Portal
  client: {
    getDashboard: () =>
      request('/client/dashboard'),
    getProjects: () =>
      request('/client/projects'),
    getProjectDetails: (id: string) =>
      request(`/client/projects/${id}`),
    getFiles: () =>
      request('/client/files'),
    getMessages: () =>
      request('/client/messages'),
    sendMessage: (data: { projectId: string; content: string; attachments?: string[] }) =>
      request('/client/messages', { data }),
    submitProjectRequest: (data: { projectName: string; projectBrief: string }) =>
      request('/client/project-requests', { data })
  },

  // Admin Dashboard
  admin: {
    getDashboard: () =>
      request('/admin/dashboard'),
    getProjects: () =>
      request('/admin/projects'),
    createProject: (data: any) =>
      request('/projects', { method: 'POST', data }),
    updateProject: (id: string, data: any) =>
      request(`/projects/${id}`, { method: 'PUT', data }),
    deleteProject: (id: string) =>
      request(`/projects/${id}`, { method: 'DELETE' }),

    // Milestones
    createMilestone: (projectId: string, data: any) =>
      request(`/projects/${projectId}/milestones`, { method: 'POST', data }),
    updateMilestone: (milestoneId: string, data: any) =>
      request(`/projects/milestones/${milestoneId}`, { method: 'PUT', data }),
    deleteMilestone: (milestoneId: string) =>
      request(`/projects/milestones/${milestoneId}`, { method: 'DELETE' }),

    // Files
    uploadFile: (projectId: string, data: any) =>
      request(`/projects/${projectId}/files`, { method: 'POST', data }),
    deleteFile: (fileId: string) =>
      request(`/projects/files/${fileId}`, { method: 'DELETE' }),

    // Clients & Users
    getClients: () =>
      request('/admin/clients'),
    createClient: (data: any) =>
      request('/admin/clients', { method: 'POST', data }),
    updateClient: (id: string, data: any) =>
      request(`/admin/clients/${id}`, { method: 'PUT', data }),
    getUsers: () =>
      request('/admin/users'),
    updateUserRole: (id: string, data: any) =>
      request(`/admin/users/${id}/role`, { method: 'PUT', data }),

    // Services CRUD
    getAllServices: () =>
      request('/services/all'),
    createService: (data: any) =>
      request('/services', { method: 'POST', data }),
    updateService: (id: string, data: any) =>
      request(`/services/${id}`, { method: 'PUT', data }),
    deleteService: (id: string) =>
      request(`/services/${id}`, { method: 'DELETE' }),

    // Skills CRUD
    getAllSkills: () =>
      request('/skills/all'),
    createSkill: (data: any) =>
      request('/skills', { method: 'POST', data }),
    updateSkill: (id: string, data: any) =>
      request(`/skills/${id}`, { method: 'PUT', data }),
    deleteSkill: (id: string) =>
      request(`/skills/${id}`, { method: 'DELETE' }),

    // Messages
    getMessages: () =>
      request('/admin/messages'),
    replyMessage: (data: { projectId: string; clientId: string; content: string }) =>
      request('/admin/messages/reply', { method: 'POST', data }),
    updateContactStatus: (id: string, status: string) =>
      request(`/contact/${id}`, { method: 'PUT', data: { status } }),
    deleteContactMessage: (id: string) =>
      request(`/contact/${id}`, { method: 'DELETE' }),

    // Analytics & Settings
    getAnalytics: () =>
      request('/admin/analytics'),
    updateSettings: (data: any) =>
      request('/admin/settings', { method: 'PUT', data })
  }
};

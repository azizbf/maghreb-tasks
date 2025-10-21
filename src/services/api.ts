const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  // Method to refresh token from localStorage
  private refreshToken() {
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Refresh token before each request
    this.refreshToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    role: 'freelancer' | 'client';
    phone?: string;
    location?: string;
    bio?: string;
  }) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(userData: {
    full_name?: string;
    phone?: string;
    location?: string;
    bio?: string;
    avatar_url?: string;
  }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }

  // Job methods
  async getJobs(params: {
    page?: number;
    limit?: number;
    q?: string;
    category?: number;
    location?: string;
    min_budget?: number;
    max_budget?: number;
    status?: string;
    sort?: string;
    order?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/jobs?${queryString}` : '/jobs';
    
    return this.request(endpoint);
  }

  async getJobById(id: string) {
    return this.request(`/jobs/${id}`);
  }

  async createJob(jobData: {
    title: string;
    description: string;
    budget_min: number;
    budget_max: number;
    currency?: string;
    duration: string;
    location: string;
    category_id: number;
    skills: number[];
    is_remote?: boolean;
  }) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async getUserJobs() {
    return this.request('/jobs/user/my-jobs');
  }

  async getJob(id: number) {
    return this.request(`/jobs/${id}`);
  }

  async updateJob(id: string, jobData: {
    title?: string;
    description?: string;
    budget_min?: number;
    budget_max?: number;
    currency?: string;
    duration?: string;
    location?: string;
    category_id?: number;
    skills?: number[];
    is_remote?: boolean;
    status?: string;
  }) {
    return this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(id: string) {
    return this.request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserJobs(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/jobs/user/my-jobs?${queryString}` : '/jobs/user/my-jobs';
    
    return this.request(endpoint);
  }

  // Proposal methods
  async getJobProposals(jobId: string, params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/proposals/job/${jobId}?${queryString}` : `/proposals/job/${jobId}`;
    
    return this.request(endpoint);
  }

  async getProposalById(id: string) {
    return this.request(`/proposals/${id}`);
  }

  async createProposal(proposalData: {
    job_id: number;
    cover_letter: string;
    proposed_budget: number;
    proposed_duration: string;
  }) {
    return this.request('/proposals', {
      method: 'POST',
      body: JSON.stringify(proposalData),
    });
  }

  async updateProposal(id: string, proposalData: {
    cover_letter?: string;
    proposed_budget?: number;
    proposed_duration?: string;
    status?: string;
  }) {
    return this.request(`/proposals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(proposalData),
    });
  }

  async acceptProposal(id: string) {
    return this.request(`/proposals/${id}/accept`, {
      method: 'PUT',
    });
  }

  async rejectProposal(id: string) {
    return this.request(`/proposals/${id}/reject`, {
      method: 'PUT',
    });
  }

  async withdrawProposal(id: string) {
    return this.request(`/proposals/${id}/withdraw`, {
      method: 'PUT',
    });
  }

  async getFreelancerProposals(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/proposals/user/my-proposals?${queryString}` : '/proposals/user/my-proposals';
    
    return this.request(endpoint);
  }

  // Category methods
  async getCategories() {
    return this.request('/categories');
  }

  async getCategoryById(id: string) {
    return this.request(`/categories/${id}`);
  }

  async getCategorySkills(id: string) {
    return this.request(`/categories/${id}/skills`);
  }

  async getAllSkills(params: {
    category_id?: number;
    search?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/categories/skills/all?${queryString}` : '/categories/skills/all';
    
    return this.request(endpoint);
  }

  // Utility methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  isAuthenticated() {
    return !!this.token;
  }

  logout() {
    this.clearToken();
  }

  // Proposal methods
  async createProposal(proposalData: {
    job_id: number;
    cover_letter: string;
    proposed_budget: number;
    proposed_duration: string;
  }) {
    return this.request('/proposals', {
      method: 'POST',
      body: JSON.stringify(proposalData),
    });
  }

  async getFreelancerProposals(status?: string) {
    const url = status ? `/proposals/user/my-proposals?status=${status}` : '/proposals/user/my-proposals';
    return this.request(url);
  }

  async getJobProposals(jobId: number) {
    return this.request(`/proposals/job/${jobId}`);
  }

  async acceptProposal(proposalId: number) {
    return this.request(`/proposals/${proposalId}/accept`, {
      method: 'PUT',
    });
  }

  async rejectProposal(proposalId: number) {
    return this.request(`/proposals/${proposalId}/reject`, {
      method: 'PUT',
    });
  }

  async withdrawProposal(proposalId: number) {
    return this.request(`/proposals/${proposalId}/withdraw`, {
      method: 'PUT',
    });
  }

  // Message methods
  async sendMessage(messageData: {
    recipient_id: number;
    content: string;
    job_id?: number;
  }) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getConversation(userId: number, jobId?: number) {
    const url = jobId ? `/messages/conversation/${userId}?job_id=${jobId}` : `/messages/conversation/${userId}`;
    return this.request(url);
  }

  async getUserConversations() {
    return this.request('/messages/conversations');
  }

  async markMessagesAsRead(userId: number) {
    return this.request(`/messages/read/${userId}`, {
      method: 'PUT',
    });
  }

  async getUnreadCount() {
    return this.request('/messages/unread-count');
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;

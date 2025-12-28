import { apiRequest, setAuthToken, removeAuthToken } from './config';

export interface SignupRequest {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
  type: 'USER' | 'CATERER' | 'ADMIN';
  company_name?: string; // Required for CATERER
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone: string;
      type: 'USER' | 'CATERER' | 'ADMIN';
      company_name?: string;
      image_url?: string | null;
      created_at?: string;
      updated_at?: string;
    };
  };
  message?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  type: 'USER' | 'CATERER' | 'ADMIN';
  company_name?: string;
}

// Auth API functions
export const authApi = {
  signup: async (data: SignupRequest) => {
    const response = await apiRequest<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Handle the actual API response structure: { success, data: { token, user }, message }
    if (response.data?.data?.token) {
      setAuthToken(response.data.data.token);
    }

    return response;
  },

  login: async (data: LoginRequest) => {
    const response = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Handle the actual API response structure: { success, data: { token, user }, message }
    if (response.data?.data?.token) {
      setAuthToken(response.data.data.token);
    }

    return response;
  },

  logout: async () => {
    removeAuthToken();
    await apiRequest('/api/auth/logout', {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    return apiRequest<User>('/api/auth/me');
  },
};


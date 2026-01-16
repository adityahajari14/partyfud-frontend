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

// ApiResponse is defined in config.ts - no need to duplicate

export interface GetCurrentUserResponse {
  user: User;
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
        profile_completed?: boolean;
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
  image_url?: string;
  profile_completed?: boolean;
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
    // Call the API first while we still have the token
    await apiRequest('/api/auth/logout', {
      method: 'POST',
    });
    // Remove token after API call (even if it fails, we still want to logout client-side)
    removeAuthToken();
  },

  getCurrentUser: async () => {
    return apiRequest<GetCurrentUserResponse>('/api/auth/me');
  },

  submitCatererInfo: async (formData: FormData, isUpdate: boolean = false) => {
    return apiRequest('/api/auth/caterer-info', {
      method: isUpdate ? 'PUT' : 'POST',
      body: formData,
    });
  },

  updateUserProfile: async (formData: FormData) => {
    return apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: formData,
    });
  },
};


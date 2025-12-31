import { apiRequest, setAuthToken, removeAuthToken, getAuthToken, API_BASE_URL } from './config';

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

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

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
  return apiRequest<ApiResponse<GetCurrentUserResponse>>('/api/auth/me');
},

  submitCatererInfo: async (formData: FormData, isUpdate: boolean = false) => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/api/auth/caterer-info`;
    const method = isUpdate ? 'PUT' : 'POST';
    
    console.log(`🚀 [API] ${isUpdate ? 'Updating' : 'Creating'} caterer info`);
    console.log(`🚀 [API] URL:`, url);
    console.log(`🚀 [API] Method:`, method);
    console.log('🔑 [API] Has token:', !!token);
    console.log('🔑 [API] Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
    
    // Log FormData contents (for debugging)
    console.log('📦 [API] FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('📤 [API] Sending request...');
    // Don't set Content-Type for FormData - browser will set it with boundary
    const response = await fetch(url, {
      method,
      headers,
      body: formData,
    });
    
    console.log('📡 [API] Response status:', response.status, response.statusText);
    console.log('📡 [API] Response headers:', Object.fromEntries(response.headers.entries()));

    // Read response as text first, then try to parse as JSON
    const responseText = await response.text();
    console.log('📥 [API] Response text length:', responseText.length);
    console.log('📥 [API] Response text preview:', responseText.substring(0, 200));
    
    let data;
    
    try {
      data = responseText ? JSON.parse(responseText) : null;
      console.log('✅ [API] Response parsed as JSON successfully');
      console.log('📦 [API] Response data:', JSON.stringify(data, null, 2));
    } catch (jsonError) {
      console.log('❌ [API] Failed to parse response as JSON:', jsonError);
      // If parsing fails, return the text as error
      return {
        error: responseText || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }

    if (!response.ok) {
      console.log('❌ [API] Response not OK, extracting error message...');
      let errorMessage = 'An error occurred';
      
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data?.message) {
        errorMessage = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
      } else if (data?.error) {
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (data.error?.message) {
          errorMessage = typeof data.error.message === 'string' ? data.error.message : JSON.stringify(data.error.message);
        } else {
          errorMessage = JSON.stringify(data.error);
        }
      } else {
        errorMessage = responseText || `HTTP ${response.status}: ${response.statusText}`;
      }
      
      console.log('❌ [API] Error message:', errorMessage);
      return {
        error: errorMessage,
        status: response.status,
      };
    }

    console.log('✅ [API] Request successful!');
    return { 
      data,
      status: response.status,
    };
  },
};


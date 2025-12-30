// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status?: number; // HTTP status code
}

// Helper function to get auth token from localStorage
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Helper function to set auth token
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

// Helper function to remove auth token
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

// Base fetch function with error handling
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  ...(options.headers as Record<string, string>),
};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // If response is not JSON, return a text error
      const text = await response.text();
      return {
        error: text || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    if (!response.ok) {
      // Handle different error response formats
      let errorMessage = 'An error occurred';
      
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data?.message) {
        errorMessage = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
      } else if (data?.error) {
        // Handle nested error object
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (data.error?.message) {
          errorMessage = typeof data.error.message === 'string' ? data.error.message : JSON.stringify(data.error.message);
        } else {
          errorMessage = JSON.stringify(data.error);
        }
      } else if (data?.errors) {
        // Handle validation errors array
        if (Array.isArray(data.errors)) {
          errorMessage = data.errors.map((e: any) => 
            typeof e === 'string' ? e : e.message || JSON.stringify(e)
          ).join(', ');
        } else {
          errorMessage = JSON.stringify(data.errors);
        }
      }
      
      return {
        error: errorMessage,
        status: response.status, // Include HTTP status code
      };
    }

    return { 
      data,
      status: response.status, // Include status code for success responses too
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          error: 'Request timeout. Please check your connection and try again.',
        };
      }
      return {
        error: error.message || 'Network error occurred',
      };
    }
    
    return {
      error: 'Network error occurred',
    };
  }
}


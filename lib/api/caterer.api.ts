import { apiRequest, API_BASE_URL, getAuthToken } from './config';

// Dish Types
export interface Dish {
  id: string;
  name: string;
  image_url?: string;
  cuisine_type_id: string;
  category_id: string;
  sub_category_id?: string;
  quantity_in_gm?: string;
  pieces?: number;
  price: number;
  currency: string;
  is_active: boolean;
  rating?: number;
  caterer_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDishRequest {
  name: string;
  image_url?: string;
  cuisine_type_id: string;
  category_id: string;
  sub_category_id?: string;
  quantity_in_gm?: string;
  pieces?: number;
  price: number;
  currency?: string;
  is_active?: boolean;
  free_form?: string;
  freeform_ids?: string[];
}

export interface UpdateDishRequest {
  name?: string;
  image_url?: string;
  cuisine_type_id?: string;
  category_id?: string;
  sub_category_id?: string;
  quantity_in_gm?: string;
  pieces?: number;
  price?: number;
  currency?: string;
  is_active?: boolean;
}

// Package Types
export interface Package {
  id: string;
  name: string;
  people_count: number;
  package_type_id: string;
  cover_image_url?: string;
  total_price: number;
  currency: string;
  rating?: number;
  is_active: boolean;
  is_available: boolean;
  caterer_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePackageRequest {
  name: string;
  people_count: number;
  package_type_id: string;
  cover_image_url?: string;
  total_price: number;
  currency?: string;
  // rating?: number;
  occassion:string;
  is_active?: boolean;
  is_available?: boolean;
  package_item_ids?: string[];
}

export interface UpdatePackageRequest {
  name?: string;
  people_count?: number;
  package_type_id?: string;
  cover_image_url?: string;
  total_price?: number;
  currency?: string;
  rating?: number;
  is_active?: boolean;
  is_available?: boolean;
}

// Dashboard Types
export interface DashboardStats {
  dishes: {
    total: number;
    active: number;
    inactive: number;
  };
  packages: {
    total: number;
    active: number;
    available: number;
    inactive: number;
  };
  packageItems: {
    total: number;
    draft: number;
    linked: number;
  };
  financial: {
    averagePackagePrice: number;
    totalRevenuePotential: number;
    currency: string;
  };
  recent: {
    dishes: Array<{
      id: string;
      name: string;
      image_url: string | null;
      price: number;
      currency: string;
      is_active: boolean;
      created_at: string;
    }>;
    packages: Array<{
      id: string;
      name: string;
      cover_image_url: string | null;
      total_price: number;
      currency: string;
      people_count: number;
      is_available: boolean;
      created_at: string;
    }>;
  };
}

// Caterer API functions
export const catererApi = {
  // Dishes
  getAllDishes: async (filters?: { cuisine_type_id?: string; category_id?: string; group_by_category?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.cuisine_type_id) params.append('cuisine_type_id', filters.cuisine_type_id);
    if (filters?.category_id) params.append('category_id', filters.category_id);
    if (filters?.group_by_category) params.append('group_by_category', 'true');
    
    const queryString = params.toString();
    const endpoint = `/api/caterer/dishes${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<any>(endpoint);
  },

  getDishById: async (id: string) => {
    return apiRequest<Dish>(`/api/caterer/dishes/${id}`);
  },

  createDish: async (data: CreateDishRequest, imageFile?: File) => {
    const token = getAuthToken();
    const formData = new FormData();
    
    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    // Add other fields
    formData.append('name', data.name);
    formData.append('cuisine_type_id', data.cuisine_type_id);
    formData.append('category_id', data.category_id);
    if (data.sub_category_id) {
      formData.append('sub_category_id', data.sub_category_id);
    }
    if (data.quantity_in_gm) {
      formData.append('quantity_in_gm', data.quantity_in_gm.toString());
    }
    if (data.pieces) {
      formData.append('pieces', data.pieces.toString());
    }
    formData.append('price', data.price.toString());
    if (data.currency) {
      formData.append('currency', data.currency);
    }
    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active.toString());
    }
    if (data.image_url) {
      formData.append('image_url', data.image_url);
    }
    // Add freeform_ids as array (append each one with the same key)
    if (data.freeform_ids && data.freeform_ids.length > 0) {
      data.freeform_ids.forEach((id) => {
        formData.append('freeform_ids', id);
      });
    }
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type - browser will set it with boundary for FormData
    
    const response = await fetch(`${API_BASE_URL}/api/caterer/dishes`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    let responseData;
    try {
      responseData = await response.json();
    } catch (jsonError) {
      const text = await response.text();
      return {
        error: text || `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      if (responseData?.error?.message) {
        errorMessage = responseData.error.message;
      } else if (responseData?.message) {
        errorMessage = responseData.message;
      } else if (responseData?.error) {
        errorMessage = typeof responseData.error === 'string' ? responseData.error : JSON.stringify(responseData.error);
      }
      return { error: errorMessage };
    }
    
    return { data: responseData.data || responseData };
  },

  updateDish: async (id: string, data: UpdateDishRequest) => {
    return apiRequest<Dish>(`/api/caterer/dishes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteDish: async (id: string) => {
    return apiRequest(`/api/caterer/dishes/${id}`, {
      method: 'DELETE',
    });
  },

  // Packages
  getAllPackages: async () => {
    return apiRequest<Package[]>('/api/caterer/packages');
  },

  getPackageById: async (id: string) => {
    return apiRequest<Package>(`/api/caterer/packages/${id}`);
  },

  createPackage: async (data: CreatePackageRequest, imageFile?: File) => {
    const token = getAuthToken();
    const formData = new FormData();
    
    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    // Add other fields
    formData.append('name', data.name);
    formData.append('people_count', data.people_count.toString());
    formData.append('package_type_id', data.package_type_id);
    formData.append('total_price', data.total_price.toString());
    if (data.currency) {
      formData.append('currency', data.currency);
    }
    if (data.occassion !== undefined) {
      formData.append('occassion', data.occassion);
    }
    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active.toString());
    }
    if (data.is_available !== undefined) {
      formData.append('is_available', data.is_available.toString());
    }
    if (data.cover_image_url) {
      formData.append('cover_image_url', data.cover_image_url);
    }
    // Add package_item_ids as comma-separated string or array
    if (data.package_item_ids && data.package_item_ids.length > 0) {
      formData.append('package_item_ids', data.package_item_ids.join(','));
    }
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type - browser will set it with boundary for FormData
    
    const response = await fetch(`${API_BASE_URL}/api/caterer/packages`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    let responseData;
    try {
      responseData = await response.json();
    } catch (jsonError) {
      const text = await response.text();
      return {
        error: text || `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      if (responseData?.error?.message) {
        errorMessage = responseData.error.message;
      } else if (responseData?.message) {
        errorMessage = responseData.message;
      } else if (responseData?.error) {
        errorMessage = typeof responseData.error === 'string' ? responseData.error : JSON.stringify(responseData.error);
      }
      return { error: errorMessage };
    }
    
    return { data: responseData.data || responseData };
  },

  updatePackage: async (id: string, data: UpdatePackageRequest) => {
    return apiRequest<Package>(`/api/caterer/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Metadata
  getCuisineTypes: async () => {
    return apiRequest<Array<{ id: string; name: string; description?: string }>>('/api/caterer/metadata/cuisine-types');
  },

  getCategories: async () => {
    return apiRequest<Array<{ id: string; name: string; description?: string }>>('/api/caterer/metadata/categories');
  },

  getSubCategories: async (categoryId?: string) => {
    const query = categoryId ? `?category_id=${categoryId}` : '';
    return apiRequest<Array<{ id: string; name: string; description?: string; category_id: string }>>(`/api/caterer/metadata/subcategories${query}`);
  },

  getFreeForms: async () => {
    return apiRequest<Array<{ id: string; name: string; description?: string }>>('/api/caterer/metadata/freeforms');
  },

  // Package Types
  getPackageTypes: async () => {
    return apiRequest<Array<{ id: string; name: string; description?: string }>>('/api/caterer/metadata/package-types');
  },

  // Package Items
  getAllPackageItems: async (packageId?: string, draft?: boolean) => {
    const params = new URLSearchParams();
    if (packageId) {
      params.append('package_id', packageId);
    }
    if (draft) {
      params.append('draft', 'true');
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<any>(`/api/caterer/packages/items${query}`);
  },

  createPackageItem: async (data: {
    dish_id: string;
    people_count: number;
    quantity?: string;
    price_at_time?: number;
    is_optional?: boolean;
    is_addon?: boolean;
    package_id?: string;
  }) => {
    return apiRequest<{ id: string; dish_id: string; package_id?: string; people_count: number; quantity: string; price_at_time?: number; is_optional: boolean; is_addon: boolean; dish: Dish }>('/api/caterer/packages/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Dashboard
  getDashboardStats: async () => {
    return apiRequest<DashboardStats>('/api/caterer/dashboard');
  },

  // Proposals
  getProposals: async () => {
    return apiRequest<Array<{
      id: string;
      user_id: string;
      caterer_id: string;
      status: string;
      event_type?: string;
      location?: string;
      dietary_preferences: string[];
      budget_per_person?: number;
      event_date?: string;
      vision?: string;
      guest_count: number;
      user: {
        id: string;
        name: string;
        email: string;
        phone: string;
      };
      created_at: string;
      updated_at: string;
    }>>('/api/caterer/proposals');
  },

  getProposalById: async (proposalId: string) => {
    return apiRequest<{
      id: string;
      user_id: string;
      caterer_id: string;
      status: string;
      event_type?: string;
      location?: string;
      dietary_preferences: string[];
      budget_per_person?: number;
      event_date?: string;
      vision?: string;
      guest_count: number;
      user: {
        id: string;
        name: string;
        email: string;
        phone: string;
      };
      created_at: string;
      updated_at: string;
    }>(`/api/caterer/proposals/${proposalId}`);
  },

  updateProposalStatus: async (proposalId: string, status: string) => {
    return apiRequest<{
      id: string;
      user_id: string;
      caterer_id: string;
      status: string;
      event_type?: string;
      location?: string;
      dietary_preferences: string[];
      budget_per_person?: number;
      event_date?: string;
      vision?: string;
      guest_count: number;
      user: {
        id: string;
        name: string;
        email: string;
        phone: string;
      };
      created_at: string;
      updated_at: string;
    }>(`/api/caterer/proposals/${proposalId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Orders
  getOrders: async () => {
    return apiRequest<Array<{
      id: string;
      user_id: string;
      user: {
        id: string;
        name: string;
        email: string;
        phone: string;
      };
      total_price: number;
      currency: string;
      status: string;
      items: Array<{
        id: string;
        package: {
          id: string;
          name: string;
          people_count: number;
          total_price: number;
          currency: string;
          cover_image_url?: string | null;
          package_type: {
            id: string;
            name: string;
          };
          caterer: {
            id: string;
            business_name: string | null;
          };
        };
        package_type: {
          id: string;
          name: string;
        };
        location: string | null;
        guests: number | null;
        date: string | null;
        price_at_time: number;
        created_at: string;
      }>;
      created_at: string;
      updated_at: string;
    }>>('/api/caterer/orders');
  },

  getOrderById: async (orderId: string) => {
    return apiRequest<{
      id: string;
      user_id: string;
      user: {
        id: string;
        name: string;
        email: string;
        phone: string;
      };
      total_price: number;
      currency: string;
      status: string;
      items: Array<{
        id: string;
        package: {
          id: string;
          name: string;
          people_count: number;
          total_price: number;
          currency: string;
          cover_image_url?: string | null;
          package_type: {
            id: string;
            name: string;
          };
          caterer: {
            id: string;
            business_name: string | null;
          };
        };
        package_type: {
          id: string;
          name: string;
        };
        location: string | null;
        guests: number | null;
        date: string | null;
        price_at_time: number;
        created_at: string;
      }>;
      created_at: string;
      updated_at: string;
    }>(`/api/caterer/orders/${orderId}`);
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    return apiRequest<{
      id: string;
      user_id: string;
      user: {
        id: string;
        name: string;
        email: string;
        phone: string;
      };
      total_price: number;
      currency: string;
      status: string;
      items: Array<{
        id: string;
        package: {
          id: string;
          name: string;
          people_count: number;
          total_price: number;
          currency: string;
          cover_image_url?: string | null;
          package_type: {
            id: string;
            name: string;
          };
          caterer: {
            id: string;
            business_name: string | null;
          };
        };
        package_type: {
          id: string;
          name: string;
        };
        location: string | null;
        guests: number | null;
        date: string | null;
        price_at_time: number;
        created_at: string;
      }>;
      created_at: string;
      updated_at: string;
    }>(`/api/caterer/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Get caterer info for the authenticated caterer
  getCatererInfo: async () => {
    return apiRequest<{
      id: string;
      business_name: string;
      business_type: string;
      business_description: string | null;
      service_area: string | null;
      minimum_guests: number | null;
      maximum_guests: number | null;
      preparation_time: number | null;
      region: string | null;
      delivery_only: boolean;
      delivery_plus_setup: boolean;
      full_service: boolean;
      staff: number | null;
      servers: number | null;
      food_license: string | null;
      Registration: string | null;
      status: string;
      created_at: string;
      updated_at: string;
    }>(`/api/caterer/info`);
  },

  // Update caterer info for the authenticated caterer
  updateCatererInfo: async (data: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/auth/caterer-info`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: data,
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        data: null,
        error: responseData.error?.message || 'Failed to update caterer info',
        status: response.status,
      };
    }

    return {
      data: responseData,
      error: null,
      status: response.status,
    };
  },};
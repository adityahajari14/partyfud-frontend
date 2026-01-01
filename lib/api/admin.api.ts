import { apiRequest } from './config';

// Admin API functions
export const adminApi = {
  // Placeholder for admin-specific endpoints
  // Will be expanded as needed
  getAdminRoutes: async () => {
    return apiRequest('/api/admin');
  },

  /**
   * Get all caterer info with optional status filter
   * @param status - Optional status filter: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED'
   */
  getCatererInfo: async (status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED') => {
    const queryParam = status ? `?status=${status}` : '';
    return apiRequest<{
      success: boolean;
      data: Array<{
        id: string;
        business_name: string;
        business_type: string;
        business_description: string | null;
        service_area: string | null;
        minimum_guests: number | null;
        maximum_guests: number | null;
        region: string | null;
        delivery_only: boolean;
        delivery_plus_setup: boolean;
        full_service: boolean;
        staff: number | null;
        servers: number | null;
        food_license: string | null;
        Registration: string | null;
        caterer_id: string;
        status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
        created_at: string;
        updated_at: string;
        caterer: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          company_name: string | null;
          image_url: string | null;
          profile_completed: boolean;
          verified: boolean;
          created_at: string;
        };
      }>;
      count: number;
    }>(`/api/admin/catererinfo${queryParam}`);
  },

  /**
   * Get caterer info by ID
   * @param id - Caterer info ID
   */
  getCatererInfoById: async (id: string) => {
    return apiRequest<{
      success: boolean;
      data: {
        id: string;
        business_name: string;
        business_type: string;
        business_description: string | null;
        service_area: string | null;
        minimum_guests: number | null;
        maximum_guests: number | null;
        region: string | null;
        delivery_only: boolean;
        delivery_plus_setup: boolean;
        full_service: boolean;
        staff: number | null;
        servers: number | null;
        food_license: string | null;
        Registration: string | null;
        caterer_id: string;
        status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
        created_at: string;
        updated_at: string;
        caterer: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          company_name: string | null;
          image_url: string | null;
          profile_completed: boolean;
          verified: boolean;
          created_at: string;
        };
      };
    }>(`/api/admin/catererinfo/${id}`);
  },

  /**
   * Update caterer info status
   * @param id - Caterer info ID
   * @param status - New status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED'
   */
  updateCatererInfoStatus: async (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED') => {
    return apiRequest<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/admin/catererinfo/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};


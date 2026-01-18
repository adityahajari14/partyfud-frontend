// Utility functions for managing cart in localStorage

export interface LocalCartItem {
  id: string; // Temporary ID for localStorage items
  package_id: string;
  package: {
    id: string;
    name: string;
    people_count: number;
    total_price: number;
    price_per_person: number;
    currency: string;
    cover_image_url?: string | null;
    caterer: {
      id: string;
      business_name: string | null;
      name?: string;
    };
  };
  guests: number; // Number of guests for this package
  price_at_time: number; // Calculated price based on guests
  event_date?: string; // Event date
  event_time?: string; // Event time
  event_type?: string; // Event type (occasion ID)
  area?: string; // Delivery area
  created_at: string;
  updated_at: string;
}

const CART_STORAGE_KEY = 'partyfud_cart_items';
const EVENT_DETAILS_STORAGE_KEY = 'partyfud_event_details'; // Store event details separately

export const cartStorage = {
  // Get all cart items from localStorage
  getItems: (): LocalCartItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Error reading cart from localStorage:', err);
    }
    return [];
  },

  // Add item to localStorage cart
  addItem: (item: Omit<LocalCartItem, 'id' | 'created_at' | 'updated_at'>): LocalCartItem => {
    const items = cartStorage.getItems();
    
    // Check if same package already exists in cart
    const existingIndex = items.findIndex(i => i.package_id === item.package_id);
    if (existingIndex !== -1) {
      // Update existing item with new guest count and event details
      items[existingIndex] = {
        ...items[existingIndex],
        guests: item.guests,
        price_at_time: item.price_at_time,
        event_date: item.event_date,
        event_time: item.event_time,
        event_type: item.event_type,
        area: item.area,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      
      // Always save event details separately (even if some fields are empty)
      // This ensures event details are preserved during sync
      cartStorage.saveEventDetails({
        event_date: item.event_date,
        event_time: item.event_time,
        event_type: item.event_type,
        area: item.area,
      });
      
      return items[existingIndex];
    }
    
    const newItem: LocalCartItem = {
      ...item,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    items.push(newItem);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    
    // Always save event details separately (even if some fields are empty)
    // This ensures event details are preserved during sync
    cartStorage.saveEventDetails({
      event_date: item.event_date,
      event_time: item.event_time,
      event_type: item.event_type,
      area: item.area,
    });
    
    return newItem;
  },

  // Update guest count for an item
  updateGuestCount: (itemId: string, guests: number, priceAtTime: number): LocalCartItem | null => {
    const items = cartStorage.getItems();
    const index = items.findIndex(item => item.id === itemId);
    if (index === -1) return null;
    
    items[index] = {
      ...items[index],
      guests,
      price_at_time: priceAtTime,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    return items[index];
  },

  // Remove item from localStorage cart
  removeItem: (itemId: string): void => {
    const items = cartStorage.getItems();
    const filtered = items.filter((item) => item.id !== itemId);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(filtered));
  },

  // Clear all items from localStorage cart
  clear: (): void => {
    localStorage.removeItem(CART_STORAGE_KEY);
  },

  // Save event details separately (since server might not store all fields)
  saveEventDetails: (eventDetails: {
    event_date?: string;
    event_time?: string;
    event_type?: string;
    area?: string;
  }): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(EVENT_DETAILS_STORAGE_KEY, JSON.stringify(eventDetails));
    } catch (err) {
      console.error('Error saving event details:', err);
    }
  },

  // Get saved event details
  getEventDetails: (): {
    event_date?: string;
    event_time?: string;
    event_type?: string;
    area?: string;
  } => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(EVENT_DETAILS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Error reading event details:', err);
    }
    return {};
  },

  // Clear event details
  clearEventDetails: (): void => {
    localStorage.removeItem(EVENT_DETAILS_STORAGE_KEY);
  },

  // Sync localStorage cart items to server
  syncToServer: async (): Promise<void> => {
    const items = cartStorage.getItems();
    if (items.length === 0) return;

    const { userApi } = await import('@/lib/api/user.api');
    const { customPackageStorage } = await import('./customPackageStorage');
    
    // First, sync custom packages to create actual packages on server
    const customPackages = customPackageStorage.getPackages();
    const customPackageMap = new Map<string, string>(); // Maps local ID to server package ID
    
    for (const customPkg of customPackages) {
      try {
        const res = await userApi.createCustomPackage({
          dish_ids: customPkg.dish_ids,
          people_count: customPkg.people_count,
        });
        
        if (res.data?.data?.id) {
          customPackageMap.set(customPkg.id, res.data.data.id);
        }
      } catch (err) {
        console.error('Error syncing custom package to server:', err);
        // Continue with other packages even if one fails
      }
    }
    
    // Clear custom packages after sync
    customPackageStorage.clear();
    
    // Now sync cart items to server
    const syncedItems: string[] = []; // Track successfully synced items
    for (const item of items) {
      try {
        // If this is a custom package, use the mapped server package ID
        let packageId = item.package_id;
        if (item.package_id.startsWith('custom_')) {
          const serverPackageId = customPackageMap.get(item.package_id);
          if (serverPackageId) {
            packageId = serverPackageId;
          } else {
            // Skip if custom package sync failed
            console.warn('Skipping cart item with unsynced custom package:', item.package_id);
            continue;
          }
        }
        
        await userApi.createCartItem({
          package_id: packageId,
          guests: item.guests,
          price_at_time: item.price_at_time,
          date: item.event_date,
          event_time: item.event_time,
          event_type: item.event_type,
          area: item.area,
        });
        
        // Mark as successfully synced
        syncedItems.push(item.id);
      } catch (err) {
        console.error('Error syncing cart item to server:', err);
        // Continue with other items even if one fails
      }
    }

    // Save event details before clearing (server doesn't store all event fields)
    // Find the first item with event details, or use the first item
    if (items.length > 0) {
      const itemWithDetails = items.find(item => 
        item.event_date || item.event_time || item.event_type || item.area
      ) || items[0];
      
      cartStorage.saveEventDetails({
        event_date: itemWithDetails.event_date,
        event_time: itemWithDetails.event_time,
        event_type: itemWithDetails.event_type,
        area: itemWithDetails.area,
      });
    }

    // Only clear successfully synced items from localStorage
    // This prevents data loss if some items fail to sync
    if (syncedItems.length > 0) {
      const remainingItems = items.filter(item => !syncedItems.includes(item.id));
      if (remainingItems.length === 0) {
        // All items synced, clear localStorage (event details are saved separately)
        cartStorage.clear();
      } else {
        // Some items failed, keep unsynced items in localStorage
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(remainingItems));
      }
    }
  },
};

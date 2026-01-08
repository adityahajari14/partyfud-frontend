'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { catererApi, CreatePackageRequest, Dish } from '@/lib/api/caterer.api';
import { userApi } from '@/lib/api/user.api';

// Component for package item card with image
interface PackageItemCardProps {
  item: { id: string; dish: { name: string; image_url?: string | null }; people_count: number; quantity: string };
  isSelected: boolean;
  onToggle: () => void;
}

const PackageItemCard: React.FC<PackageItemCardProps> = ({ item, isSelected, onToggle }) => {
  const [imageError, setImageError] = useState(false);
  const fallbackImage = `https://source.unsplash.com/400x300/?food,${encodeURIComponent(item.dish.name || 'delicious')}`;
  const displayImage = item.dish.image_url && !imageError ? item.dish.image_url : fallbackImage;

  return (
    <label
      className={`block bg-white rounded-lg shadow overflow-hidden transition-all cursor-pointer ${isSelected
          ? 'ring-2 ring-[#268700] ring-offset-2'
          : 'hover:shadow-md'
        }`}
    >
      {/* Image - Full width, fully visible */}
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img
          src={displayImage}
          alt={item.dish.name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 w-4 h-4 text-[#268700] border-gray-300 rounded focus:ring-[#268700] flex-shrink-0 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.dish.name}</h3>
            <p className="text-sm text-gray-700">
              {item.people_count} People • Qty: {item.quantity}
            </p>
          </div>
        </div>
        {isSelected && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <span className="inline-flex items-center px-2.5 py-1 bg-[#e8f5e0] text-[#1a5a00] rounded-full text-xs font-semibold">
              ✓ Selected
            </span>
          </div>
        )}
      </div>
    </label>
  );
};

// Component for dish image with fallback in modal
const DishImageInModal: React.FC<{ imageUrl: string | null | undefined; dishName: string }> = ({ imageUrl, dishName }) => {
  const [imageError, setImageError] = React.useState(false);
  const [fallbackError, setFallbackError] = React.useState(false);

  const fallbackImage = '/default_dish.jpg';

  return (
    <div className="w-full h-32 bg-gray-200 flex items-center justify-center overflow-hidden rounded mb-2 relative flex-shrink-0">
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={dishName}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : !fallbackError ? (
        <img
          src={fallbackImage}
          alt={dishName}
          className="w-full h-full object-cover"
          onError={() => setFallbackError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
          <svg
            className="w-10 h-10 text-gray-400 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-500 font-medium text-center px-2 line-clamp-2">{dishName}</p>
        </div>
      )}
    </div>
  );
};

export default function CreatePackagePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreatePackageRequest>({
    name: '',
    people_count: 0,
    cover_image_url: '',
    total_price: 0,
    currency: 'AED',
    // rating: undefined,
    occassion: [] as string[],
    is_active: true,
    is_available: true,
    package_item_ids: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [occasions, setOccasions] = useState<Array<{ id: string; name: string }>>([]);  // Store categories with their items
  const [packageItemsByCategory, setPackageItemsByCategory] = useState<Array<{
    category: { id: string; name: string; description?: string | null };
    items: Array<{ id: string; dish: { name: string; image_url?: string | null }; people_count: number; quantity: string }>;
  }>>([]);
  const DEFAULT_COVER = "/cover.png";
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(DEFAULT_COVER);
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    setLoadingMetadata(true);
    try {
      // Fetch occasions
      const occasionsResponse = await userApi.getOccasions();
      if (occasionsResponse.data?.data) {
        setOccasions(occasionsResponse.data.data.map((occ: any) => ({
          id: occ.id,
          name: occ.name,
        })));
      }

      // Fetch draft package items (items without package_id)
      await fetchPackageItems();
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setLoadingMetadata(false);
    }
  };

  const fetchPackageItems = async () => {
    try {
      // Fetch draft items (items without package_id) for creating a new package
      const itemsResponse = await (catererApi as any).getAllPackageItems(undefined, true);
      console.log('📦 [fetchPackageItems] API Response:', itemsResponse);
      
      // Backend returns: { success: true, data: { categories: [...] } }
      // apiRequest wraps it: { data: { success: true, data: { categories: [...] } } }
      if (itemsResponse?.data) {
        const responseData = itemsResponse.data as any;
        console.log('📦 [fetchPackageItems] Response data:', responseData);
        
        // Access the nested data structure - backend response has data.data.categories
        const categoriesData = responseData.data || responseData;
        console.log('📦 [fetchPackageItems] Categories data:', categoriesData);
        
        // New API structure: { categories: [{ category: {...}, items: [...] }] }
        if (categoriesData?.categories && Array.isArray(categoriesData.categories)) {
          console.log('📦 [fetchPackageItems] Found categories:', categoriesData.categories.length);
          
          // Ensure each category has items as an array and normalize item properties
          const normalizedCategories = categoriesData.categories.map((cat: any) => {
            const items = Array.isArray(cat.items) 
              ? cat.items.map((item: any) => ({
                  ...item,
                  quantity: String(item.quantity || 1) // Convert quantity to string
                }))
              : [];
            
            console.log(`📦 [fetchPackageItems] Category "${cat.category?.name || 'Unknown'}": ${items.length} items`);
            
            return {
              category: cat.category || cat,
              items: items
            };
          });
          
          console.log('📦 [fetchPackageItems] Setting normalized categories:', normalizedCategories.length);
          setPackageItemsByCategory(normalizedCategories);
        } else {
          console.warn('📦 [fetchPackageItems] No categories found, using fallback');
          // Fallback for old structure (if API hasn't updated yet)
          const itemsList = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);
          // Convert flat array to category structure
          setPackageItemsByCategory([{
            category: { id: 'all', name: 'All Items', description: null },
            items: Array.isArray(itemsList) ? itemsList.map((item: any) => ({
              ...item,
              quantity: String(item.quantity || 1)
            })) : []
          }]);
        }
      } else {
        console.warn('📦 [fetchPackageItems] No data in response');
        setPackageItemsByCategory([]);
      }
    } catch (error) {
      console.error('❌ [fetchPackageItems] Error fetching package items:', error);
      // Set empty state on error
      setPackageItemsByCategory([]);
    }
  };

  // Helper function to get all items from all categories (for selected items summary)
  const getAllItems = () => {
    return packageItemsByCategory.flatMap(category => 
      Array.isArray(category.items) ? category.items : []
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleItemToggle = (itemId: string) => {
    const currentIds = formData.package_item_ids || [];
    if (currentIds.includes(itemId)) {
      setFormData({
        ...formData,
        package_item_ids: currentIds.filter(id => id !== itemId),
      });
    } else {
      setFormData({
        ...formData,
        package_item_ids: [...currentIds, itemId],
      });
    }
  };


  const handleOpenCreateItemModal = () => {
    router.push(`/caterer/packages/create/add-items?people_count=${formData.people_count || 0}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.name.trim()) {
      setErrors({ name: 'Package name is required' });
      return;
    }
    if (!formData.people_count || formData.people_count <= 0) {
      setErrors({ people_count: 'People count must be greater than 0' });
      return;
    }
    if (!formData.total_price || formData.total_price <= 0) {
      setErrors({ total_price: 'Total price must be greater than 0' });
      return;
    }

    setIsSubmitting(true);

    const response = await (catererApi as any).createPackage(formData, selectedImage || undefined);

    if (response.error) {
      setErrors({ general: response.error });
      setIsSubmitting(false);
      return;
    }

    router.push('/caterer/packages');
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-4 text-sm text-gray-600">
          <span>Packages</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Create a Package</span>
        </div>

        {/* Back Button and Title */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create a Package</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* General Information Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-5">General Information</h2>

            {errors.general && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Form Fields */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Package Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter package name"
                    error={errors.name}
                  />
                  <Input
                    label="People Count"
                    type="number"
                    value={formData.people_count?.toString() || ''}
                    onChange={(e) => {
                      const peopleCount = parseInt(e.target.value) || 0;
                      setFormData({ ...formData, people_count: peopleCount });
                      setCreateItemFormData(prev => ({ ...prev, people_count: peopleCount }));
                    }}
                    placeholder="Enter number of people"
                    error={errors.people_count}
                  />
                </div>
                <div>
                  {/* Occasions - Multiple Selection with Checkboxes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Occasions <span className="text-gray-500 text-xs">(Select all that apply)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {occasions.length === 0 ? (
                        <p className="col-span-2 text-sm text-gray-500">Loading occasions...</p>
                      ) : (
                        occasions.map((occasion) => (
                          <label
                            key={occasion.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition"
                          >
                            <input
                              type="checkbox"
                              checked={Array.isArray(formData.occassion) && formData.occassion.includes(occasion.id)}
                              onChange={(e) => {
                                const currentOccasions = Array.isArray(formData.occassion) ? formData.occassion : [];
                                if (e.target.checked) {
                                  setFormData({ ...formData, occassion: [...currentOccasions, occasion.id] });
                                } else {
                                  setFormData({ ...formData, occassion: currentOccasions.filter(id => id !== occasion.id) });
                                }
                              }}
                              className="w-4 h-4 text-[#268700] border-gray-300 rounded focus:ring-[#268700]"
                            />
                            <span className="text-sm text-gray-700">{occasion.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                    {errors.occassion && (
                      <p className="mt-1 text-sm text-red-600">{errors.occassion}</p>
                    )}
                  </div>
                  
                  {/* <Input
                    label="Rating (Optional)"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating?.toString() || ''}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0.0 - 5.0"
                  /> */}
                </div>
                <div>
                  {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL (Optional)
                  </label>
                  <Input
                    type="url"
                    value={formData.cover_image_url || ''}
                    onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  /> */}
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>

                <div className="relative">
                  <img
                    src={imagePreview || DEFAULT_COVER}
                    alt="Cover Preview"
                    className="w-full h-40 object-cover rounded-lg border border-gray-300"
                  />

                  {/* Remove only if user uploaded */}
                  {selectedImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(DEFAULT_COVER);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Upload Button */}
                <label className="mt-3 flex items-center justify-center w-full px-3 py-2 bg-[#268700] text-white rounded-lg cursor-pointer hover:bg-[#1f6b00] transition-colors text-sm">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Change Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

            </div>
          </div>

          {/* Package Items Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Package Items</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Select items to include in this package
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleOpenCreateItemModal}
              >
                + Add Ons & Options
              </Button>
            </div>

            {/* Selected Items Summary */}
            {formData.package_item_ids && formData.package_item_ids.length > 0 && (
              <div className="mb-4 p-3 bg-[#e8f5e0] rounded-lg border border-[#268700]/20">
                <p className="text-sm font-semibold text-[#1a5a00] mb-2">
                  {formData.package_item_ids.length} item(s) selected
                </p>
                <div className="flex flex-wrap gap-2">
                  {getAllItems()
                    .filter(item => formData.package_item_ids?.includes(item.id))
                    .map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white text-[#1a5a00] rounded-full text-sm border border-[#268700]/30"
                      >
                        {item.dish.name}
                        <button
                          type="button"
                          onClick={() => handleItemToggle(item.id)}
                          className="text-[#268700] hover:text-[#1a5a00] font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Package Items List - Grouped by Category */}
            {loadingMetadata ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#268700]"></div>
              </div>
            ) : getAllItems().length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 mb-3">No package items available</p>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleOpenCreateItemModal}
                >
                  + Create Your First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {packageItemsByCategory.map((categoryGroup) => (
                  <div key={categoryGroup.category.id} className="space-y-4">
                    {/* Category Header */}
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {categoryGroup.category.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({Array.isArray(categoryGroup.items) ? categoryGroup.items.length : 0} {Array.isArray(categoryGroup.items) && categoryGroup.items.length === 1 ? 'item' : 'items'})
                      </span>
                      {categoryGroup.category.description && (
                        <span className="text-sm text-gray-400 italic">
                          - {categoryGroup.category.description}
                        </span>
                      )}
                    </div>
                    
                    {/* Items Grid for this Category */}
                    {!Array.isArray(categoryGroup.items) || categoryGroup.items.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-400">No items in this category</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryGroup.items.map((item) => (
                          <PackageItemCard
                            key={item.id}
                            item={item}
                            isSelected={formData.package_item_ids?.includes(item.id) || false}
                            onToggle={() => handleItemToggle(item.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-5">Pricing & Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Price
                </label>
                <div className="relative">
                  <img src="/dirham.svg" alt="AED" className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.total_price?.toString() || ''}
                    onChange={(e) => setFormData({ ...formData, total_price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    error={errors.total_price}
                    className="pl-12"
                  />
                </div>
              </div>
              {/* <div className="flex items-center gap-6 pt-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active ?? true}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#268700] border-gray-300 rounded focus:ring-[#268700]"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Active
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available ?? true}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-4 h-4 text-[#268700] border-gray-300 rounded focus:ring-[#268700]"
                  />
                  <label htmlFor="is_available" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Available
                  </label>
                </div>
              </div> */}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between border-t border-gray-100">
            <div>
              <span className="text-sm text-gray-600">Total Price: </span>
              <span className="text-2xl font-bold text-gray-900 ml-2">
                AED {formData.total_price ? formData.total_price.toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
              >
                Create Package
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


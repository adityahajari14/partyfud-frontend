'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { catererApi, CreatePackageRequest, Dish } from '@/lib/api/caterer.api';
import { userApi } from '@/lib/api/user.api';

// Component for dish card with image
interface DishCardProps {
  dish: Dish;
  isSelected: boolean;
  onToggle: () => void;
}

const DishCard: React.FC<DishCardProps> = ({ dish, isSelected, onToggle }) => {
  return (
    <label
      className={`block bg-white rounded-lg shadow overflow-hidden transition-all cursor-pointer ${isSelected
        ? 'ring-2 ring-[#268700] ring-offset-2'
        : 'hover:shadow-md'
        }`}
    >
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
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{dish.name}</h3>
            <p className="text-sm text-gray-700">
              {dish.price ? `${dish.currency || 'AED'} ${Number(dish.price).toFixed(2)}` : 'Price not set'}
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

  const fallbackImage = '/logo2.svg';

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
    minimum_people: undefined, // Will be set from caterer's minimum_guests
    cover_image_url: '',
    currency: 'AED',
    // rating: undefined,
    occassion: [] as string[],
    is_active: true,
    is_available: true,
    customisation_type: 'FIXED', // Keep default, but UI won't show selection
    package_item_ids: [],
    category_selections: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [occasions, setOccasions] = useState<Array<{ id: string; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; description?: string | null }>>([]);
  const [dishesByCategory, setDishesByCategory] = useState<Array<{
    category: { id: string; name: string; description?: string | null };
    dishes: Array<Dish>;
  }>>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minimumGuests, setMinimumGuests] = useState<number | null>(null);
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
      // Fetch caterer info to get minimum_guests
      try {
        const catererInfoResponse = await catererApi.getCatererInfo();
        if (catererInfoResponse.data) {
          const info = (catererInfoResponse.data as any).data || catererInfoResponse.data;
          if (info.minimum_guests) {
            setMinimumGuests(info.minimum_guests);
            // Pre-fill form with caterer's minimum_guests
            setFormData(prev => ({ ...prev, minimum_people: info.minimum_guests }));
          }
        }
      } catch (error) {
        console.error('Error fetching caterer info:', error);
      }

      // Fetch occasions
      const occasionsResponse = await userApi.getOccasions();
      if (occasionsResponse.data?.data) {
        setOccasions(occasionsResponse.data.data.map((occ: any) => ({
          id: occ.id,
          name: occ.name,
        })));
      }

      // Fetch categories
      const categoriesResponse = await catererApi.getCategories();
      if (categoriesResponse.data) {
        const categoriesData = categoriesResponse.data as any;
        if (categoriesData.data && Array.isArray(categoriesData.data)) {
          setCategories(categoriesData.data);
        } else if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }
      }

      // Fetch dishes grouped by category
      await fetchDishes();
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setLoadingMetadata(false);
    }
  };

  const fetchDishes = async () => {
    try {
      const response = await catererApi.getAllDishes({ group_by_category: true });
      if (response.data) {
        const data = response.data as any;
        const responseData = data.data || data;

        if (responseData.categories && Array.isArray(responseData.categories)) {
          setDishesByCategory(responseData.categories);
        } else {
          const dishesList = Array.isArray(data) ? data : (data.data || []);
          setDishesByCategory([{
            category: { id: 'all', name: 'All Dishes', description: null },
            dishes: Array.isArray(dishesList) ? dishesList : []
          }]);
        }
      }
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setDishesByCategory([]);
    }
  };

  // Helper function to get all dishes from all categories
  const getAllDishes = () => {
    return dishesByCategory.flatMap(category =>
      Array.isArray(category.dishes) ? category.dishes : []
    );
  };

  // Filter dishes based on search query
  const getFilteredDishesByCategory = () => {
    let filteredCategories = dishesByCategory;

    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredCategories = dishesByCategory
        .map(categoryGroup => ({
          ...categoryGroup,
          dishes: categoryGroup.dishes.filter(dish =>
            dish.name.toLowerCase().includes(query)
          )
        }));
    }

    // Always filter out categories with 0 dishes
    return filteredCategories.filter(categoryGroup => categoryGroup.dishes.length > 0);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDishToggle = (dishId: string) => {
    // For now, we'll use dish IDs directly in package_item_ids
    // The backend will need to handle creating package items from dish IDs
    // or we can create package items on the fly
    const currentIds = formData.package_item_ids || [];
    if (currentIds.includes(dishId)) {
      setFormData({
        ...formData,
        package_item_ids: currentIds.filter(id => id !== dishId),
      });
    } else {
      setFormData({
        ...formData,
        package_item_ids: [...currentIds, dishId],
      });
    }
  };


  // Calculate package price from selected dishes
  const calculatePackagePrice = (): number => {
    const minPeople = formData.minimum_people || minimumGuests;
    if (!formData.package_item_ids || formData.package_item_ids.length === 0 || !minPeople || minPeople <= 0) {
      return 0;
    }

    const allDishes = getAllDishes();
    const selectedDishes = allDishes.filter(dish => formData.package_item_ids?.includes(dish.id));
    
    let totalPrice = 0;
    selectedDishes.forEach((dish) => {
      // Calculate price: dish.price * minimum_people
      // Note: This is a simplified calculation - backend will handle actual calculation
      const price = typeof dish.price === 'number' ? dish.price : Number(dish.price) || 0;
      totalPrice += price * (minPeople || 1);
    });

    return totalPrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.name.trim()) {
      setErrors({ name: 'Package name is required' });
      return;
    }
    const minPeople = formData.minimum_people || minimumGuests;
    if (!minPeople || minPeople <= 0) {
      setErrors({ minimum_people: 'Minimum people must be greater than 0' });
      return;
    }
    if (!formData.package_item_ids || formData.package_item_ids.length === 0) {
      setErrors({ package_item_ids: 'At least one dish must be selected' });
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
                    label="Minimum People"
                    type="number"
                    min="1"
                    value={formData.minimum_people !== undefined && formData.minimum_people !== null ? formData.minimum_people.toString() : ''}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      if (value === '') {
                        // Allow clearing - will use default when submitting
                        setFormData({ ...formData, minimum_people: undefined });
                      } else {
                        const numValue = parseInt(value, 10);
                        if (!isNaN(numValue)) {
                          setFormData({ ...formData, minimum_people: numValue });
                        }
                      }
                    }}
                    placeholder={minimumGuests ? `${minimumGuests} (default from profile)` : 'Enter minimum number of people'}
                    error={errors.minimum_people}
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
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-900">Package Items</h2>
              <p className="text-sm text-gray-600 mt-1">
                Select dishes to include in this package
              </p>
            </div>

            {/* Search Box */}
            <div className="mb-5">
              <Input
                label="Search Dishes"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for dishes by name..."
                className="w-full"
              />
            </div>

            {/* Selected Dishes Summary */}
            {formData.package_item_ids && formData.package_item_ids.length > 0 && (
              <div className="mb-4 p-3 bg-[#e8f5e0] rounded-lg border border-[#268700]/20">
                <p className="text-sm font-semibold text-[#1a5a00] mb-2">
                  {formData.package_item_ids.length} dish(es) selected
                </p>
                <div className="flex flex-wrap gap-2">
                  {getAllDishes()
                    .filter(dish => formData.package_item_ids?.includes(dish.id))
                    .map((dish) => (
                      <span
                        key={dish.id}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white text-[#1a5a00] rounded-full text-sm border border-[#268700]/30"
                      >
                        {dish.name}
                        <button
                          type="button"
                          onClick={() => handleDishToggle(dish.id)}
                          className="text-[#268700] hover:text-[#1a5a00] font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Dishes List - Grouped by Category */}
            {loadingMetadata ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#268700]"></div>
              </div>
            ) : getAllDishes().length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No dishes available. Please add dishes to your menu first.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {getFilteredDishesByCategory().map((categoryGroup) => (
                  <div key={categoryGroup.category.id} className="space-y-4">
                    {/* Category Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {categoryGroup.category.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({categoryGroup.dishes.length} {categoryGroup.dishes.length === 1 ? 'dish' : 'dishes'})
                        </span>
                        {categoryGroup.category.description && (
                          <span className="text-sm text-gray-400 italic">
                            - {categoryGroup.category.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dishes Grid for this Category */}
                    {categoryGroup.dishes.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-400">No dishes in this category</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryGroup.dishes.map((dish) => (
                          <DishCard
                            key={dish.id}
                            dish={dish}
                            isSelected={formData.package_item_ids?.includes(dish.id) || false}
                            onToggle={() => handleDishToggle(dish.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {getFilteredDishesByCategory().length === 0 && searchQuery.trim() && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">No dishes found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Price Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-5">Pricing & Status</h2>
            <div className="grid grid-cols-1 gap-6">
              {/* Calculated Price Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Price (Calculated)
                </label>
                <div className="relative">
                  <img src="/dirham.svg" alt="AED" className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <div className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                    <span className="text-sm text-gray-500">Starting </span>
                    <span className="text-lg font-semibold">
                      AED {calculatePackagePrice().toFixed(2)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Price is automatically calculated from selected dishes × {formData.minimum_people || minimumGuests || 'minimum'} people × quantity
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  value={formData.additional_info || ''}
                  onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                  placeholder="For example: Crockery not included or per person crockery 20 AED, cleaning services extra charge of 10 AED per person etc"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#268700] focus:border-transparent resize-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter extra pricing and services information for this package
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between border-t border-gray-100">
            <div>
              <span className="text-sm text-gray-600">Starting Price: </span>
              <span className="text-2xl font-bold text-gray-900 ml-2">
                AED {calculatePackagePrice().toFixed(2)}
              </span>
              {formData.package_item_ids && formData.package_item_ids.length > 0 && (formData.minimum_people || minimumGuests) && (formData.minimum_people || minimumGuests || 0) > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Price will be calculated from selected items for {formData.minimum_people || minimumGuests} people
                </p>
              )}
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


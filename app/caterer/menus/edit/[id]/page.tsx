'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { catererApi, Dish, UpdateDishRequest } from '@/lib/api/caterer.api';

export default function EditMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const dishId = params.id as string;

  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<UpdateDishRequest>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image states
  const [imagePreview, setImagePreview] = useState<string>('/default_dish.jpg');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
  // Metadata states
  const [cuisineTypes, setCuisineTypes] = useState<Array<{ value: string; label: string }>>([]);
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [subCategories, setSubCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [freeForms, setFreeForms] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedFreeForms, setSelectedFreeForms] = useState<string[]>([]);

  useEffect(() => {
    fetchDish();
    fetchMetadata();
  }, [dishId]);

  const fetchMetadata = async () => {
    try {
      // Fetch cuisine types
      const cuisineResponse = await catererApi.getCuisineTypes();
      if (cuisineResponse.data) {
        const cuisineData = cuisineResponse.data as any;
        const cuisineList = Array.isArray(cuisineData) ? cuisineData : (cuisineData.data || []);
        const cuisineOptions = [
          { value: '', label: 'Select Cuisine Type' },
          ...cuisineList.map((c: any) => ({ value: c.id, label: c.name }))
        ];
        setCuisineTypes(cuisineOptions);
      }

      // Fetch categories
      const categoriesResponse = await catererApi.getCategories();
      if (categoriesResponse.data) {
        const categoryData = categoriesResponse.data as any;
        const categoryList = Array.isArray(categoryData) ? categoryData : (categoryData.data || []);
        const categoryOptions = [
          { value: '', label: 'Select Category' },
          ...categoryList.map((c: any) => ({ value: c.id, label: c.name }))
        ];
        setCategories(categoryOptions);
      }

      // Fetch free forms (dietary information)
      const freeFormResponse = await catererApi.getFreeForms();
      if (freeFormResponse.data) {
        const freeFormData = freeFormResponse.data as any;
        const freeFormList = Array.isArray(freeFormData) ? freeFormData : (freeFormData.data || []);
        setFreeForms(freeFormList);
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
    }
  };

  const fetchSubCategories = async (categoryId: string) => {
    if (!categoryId) {
      setSubCategories([{ value: '', label: 'Select Sub-Category' }]);
      return;
    }

    setLoadingSubCategories(true);
    try {
      const response = await catererApi.getSubCategories(categoryId);
      if (response.data) {
        const subData = response.data as any;
        const subList = Array.isArray(subData) ? subData : (subData.data || []);
        if (subList.length > 0) {
          const subCategoryOptions = [
            { value: '', label: 'Select Sub-Category' },
            ...subList.map((sc: any) => ({ value: sc.id, label: sc.name }))
          ];
          setSubCategories(subCategoryOptions);
        } else {
          setSubCategories([{ value: '', label: 'No Sub-Categories Available' }]);
        }
      } else {
        setSubCategories([{ value: '', label: 'No Sub-Categories Available' }]);
      }
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
      setSubCategories([{ value: '', label: 'Select Sub-Category' }]);
    } finally {
      setLoadingSubCategories(false);
    }
  };

  const fetchDish = async () => {
    try {
      setLoading(true);
      const response = await catererApi.getDishById(dishId);
      
      // Handle different API response structures
      let dishData: any = null;
      if (response.data) {
        const data = response.data as any;
        dishData = data.data || data; // Handle both { data: {...} } and direct object
      }
      
      if (dishData) {
        setDish(dishData);
        
        // Set image preview
        setImagePreview(dishData.image_url || '/default_dish.jpg');
        
        // Set freeform selections if available
        if (dishData.freeforms && Array.isArray(dishData.freeforms)) {
          setSelectedFreeForms(dishData.freeforms.map((f: any) => f.id));
        }
        
        setFormData({
          name: dishData.name,
          price: dishData.price,
          is_active: dishData.is_active,
          quantity: dishData.quantity,
          pieces: dishData.pieces,
          cuisine_type_id: dishData.cuisine_type?.id || dishData.cuisine_type_id,
          category_id: dishData.category?.id || dishData.category_id,
          sub_category_id: dishData.sub_category?.id || dishData.sub_category_id,
        });
        
        // Fetch subcategories if category exists
        const catId = dishData.category?.id || dishData.category_id;
        if (catId) {
          fetchSubCategories(catId);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dish:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData({ 
      ...formData, 
      category_id: categoryId,
      sub_category_id: undefined // Reset subcategory when category changes
    });
    if (categoryId) {
      fetchSubCategories(categoryId);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    setFormErrors({});

    // Add freeform_ids to formData
    const formDataWithFreeForms = {
      ...formData,
      freeform_ids: selectedFreeForms.length > 0 ? selectedFreeForms : undefined,
    };

    const response = await catererApi.updateDish(dishId, formDataWithFreeForms, selectedImage || undefined);

    if (response.error) {
      if (typeof response.error === 'object') {
        setFormErrors(response.error as Record<string, string>);
      } else {
        setFormErrors({ general: response.error });
      }
      setIsSubmitting(false);
      return;
    }

    // Success - navigate back
    router.push('/caterer/menus');
  };

  const handleCancel = () => {
    router.push('/caterer/menus');
  };

  if (loading) {
    return (
      <>
        <Header onAddClick={() => {}} showAddButton={false} />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#268700] mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading dish details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!dish) {
    return (
      <>
        <Header onAddClick={() => {}} showAddButton={false} />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Dish Not Found</h2>
              <p className="text-gray-600 mb-6">The dish you're looking for doesn't exist or has been removed.</p>
              <Button onClick={handleCancel} variant="primary">
                Back to Menus
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header onAddClick={() => {}} showAddButton={false} />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Back to menus"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Edit Menu Item</h1>
            </div>
          </div>

          {formErrors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {formErrors.general}
            </div>
          )}

          <div className="space-y-6">
            {/* Form Fields */}
            <Input
              label="Name of the Dish *"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter dish name"
              error={formErrors.name}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Cuisine Type *"
                options={cuisineTypes}
                value={formData.cuisine_type_id?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, cuisine_type_id: e.target.value })}
                placeholder="Select Cuisine Type"
                error={formErrors.cuisine_type_id}
              />
              <Select
                label="Category"
                options={categories}
                value={formData.category_id?.toString() || ''}
                onChange={(e) => handleCategoryChange(e.target.value)}
                placeholder="Select Category"
                error={formErrors.category_id}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub-Category (Optional)
              </label>
              {loadingSubCategories ? (
                <div className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#268700]"></div>
                  <span className="text-sm text-gray-700">Loading subcategories...</span>
                </div>
              ) : (
                <Select
                  options={subCategories}
                  value={formData.sub_category_id?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, sub_category_id: e.target.value || undefined })}
                  placeholder="Select Sub-Category"
                  disabled={!formData.category_id}
                  error={formErrors.sub_category_id}
                />
              )}
              {!formData.category_id && (
                <p className="mt-1 text-xs text-gray-600">Please select a category first</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Quantity"
                type="text"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value || undefined })}
                placeholder="Enter quantity"
                error={formErrors.quantity}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <img src="/dirham.svg" alt="AED" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                  <input
                    type="number"
                    step="1"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#268700]"
                  />
                </div>
                {formErrors.price && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.price}</p>
                )}
              </div>
            </div>

            <Input
              label="Number of Pieces *"
              type="number"
              min="1"
              value={formData.pieces || ''}
              onChange={(e) => setFormData({ ...formData, pieces: parseInt(e.target.value) || 1 })}
              placeholder="e.g., 2"
              error={formErrors.pieces}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Information
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border border-gray-300 rounded-lg p-4 bg-gray-50">
                {freeForms.map((freeForm) => (
                  <label
                    key={freeForm.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFreeForms.includes(freeForm.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFreeForms([...selectedFreeForms, freeForm.id]);
                        } else {
                          setSelectedFreeForms(selectedFreeForms.filter(id => id !== freeForm.id));
                        }
                      }}
                      className="w-4 h-4 text-[#268700] border-gray-300 rounded focus:ring-[#268700]"
                    />
                    <span className="text-sm text-gray-800">{freeForm.name}</span>
                  </label>
                ))}
                {freeForms.length === 0 && (
                  <p className="text-sm text-gray-600 col-span-2">No dietary options available</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Dish Image (Optional)
              </label>
              <div className="flex items-start gap-4">
                <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  <img
                    src={imagePreview}
                    alt="Dish Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <label className="inline-flex items-center px-4 py-2 bg-[#268700] text-white rounded-lg cursor-pointer hover:bg-[#1f6b00] transition-colors">
                    <svg
                      className="w-5 h-5 mr-2"
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
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-2 text-sm text-gray-600">
                    Upload a high-quality image of your dish. Recommended size: 800x600px
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active !== false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-[#268700] border-gray-300 rounded focus:ring-[#268700]"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Active (visible to customers)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                onClick={handleCancel}
                variant="secondary"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Dish'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

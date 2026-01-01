'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { catererApi, Dish, CreateDishRequest, UpdateDishRequest } from '@/lib/api/caterer.api';

// Component for dish image with fallback
const DishImage: React.FC<{ imageUrl: string | null; dishName: string }> = ({ imageUrl, dishName }) => {
  const [imageError, setImageError] = React.useState(false);
  const [fallbackError, setFallbackError] = React.useState(false);

  const fallbackImage = '/default_dish.jpg';

  return (
    <div className="w-full h-32 md:h-48 bg-gray-200 flex items-center justify-center overflow-hidden relative shrink-0">
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
            className="w-16 h-16 text-gray-400 mb-2"
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
          <p className="text-sm text-gray-500 font-medium text-center px-2 line-clamp-2">{dishName}</p>
        </div>
      )}
    </div>
  );
};

export default function MenusPage() {
  const router = useRouter();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cuisine_type_id: '',
    category_id: '',
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [createFormData, setCreateFormData] = useState<CreateDishRequest>({
    name: '',
    cuisine_type_id: '',
    category_id: '',
    sub_category_id: '',
    price: 0,
    currency: 'AED',
    is_active: true,
  });
  const [createFormErrors, setCreateFormErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('/default_dish.jpg');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState<UpdateDishRequest>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cuisineTypes, setCuisineTypes] = useState<Array<{ value: string; label: string }>>([
    { value: '', label: 'Select Cuisine Type' },
  ]);
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([
    { value: '', label: 'Select Category' },
  ]);
  const [subCategories, setSubCategories] = useState<Array<{ value: string; label: string }>>([
    { value: '', label: 'Select Sub-Category' },
  ]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [selectedCategoryHasSubCategories, setSelectedCategoryHasSubCategories] = useState(true);
  const [freeForms, setFreeForms] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedFreeForms, setSelectedFreeForms] = useState<string[]>([]);

  useEffect(() => {
    fetchDishes();
    fetchMetadata();
  }, [filters]);

  useEffect(() => {
    // Fetch subcategories when category changes in create form
    if (createFormData.category_id) {
      fetchSubCategories(createFormData.category_id);
    } else {
      setSubCategories([{ value: '', label: 'Select Sub-Category' }]);
      setSelectedCategoryHasSubCategories(true);
      setLoadingSubCategories(false);
    }
  }, [createFormData.category_id]);

  const fetchMetadata = async () => {
    try {
      // Fetch cuisine types
      const cuisineResponse = await catererApi.getCuisineTypes();
      if (cuisineResponse.data) {
        const data = cuisineResponse.data as any;
        const cuisineList = Array.isArray(data) ? data : (data.data || []);
        setCuisineTypes([
          { value: '', label: 'Select Cuisine Type' },
          ...cuisineList.map((ct: any) => ({
            value: ct.id || ct.value,
            label: ct.name || ct.label,
          })),
        ]);
      }

      // Fetch categories
      const categoryResponse = await catererApi.getCategories();
      if (categoryResponse.data) {
        const data = categoryResponse.data as any;
        const categoryList = Array.isArray(data) ? data : (data.data || []);
        setCategories([
          { value: '', label: 'Select Category' },
          ...categoryList.map((cat: any) => ({
            value: cat.id || cat.value,
            label: cat.name || cat.label,
          })),
        ]);
      }

      // Fetch free forms
      const freeFormResponse = await catererApi.getFreeForms();
      if (freeFormResponse.data) {
        const data = freeFormResponse.data as any;
        const freeFormList = Array.isArray(data) ? data : (data.data || []);
        setFreeForms(freeFormList);
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  const fetchSubCategories = async (categoryId: string) => {
    setLoadingSubCategories(true);
    try {
      const response = await catererApi.getSubCategories(categoryId);
      if (response.data) {
        const data = response.data as any;
        const subCategoryList = Array.isArray(data) ? data : (data.data || []);

        // Check if category has subcategories
        const hasSubCategories = subCategoryList.length > 0;
        setSelectedCategoryHasSubCategories(hasSubCategories);

        if (hasSubCategories) {
          setSubCategories([
            { value: '', label: 'Select Sub-Category' },
            ...subCategoryList.map((sc: any) => ({
              value: sc.id || sc.value,
              label: sc.name || sc.label,
            })),
          ]);
        } else {
          // Category has no subcategories (e.g., Beverages, Soups)
          setSubCategories([
            { value: '', label: 'No subcategories available' },
          ]);
        }
      } else {
        setSubCategories([{ value: '', label: 'Select Sub-Category' }]);
        setSelectedCategoryHasSubCategories(true);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubCategories([{ value: '', label: 'Error loading subcategories' }]);
      setSelectedCategoryHasSubCategories(true);
    } finally {
      setLoadingSubCategories(false);
    }
  };

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const response = await catererApi.getAllDishes({
        cuisine_type_id: filters.cuisine_type_id || undefined,
        category_id: filters.category_id || undefined,
      });

      // Handle API response structure
      // The apiRequest returns { data: <parsed JSON> }
      // If API returns { success: true, data: [...] }, then response.data = { success: true, data: [...] }
      if (response.data) {
        const data = response.data as any;
        if (Array.isArray(data)) {
          // Direct array response
          setDishes(data);
        } else if (data.data && Array.isArray(data.data)) {
          // Wrapped in { success: true, data: [...] } structure
          setDishes(data.data);
        } else {
          // Fallback: empty array
          console.warn('Unexpected dishes API response structure:', data);
          setDishes([]);
        }
      } else {
        setDishes([]);
      }
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      price: dish.price,
      is_active: dish.is_active,
      quantity_in_gm: dish.quantity_in_gm,
      pieces: dish.pieces,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingDish) return;

    setIsSubmitting(true);
    setFormErrors({});

    const response = await catererApi.updateDish(editingDish.id, formData);

    if (response.error) {
      setFormErrors({ general: response.error });
      setIsSubmitting(false);
      return;
    }

    setIsEditModalOpen(false);
    setEditingDish(null);
    fetchDishes();
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const response = await catererApi.deleteDish(id);

    if (!response.error) {
      setDeleteConfirm(null);
      fetchDishes();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };


  const handleCreate = async () => {
    setIsCreating(true);
    setCreateFormErrors({});

    // Validate required fields
    if (!createFormData.name || !createFormData.cuisine_type_id || !createFormData.category_id || !createFormData.price) {
      setCreateFormErrors({ general: 'Please fill in all required fields' });
      setIsCreating(false);
      return;
    }

    // Validate subcategory only if category has subcategories
    if (selectedCategoryHasSubCategories && !createFormData.sub_category_id) {
      setCreateFormErrors({ general: 'Please select a sub-category' });
      setIsCreating(false);
      return;
    }

    // Include freeform_ids in the request
    const formDataWithFreeForms = {
      ...createFormData,
      freeform_ids: selectedFreeForms.length > 0 ? selectedFreeForms : undefined,
    };

    const response = await catererApi.createDish(formDataWithFreeForms, selectedImage || undefined);

    if (response.error) {
      setCreateFormErrors({ general: response.error });
      setIsCreating(false);
      return;
    }

    // Reset form and close modal
    setIsCreateModalOpen(false);
    setCreateFormData({
      name: '',
      cuisine_type_id: '',
      category_id: '',
      sub_category_id: '',
      price: 0,
      currency: 'AED',
      is_active: true,
    });
    setSelectedImage(null);
    setImagePreview('/default_dish.jpg');
    setSelectedFreeForms([]);
    setSubCategories([{ value: '', label: 'Select Sub-Category' }]);
    setSelectedCategoryHasSubCategories(true);
    setLoadingSubCategories(false);
    fetchDishes();
    setIsCreating(false);
  };


  return (
    <>
      <Header
        showAddButton={true}
        addButtonText="+ Add Menu Item"
        onAddClick={() => setIsCreateModalOpen(true)}
      />
      <main className="flex-1 p-4 lg:p-6 pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Items</h1>
          <p className="text-gray-700 mb-6">Create and manage your menu items</p>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
            <Select
              label="Cuisine Type"
              options={cuisineTypes}
              value={filters.cuisine_type_id}
              onChange={(e) => setFilters({ ...filters, cuisine_type_id: e.target.value })}
              placeholder="Select Cuisine Type"
              className="text-sm"
            />
            <Select
              label="Category"
              options={categories}
              value={filters.category_id}
              onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
              placeholder="Select Category"
              className="text-sm"
            />
          </div>

          {/* Dishes Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700]"></div>
            </div>
          ) : dishes.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-700">No dishes found. Create your first dish to get started.</p>
            </div>
          ) : Array.isArray(dishes) && dishes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {dishes.map((dish) => (
                <div key={dish.id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-full">
                  <div className="shrink-0">
                    <DishImage imageUrl={dish.image_url || null} dishName={dish.name} />
                  </div>
                  <div className="p-2 md:p-3 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-1 line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]">{dish.name}</h3>
                    {dish.quantity_in_gm && (
                      <p className="text-xs text-gray-600 mb-1 md:mb-2">
                        {dish.quantity_in_gm} gm
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-2 mt-auto gap-1">
                      <span
                        className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold whitespace-nowrap ${dish.is_active
                          ? 'bg-[#e8f5e0] text-[#1a5a00]'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {dish.is_active ? 'Available' : 'Unavailable'}
                      </span>
                      <div className="text-right">
                        <p className="text-xs md:text-base font-bold text-gray-900 whitespace-nowrap">
                          {dish.currency} {typeof dish.price === 'number' ? dish.price.toFixed(2) : parseFloat(dish.price || '0').toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 md:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-0 border-2 border-gray-900 text-gray-900 hover:bg-gray-50 hover:text-gray-900 focus:ring-gray-900 text-xs md:text-sm px-1 md:px-2"
                        onClick={() => handleEdit(dish)}
                      >
                        <span className="hidden sm:inline">Edit Item</span>
                        <span className="sm:hidden">Edit</span>
                      </Button>
                      <button
                        onClick={() => setDeleteConfirm(dish.id)}
                        className="p-1.5 md:p-2 bg-red-50 border-2 border-red-500 hover:bg-red-100 rounded-lg transition-colors shrink-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center"
                        aria-label="Delete item"
                      >
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-700">No dishes found. Create your first dish to get started.</p>
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateFormData({
            name: '',
            cuisine_type_id: '',
            category_id: '',
            sub_category_id: '',
            price: 0,
            currency: 'AED',
            is_active: true,
          });
          setSelectedImage(null);
          setImagePreview('/default_dish.jpg');
          setSelectedFreeForms([]);
          setSubCategories([{ value: '', label: 'Select Sub-Category' }]);
          setSelectedCategoryHasSubCategories(true);
          setLoadingSubCategories(false);
          setCreateFormErrors({});
        }}
        title="Create a Item"
        size="lg"
      >
        {createFormErrors.general && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {createFormErrors.general}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side - Image Upload */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 aspect-square bg-gray-50">
              <img
                src={imagePreview}
                alt="Dish Preview"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            <label className="flex items-center justify-center w-full px-4 py-2 bg-[#268700] text-white rounded-lg cursor-pointer hover:bg-[#1f6b00] transition-colors">
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
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Right Side - Form Fields */}
          <div className="space-y-4">
            <Input
              label="Name of the Dish"
              value={createFormData.name}
              onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
              placeholder="Enter Name"
            />
            <Select
              label="Cuisine Type"
              options={cuisineTypes}
              value={createFormData.cuisine_type_id}
              onChange={(e) => setCreateFormData({ ...createFormData, cuisine_type_id: e.target.value })}
              placeholder="Select Cuisine Type"
            />
            <Select
              label="Category"
              options={categories}
              value={createFormData.category_id}
              onChange={(e) => {
                setCreateFormData({
                  ...createFormData,
                  category_id: e.target.value,
                  sub_category_id: '', // Reset subcategory when category changes
                });
              }}
              placeholder="Select Category"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Form
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {freeForms.map((freeForm) => (
                  <label
                    key={freeForm.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
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
                  <p className="text-sm text-gray-600 col-span-2">No free forms available</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub-Category
                {!selectedCategoryHasSubCategories && (
                  <span className="ml-2 text-xs text-gray-600 font-normal">
                    (Optional - This category has no subcategories)
                  </span>
                )}
              </label>
              {loadingSubCategories ? (
                <div className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#268700]"></div>
                  <span className="text-sm text-gray-700">Loading subcategories...</span>
                </div>
              ) : (
                <Select
                  options={subCategories}
                  value={createFormData.sub_category_id || ''}
                  onChange={(e) => setCreateFormData({ ...createFormData, sub_category_id: e.target.value })}
                  placeholder={selectedCategoryHasSubCategories ? "Select Sub-Category" : "No subcategories"}
                  disabled={!createFormData.category_id || !selectedCategoryHasSubCategories}
                />
              )}
              {!createFormData.category_id && (
                <p className="mt-1 text-xs text-gray-600">Please select a category first</p>
              )}
              {createFormData.category_id && !selectedCategoryHasSubCategories && (
                <p className="mt-1 text-xs text-blue-600">
                  This category doesn't have subcategories. You can proceed without selecting one.
                </p>
              )}
            </div>
            <Input
              label="Quantity (gm)"
              type="number"
              value={formData.quantity_in_gm || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity_in_gm: e.target.value || undefined, // ✅ STRING
                })
              }
              placeholder="Enter Quantity in gm"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700">AED</span>
                <input
                  type="number"
                  step="0.01"
                  value={createFormData.price || ''}
                  onChange={(e) => setCreateFormData({ ...createFormData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter Price"
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#268700]"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setIsCreateModalOpen(false);
              setCreateFormData({
                name: '',
                cuisine_type_id: '',
                category_id: '',
                sub_category_id: '',
                price: 0,
                currency: 'AED',
                is_active: true,
              });
              setSelectedImage(null);
              setImagePreview('/default_dish.jpg');
              setSelectedFreeForms([]);
              setSubCategories([{ value: '', label: 'Select Sub-Category' }]);
              setSelectedCategoryHasSubCategories(true);
              setLoadingSubCategories(false);
              setCreateFormErrors({});
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleCreate}
            isLoading={isCreating}
          >
            Upload
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDish(null);
          setFormData({});
        }}
        title="Edit Item"
        size="md"
      >
        {formErrors.general && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {formErrors.general}
          </div>
        )}
        <div className="space-y-4">
          <Input
            label="Name of the Dish"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter Name"
          />
          <Input
            label="Price"
            type="number"
            step="0.01"
            value={formData.price?.toString() || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            placeholder="Enter Price"
          />
          <Input
            label="Quantity (gm)"
            type="number"
            value={formData.quantity_in_gm || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity_in_gm: e.target.value || undefined, // ✅ STRING
              })
            }
            placeholder="Enter Quantity in gm"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active ?? true}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-[#268700] border-gray-300 rounded focus:ring-[#268700]"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Available
            </label>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setIsEditModalOpen(false);
              setEditingDish(null);
              setFormData({});
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleUpdate}
            isLoading={isSubmitting}
          >
            Update
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
        size="sm"
      >
        <p className="text-gray-800 mb-6">
          Are you sure you want to delete this dish? This action cannot be undone.
        </p>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setDeleteConfirm(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}


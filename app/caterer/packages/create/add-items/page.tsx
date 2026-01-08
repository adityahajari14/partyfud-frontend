'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { catererApi, Dish } from '@/lib/api/caterer.api';

export default function AddPackageItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const peopleCount = parseInt(searchParams.get('people_count') || '0');

  const [dishesByCategory, setDishesByCategory] = useState<Array<{
    category: { id: string; name: string; description?: string | null };
    dishes: Dish[];
  }>>([]);
  const [loadingDishes, setLoadingDishes] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [createItemFormData, setCreateItemFormData] = useState({
    people_count: peopleCount || 0,
    quantity: '1',
  });
  const [createItemErrors, setCreateItemErrors] = useState<Record<string, string>>({});
  const [isCreatingItem, setIsCreatingItem] = useState(false);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    setLoadingDishes(true);
    try {
      const response = await (catererApi as any).getAllDishes({ group_by_category: true });
      if (response.data) {
        const data = response.data as any;
        const responseData = data.data || data;
        
        if (responseData.categories && Array.isArray(responseData.categories)) {
          setDishesByCategory(responseData.categories);
        } else {
          const dishesList = Array.isArray(data) ? data : (data.data || []);
          setDishesByCategory([{
            category: { id: 'all', name: 'All Dishes', description: null },
            dishes: dishesList
          }]);
        }
      }
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setDishesByCategory([]);
    } finally {
      setLoadingDishes(false);
    }
  };

  const handleCreatePackageItems = async () => {
    setIsCreatingItem(true);
    setCreateItemErrors({});

    // Validation
    if (selectedDishes.size === 0) {
      setCreateItemErrors({ dish_id: 'Please select at least one dish' });
      setIsCreatingItem(false);
      return;
    }
    if (!createItemFormData.people_count || createItemFormData.people_count <= 0) {
      setCreateItemErrors({ people_count: 'People count must be greater than 0' });
      setIsCreatingItem(false);
      return;
    }

    try {
      // Create package items for all selected dishes
      const promises = Array.from(selectedDishes).map(dishId => {
        const dish = dishesByCategory
          .flatMap(cat => cat.dishes)
          .find(d => d.id === dishId);
        
        return (catererApi as any).createPackageItem({
          dish_id: dishId,
          people_count: createItemFormData.people_count,
          quantity: createItemFormData.quantity,
          price_at_time: dish?.price || undefined,
          is_optional: false,
          is_addon: false,
        });
      });

      const responses = await Promise.all(promises);
      
      // Check if any failed
      const failed = responses.find(r => r.error);
      if (failed) {
        setCreateItemErrors({ general: failed.error });
        setIsCreatingItem(false);
        return;
      }

      // Success - navigate back to create package page
      router.push('/caterer/packages/create');
    } catch (error) {
      setCreateItemErrors({ general: 'Failed to create package items' });
    } finally {
      setIsCreatingItem(false);
    }
  };

  const handleCancel = () => {
    router.push('/caterer/packages/create');
  };

  // Filter dishes based on search query
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) return dishesByCategory;
    
    const query = searchQuery.toLowerCase();
    return dishesByCategory
      .map(categoryGroup => ({
        ...categoryGroup,
        dishes: categoryGroup.dishes.filter(dish =>
          dish.name.toLowerCase().includes(query)
        )
      }))
      .filter(categoryGroup => categoryGroup.dishes.length > 0);
  };

  const filteredCategories = getFilteredCategories();
  const totalDishes = dishesByCategory.reduce((sum, cat) => sum + cat.dishes.length, 0);

  return (
    <>
      <Header onAddClick={() => {}} showAddButton={false} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                title="Back to package creation"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Select Dishes</h1>
                <p className="text-gray-600 mt-1">Choose dishes to add to your package</p>
              </div>
            </div>
          </div>

          {createItemErrors.general && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {createItemErrors.general}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Dishes List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Search and Stats Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search dishes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#268700] focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2.5 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    <span className="font-medium">{totalDishes}</span> dishes available
                  </div>
                </div>
              </div>

              {/* Dishes List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {loadingDishes ? (
                  <div className="flex flex-col justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700] mb-4"></div>
                    <span className="text-gray-600 font-medium">Loading delicious dishes...</span>
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 font-medium">No dishes found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
                  </div>
                ) : (
                  <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
                    <div className="p-4 space-y-6">
                      {filteredCategories.map((categoryGroup) => (
                        <div key={categoryGroup.category.id} className="space-y-3">
                          {/* Category Header */}
                          <div className="sticky top-0 bg-white z-10 pb-3 border-b-2 border-gray-200">
                            <div className="flex items-baseline gap-3">
                              <h3 className="text-lg font-bold text-gray-900">
                                {categoryGroup.category.name}
                              </h3>
                              <span className="text-sm text-gray-500 font-medium">
                                {categoryGroup.dishes.length} {categoryGroup.dishes.length === 1 ? 'dish' : 'dishes'}
                              </span>
                            </div>
                            {categoryGroup.category.description && (
                              <p className="text-sm text-gray-500 italic mt-1">
                                {categoryGroup.category.description}
                              </p>
                            )}
                          </div>
                          
                          {/* Dishes Grid */}
                          {categoryGroup.dishes.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                              <p className="text-sm text-gray-400">No dishes in this category</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-3">
                              {categoryGroup.dishes.map((dish) => {
                                const isSelected = selectedDishes.has(dish.id);
                                return (
                                  <label
                                    key={dish.id}
                                    className={`group relative flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                      isSelected
                                        ? 'border-[#268700] bg-[#f0f9ed] shadow-md scale-[1.02]'
                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                                  >
                                    <div className="flex-shrink-0">
                                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                        isSelected 
                                          ? 'bg-[#268700] border-[#268700]' 
                                          : 'border-gray-300 group-hover:border-gray-400'
                                      }`}>
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={(e) => {
                                            const newSelected = new Set(selectedDishes);
                                            if (e.target.checked) {
                                              newSelected.add(dish.id);
                                            } else {
                                              newSelected.delete(dish.id);
                                            }
                                            setSelectedDishes(newSelected);
                                          }}
                                          className="sr-only"
                                        />
                                        {isSelected && (
                                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-gray-900 text-base truncate">
                                        {dish.name}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="inline-flex items-center text-sm font-medium text-[#268700]">
                                          <img src="/dirham.svg" alt="Dirham" className="w-4 h-4 mr-1" />
                                          {typeof dish.price === 'number' ? dish.price.toFixed(2) : parseFloat(String(dish.price || '0')).toFixed(2)}
                                          <span className="text-gray-500 font-normal ml-1">/person</span>
                                        </span>
                                      </div>
                                    </div>

                                    {isSelected && (
                                      <div className="flex-shrink-0">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#268700] text-white">
                                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                          Selected
                                        </span>
                                      </div>
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Selection Summary & Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                {/* Selection Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#268700] to-[#1e6b00] px-6 py-4">
                    <h3 className="text-white font-bold text-lg">Selection Summary</h3>
                  </div>
                  <div className="p-6">
                    {selectedDishes.size === 0 ? (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-gray-500 text-sm font-medium">No dishes selected</p>
                        <p className="text-gray-400 text-xs mt-1">Select dishes from the list</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Total Selected:</span>
                            <span className="text-2xl font-bold text-blue-600">{selectedDishes.size}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {selectedDishes.size === 1 ? 'dish' : 'dishes'} will be added
                          </p>
                        </div>

                        {createItemErrors.dish_id && (
                          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                            {createItemErrors.dish_id}
                          </p>
                        )}

                        {/* Form Fields */}
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              People Count *
                            </label>
                            <div className="relative">
                              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <Input
                                type="number"
                                min="1"
                                value={createItemFormData.people_count?.toString() || ''}
                                onChange={(e) => setCreateItemFormData({
                                  ...createItemFormData,
                                  people_count: parseInt(e.target.value) || 0,
                                })}
                                placeholder="e.g., 50"
                                className="pl-10"
                              />
                            </div>
                            {createItemErrors.people_count && (
                              <p className="mt-1.5 text-sm text-red-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {createItemErrors.people_count}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Quantity per Person *
                            </label>
                            <div className="relative">
                              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                              </svg>
                              <Input
                                type="number"
                                min="1"
                                value={createItemFormData.quantity}
                                onChange={(e) =>
                                  setCreateItemFormData({
                                    ...createItemFormData,
                                    quantity: e.target.value,
                                  })
                                }
                                placeholder="e.g., 1"
                                className="pl-10"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
                  <Button
                    onClick={handleCreatePackageItems}
                    variant="primary"
                    disabled={isCreatingItem || selectedDishes.size === 0}
                    className="w-full py-3 text-base font-semibold"
                  >
                    {isCreatingItem ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding Items...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add {selectedDishes.size > 0 ? `${selectedDishes.size} ${selectedDishes.size === 1 ? 'Item' : 'Items'}` : 'Items'}
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                    disabled={isCreatingItem}
                    className="w-full py-3 text-base font-medium"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { adminApi } from '@/lib/api/admin.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';

type EntityType = 'cuisine' | 'category' | 'subcategory' | 'certification' | 'occasion' | 'freeform';

interface BaseEntity {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface CuisineType extends BaseEntity {}
interface Category extends BaseEntity {
  subCategories?: SubCategory[];
}
interface SubCategory extends BaseEntity {
  category_id: string;
  category?: { id: string; name: string };
}
interface Certification extends BaseEntity {}
interface Occasion extends BaseEntity {
  image_url?: string | null;
}
interface FreeForm extends BaseEntity {}

export default function MetadataManagementPage() {
  const [activeTab, setActiveTab] = useState<EntityType>('cuisine');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Data states
  const [cuisines, setCuisines] = useState<CuisineType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [freeforms, setFreeforms] = useState<FreeForm[]>([]);

  useEffect(() => {
    fetchData();
    // Load categories when subcategory tab is active
    if (activeTab === 'subcategory') {
      loadCategories();
    }
  }, [activeTab]);

  const loadCategories = async () => {
    try {
      const categoryRes = await adminApi.getCategories();
      if (categoryRes.data?.data) {
        setCategories(categoryRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'cuisine':
          const cuisineRes = await adminApi.getCuisineTypes();
          if (cuisineRes.data?.data) {
            setCuisines(cuisineRes.data.data);
          }
          break;
        case 'category':
          const categoryRes = await adminApi.getCategories();
          if (categoryRes.data?.data) {
            setCategories(categoryRes.data.data);
          }
          break;
        case 'subcategory':
          const subcategoryRes = await adminApi.getSubCategories();
          if (subcategoryRes.data?.data) {
            setSubcategories(subcategoryRes.data.data);
          }
          break;
        case 'certification':
          const certRes = await adminApi.getCertifications();
          if (certRes.data?.data) {
            setCertifications(certRes.data.data);
          }
          break;
        case 'occasion':
          const occasionRes = await adminApi.getOccasions();
          if (occasionRes.data?.data) {
            setOccasions(occasionRes.data.data);
          }
          break;
        case 'freeform':
          const freeformRes = await adminApi.getFreeForms();
          if (freeformRes.data?.data) {
            setFreeforms(freeformRes.data.data);
          }
          break;
      }
    } catch (error: any) {
      showToast('Failed to fetch data: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      ...(activeTab === 'subcategory' && { category_id: item.category_id || '' }),
      ...(activeTab === 'occasion' && { image_url: item.image_url || '' }),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      switch (activeTab) {
        case 'cuisine':
          await adminApi.deleteCuisineType(id);
          break;
        case 'category':
          await adminApi.deleteCategory(id);
          break;
        case 'subcategory':
          await adminApi.deleteSubCategory(id);
          break;
        case 'certification':
          await adminApi.deleteCertification(id);
          break;
        case 'occasion':
          await adminApi.deleteOccasion(id);
          break;
        case 'freeform':
          await adminApi.deleteFreeForm(id);
          break;
      }
      showToast('Item deleted successfully', 'success');
      fetchData();
    } catch (error: any) {
      showToast('Failed to delete: ' + (error.message || 'Unknown error'), 'error');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      showToast('Name is required', 'error');
      return;
    }

    if (activeTab === 'subcategory' && !formData.category_id) {
      showToast('Category is required for subcategory', 'error');
      return;
    }

    try {
      if (editingItem) {
        // Update
        switch (activeTab) {
          case 'cuisine':
            await adminApi.updateCuisineType(editingItem.id, formData);
            break;
          case 'category':
            await adminApi.updateCategory(editingItem.id, formData);
            break;
          case 'subcategory':
            await adminApi.updateSubCategory(editingItem.id, formData);
            break;
          case 'certification':
            await adminApi.updateCertification(editingItem.id, formData);
            break;
          case 'occasion':
            await adminApi.updateOccasion(editingItem.id, formData);
            break;
          case 'freeform':
            await adminApi.updateFreeForm(editingItem.id, formData);
            break;
        }
        showToast('Item updated successfully', 'success');
      } else {
        // Create
        switch (activeTab) {
          case 'cuisine':
            await adminApi.createCuisineType(formData);
            break;
          case 'category':
            await adminApi.createCategory(formData);
            break;
          case 'subcategory':
            await adminApi.createSubCategory(formData);
            break;
          case 'certification':
            await adminApi.createCertification(formData);
            break;
          case 'occasion':
            await adminApi.createOccasion(formData);
            break;
          case 'freeform':
            await adminApi.createFreeForm(formData);
            break;
        }
        showToast('Item created successfully', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      showToast('Failed to save: ' + (error.message || 'Unknown error'), 'error');
    }
  };

  const renderTable = () => {
    const getData = () => {
      switch (activeTab) {
        case 'cuisine':
          return cuisines;
        case 'category':
          return categories;
        case 'subcategory':
          return subcategories;
        case 'certification':
          return certifications;
        case 'occasion':
          return occasions;
        case 'freeform':
          return freeforms;
        default:
          return [];
      }
    };

    const data = getData();

    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#268700]"></div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          No items found. Click "Add New" to create one.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
              {activeTab === 'subcategory' && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              )}
              {activeTab === 'occasion' && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Image URL</th>
              )}
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.description || <span className="text-gray-400">—</span>}
                </td>
                {activeTab === 'subcategory' && (
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.category?.name || '—'}
                  </td>
                )}
                {activeTab === 'occasion' && (
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.image_url ? (
                      <a href={item.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-xs block">
                        {item.image_url}
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const tabs = [
    { id: 'cuisine' as EntityType, label: 'Cuisine Types' },
    { id: 'category' as EntityType, label: 'Categories' },
    { id: 'subcategory' as EntityType, label: 'Sub Categories' },
    { id: 'certification' as EntityType, label: 'Certifications' },
    { id: 'occasion' as EntityType, label: 'Occasions' },
    { id: 'freeform' as EntityType, label: 'Free Forms' },
  ];

  return (
    <>
      <Header showAddButton={false} />
      <main className="flex-1 p-6 pt-24 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Metadata Management</h1>
            <p className="text-gray-600">Manage cuisines, categories, certifications, occasions, and other metadata</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                      activeTab === tab.id
                        ? 'border-[#268700] text-[#268700]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <Button onClick={handleCreate} className="bg-[#268700] hover:bg-[#1f6b00]">
                Add New
              </Button>
            </div>

            {renderTable()}
          </div>
        </div>
      </main>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? `Edit ${tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}` : `Add New ${tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter name"
            />
          </div>

          {activeTab === 'subcategory' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#268700] focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#268700] focus:border-transparent"
            />
          </div>

          {activeTab === 'occasion' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <Input
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="Enter image URL (optional)"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={() => setShowModal(false)}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-[#268700] hover:bg-[#1f6b00]">
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

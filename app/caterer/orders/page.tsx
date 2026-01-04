'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { catererApi } from '@/lib/api/caterer.api';
import { Eye, ShoppingBag, Calendar, MapPin, Users, DollarSign, User, X, CheckCircle, Phone, Mail } from 'lucide-react';

interface OrderItem {
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
    package_items?: Array<{
      id: string;
      dish: {
        id: string;
        name: string;
        image_url?: string | null;
        price: number;
        currency: string;
        category: {
          id: string;
          name: string;
        };
        cuisine_type: {
          id: string;
          name: string;
        };
      };
      quantity: number;
      is_optional: boolean;
      is_addon: boolean;
      people_count: number;
    }>;
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
}

interface Order {
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
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export default function CatererOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await catererApi.getOrders();
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // API returns { success: true, data: [...], count: ... }
        const apiResponse = response.data as any;
        if (apiResponse.success && apiResponse.data) {
          setOrders(apiResponse.data);
        } else if (Array.isArray(apiResponse)) {
          setOrders(apiResponse);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const response = await catererApi.getOrderById(orderId);
      
      if (response.error) {
        setMessage({ type: 'error', text: response.error });
      } else if (response.data) {
        // API returns { success: true, data: {...} }
        const apiResponse = response.data as any;
        const orderData = apiResponse.success ? apiResponse.data : apiResponse;
        setSelectedOrder(orderData);
        setShowOrderDetails(true);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setMessage({ type: 'error', text: 'Failed to load order details' });
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change the order status to ${newStatus.replace(/_/g, ' ')}?`)) {
      return;
    }

    setUpdatingStatus(orderId);
    setMessage(null);
    try {
      const response = await catererApi.updateOrderStatus(orderId, newStatus);
      
      if (response.error) {
        setMessage({ type: 'error', text: response.error });
      } else if (response.data) {
        // API returns { success: true, data: {...} }
        const apiResponse = response.data as any;
        const orderData = apiResponse.success ? apiResponse.data : apiResponse;
        
        // Update the order in the list
        setOrders(orders.map(o => 
          o.id === orderId ? orderData : o
        ));
        // Update selected order if it's the one being updated
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(orderData);
        }
        setMessage({ type: 'success', text: 'Order status updated successfully' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setMessage({ type: 'error', text: 'Failed to update order status' });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Not specified';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PAID':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'PREPARING':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'OUT_FOR_DELIVERY':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING':
        return [
          { value: 'CONFIRMED', label: 'Confirm Order' },
          { value: 'CANCELLED', label: 'Cancel Order' },
        ];
      case 'CONFIRMED':
        return [
          { value: 'PAID', label: 'Mark as Paid' },
          { value: 'PREPARING', label: 'Start Preparing' },
          { value: 'CANCELLED', label: 'Cancel Order' },
        ];
      case 'PAID':
        return [
          { value: 'PREPARING', label: 'Start Preparing' },
        ];
      case 'PREPARING':
        return [
          { value: 'OUT_FOR_DELIVERY', label: 'Mark Out for Delivery' },
        ];
      case 'OUT_FOR_DELIVERY':
        return [
          { value: 'DELIVERED', label: 'Mark as Delivered' },
        ];
      default:
        return [];
    }
  };

  const canUpdateStatus = (status: string) => {
    return status !== 'DELIVERED' && status !== 'CANCELLED';
  };

  const filteredOrders = statusFilter === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PAID', label: 'Paid' },
    { value: 'PREPARING', label: 'Preparing' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  // Calculate total revenue from items in filtered orders
  const totalRevenue = filteredOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.price_at_time, 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-[#268700] text-white px-6 py-2 rounded-full hover:bg-[#1f6b00] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600 mb-4">
            {filteredOrders.length === 0 
              ? 'No orders found' 
              : `${filteredOrders.length} ${filteredOrders.length === 1 ? 'order' : 'orders'} found`}
          </p>
          
          {/* Status Filter and Stats */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#268700]"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {totalRevenue > 0 && (
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Total Revenue: </span>
                <span className="text-[#268700] font-bold">AED {totalRevenue.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-600">Orders from customers will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const nextStatusOptions = getNextStatusOptions(order.status);
              const orderTotal = order.items.reduce((sum, item) => sum + item.price_at_time, 0);
              
              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.id.slice(0, 8)}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User size={16} />
                            <span>{order.user.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>{formatDate(order.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={16} />
                            <span className="font-semibold">AED {orderTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {nextStatusOptions.length > 0 && canUpdateStatus(order.status) && (
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleUpdateStatus(order.id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            disabled={updatingStatus === order.id}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#268700] disabled:opacity-50"
                          >
                            <option value="">Update Status</option>
                            {nextStatusOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          onClick={() => handleViewOrder(order.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#268700] text-white rounded-lg hover:bg-[#1f6b00] transition"
                        >
                          <Eye size={18} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          {item.package.cover_image_url && (
                            <Image
                              src={item.package.cover_image_url}
                              alt={item.package.name}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{item.package.name}</h4>
                            <p className="text-sm text-gray-600">{item.package.package_type.name}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                              {item.guests && (
                                <span className="flex items-center gap-1">
                                  <Users size={12} />
                                  {item.guests} guests
                                </span>
                              )}
                              {item.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} />
                                  {item.location}
                                </span>
                              )}
                              {item.date && (
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {formatDate(item.date)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">AED {item.price_at_time.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred Background */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-md"
            onClick={() => setShowOrderDetails(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowOrderDetails(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <div className="p-8">
              {/* Header */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order #{selectedOrder.id.slice(0, 8)}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <p className="text-gray-600">Placed on {formatDate(selectedOrder.created_at)}</p>
              </div>

              {/* Customer Contact Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{selectedOrder.user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedOrder.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{selectedOrder.user.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-6">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Package Header */}
                      <div className="flex items-start gap-4 p-4 bg-gray-50">
                        {item.package.cover_image_url && (
                          <Image
                            src={item.package.cover_image_url}
                            alt={item.package.name}
                            width={100}
                            height={100}
                            className="rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{item.package.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{item.package.package_type.name}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500">
                            {item.guests && (
                              <div>
                                <p className="font-medium">Guests</p>
                                <p>{item.guests}</p>
                              </div>
                            )}
                            {item.location && (
                              <div>
                                <p className="font-medium">Location</p>
                                <p>{item.location}</p>
                              </div>
                            )}
                            {item.date && (
                              <div>
                                <p className="font-medium">Date</p>
                                <p>{formatDate(item.date)}</p>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">Price</p>
                              <p className="text-[#268700] font-semibold">AED {item.price_at_time.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dishes in Package */}
                      {item.package.package_items && item.package.package_items.length > 0 && (
                        <div className="p-4 bg-white">
                          <h5 className="text-sm font-semibold text-gray-700 mb-3">Dishes in Package:</h5>
                          <div className="space-y-3">
                            {item.package.package_items.map((packageItem) => (
                              <div key={packageItem.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                {packageItem.dish.image_url && (
                                  <Image
                                    src={packageItem.dish.image_url}
                                    alt={packageItem.dish.name}
                                    width={60}
                                    height={60}
                                    className="rounded-lg object-cover"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h6 className="font-medium text-gray-900">{packageItem.dish.name}</h6>
                                    {packageItem.is_optional && (
                                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full border border-yellow-300">
                                        Optional
                                      </span>
                                    )}
                                    {packageItem.is_addon && (
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-300">
                                        Add-on
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                                    <span>{packageItem.dish.category.name}</span>
                                    <span>•</span>
                                    <span>{packageItem.dish.cuisine_type.name}</span>
                                    {packageItem.quantity > 1 && (
                                      <>
                                        <span>•</span>
                                        <span>Qty: {packageItem.quantity}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">
                                    AED {packageItem.dish.price.toLocaleString()}
                                  </p>
                                  {packageItem.quantity > 1 && (
                                    <p className="text-xs text-gray-500">
                                      × {packageItem.quantity}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update Section */}
              {getNextStatusOptions(selectedOrder.status).length > 0 && canUpdateStatus(selectedOrder.status) && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Update Order Status</p>
                  <div className="flex flex-wrap gap-2">
                    {getNextStatusOptions(selectedOrder.status).map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleUpdateStatus(selectedOrder.id, option.value)}
                        disabled={updatingStatus === selectedOrder.id}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-[#268700]">
                    AED {selectedOrder.items.reduce((sum, item) => sum + item.price_at_time, 0).toLocaleString()}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Order Placed</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedOrder.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

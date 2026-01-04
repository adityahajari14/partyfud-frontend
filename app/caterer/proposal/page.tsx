'use client';

import { useState, useEffect } from 'react';
import { catererApi } from '@/lib/api/caterer.api';
import { Eye, Calendar, MapPin, Users, DollarSign, FileText, User, X, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Proposal {
  id: string;
  user_id: string;
  caterer_id: string;
  status: 'PENDING' | 'PROCESSING' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
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
}

export default function CatererProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await catererApi.getProposals();
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // API returns { success: true, data: [...], count: ... }
        const apiResponse = response.data as any;
        if (apiResponse.success && apiResponse.data) {
          setProposals(apiResponse.data);
        } else if (Array.isArray(apiResponse)) {
          setProposals(apiResponse);
        }
      }
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowDetails(true);
  };

  const handleUpdateStatus = async (proposalId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change the status to ${newStatus}?`)) {
      return;
    }

    setUpdatingStatus(proposalId);
    try {
      const response = await catererApi.updateProposalStatus(proposalId, newStatus);
      
      if (response.error) {
        alert(response.error);
      } else if (response.data) {
        // API returns { success: true, data: {...} }
        const apiResponse = response.data as any;
        const proposalData = apiResponse.success ? apiResponse.data : apiResponse;
        
        // Update the proposal in the list
        setProposals(proposals.map(p => 
          p.id === proposalId ? proposalData : p
        ));
        // Update selected proposal if it's the one being updated
        if (selectedProposal?.id === proposalId) {
          setSelectedProposal(proposalData);
        }
        alert('Status updated successfully');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Not specified';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'QUOTED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'EXPIRED':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredProposals = statusFilter === 'ALL' 
    ? proposals 
    : proposals.filter(p => p.status === statusFilter);

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'QUOTED', label: 'Quoted' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'EXPIRED', label: 'Expired' },
  ];

  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING':
        return [
          { value: 'PROCESSING', label: 'Mark as Processing' },
          { value: 'REJECTED', label: 'Reject' },
        ];
      case 'PROCESSING':
        return [
          { value: 'QUOTED', label: 'Mark as Quoted' },
          { value: 'REJECTED', label: 'Reject' },
        ];
      case 'QUOTED':
        return [
          { value: 'ACCEPTED', label: 'Mark as Accepted' },
          { value: 'REJECTED', label: 'Reject' },
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposals...</p>
        </div>
      </div>
    );
  }

  if (error && proposals.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProposals}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Proposal Management</h1>
          <p className="text-gray-600 mb-4">
            {filteredProposals.length === 0 
              ? 'No proposals found' 
              : `${filteredProposals.length} ${filteredProposals.length === 1 ? 'proposal' : 'proposals'} found`}
          </p>
          
          {/* Status Filter */}
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
        </div>

        {filteredProposals.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No proposals found</h2>
            <p className="text-gray-600">Proposals from customers will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredProposals.map((proposal) => {
              const nextStatusOptions = getNextStatusOptions(proposal.status);
              return (
                <div
                  key={proposal.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Proposal Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {proposal.event_type || 'Custom Event'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(proposal.status)}`}>
                            {getStatusLabel(proposal.status)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User size={16} />
                            <span>{proposal.user.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>{formatDate(proposal.event_date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={16} />
                            <span>{proposal.guest_count} guests</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {nextStatusOptions.length > 0 && (
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleUpdateStatus(proposal.id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            disabled={updatingStatus === proposal.id}
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
                          onClick={() => handleViewProposal(proposal)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#268700] text-white rounded-lg hover:bg-[#1f6b00] transition"
                        >
                          <Eye size={18} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Proposal Summary */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {proposal.location && (
                        <div className="flex items-start gap-2">
                          <MapPin size={18} className="text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="text-sm font-medium text-gray-900">{proposal.location}</p>
                          </div>
                        </div>
                      )}
                      {proposal.budget_per_person && (
                        <div className="flex items-start gap-2">
                          <DollarSign size={18} className="text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Budget per Person</p>
                            <p className="text-sm font-medium text-gray-900">AED {proposal.budget_per_person}</p>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500">Submitted</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(proposal.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Proposal Details Modal */}
      {showDetails && selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred Background */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-md"
            onClick={() => setShowDetails(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowDetails(false)}
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
                    {selectedProposal.event_type || 'Custom Event Proposal'}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedProposal.status)}`}>
                    {getStatusLabel(selectedProposal.status)}
                  </span>
                </div>
                <p className="text-gray-600">Customer: <span className="font-medium">{selectedProposal.user.name}</span></p>
              </div>

              {/* Customer Contact Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{selectedProposal.user.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{selectedProposal.user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{selectedProposal.user.phone}</p>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Event Date</p>
                  <p className="text-base font-medium text-gray-900">{formatDate(selectedProposal.event_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Guest Count</p>
                  <p className="text-base font-medium text-gray-900">{selectedProposal.guest_count} guests</p>
                </div>
                {selectedProposal.location && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="text-base font-medium text-gray-900">{selectedProposal.location}</p>
                  </div>
                )}
                {selectedProposal.budget_per_person && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Budget per Person</p>
                    <p className="text-base font-medium text-gray-900">AED {selectedProposal.budget_per_person}</p>
                  </div>
                )}
              </div>

              {/* Dietary Preferences */}
              {selectedProposal.dietary_preferences && selectedProposal.dietary_preferences.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Dietary Preferences</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProposal.dietary_preferences.map((pref, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm border border-green-300"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Vision/Description */}
              {selectedProposal.vision && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Event Vision</p>
                  <p className="text-base text-gray-900 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {selectedProposal.vision}
                  </p>
                </div>
              )}

              {/* Status Update Section */}
              {getNextStatusOptions(selectedProposal.status).length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {getNextStatusOptions(selectedProposal.status).map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleUpdateStatus(selectedProposal.id, option.value)}
                        disabled={updatingStatus === selectedProposal.id}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Submitted</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedProposal.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedProposal.updated_at)}</p>
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


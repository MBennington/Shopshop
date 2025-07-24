'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FiUser,
  FiShoppingBag,
  FiMapPin,
  FiEdit2,
  FiSettings,
  FiBell,
  FiLock,
  FiUserCheck,
  FiCamera,
  FiX,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  businessName?: string;
  phone?: string;
  businessType?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, updateUser, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Auto-dismiss success/error messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const settings = {
    emailNotifications: true,
    orderUpdates: true,
    marketingEmails: false,
    twoFactorAuth: false,
    showProfile: true,
    showOrders: true,
    language: 'English',
    currency: 'USD',
  };

  // Set loading to false when user is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
      });
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setProfilePicture(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError('');
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      setFormErrors({});

      // Validate form before submission
      if (!validateForm()) {
        setSaving(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      const formDataToSend = new FormData();

      // Add form fields
      formDataToSend.append('name', formData.name);

      // Add profile picture if selected
      if (profilePicture) {
        formDataToSend.append('profilePicture', profilePicture);
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      updateUser(data.data);
      removeProfilePicture();

      setFormData({
        name: data.data.name || '',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = () => {
    // Here you would typically make an API call to update the user's settings
    console.log('Saving settings:', settings);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#397fc5] mx-auto"></div>
          <p className="mt-4 text-[#6a7581]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6a7581]">Please log in to view your profile</p>
          <button
            onClick={() => router.push('/auth')}
            className="mt-4 px-4 py-2 bg-[#397fc5] text-white rounded-lg hover:bg-[#2c5f94] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const currentProfilePicture =
    previewUrl ||
    user.profilePicture ||
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80';

  return (
    <div className="min-h-screen bg-[#f7f8fa] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-[#dde0e3] overflow-hidden">
          {/* Profile Header */}
          <div className="p-8 border-b border-[#dde0e3]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={currentProfilePicture}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#121416]">
                    {user.name}
                  </h1>
                  <p className="text-[#6a7581]">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'seller'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {user.role === 'seller' ? 'Seller' : 'Buyer'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 border border-[#dde0e3] text-[#6a7581] rounded-lg hover:bg-[#f7f8fa] transition-colors text-sm font-medium"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600"
              >
                <FiX size={16} />
              </button>
            </div>
          )}
          {success && (
            <div className="mx-8 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-green-600 font-medium">{success}</p>
              </div>
              <button
                onClick={() => setSuccess('')}
                className="text-green-400 hover:text-green-600"
              >
                <FiX size={16} />
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#dde0e3] overflow-x-auto">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap ${
                activeTab === 'personal'
                  ? 'text-[#397fc5] border-b-2 border-[#397fc5]'
                  : 'text-[#6a7581] hover:text-[#121416]'
              }`}
            >
              <FiUser size={20} />
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'text-[#397fc5] border-b-2 border-[#397fc5]'
                  : 'text-[#6a7581] hover:text-[#121416]'
              }`}
            >
              <FiShoppingBag size={20} />
              Order History
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap ${
                activeTab === 'addresses'
                  ? 'text-[#397fc5] border-b-2 border-[#397fc5]'
                  : 'text-[#6a7581] hover:text-[#121416]'
              }`}
            >
              <FiMapPin size={20} />
              Saved Addresses
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'text-[#397fc5] border-b-2 border-[#397fc5]'
                  : 'text-[#6a7581] hover:text-[#121416]'
              }`}
            >
              <FiSettings size={20} />
              Settings
            </button>
          </div>

          {/* Content Sections */}
          <div className="p-8">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                {/* Profile Picture Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={currentProfilePicture}
                        alt={user.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-[#dde0e3]"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-[#397fc5] text-white p-1.5 rounded-full hover:bg-[#2c5f94] transition-colors shadow-lg"
                        title="Change profile picture"
                      >
                        <FiCamera size={14} />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#121416]">
                        Profile Picture
                      </h3>
                      <p className="text-sm text-[#6a7581]">
                        Upload a new profile picture
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 text-sm text-[#397fc5] hover:text-[#2c5f94] font-medium"
                      >
                        Choose Image
                      </button>
                    </div>
                  </div>

                  {profilePicture && (
                    <div className="p-4 bg-[#f7f8fa] rounded-lg border border-[#dde0e3]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-[#121416]">
                              New Profile Picture
                            </p>
                            <p className="text-sm text-[#6a7581]">
                              {profilePicture.name}
                            </p>
                            <p className="text-xs text-[#6a7581]">
                              {(profilePicture.size / 1024 / 1024).toFixed(2)}{' '}
                              MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={removeProfilePicture}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                          title="Remove image"
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#6a7581] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent ${
                        formErrors.name
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-[#dde0e3]'
                      }`}
                      required
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="px-6 py-2 bg-[#397fc5] text-white rounded-lg hover:bg-[#2c5f94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <FiShoppingBag className="mx-auto text-[#6a7581]" size={48} />
                  <p className="mt-4 text-[#6a7581]">No orders yet</p>
                  <p className="text-sm text-[#6a7581]">
                    Your order history will appear here
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <FiMapPin className="mx-auto text-[#6a7581]" size={48} />
                  <p className="mt-4 text-[#6a7581]">No saved addresses</p>
                  <p className="text-sm text-[#6a7581]">
                    Add addresses for faster checkout
                  </p>
                </div>
                <button className="w-full p-4 border-2 border-dashed border-[#dde0e3] rounded-lg text-[#6a7581] hover:border-[#397fc5] hover:text-[#397fc5] transition-colors">
                  + Add New Address
                </button>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8">
                {/* Notification Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FiBell className="text-[#397fc5]" size={20} />
                    <h3 className="text-lg font-semibold text-[#121416]">
                      Notification Preferences
                    </h3>
                  </div>
                  <div className="space-y-4 pl-7">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={settings.emailNotifications}
                        className="w-4 h-4 text-[#397fc5] border-[#dde0e3] rounded focus:ring-[#397fc5]"
                      />
                      <span className="text-[#121416]">
                        Email Notifications
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={settings.orderUpdates}
                        className="w-4 h-4 text-[#397fc5] border-[#dde0e3] rounded focus:ring-[#397fc5]"
                      />
                      <span className="text-[#121416]">Order Updates</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={settings.marketingEmails}
                        className="w-4 h-4 text-[#397fc5] border-[#dde0e3] rounded focus:ring-[#397fc5]"
                      />
                      <span className="text-[#121416]">Marketing Emails</span>
                    </label>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FiLock className="text-[#397fc5]" size={20} />
                    <h3 className="text-lg font-semibold text-[#121416]">
                      Privacy Settings
                    </h3>
                  </div>
                  <div className="space-y-4 pl-7">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={settings.twoFactorAuth}
                        className="w-4 h-4 text-[#397fc5] border-[#dde0e3] rounded focus:ring-[#397fc5]"
                      />
                      <span className="text-[#121416]">
                        Two-Factor Authentication
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={settings.showProfile}
                        className="w-4 h-4 text-[#397fc5] border-[#dde0e3] rounded focus:ring-[#397fc5]"
                      />
                      <span className="text-[#121416]">
                        Show Profile to Other Users
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={settings.showOrders}
                        className="w-4 h-4 text-[#397fc5] border-[#dde0e3] rounded focus:ring-[#397fc5]"
                      />
                      <span className="text-[#121416]">Show Order History</span>
                    </label>
                  </div>
                </div>

                {/* Account Preferences */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FiUserCheck className="text-[#397fc5]" size={20} />
                    <h3 className="text-lg font-semibold text-[#121416]">
                      Account Preferences
                    </h3>
                  </div>
                  <div className="space-y-4 pl-7">
                    <div>
                      <label className="block text-sm font-medium text-[#6a7581] mb-2">
                        Language
                      </label>
                      <select
                        defaultValue={settings.language}
                        className="w-full px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#6a7581] mb-2">
                        Currency
                      </label>
                      <select
                        defaultValue={settings.currency}
                        className="w-full px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveSettings}
                    className="px-6 py-2 bg-[#397fc5] text-white rounded-lg hover:bg-[#2c5f94] transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
  profilePicture?: string;
  savedAddresses: {
    label: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  }[];
  notifications?: {
    orderUpdates?: boolean;
    marketingEmails?: boolean;
  };
  privacySettings?: {
    twoFactorAuth?: boolean;
  };
  accountPreferences?: {
    language?: string;
    currency?: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const { user, updateUser, logout } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    _id: '',
    name: '',
    email: '',
    role: 'buyer',
    savedAddresses: [],
    notifications: {
      orderUpdates: true,
      marketingEmails: false,
    },
    privacySettings: {
      twoFactorAuth: false,
    },
    accountPreferences: {
      language: 'en',
      currency: 'LKR',
    },
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [addressErrors, setAddressErrors] = useState<{ [key: string]: string }>(
    {}
  );

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

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setFormData({
        _id: user._id || '',
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'seller',
        savedAddresses:
          user.savedAddresses?.map((addr: any) => ({
            label: addr.label || '',
            address: addr.address || '',
            city: addr.city || '',
            postalCode: addr.postalCode || '',
            country: addr.country || '',
          })) || [],
        notifications: {
          orderUpdates: user.notifications?.orderUpdates ?? true,
          marketingEmails: user.notifications?.marketingEmails ?? false,
        },
        privacySettings: {
          twoFactorAuth: user.privacySettings?.twoFactorAuth ?? false,
        },
        accountPreferences: {
          language: user.accountPreferences?.language || 'en',
          currency: user.accountPreferences?.currency || 'LKR',
        },
      });
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, dataset } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Handle nested address updates (if address index is present)
    if (dataset.addressIndex !== undefined) {
      const index = Number(dataset.addressIndex);
      const field = name;

      setFormData((prev) => {
        const updatedAddresses = [...(prev.savedAddresses || [])];
        updatedAddresses[index] = {
          ...updatedAddresses[index],
          [field]: type === 'checkbox' ? checked : value,
        };
        return { ...prev, savedAddresses: updatedAddresses };
      });
    }

    // Handle notifications (checkboxes or values)
    else if (['orderUpdates', 'marketingEmails'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [name]: type === 'checkbox' ? checked : value,
        },
      }));
    }

    // Handle privacy settings
    else if (['twoFactorAuth'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        privacySettings: {
          ...prev.privacySettings,
          [name]: type === 'checkbox' ? checked : value,
        },
      }));
    }

    // Handle account preferences
    else if (['language', 'currency'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        accountPreferences: {
          ...prev.accountPreferences,
          [name]: value,
        },
      }));
    }

    // Top-level fields like name, email
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear errors if any
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    // Check if it's a privacy setting
    if (['twoFactorAuth'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        privacySettings: {
          ...prev.privacySettings,
          [name]: checked,
        },
      }));
    }
    // Otherwise treat as notification setting
    else if (['orderUpdates', 'marketingEmails'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [name]: checked,
        },
      }));
    }

    // Clear error if exists
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

  const validateAddressForm = () => {
    const errors: { [key: string]: string } = {};

    if (!addressForm.label.trim()) {
      errors.label = 'Label is required';
    }
    if (!addressForm.address.trim()) {
      errors.address = 'Address is required';
    }
    if (!addressForm.city.trim()) {
      errors.city = 'City is required';
    }
    if (!addressForm.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    }
    if (!addressForm.country.trim()) {
      errors.country = 'Country is required';
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAddress = () => {
    setShowAddressForm(true);
    setEditingIndex(null);
    setAddressForm({
      label: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
    });
    setAddressErrors({});
  };

  const handleEditAddress = (index: number) => {
    const address = formData.savedAddresses[index];
    setAddressForm({
      label: address.label,
      address: address.address,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
    });
    setEditingIndex(index);
    setShowAddressForm(true);
    setAddressErrors({});
  };

  const handleDeleteAddress = (index: number) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setFormData((prev) => {
        const newAddresses = prev.savedAddresses.filter((_, i) => i !== index);
        
        // Update user context immediately to prevent re-saving
        if (user) {
          updateUser({
            ...user,
            savedAddresses: newAddresses,
          });
        }
        
        return { ...prev, savedAddresses: newAddresses };
      });
    }
  };

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error if exists
    if (addressErrors[name]) {
      setAddressErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddressFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAddressForm()) {
      return;
    }

    let updatedAddresses;
    
    if (editingIndex !== null) {
      // Update existing address
      setFormData((prev) => {
        const newAddresses = [...prev.savedAddresses];
        newAddresses[editingIndex] = { ...addressForm };
        updatedAddresses = newAddresses;
        return { ...prev, savedAddresses: newAddresses };
      });
    } else {
      // Add new address
      setFormData((prev) => {
        const newAddresses = [...prev.savedAddresses, { ...addressForm }];
        updatedAddresses = newAddresses;
        return { ...prev, savedAddresses: newAddresses };
      });
    }

    // Update user context immediately to prevent re-saving
    if (updatedAddresses && user) {
      updateUser({
        ...user,
        savedAddresses: updatedAddresses,
      });
    }

    // Reset form immediately after adding/editing
    setShowAddressForm(false);
    setEditingIndex(null);
    setAddressForm({
      label: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
    });
    setAddressErrors({});
  };

  const cancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingIndex(null);
    setAddressForm({
      label: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
    });
    setAddressErrors({});
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

  function isChangedNonEmpty(newValue: any, oldValue: any): boolean {
    return newValue !== oldValue && newValue !== '';
  }

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      setFormErrors({});

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

      // Compare and append primitive fields
      if (formData.name !== user?.name) {
        formDataToSend.append('name', formData.name);
      }

      // Handle address changes - send the complete updated address list
      const updatedAddresses = formData.savedAddresses || [];
      const originalAddresses = user?.savedAddresses || [];

      // Check if addresses have changed (length, content, or structure)
      const addressesChanged =
        updatedAddresses.length !== originalAddresses.length ||
        JSON.stringify(updatedAddresses) !== JSON.stringify(originalAddresses);

      if (addressesChanged) {
        formDataToSend.append(
          'savedAddresses',
          JSON.stringify(updatedAddresses)
        );
      }

      // Notifications
      const notificationsDiff: any = {};
      if (
        formData.notifications?.orderUpdates !==
        user?.notifications?.orderUpdates
      ) {
        notificationsDiff.orderUpdates = formData.notifications?.orderUpdates;
      }
      if (
        formData.notifications?.marketingEmails !==
        user?.notifications?.marketingEmails
      ) {
        notificationsDiff.marketingEmails =
          formData.notifications?.marketingEmails;
      }
      if (Object.keys(notificationsDiff).length > 0) {
        formDataToSend.append(
          'notifications',
          JSON.stringify(notificationsDiff)
        );
      }

      // Privacy
      const privacyDiff: any = {};
      if (
        formData.privacySettings?.twoFactorAuth !==
        user?.privacySettings?.twoFactorAuth
      ) {
        privacyDiff.twoFactorAuth = formData.privacySettings?.twoFactorAuth;
      }
      if (Object.keys(privacyDiff).length > 0) {
        formDataToSend.append('privacySettings', JSON.stringify(privacyDiff));
      }

      // Account Preferences
      const prefsDiff: any = {};
      if (
        formData.accountPreferences?.language !==
        user?.accountPreferences?.language
      ) {
        prefsDiff.language = formData.accountPreferences?.language;
      }
      if (
        formData.accountPreferences?.currency !==
        user?.accountPreferences?.currency
      ) {
        prefsDiff.currency = formData.accountPreferences?.currency;
      }
      if (Object.keys(prefsDiff).length > 0) {
        formDataToSend.append('accountPreferences', JSON.stringify(prefsDiff));
      }

      // Profile picture
      if (profilePicture) {
        formDataToSend.append('profilePicture', profilePicture);
      }

      // Only make API call if there are actual changes
      if (formDataToSend.entries().next().done) {
        setSuccess('No changes to save');
        setSaving(false);
        return;
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

      // Update form data with the response data to prevent re-saving
      setFormData((prev) => ({
        ...prev,
        name: data.data.name || prev.name,
        savedAddresses: data.data.savedAddresses || prev.savedAddresses,
        notifications: {
          ...prev.notifications,
          ...data.data.notifications,
        },
        privacySettings: {
          ...prev.privacySettings,
          ...data.data.privacySettings,
        },
        accountPreferences: {
          ...prev.accountPreferences,
          ...data.data.accountPreferences,
        },
      }));

      // Always reset address form state after successful save
      setShowAddressForm(false);
      setEditingIndex(null);
      setAddressForm({
        label: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
      });
      setAddressErrors({});
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
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
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#121416]">
                    Saved Addresses
                  </h3>
                  <button
                    onClick={handleAddAddress}
                    className="flex items-center gap-2 px-4 py-2 bg-[#397fc5] text-white rounded-lg hover:bg-[#2c5f94] transition-colors text-sm font-medium"
                  >
                    <FiPlus size={16} />
                    Add Address
                  </button>
                </div>

                {formData.savedAddresses.length > 0 ? (
                  <div className="space-y-4">
                    {formData.savedAddresses.map((address, index) => (
                      <div
                        key={index}
                        className="border border-[#dde0e3] p-4 rounded-lg shadow-sm bg-white"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-[#121416]">
                              {address.label}
                            </h4>
                            <p className="text-[#6a7581] text-sm mt-1">
                              {address.address}
                            </p>
                            <p className="text-[#6a7581] text-sm">
                              {address.city}, {address.postalCode},{' '}
                              {address.country}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAddress(index)}
                              className="flex items-center gap-1 text-[#397fc5] hover:text-[#2c5f94] text-sm font-medium"
                            >
                              <FiEdit2 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(index)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              <FiTrash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#6a7581]">
                    <FiMapPin className="mx-auto" size={48} />
                    <p className="mt-4 font-medium">No saved addresses</p>
                    <p className="text-sm">Add addresses for faster checkout</p>
                  </div>
                )}

                {showAddressForm && (
                  <div className="border border-[#dde0e3] rounded-lg p-6 bg-[#f7f8fa]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-[#121416]">
                        {editingIndex !== null
                          ? 'Edit Address'
                          : 'Add New Address'}
                      </h4>
                      <button
                        onClick={cancelAddressForm}
                        className="text-[#6a7581] hover:text-[#121416]"
                      >
                        <FiX size={20} />
                      </button>
                    </div>

                    <form
                      onSubmit={handleAddressFormSubmit}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#6a7581] mb-2">
                            Label *
                          </label>
                          <input
                            type="text"
                            name="label"
                            value={addressForm.label}
                            onChange={handleAddressFormChange}
                            placeholder="e.g., Home, Office"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent ${
                              addressErrors.label
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-[#dde0e3]'
                            }`}
                          />
                          {addressErrors.label && (
                            <p className="mt-1 text-sm text-red-600">
                              {addressErrors.label}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#6a7581] mb-2">
                            Address *
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={addressForm.address}
                            onChange={handleAddressFormChange}
                            placeholder="Street address"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent ${
                              addressErrors.address
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-[#dde0e3]'
                            }`}
                          />
                          {addressErrors.address && (
                            <p className="mt-1 text-sm text-red-600">
                              {addressErrors.address}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#6a7581] mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={addressForm.city}
                            onChange={handleAddressFormChange}
                            placeholder="City"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent ${
                              addressErrors.city
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-[#dde0e3]'
                            }`}
                          />
                          {addressErrors.city && (
                            <p className="mt-1 text-sm text-red-600">
                              {addressErrors.city}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#6a7581] mb-2">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            name="postalCode"
                            value={addressForm.postalCode}
                            onChange={handleAddressFormChange}
                            placeholder="Postal code"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent ${
                              addressErrors.postalCode
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-[#dde0e3]'
                            }`}
                          />
                          {addressErrors.postalCode && (
                            <p className="mt-1 text-sm text-red-600">
                              {addressErrors.postalCode}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-[#6a7581] mb-2">
                            Country *
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={addressForm.country}
                            onChange={handleAddressFormChange}
                            placeholder="Country"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent ${
                              addressErrors.country
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-[#dde0e3]'
                            }`}
                          />
                          {addressErrors.country && (
                            <p className="mt-1 text-sm text-red-600">
                              {addressErrors.country}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={cancelAddressForm}
                          className="px-4 py-2 border border-[#dde0e3] text-[#6a7581] rounded-lg hover:bg-[#f7f8fa] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#397fc5] text-white rounded-lg hover:bg-[#2c5f94] transition-colors"
                        >
                          {editingIndex !== null
                            ? 'Update Address'
                            : 'Add Address'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Save Changes Button for Addresses */}
                {formData.savedAddresses.length > 0 && (
                  <div className="flex justify-end pt-6 border-t border-[#dde0e3]">
                    <button
                      onClick={handleSaveChanges}
                      disabled={saving}
                      className="px-6 py-2 bg-[#397fc5] text-white rounded-lg hover:bg-[#2c5f94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {saving ? 'Saving...' : 'Save Address Changes'}
                    </button>
                  </div>
                )}
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
                        name="orderUpdates"
                        checked={formData.notifications?.orderUpdates}
                        onChange={handleCheckboxChange}
                        className="w-4 h-4 text-[#397fc5] border-[#dde0e3] rounded focus:ring-[#397fc5]"
                      />
                      <span className="text-[#121416]">Order Updates</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="marketingEmails"
                        checked={formData.notifications?.marketingEmails}
                        onChange={handleCheckboxChange}
                        className="w-4 h-4 text-[#397fc5] border-[#dde0e3] rounded focus:ring-[#397fc5]"
                      />
                      <span className="text-[#121416]">Promotional Offers</span>
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
                        name="twoFactorAuth"
                        checked={formData.privacySettings?.twoFactorAuth}
                        onChange={handleCheckboxChange}
                        className="w-4 h-4 text-[#397fc5] border-[#dde0e3] rounded focus:ring-[#397fc5]"
                      />
                      <span className="text-[#121416]">
                        Two-Factor Authentication
                      </span>
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
                        name="language"
                        value={formData.accountPreferences?.language}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#6a7581] mb-2">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={formData.accountPreferences?.currency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent"
                      >
                        <option value="LKR">LKR (LKR)</option>
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
          </div>
        </div>
      </div>
    </div>
  );
}

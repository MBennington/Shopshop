'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiUser, FiCamera, FiX, FiSave } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface FormData {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
  profilePicture?: string;
  savedAddresses?: {
    label: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  }[];
  notifications?: {
    orderUpdates?: boolean;
    productInquiries?: boolean;
    marketingEmails?: boolean;
  };
  privacySettings?: {
    twoFactorAuth?: boolean;
  };
  accountPreferences?: {
    language?: string;
    currency?: string;
  };
  sellerInfo?: {
    businessName?: string;
    phone?: string;
    businessType?: string;
    businessDescription?: string;
    contactDetails?: {
      address?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
    payouts?: {
      paymentMethod?: string;
      bankAccountNumber?: string;
      bankAccountName?: string;
      bankName?: string;
    };
    baseShippingFee?: number | null;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    _id: '',
    name: '',
    email: '',
    role: 'seller', // or 'buyer', depending on default
    sellerInfo: {
      businessName: '',
      phone: '',
      businessType: '',
      businessDescription: '',
      contactDetails: {
        address: '',
        city: '',
        postalCode: '',
        country: '',
      },
      payouts: {
        paymentMethod: '',
        bankAccountNumber: '',
        bankAccountName: '',
        bankName: '',
      },
      baseShippingFee: null,
    },
    notifications: {
      orderUpdates: true,
      productInquiries: true,
      marketingEmails: false,
    },
    privacySettings: {
      twoFactorAuth: false,
    },
    accountPreferences: {
      language: 'en',
      currency: 'USD',
    },
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

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setFormData({
        _id: user._id || '',
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'seller',
        sellerInfo: {
          businessName: user.sellerInfo?.businessName || '',
          phone: user.sellerInfo?.phone || '',
          businessType: user.sellerInfo?.businessType || '',
          businessDescription: user.sellerInfo?.businessDescription || '',
          contactDetails: {
            address: user.sellerInfo?.contactDetails?.address || '',
            city: user.sellerInfo?.contactDetails?.city || '',
            postalCode: user.sellerInfo?.contactDetails?.postalCode || '',
            country: user.sellerInfo?.contactDetails?.country || '',
          },
          payouts: {
            paymentMethod: user.sellerInfo?.payouts?.paymentMethod || '',
            bankAccountNumber: user.sellerInfo?.payouts?.bankAccountNumber || '',
            bankAccountName: user.sellerInfo?.payouts?.bankAccountName || '',
            bankName: user.sellerInfo?.payouts?.bankName || '',
          },
          baseShippingFee: user.sellerInfo?.baseShippingFee ?? null,
        },
        notifications: {
          orderUpdates: user.notifications?.orderUpdates ?? true,
          productInquiries: user.notifications?.productInquiries ?? true,
          marketingEmails: user.notifications?.marketingEmails ?? false,
        },
        privacySettings: {
          twoFactorAuth: user.privacySettings?.twoFactorAuth ?? false,
        },
        accountPreferences: {
          language: user.accountPreferences?.language || 'en',
          currency: user.accountPreferences?.currency || 'USD',
        },
      });
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle nested sellerInfo fields
    if (
      name === 'businessName' ||
      name === 'phone' ||
      name === 'businessType' ||
      name === 'businessDescription' ||
      name === 'baseShippingFee'
    ) {
        setFormData((prev) => ({
          ...prev,
          sellerInfo: {
            ...prev.sellerInfo,
            [name]: name === 'baseShippingFee' 
              ? (value === '' ? null : parseFloat(value) || null)
              : value,
          },
        }));
    } else if (
      name === 'address' ||
      name === 'city' ||
      name === 'postalCode' ||
      name === 'country'
    ) {
      setFormData((prev) => ({
        ...prev,
        sellerInfo: {
          ...prev.sellerInfo,
          contactDetails: {
            ...prev.sellerInfo?.contactDetails,
            [name]: value,
          },
        },
      }));
    } else if (
      name === 'paymentMethod' ||
      name === 'bankAccountNumber' ||
      name === 'bankAccountName' ||
      name === 'bankName'
    ) {
      setFormData((prev) => ({
        ...prev,
        sellerInfo: {
          ...prev.sellerInfo,
          payouts: {
            ...prev.sellerInfo?.payouts,
            [name]: value,
          },
        },
      }));
    } else {
      // Handle flat fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [name]: checked },
    }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.sellerInfo?.businessName?.trim()) {
      errors.businessName = 'Business name is required for sellers';
    }

    if (!formData.sellerInfo?.phone?.trim()) {
      errors.phone = 'Phone number is required for sellers';
    }

    if (!formData.sellerInfo?.businessType?.trim()) {
      errors.businessType = 'Business type is required for sellers';
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
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError('');
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
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

      // Prepare sellerInfo diff
      const sellerInfoDiff: any = {};
      if (
        isChangedNonEmpty(
          formData.sellerInfo?.businessName,
          user?.sellerInfo?.businessName
        )
      ) {
        sellerInfoDiff.businessName = formData.sellerInfo?.businessName;
      }
      if (
        isChangedNonEmpty(formData.sellerInfo?.phone, user?.sellerInfo?.phone)
      ) {
        sellerInfoDiff.phone = formData.sellerInfo?.phone;
      }
      if (
        isChangedNonEmpty(
          formData.sellerInfo?.businessType,
          user?.sellerInfo?.businessType
        )
      ) {
        sellerInfoDiff.businessType = formData.sellerInfo?.businessType;
      }
      if (
        formData.sellerInfo?.baseShippingFee !== user?.sellerInfo?.baseShippingFee
      ) {
        sellerInfoDiff.baseShippingFee = formData.sellerInfo?.baseShippingFee;
      }
      if (
        isChangedNonEmpty(
          formData.sellerInfo?.businessDescription,
          user?.sellerInfo?.businessDescription
        )
      ) {
        sellerInfoDiff.businessDescription = formData.sellerInfo?.businessDescription;
      }

      const contact = formData.sellerInfo?.contactDetails || {};
      const originalContact = user?.sellerInfo?.contactDetails || {};
      const contactDiff: any = {};
      if (isChangedNonEmpty(contact.address, originalContact.address)) {
        contactDiff.address = contact.address;
      }
      if (isChangedNonEmpty(contact.city, originalContact.city)) {
        contactDiff.city = contact.city;
      }
      if (isChangedNonEmpty(contact.postalCode, originalContact.postalCode)) {
        contactDiff.postalCode = contact.postalCode;
      }
      if (isChangedNonEmpty(contact.country, originalContact.country)) {
        contactDiff.country = contact.country;
      }
      if (Object.keys(contactDiff).length > 0) {
        sellerInfoDiff.contactDetails = contactDiff;
      }

      const payouts = formData.sellerInfo?.payouts || {};
      const originalPayouts = user?.sellerInfo?.payouts || {};
      const payoutsDiff: any = {};

      if (
        isChangedNonEmpty(payouts.paymentMethod, originalPayouts.paymentMethod)
      ) {
        payoutsDiff.paymentMethod = payouts.paymentMethod;
      }
      if (
        isChangedNonEmpty(payouts.bankAccountNumber, originalPayouts.bankAccountNumber)
      ) {
        payoutsDiff.bankAccountNumber = payouts.bankAccountNumber;
      }
      if (
        isChangedNonEmpty(payouts.bankAccountName, originalPayouts.bankAccountName)
      ) {
        payoutsDiff.bankAccountName = payouts.bankAccountName;
      }
      if (
        isChangedNonEmpty(payouts.bankName, originalPayouts.bankName)
      ) {
        payoutsDiff.bankName = payouts.bankName;
      }
      if (Object.keys(payoutsDiff).length > 0) {
        sellerInfoDiff.payouts = payoutsDiff;
      }

      if (Object.keys(sellerInfoDiff).length > 0) {
        formDataToSend.append('sellerInfo', JSON.stringify(sellerInfoDiff));
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
        formData.notifications?.productInquiries !==
        user?.notifications?.productInquiries
      ) {
        notificationsDiff.productInquiries =
          formData.notifications?.productInquiries;
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

      setFormData((prev) => ({
        ...prev,
        name: data.data.name || '',
        sellerInfo: {
          ...prev.sellerInfo,
          ...data.data.sellerInfo,
        },
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
          <p className="mt-4 text-[#6a7581]">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6a7581]">Please log in to view your settings</p>
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
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 overflow-y-auto">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">
                  Settings
                </p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="mx-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
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
              <div className="mx-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
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
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap ${
                  activeTab === 'account'
                    ? 'text-[#397fc5] border-b-2 border-[#397fc5]'
                    : 'text-[#6a7581] hover:text-[#121416]'
                }`}
              >
                Account
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap ${
                  activeTab === 'contact'
                    ? 'text-[#397fc5] border-b-2 border-[#397fc5]'
                    : 'text-[#6a7581] hover:text-[#121416]'
                }`}
              >
                Contact
              </button>
              <button
                onClick={() => setActiveTab('payouts')}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap ${
                  activeTab === 'payouts'
                    ? 'text-[#397fc5] border-b-2 border-[#397fc5]'
                    : 'text-[#6a7581] hover:text-[#121416]'
                }`}
              >
                Payouts
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'text-[#397fc5] border-b-2 border-[#397fc5]'
                    : 'text-[#6a7581] hover:text-[#121416]'
                }`}
              >
                Notifications
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {activeTab === 'account' && (
                <div className="space-y-6">
                  {/* Profile Picture Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 px-2">
                      {/* Profile Picture */}
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

                      {/* Business Name & Email */}
                      <div className="flex flex-col justify-center">
                        <p className="text-lg font-semibold text-[#121416]">
                          {formData.sellerInfo?.businessName || 'Business Name'}
                        </p>
                        <p className="text-sm text-[#6a7581]">
                          {formData.email || user.email}
                        </p>
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

                  <div>
                    <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                      Business Information
                    </h2>
                    <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                      <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#121416] text-base font-medium leading-normal pb-2">
                          Your Name *
                        </p>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal ${
                            formErrors.name
                              ? 'border-red-300 focus:ring-red-500'
                              : 'border-[#dde0e3]'
                          }`}
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.name}
                          </p>
                        )}
                      </label>
                    </div>
                    <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                      <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#121416] text-base font-medium leading-normal pb-2">
                          Business Name *
                        </p>
                        <input
                          name="businessName"
                          value={formData.sellerInfo?.businessName || ''}
                          onChange={handleInputChange}
                          className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal ${
                            formErrors.businessName
                              ? 'border-red-300 focus:ring-red-500'
                              : 'border-[#dde0e3]'
                          }`}
                        />
                        {formErrors.businessName && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.businessName}
                          </p>
                        )}
                      </label>
                    </div>
                    <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                      <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#121416] text-base font-medium leading-normal pb-2">
                          Phone Number *
                        </p>
                        <input
                          name="phone"
                          type="tel"
                          value={formData.sellerInfo?.phone}
                          onChange={handleInputChange}
                          className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal ${
                            formErrors.phone
                              ? 'border-red-300 focus:ring-red-500'
                              : 'border-[#dde0e3]'
                          }`}
                        />
                        {formErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.phone}
                          </p>
                        )}
                      </label>
                    </div>
                    <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                      <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#121416] text-base font-medium leading-normal pb-2">
                          Business Type *
                        </p>
                        <select
                          name="businessType"
                          value={formData.sellerInfo?.businessType || ''}
                          onChange={handleInputChange}
                          className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal ${
                            formErrors.businessType
                              ? 'border-red-300 focus:ring-red-500'
                              : 'border-[#dde0e3]'
                          }`}
                        >
                          <option value="">
                            `{formData.sellerInfo?.businessType}`
                          </option>
                          <option value="retail">Retail</option>
                          <option value="wholesale">Wholesale</option>
                          <option value="manufacturing">Manufacturing</option>
                          <option value="service">Service</option>
                          <option value="food">Food & Beverage</option>
                          <option value="fashion">Fashion</option>
                          <option value="electronics">Electronics</option>
                          <option value="other">Other</option>
                        </select>
                        {formErrors.businessType && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.businessType}
                          </p>
                        )}
                      </label>
                    </div>
                    <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                      <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#121416] text-base font-medium leading-normal pb-2">
                          Base Shipping Fee (LKR)
                        </p>
                        <input
                          name="baseShippingFee"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.sellerInfo?.baseShippingFee ?? ''}
                          onChange={handleInputChange}
                          placeholder="e.g., 100.00"
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal border-[#dde0e3]"
                        />
                        <p className="mt-1 text-xs text-[#6a7581]">
                          Leave empty to use platform default (LKR 100.00)
                        </p>
                      </label>
                    </div>
                    <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                      <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#121416] text-base font-medium leading-normal pb-2">
                          Business Description
                        </p>
                        <textarea
                          name="businessDescription"
                          value={formData.sellerInfo?.businessDescription || ''}
                          onChange={handleInputChange}
                          placeholder="Tell customers about your business, products, and what makes you unique..."
                          rows={4}
                          className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#6a7581] focus:outline-0 focus:ring-0 border bg-[#f8f9fa] focus:bg-white focus:border-[#397fc5] focus:text-[#121416] placeholder:text-[#9ca3af] p-[15px] text-base font-normal leading-normal transition-all duration-200 ${
                            formErrors.businessDescription
                              ? 'border-red-300 focus:ring-red-500'
                              : 'border-[#e5e7eb]'
                          }`}
                        />
                        {formErrors.businessDescription && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.businessDescription}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-[#6a7581]">
                          This description will be displayed on your shop page to help customers understand your business.
                        </p>
                      </label>
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
                      <FiSave size={16} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                        Contact Details
                      </h2>
                      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                        <label className="flex flex-col min-w-40 flex-1">
                          <p className="text-[#121416] text-base font-medium leading-normal pb-2">
                            Address
                          </p>
                          <input
                            name="address"
                            value={
                              formData.sellerInfo?.contactDetails?.address || ''
                            }
                            onChange={handleInputChange}
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                          />
                        </label>
                      </div>
                      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                        <label className="flex flex-col min-w-40 flex-1">
                          <p className="text-[#121416] text-base font-medium leading-normal pb-2">
                            City
                          </p>
                          <input
                            name="city"
                            value={
                              formData.sellerInfo?.contactDetails?.city || ''
                            }
                            onChange={handleInputChange}
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                          />
                        </label>
                        <label className="flex flex-col min-w-40 flex-1">
                          <p className="text-[#121416] text-base font-medium leading-normal pb-2">
                            Postal Code
                          </p>
                          <input
                            name="postalCode"
                            value={
                              formData.sellerInfo?.contactDetails?.postalCode ||
                              ''
                            }
                            onChange={handleInputChange}
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                          />
                        </label>
                      </div>
                      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                        <label className="flex flex-col min-w-40 flex-1">
                          <p className="text-[#121416] text-base font-medium leading-normal pb-2">
                            Country
                          </p>
                          <input
                            name="country"
                            value={
                              formData.sellerInfo?.contactDetails?.country || ''
                            }
                            onChange={handleInputChange}
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                          />
                        </label>
                      </div>
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
                      <FiSave size={16} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'payouts' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                      Payouts
                    </h2>
                    <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                      <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#121416] text-base font-medium leading-normal pb-2">
                          Payment Method
                        </p>
                        <select
                          name="paymentMethod"
                          value={
                            formData.sellerInfo?.payouts?.paymentMethod || ''
                          }
                          onChange={handleInputChange}
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                        >
                          <option value="">Select payment method</option>
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                        </select>
                      </label>
                    </div>
                    <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                      <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#121416] text-base font-medium leading-normal pb-2">
                          Bank Name
                        </p>
                        <input
                          name="bankName"
                          value={
                            formData.sellerInfo?.payouts?.bankName || ''
                          }
                          onChange={handleInputChange}
                          placeholder="Enter bank name"
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                        />
                      </label>
                    </div>
                    <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                      <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#121416] text-base font-medium leading-normal pb-2">
                          Bank Account Number
                        </p>
                        <input
                          name="bankAccountNumber"
                          value={
                            formData.sellerInfo?.payouts?.bankAccountNumber || ''
                          }
                          onChange={handleInputChange}
                          placeholder="Enter account number"
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                        />
                      </label>
                    </div>
                    <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                      <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#121416] text-base font-medium leading-normal pb-2">
                          Bank Account Name
                        </p>
                        <input
                          name="bankAccountName"
                          value={
                            formData.sellerInfo?.payouts?.bankAccountName || ''
                          }
                          onChange={handleInputChange}
                          placeholder="Enter account holder name"
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                        />
                      </label>
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
                      <FiSave size={16} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                      Notifications
                    </h2>
                    <div className="px-4">
                      <label className="flex gap-x-3 py-3 flex-row">
                        <input
                          type="checkbox"
                          name="orderUpdates"
                          checked={formData.notifications?.orderUpdates}
                          onChange={handleCheckboxChange}
                          className="h-5 w-5 rounded border-[#dde0e3] border-2 bg-transparent text-[#528bc5] checked:bg-[#528bc5] checked:border-[#528bc5] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dde0e3] focus:outline-none"
                        />
                        <p className="text-[#121416] text-base font-normal leading-normal">
                          Order Updates
                        </p>
                      </label>
                      <label className="flex gap-x-3 py-3 flex-row">
                        <input
                          type="checkbox"
                          name="productInquiries"
                          checked={formData.notifications?.productInquiries}
                          onChange={handleCheckboxChange}
                          className="h-5 w-5 rounded border-[#dde0e3] border-2 bg-transparent text-[#528bc5] checked:bg-[#528bc5] checked:border-[#528bc5] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dde0e3] focus:outline-none"
                        />
                        <p className="text-[#121416] text-base font-normal leading-normal">
                          Product Inquiries
                        </p>
                      </label>
                      <label className="flex gap-x-3 py-3 flex-row">
                        <input
                          type="checkbox"
                          name="marketingEmails"
                          checked={formData.notifications?.marketingEmails}
                          onChange={handleCheckboxChange}
                          className="h-5 w-5 rounded border-[#dde0e3] border-2 bg-transparent text-[#528bc5] checked:bg-[#528bc5] checked:border-[#528bc5] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dde0e3] focus:outline-none"
                        />
                        <p className="text-[#121416] text-base font-normal leading-normal">
                          Promotional Offers
                        </p>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSaveChanges}
                      className="px-6 py-2 bg-[#397fc5] text-white rounded-lg hover:bg-[#2c5f94] transition-colors flex items-center gap-2"
                    >
                      <FiSave size={16} />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

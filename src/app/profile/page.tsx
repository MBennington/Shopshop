"use client";

import React, { useState } from 'react';
import { FiUser, FiShoppingBag, FiMapPin, FiEdit2, FiSettings, FiBell, FiLock, FiUserCheck } from 'react-icons/fi';

const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 234 567 8900',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  orders: [
    { id: '1', date: '2024-03-15', total: '$129.99', status: 'Delivered' },
    { id: '2', date: '2024-03-10', total: '$89.99', status: 'Processing' },
    { id: '3', date: '2024-03-05', total: '$199.99', status: 'Delivered' },
  ],
  addresses: [
    { id: '1', type: 'Home', street: '123 Main St', city: 'New York', state: 'NY', zip: '10001' },
    { id: '2', type: 'Work', street: '456 Business Ave', city: 'New York', state: 'NY', zip: '10002' },
  ],
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: mockUser.name,
    email: mockUser.email,
    phone: mockUser.phone,
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    marketingEmails: false,
    twoFactorAuth: false,
    showProfile: true,
    showOrders: true,
    language: 'English',
    currency: 'USD',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSaveChanges = () => {
    // Here you would typically make an API call to update the user's information
    console.log('Saving changes:', formData);
  };

  const handleSaveSettings = () => {
    // Here you would typically make an API call to update the user's settings
    console.log('Saving settings:', settings);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-[#dde0e3] overflow-hidden">
          {/* Profile Header */}
          <div className="p-8 border-b border-[#dde0e3]">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={mockUser.avatar}
                  alt={mockUser.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <button className="absolute bottom-0 right-0 bg-[#397fc5] text-white p-2 rounded-full hover:bg-[#2c5f94] transition-colors">
                  <FiEdit2 size={16} />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#121416]">{formData.name}</h1>
                <p className="text-[#6a7581]">{formData.email}</p>
              </div>
            </div>
          </div>

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#6a7581] mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6a7581] mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6a7581] mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={handleSaveChanges}
                    className="px-6 py-2 bg-[#397fc5] text-white rounded-lg hover:bg-[#2c5f94] transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                {mockUser.orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-[#f7f8fa] rounded-lg border border-[#dde0e3]"
                  >
                    <div>
                      <p className="font-medium text-[#121416]">Order #{order.id}</p>
                      <p className="text-sm text-[#6a7581]">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#121416]">{order.total}</p>
                      <p className="text-sm text-[#6a7581]">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-4">
                {mockUser.addresses.map((address) => (
                  <div
                    key={address.id}
                    className="p-4 bg-[#f7f8fa] rounded-lg border border-[#dde0e3]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-[#121416]">{address.type}</span>
                      <button className="text-[#397fc5] hover:text-[#2c5f94]">
                        <FiEdit2 size={16} />
                      </button>
                    </div>
                    <p className="text-[#6a7581]">
                      {address.street}, {address.city}, {address.state} {address.zip}
                    </p>
                  </div>
                ))}
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
                    <h3 className="text-lg font-semibold text-[#121416]">Notification Preferences</h3>
                  </div>
                  <div className="space-y-4 pl-7">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={settings.emailNotifications}
                        onChange={handleSettingsChange}
                        className="w-4 h-4 text-[#397fc5] border-[#dde0e3] rounded focus:ring-[#397fc5]"
                      />
                      <span className="text-[#121416]">Email Notifications</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="orderUpdates"
                        checked={settings.orderUpdates}
                        onChange={handleSettingsChange}
                        className="w-4 h-4 text-[#397fc5] border-[#dde0e3] rounded focus:ring-[#397fc5]"
                      />
                      <span className="text-[#121416]">Order Updates</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="marketingEmails"
                        checked={settings.marketingEmails}
                        onChange={handleSettingsChange}
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
                    <h3 className="text-lg font-semibold text-[#121416]">Privacy Settings</h3>
                  </div>
                  <div className="space-y-4 pl-7">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="twoFactorAuth"
                        checked={settings.twoFactorAuth}
                        onChange={handleSettingsChange}
                        className="w-4 h-4 text-[#397fc5] border-[#dde0e3] rounded focus:ring-[#397fc5]"
                      />
                      <span className="text-[#121416]">Two-Factor Authentication</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="showProfile"
                        checked={settings.showProfile}
                        onChange={handleSettingsChange}
                        className="w-4 h-4 text-[#397fc5] border-[#dde0e3] rounded focus:ring-[#397fc5]"
                      />
                      <span className="text-[#121416]">Show Profile to Other Users</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="showOrders"
                        checked={settings.showOrders}
                        onChange={handleSettingsChange}
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
                    <h3 className="text-lg font-semibold text-[#121416]">Account Preferences</h3>
                  </div>
                  <div className="space-y-4 pl-7">
                    <div>
                      <label className="block text-sm font-medium text-[#6a7581] mb-2">Language</label>
                      <select
                        name="language"
                        value={settings.language}
                        onChange={handleSettingsChange}
                        className="w-full px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397fc5] focus:border-transparent"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#6a7581] mb-2">Currency</label>
                      <select
                        name="currency"
                        value={settings.currency}
                        onChange={handleSettingsChange}
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
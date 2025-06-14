'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  accountNumber: string;
  routingNumber: string;
  notifications: {
    orderUpdates: boolean;
    productInquiries: boolean;
    promotionalOffers: boolean;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Account');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    paymentMethod: '',
    accountNumber: '',
    routingNumber: '',
    notifications: {
      orderUpdates: true,
      productInquiries: true,
      promotionalOffers: false,
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [name]: checked }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form data:', formData);
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 overflow-y-auto">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">Settings</p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">Manage your account settings and preferences</p>
              </div>
            </div>

            <div className="pb-3">
              <div className="flex border-b border-[#dde0e3] px-4 gap-8">
                {['Account', 'Store', 'Payouts', 'Notifications'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex flex-col items-center justify-center border-b-[3px] ${
                      activeTab === tab ? 'border-b-[#121416] text-[#121416]' : 'border-b-transparent text-[#6a7581]'
                    } pb-[13px] pt-4`}
                  >
                    <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                      activeTab === tab ? 'text-[#121416]' : 'text-[#6a7581]'
                    }`}>{tab}</p>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <section>
                  <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                    Personal Information
                  </h2>
                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#121416] text-base font-medium leading-normal pb-2">Full Name</p>
                      <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                      />
                    </label>
                  </div>
                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#121416] text-base font-medium leading-normal pb-2">Email</p>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                      />
                    </label>
                  </div>
                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#121416] text-base font-medium leading-normal pb-2">Phone Number</p>
                      <input
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                      />
                    </label>
                  </div>
                </section>

                <section>
                  <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                    Contact Details
                  </h2>
                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#121416] text-base font-medium leading-normal pb-2">Address</p>
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                      />
                    </label>
                  </div>
                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#121416] text-base font-medium leading-normal pb-2">City</p>
                      <input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                      />
                    </label>
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#121416] text-base font-medium leading-normal pb-2">Postal Code</p>
                      <input
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                      />
                    </label>
                  </div>
                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#121416] text-base font-medium leading-normal pb-2">Country</p>
                      <input
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                      />
                    </label>
                  </div>
                </section>

                <section>
                  <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                    Payouts
                  </h2>
                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#121416] text-base font-medium leading-normal pb-2">Payment Method</p>
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 bg-[image:--select-button-svg] placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                      >
                        <option value="">Select payment method</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="paypal">PayPal</option>
                        <option value="stripe">Stripe</option>
                      </select>
                    </label>
                  </div>
                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#121416] text-base font-medium leading-normal pb-2">Account Number</p>
                      <input
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                      />
                    </label>
                  </div>
                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#121416] text-base font-medium leading-normal pb-2">Routing Number</p>
                      <input
                        name="routingNumber"
                        value={formData.routingNumber}
                        onChange={handleInputChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#121416] focus:outline-0 focus:ring-0 border border-[#dde0e3] bg-white focus:border-[#dde0e3] h-14 placeholder:text-[#6a7581] p-[15px] text-base font-normal leading-normal"
                      />
                    </label>
                  </div>
                </section>

                <section>
                  <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                    Notifications
                  </h2>
                  <div className="px-4">
                    <label className="flex gap-x-3 py-3 flex-row">
                      <input
                        type="checkbox"
                        name="orderUpdates"
                        checked={formData.notifications.orderUpdates}
                        onChange={handleCheckboxChange}
                        className="h-5 w-5 rounded border-[#dde0e3] border-2 bg-transparent text-[#528bc5] checked:bg-[#528bc5] checked:border-[#528bc5] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dde0e3] focus:outline-none"
                      />
                      <p className="text-[#121416] text-base font-normal leading-normal">Order Updates</p>
                    </label>
                    <label className="flex gap-x-3 py-3 flex-row">
                      <input
                        type="checkbox"
                        name="productInquiries"
                        checked={formData.notifications.productInquiries}
                        onChange={handleCheckboxChange}
                        className="h-5 w-5 rounded border-[#dde0e3] border-2 bg-transparent text-[#528bc5] checked:bg-[#528bc5] checked:border-[#528bc5] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dde0e3] focus:outline-none"
                      />
                      <p className="text-[#121416] text-base font-normal leading-normal">Product Inquiries</p>
                    </label>
                    <label className="flex gap-x-3 py-3 flex-row">
                      <input
                        type="checkbox"
                        name="promotionalOffers"
                        checked={formData.notifications.promotionalOffers}
                        onChange={handleCheckboxChange}
                        className="h-5 w-5 rounded border-[#dde0e3] border-2 bg-transparent text-[#528bc5] checked:bg-[#528bc5] checked:border-[#528bc5] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dde0e3] focus:outline-none"
                      />
                      <p className="text-[#121416] text-base font-normal leading-normal">Promotional Offers</p>
                    </label>
                  </div>
                </section>

                <div className="flex px-4 py-3 justify-end">
                  <button
                    type="submit"
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#528bc5] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                  >
                    <span className="truncate">Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
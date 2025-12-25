'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import Link from 'next/link';

export default function ReportIssuePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: '',
    issueType: '',
    description: '',
    orderId: '',
    productId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Get query params if coming from review page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('productId');
      if (productId) {
        setFormData(prev => ({ ...prev, productId }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      // TODO: Implement actual API endpoint for reporting issues
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({
        subject: '',
        issueType: '',
        description: '',
        orderId: '',
        productId: formData.productId, // Keep productId if it was set
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    } catch (error: any) {
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Failed to submit issue report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#121416] mb-2">
              Report an Issue
            </h1>
            <p className="text-gray-600">
              We're here to help! Please provide details about the issue you're experiencing.
            </p>
          </div>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">Issue reported successfully!</p>
                <p className="text-green-700 text-sm mt-1">
                  We've received your report and will get back to you soon.
                </p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Error submitting report</p>
                <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="issueType" className="block text-sm font-medium text-[#121416] mb-2">
                Issue Type *
              </label>
              <select
                id="issueType"
                value={formData.issueType}
                onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                required
                className="w-full px-3 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#528bc5]"
              >
                <option value="">Select an issue type</option>
                <option value="order">Order Issue</option>
                <option value="product">Product Issue</option>
                <option value="delivery">Delivery Issue</option>
                <option value="payment">Payment Issue</option>
                <option value="review">Review Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-[#121416] mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                maxLength={200}
                placeholder="Brief description of the issue"
                className="w-full px-3 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#528bc5]"
              />
            </div>

            <div>
              <label htmlFor="orderId" className="block text-sm font-medium text-[#121416] mb-2">
                Order ID (Optional)
              </label>
              <input
                type="text"
                id="orderId"
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                placeholder="If this issue is related to an order"
                className="w-full px-3 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#528bc5]"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#121416] mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={6}
                maxLength={2000}
                placeholder="Please provide detailed information about the issue..."
                className="w-full px-3 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#528bc5] resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/2000 characters
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Link
                href={formData.productId ? `/products/${formData.productId}` : '/'}
                className="px-4 py-2 border border-[#dde0e3] rounded-lg text-[#121416] hover:bg-gray-50 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#528bc5] text-white hover:bg-[#4a7bb3]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Need immediate assistance?{' '}
              <a href="mailto:support@shopshop.com" className="text-[#528bc5] hover:underline">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


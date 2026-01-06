'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'forgot-password',
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || data.error || 'Unable to send reset link');
        return;
      }

      // Do not reveal whether the email exists
      setMessage(
        'A password reset link has been sent. Please check your email.'
      );
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
          >
            <div className="size-8 text-[#0d141c]">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h1 className="text-[#0d141c] text-2xl font-bold">Marketplace</h1>
          </Link>
        </div>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-[#0d141c]">
              Forgot password
            </CardTitle>
            <CardDescription className="text-[#49739c]">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="forgot-email"
                  className="text-sm font-medium text-[#0d141c]"
                >
                  Email
                </label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-[#0d141c] hover:bg-[#1a2332] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending link...' : 'Send reset link'}
              </Button>
            </form>

            {message && (
              <div className="mt-4 text-sm text-green-600 bg-green-100 border border-green-300 p-2 rounded">
                {message}
              </div>
            )}
            {error && (
              <div className="mt-4 text-sm text-red-600 bg-red-100 border border-red-300 p-2 rounded">
                {error}
              </div>
            )}

            <div className="mt-6 text-center text-sm text-[#49739c]">
              <button
                type="button"
                onClick={() => router.push('/auth')}
                className="hover:text-[#397fc5] transition-colors"
              >
                Back to sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

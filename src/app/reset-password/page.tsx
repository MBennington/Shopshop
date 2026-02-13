'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [urlChecked, setUrlChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const t = searchParams?.get('token');
    setToken(t ?? null);
    setUrlChecked(true);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Reset link is invalid or missing.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password should be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset-password',
          token,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.msg || data.error || 'Unable to reset password');
        return;
      }

      toast.success('Your password has been updated. You can now sign in.');

      // Optionally redirect after a short delay
      setTimeout(() => {
        router.push('/auth');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error('Something went wrong. Please try again.');
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
              Reset password
            </CardTitle>
            <CardDescription className="text-[#49739c]">
              Choose a new password for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!urlChecked ? (
              <div className="text-sm text-[#49739c] py-2">Checking reset link...</div>
            ) : !token ? (
              <div className="text-sm text-red-600 bg-red-100 border border-red-300 p-3 rounded">
                This reset link is invalid or has expired. Please request a new
                one from the forgot password page.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="new-password"
                    className="text-sm font-medium text-[#0d141c]"
                  >
                    New password
                  </label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Create a new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="confirm-password"
                    className="text-sm font-medium text-[#0d141c]"
                  >
                    Confirm password
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#0d141c] hover:bg-[#1a2332] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating password...' : 'Update password'}
                </Button>
              </form>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}


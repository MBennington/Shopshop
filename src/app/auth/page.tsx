'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function AuthPage() {
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });


  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  // Get returnUrl from query params
  const returnUrl = searchParams?.get('returnUrl') || null;
  const isSignup = searchParams?.get('signup') === 'true';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'login', ...loginForm }),
      });

      const data = await res.json();

      if (res.ok && data.status) {
        toast.success('Login successful!');
        login(data.token, data.data);
        // Redirect to returnUrl if provided, otherwise to home
        if (returnUrl) {
          router.push(returnUrl);
        } else {
          router.push('/');
        }
      } else {
        toast.error(data.msg || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Server error during login');
    } finally {
      setIsLoading(false);
    }

    // Simulate API call
    // setTimeout(() => {
    //   console.log('Login:', loginForm);
    //   setIsLoading(false);
    //   // Redirect to home page after successful login
    //   router.push('/');
    // }, 1000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    const payload = {
      name: signupForm.name,
      email: signupForm.email,
      password: signupForm.password,
      role: 'buyer',
    };

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'signup', ...payload }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Account created successfully!');
        login(data.token, data.data);
        // Redirect to returnUrl if provided, otherwise to home
        if (returnUrl) {
          router.push(returnUrl);
        } else {
          router.push('/');
        }
      } else {
        toast.error(data.msg || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Server error during signup');
    } finally {
      setIsLoading(false);
    }

    // Simulate API call
    // setTimeout(() => {
    //   console.log('Signup:', signupForm);
    //   setIsLoading(false);
    //   // Redirect to home page after successful signup
    //   router.push('/');
    // }, 1000);
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center p-4"
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
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-[#0d141c]">
              Welcome
            </CardTitle>
            <CardDescription className="text-[#49739c]">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={isSignup ? "signup" : "login"} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-sm font-medium">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-medium">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="login-email"
                      className="text-sm font-medium text-[#0d141c]"
                    >
                      Email
                    </label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="login-password"
                      className="text-sm font-medium text-[#0d141c]"
                    >
                      Password
                    </label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-[#397fc5] hover:text-[#2c5f94] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#0d141c] hover:bg-[#1a2332] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="signup-name"
                      className="text-sm font-medium text-[#0d141c]"
                    >
                      Full Name
                    </label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupForm.name}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, name: e.target.value })
                      }
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="signup-email"
                      className="text-sm font-medium text-[#0d141c]"
                    >
                      Email
                    </label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupForm.email}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, email: e.target.value })
                      }
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="signup-password"
                      className="text-sm font-medium text-[#0d141c]"
                    >
                      Password
                    </label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupForm.password}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          password: e.target.value,
                        })
                      }
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="signup-confirm-password"
                      className="text-sm font-medium text-[#0d141c]"
                    >
                      Confirm Password
                    </label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupForm.confirmPassword}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      className="h-11"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#0d141c] hover:bg-[#1a2332] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Separator className="my-4" />
              <div className="text-center">
                <p className="text-sm text-[#49739c] mb-3">
                  Looking to sell on our platform?
                </p>
                <Button
                  onClick={() => router.push('/auth/seller')}
                  variant="outline"
                  className="w-full h-11 border-[#397fc5] text-[#397fc5] hover:bg-[#397fc5] hover:text-white"
                >
                  Login as Seller
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-[#49739c] hover:text-[#397fc5] transition-colors"
          >
            ← Back to marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}

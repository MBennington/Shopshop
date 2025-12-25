'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

export default function SellerAuthPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [signupForm, setSignupForm] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
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
        login(data.token, data.data);
        // localStorage.setItem('token', data.token);
        // router.push('/sell');
      } else {
        setErrorMessage(data.msg || 'Login failed');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Server error during login');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    } finally {
      setIsLoading(false);
    }

    // Simulate API call
    // setTimeout(() => {
    //   console.log('Seller Login:', loginForm);
    //   setIsLoading(false);
    //   // Redirect to seller dashboard after successful login
    //   router.push('/sell');
    // }, 1000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (signupForm.password !== signupForm.confirmPassword) {
      setErrorMessage('Passwords do not match');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;
    }

    setIsLoading(true);

    const payload = {
      businessName: signupForm.businessName,
      email: signupForm.email,
      phone: signupForm.phone,
      businessType: signupForm.businessType,
      password: signupForm.password,
      role: 'seller',
      name: signupForm.contactName,
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
        setSuccessMessage('Seller account created successfully!');
        login(data.token, data.data);
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
        localStorage.setItem('token', data.token);
        router.push('/sell');
      } else {
        setErrorMessage(data.msg || 'Signup failed');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrorMessage('Server error during signup');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    } finally {
      setIsLoading(false);
    }

    // Simulate API call
    // setTimeout(() => {
    //   console.log('Seller Signup:', signupForm);
    //   setIsLoading(false);
    //   // Redirect to seller dashboard after successful signup
    //   router.push('/sell');
    // }, 1000);
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center p-4"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div className="w-full max-w-lg">
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
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-[#397fc5] p-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h2 className="text-[#0d141c] text-xl font-semibold">
              Seller Portal
            </h2>
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-[#0d141c]">
              Welcome Seller
            </CardTitle>
            <CardDescription className="text-[#49739c]">
              Join our marketplace and start selling your products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-sm font-medium">
                  Seller Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-medium">
                  Become a Seller
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="seller-login-email"
                      className="text-sm font-medium text-[#0d141c]"
                    >
                      Business Email
                    </label>
                    <Input
                      id="seller-login-email"
                      type="email"
                      placeholder="Enter your business email"
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
                      htmlFor="seller-login-password"
                      className="text-sm font-medium text-[#0d141c]"
                    >
                      Password
                    </label>
                    <Input
                      id="seller-login-password"
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
                      href="#"
                      className="text-sm text-[#397fc5] hover:text-[#2c5f94] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#397fc5] hover:bg-[#2c5f94] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In to Seller Portal'}
                  </Button>
                </form>
                {/* 🔽 success or error message */}
                {errorMessage && (
                  <div className="text-sm text-red-600 bg-red-100 border border-red-300 p-2 rounded">
                    {errorMessage}
                  </div>
                )}
                {successMessage && (
                  <div className="text-sm text-green-600 bg-green-100 border border-green-300 p-2 rounded">
                    {successMessage}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="business-name"
                        className="text-sm font-medium text-[#0d141c]"
                      >
                        Business Name
                      </label>
                      <Input
                        id="business-name"
                        type="text"
                        placeholder="Your business name"
                        value={signupForm.businessName}
                        onChange={(e) =>
                          setSignupForm({
                            ...signupForm,
                            businessName: e.target.value,
                          })
                        }
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="contact-name"
                        className="text-sm font-medium text-[#0d141c]"
                      >
                        Contact Name
                      </label>
                      <Input
                        id="contact-name"
                        type="text"
                        placeholder="Your full name"
                        value={signupForm.contactName}
                        onChange={(e) =>
                          setSignupForm({
                            ...signupForm,
                            contactName: e.target.value,
                          })
                        }
                        required
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="seller-email"
                      className="text-sm font-medium text-[#0d141c]"
                    >
                      Business Email
                    </label>
                    <Input
                      id="seller-email"
                      type="email"
                      placeholder="Enter your business email"
                      value={signupForm.email}
                      onChange={(e) =>
                        setSignupForm({ ...signupForm, email: e.target.value })
                      }
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="phone"
                        className="text-sm font-medium text-[#0d141c]"
                      >
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Your phone number"
                        value={signupForm.phone}
                        onChange={(e) =>
                          setSignupForm({
                            ...signupForm,
                            phone: e.target.value,
                          })
                        }
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="business-type"
                        className="text-sm font-medium text-[#0d141c]"
                      >
                        Business Type
                      </label>
                      <Input
                        id="business-type"
                        type="text"
                        placeholder="e.g. Retail, Manufacturing"
                        value={signupForm.businessType}
                        onChange={(e) =>
                          setSignupForm({
                            ...signupForm,
                            businessType: e.target.value,
                          })
                        }
                        required
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="seller-password"
                      className="text-sm font-medium text-[#0d141c]"
                    >
                      Password
                    </label>
                    <Input
                      id="seller-password"
                      type="password"
                      placeholder="Create a strong password"
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
                      htmlFor="seller-confirm-password"
                      className="text-sm font-medium text-[#0d141c]"
                    >
                      Confirm Password
                    </label>
                    <Input
                      id="seller-confirm-password"
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
                  <div className="text-xs text-[#49739c] bg-[#f8f9fa] p-3 rounded-lg">
                    By registering as a seller, you agree to our Terms of
                    Service and acknowledge that your business information will
                    be verified.
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#397fc5] hover:bg-[#2c5f94] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating seller account...' : 'Start Selling'}
                  </Button>
                </form>
                {/* 🔽 ADD THIS BLOCK HERE */}
                {errorMessage && (
                  <div className="text-sm text-red-600 bg-red-100 border border-red-300 p-2 rounded">
                    {errorMessage}
                  </div>
                )}
                {successMessage && (
                  <div className="text-sm text-green-600 bg-green-100 border border-green-300 p-2 rounded">
                    {successMessage}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Separator className="my-4" />
              <div className="text-center">
                <p className="text-sm text-[#49739c] mb-3">
                  Looking to shop instead?
                </p>
                <Button
                  onClick={() => router.push('/auth')}
                  variant="outline"
                  className="w-full h-11 border-[#0d141c] text-[#0d141c] hover:bg-[#0d141c] hover:text-white"
                >
                  Customer Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-2">
          <Link
            href="/"
            className="block text-sm text-[#49739c] hover:text-[#397fc5] transition-colors"
          >
            ← Back to marketplace
          </Link>
          <div className="flex items-center justify-center gap-4 text-xs text-[#49739c]">
            <Link href="#" className="hover:text-[#397fc5] transition-colors">
              Help Center
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-[#397fc5] transition-colors">
              Seller Guidelines
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-[#397fc5] transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

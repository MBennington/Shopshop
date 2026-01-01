'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
  profilePicture?: string;
  savedAddresses?: {
    label: string;
    address: string;
    city: string;
    province?: string;
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
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      console.log(
        'Fetching user profile with token:',
        token.substring(0, 20) + '...'
      );

      const response = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Profile response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data);
        setUser(data.data);
      } else {
        // Token is invalid, remove it
        console.log('Token invalid, removing from localStorage');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Network error or other issues, remove token
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);

    // Redirect based on user role
    if (userData.role === 'seller') {
      router.push('/sell');
    } else {
      router.push('/');
    }
  };

  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false);
    router.push('/auth');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  login: (email: string, password: string, role: 'doctor' | 'patient') => Promise<boolean>;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  verifyDoctor: (nmcNumber: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ✅ Update your backend base URL here
const API_BASE_URL = 'http://localhost:8080';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // ✅ Used to block rendering until validated

  useEffect(() => {
    const token = localStorage.getItem('docnet_token');
    const savedUser = localStorage.getItem('docnet_user');

    if (token && savedUser) {
      fetch(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(data => {
          setUser(data);
          localStorage.setItem('docnet_user', JSON.stringify(data));
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('docnet_token');
          localStorage.removeItem('docnet_user');
        })
        .finally(() => {
          setAuthLoading(false);
        });
    } else {
      setUser(null);
      setAuthLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, role: 'doctor' | 'patient'): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token, ...user } = data; // destructure the token from the user info
      
        setUser(user);
        localStorage.setItem('docnet_token', token);
        localStorage.setItem('docnet_user', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  

  const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        const { token, ...user } = data; // destructure the token from the user info
      
        setUser(user);
        localStorage.setItem('docnet_token', token);
        localStorage.setItem('docnet_user', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('docnet_token')}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('docnet_token');
      localStorage.removeItem('docnet_user');
    }
  };

  const verifyDoctor = async (nmcNumber: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-nmc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nmcNumber }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.isValid || false;
      }
      return false;
    } catch (error) {
      console.error('NMC verification error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, verifyDoctor, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

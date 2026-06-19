import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_URL = '/api/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role?: 'tourist' | 'guide';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    password: string,
    phone?: string,
    role?: 'tourist' | 'guide',
    guideProfile?: { bio: string; destination: string; pricePerTrip: number; languages?: string[]; location?: string }
  ) => Promise<boolean>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children, showNotification }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    if (storedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user } = response.data;
      
      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      showNotification('Logged in successfully!');

      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      const msg = error?.response?.data?.message || error?.message || 'Login failed. Please check your credentials.';
      showNotification(msg, 'error');
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    role: 'tourist' | 'guide' = 'tourist',
    guideProfile?: { bio: string; destination: string; pricePerTrip: number; languages?: string[]; location?: string }
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/signup`, { name, email, password, phone, role });
      const { token, user } = response.data;

      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      showNotification('Account created successfully!');

      // Create guide profile using provided details (no default profiles)
      if (user?.role === 'guide' && guideProfile) {
        try {
          const base = '';
          await axios.post(`${base}/api/guide/guides`, {
            bio: guideProfile.bio,
            services: [{ destination: guideProfile.destination, pricePerTrip: guideProfile.pricePerTrip }],
            languages: guideProfile.languages || ['English'],
            location: guideProfile.location || guideProfile.destination,
          });
        } catch (e) {
          console.warn('Create guide profile failed:', e);
        }
      }

      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Signup failed:', error);
      const msg = error?.response?.data?.message || error?.message || 'Signup failed. Please try again.';
      showNotification(msg, 'error');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('Logged out successfully!');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

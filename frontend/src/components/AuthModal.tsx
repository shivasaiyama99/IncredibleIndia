import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [registerAsGuide, setRegisterAsGuide] = useState(false);
  const [guideBio, setGuideBio] = useState('');
  const [guideDestination, setGuideDestination] = useState('');
  const [guidePrice, setGuidePrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, signup, isLoading } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!isLogin && !formData.name) newErrors.name = 'Name is required';
    if (!isLogin && registerAsGuide) {
      if (!guideBio) newErrors.guideBio = 'Bio is required';
      if (!guideDestination) newErrors.guideDestination = 'Destination is required';
      if (!guidePrice || Number(guidePrice) <= 0) newErrors.guidePrice = 'Valid price is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let success = false;
      if (isLogin) {
        success = await login(formData.email, formData.password);
      } else {
        const guideProfile = registerAsGuide ? {
          bio: guideBio,
          destination: guideDestination,
          pricePerTrip: Number(guidePrice),
        } : undefined;
        success = await signup(
          formData.name,
          formData.email,
          formData.password,
          formData.phone,
          registerAsGuide ? 'guide' : 'tourist',
          guideProfile
        );
      }

      if (success) {
        onSuccess();
        onClose();
      } else {
        setErrors({ general: 'Authentication failed. Please try again.' });
      }
    } catch {
      setErrors({ general: 'An error occurred. Please try again.' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {isLogin ? 'Welcome Back' : 'Join Incredible India'}
              </h2>
              <p className="text-gray-600 mt-1">
                {isLogin ? 'Sign in to your account' : 'Create your account to start exploring'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="+91-9876543210"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input id="registerGuide" type="checkbox" checked={registerAsGuide} onChange={(e) => setRegisterAsGuide(e.target.checked)} className="w-4 h-4" />
                  <label htmlFor="registerGuide" className="text-sm text-gray-700">Register as Guide</label>
                </div>
                {registerAsGuide && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Guide Bio</label>
                      <textarea value={guideBio} onChange={(e) => setGuideBio(e.target.value)} rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Tell travelers about your experience" />
                      {errors.guideBio && <p className="text-red-500 text-sm mt-1">{errors.guideBio}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Destination (Service)</label>
                      <input value={guideDestination} onChange={(e) => setGuideDestination(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="e.g., Jaipur" />
                      {errors.guideDestination && <p className="text-red-500 text-sm mt-1">{errors.guideDestination}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Price Per Trip (₹)</label>
                      <input type="number" value={guidePrice} onChange={(e) => setGuidePrice(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="e.g., 2500" />
                      {errors.guidePrice && <p className="text-red-500 text-sm mt-1">{errors.guidePrice}</p>}
                    </div>
                  </div>
                )}
              </>
            )}

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button onClick={() => setIsLogin(!isLogin)} className="text-orange-600 font-semibold ml-1 hover:text-orange-700">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">Google</span>
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
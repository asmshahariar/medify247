import { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 AuthContext: Attempting login');
      console.log('📧 Email:', email);
      console.log('🔑 Making API POST request to /auth/login');
      
      const requestData = { email, password };
      console.log('📤 Request data:', { email, password: '***' });
      
      const response = await api.post('/auth/login', requestData);
      
      console.log('✅ API Response received');
      console.log('📥 Response status:', response.status);
      console.log('📥 Response data:', response.data);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        console.log('✅ Login successful!');
        console.log('👤 User:', user);
        console.log('🎫 Token received:', token ? 'Yes (length: ' + token.length + ')' : 'No');
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        console.log('💾 Token and user saved to localStorage');
        return { success: true, data: response.data.data };
      }
      
      console.warn('⚠️ Login response indicates failure');
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('❌ Login API error occurred');
      console.error('Error object:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error config:', error.config);
      
      // Handle network errors
      if (!error.response) {
        console.error('🚫 No response from server - network error');
        if (error.code === 'ECONNREFUSED') {
          return {
            success: false,
            message: 'Cannot connect to server. Please make sure the backend is running on port 5000.',
            errors: null
          };
        }
        if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
          return {
            success: false,
            message: 'Network error. Please check your internet connection and ensure the backend server is running.',
            errors: null
          };
        }
        return {
          success: false,
          message: 'Cannot connect to server. Please check if the backend is running.',
          errors: null
        };
      }
      
      // Handle HTTP errors
      console.error('📛 HTTP Error:', error.response.status, error.response.statusText);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
        errors: error.response?.data?.errors
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return { success: true, data: response.data.data };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
        errors: error.response?.data?.errors
      };
    }
  };

  const hospitalRegister = async (hospitalData) => {
    try {
      const response = await api.post('/hospitals/register', hospitalData);
      
      if (response.data.success) {
        // Hospital registration doesn't automatically log in
        // User needs to wait for approval
        return { success: true, data: response.data.data };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Hospital registration failed. Please try again.',
        errors: error.response?.data?.errors
      };
    }
  };

  const diagnosticCenterRegister = async (centerData) => {
    try {
      const response = await api.post('/diagnostic-centers/register', centerData);
      
      if (response.data.success) {
        // Diagnostic center registration doesn't automatically log in
        // User needs to wait for approval
        return { success: true, data: response.data.data };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Diagnostic center registration failed. Please try again.',
        errors: error.response?.data?.errors
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    hospitalRegister,
    diagnosticCenterRegister,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



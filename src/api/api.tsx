// === 📁 src/api/api.js ===
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add access token to every request if available
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===============
// Auth APIs
// ===============

export const login = (username, password) =>
  api.post('accounts/login/', { email: username, password });

export const register = (username, email, password1, password2) =>
  api.post('auth/registration/', { username, email, password1, password2 });

export const verifyEmail = ({ verification_code }) =>
  api.post('auth/verify-email/', { verification_code });

export const getUserProfile = (userId) =>
  api.get(`accounts/users/${userId}/`);

export const forgotPassword = ({ email }) =>
  api.post('accounts/forgot-password/', { email });

export const resetPassword = ({ email, verification_code, new_password }) =>
  api.post('accounts/reset-password/', {
    email,
    verification_code,
    new_password,
  });

// Google Login
export const googleLogin = (idToken) =>
  api.post('auth/google/', { id_token: idToken });

// ===============
// Posts
// ===============

export const getPosts = () => api.get('api/posts/posts');

export default api;

// === 📁 src/api/api.js ===

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// attach token to all requests if available
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Accounts APIs
export const login = (email, password) => 
  api.post('accounts/login/', { email, password });

export const register = (username, email, password1, password2) =>
  api.post('auth/registration/', { username, email, password1, password2 });

export const verifyEmail = ({ verification_code }) =>
  api.post('auth/verify-email/', { verification_code });

export const getUser = (userId) => 
  api.get(`accounts/users/${userId}/`);

// ✅ NEW endpoint: fetch profile by user_id
export const getProfileByUserId = (userId) => 
  api.get(`accounts/profiles/user/${userId}/`);

export const createProfile = (data) => 
  api.post('accounts/profiles/', data);

export const updateProfile = (profileId, data) => 
  api.patch(`accounts/profiles/${profileId}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const forgotPassword = ({ email }) =>
  api.post('accounts/forgot-password/', { email });

export const resetPassword = ({ email, verification_code, new_password }) =>
  api.post('accounts/reset-password/', {
    email,
    verification_code,
    new_password,
  });

// Posts & Ads
export const getPosts = () => api.get('posts/posts/');
export const getAds = () => api.get('ads/ads/');

export default api;

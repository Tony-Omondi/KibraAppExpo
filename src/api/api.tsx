// src/api/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config});

// Accounts APIs
export const login = (email, password) => 
  api.post('accounts/login/', { email, password });

export const register = (username, email, password) => 
  api.post('accounts/register/', { username, email, password });

export const verifyEmail = (verification_code) => 
  api.post('accounts/verify-email/', { verification_code });

export const getUser = (userId) => 
  api.get(`accounts/users/${userId}/`);

export const getProfile = (userId) => 
  api.get(`accounts/profiles/${userId}/`);

export const createProfile = (data) => 
  api.post('accounts/profiles/', data);

export const updateProfile = (userId, data) => 
  api.patch(`accounts/profiles/${userId}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

// Posts & Ads
export const getPosts = () => api.get('posts/posts/');
export const getAds = () => api.get('ads/ads/');

export default api;
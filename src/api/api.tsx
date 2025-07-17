import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL, // e.g., http://192.168.88.85:8000/api/
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', { url: config.url, data: config.data });
    return config;
  },
  (error) => {
    console.error('API Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// Accounts APIs
export const login = (email: string, password: string) =>
  api.post('accounts/login/', { email, password });

export const register = (username: string, email: string, password1: string, password2: string) =>
  api.post('auth/registration/', { username, email, password1, password2 });

export const verifyEmail = ({ verification_code }: { verification_code: string }) =>
  api.post('auth/verify-email/', { verification_code });

export const getUser = (userId: number) =>
  api.get(`accounts/users/${userId}/`);

export const getProfileByUserId = (userId: number) =>
  api.get(`accounts/profiles/user/${userId}/`);

export const createProfile = (data: any) =>
  api.post('accounts/profiles/', data);

export const updateProfile = (profileId: number, data: any) =>
  api.patch(`accounts/profiles/${profileId}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const followUser = (followedId: number) =>
  api.post('accounts/follows/follow/', { followed_id: followedId });

export const unfollowUser = (followedId: number) =>
  api.post('accounts/follows/unfollow/', { followed_id: followedId });

// Notifications APIs
export const getNotifications = () =>
  api.get('notifications/notifications/');

export const markNotificationAsRead = (notificationId: number) =>
  api.post(`notifications/notifications/${notificationId}/mark_as_read/`);

export const markAllNotificationsAsRead = () =>
  api.post('notifications/notifications/mark_all_as_read/');

export const forgetPassword = ({ email }: { email: string }) =>
  api.post('accounts/forgot-password/', { email });

export const resetPassword = ({
  email,
  verification_code,
  new_password,
}: {
  email: string;
  verification_code: string;
  new_password: string;
}) =>
  api.post('accounts/reset-password/', {
    email,
    verification_code,
    new_password,
  });

// Posts & Ads
export const getPosts = () => api.get('posts/posts/');
export const getAds = () => api.get('ads/ads/');
export const getCommentsForPost = (postId: number) =>
  api.get(`posts/comments/?post=${postId}`);
export const addCommentToPost = (postId: number, text: string) =>
  api.post('posts/comments/', { post: postId, text });
export const toggleLike = (postId: number) =>
  api.post(`posts/likes/${postId}/toggle/`);
export const createPost = (data: FormData) =>
  api.post('posts/posts/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export default api;
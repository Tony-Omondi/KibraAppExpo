import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL, // e.g., http://192.168.88.85:8000/api/
  timeout: 30000, // Increased to handle Paystack API delays
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
      message: error.message,
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

export const resetPassword = ({ email, verification_code, new_password }: { email: string; verification_code: string; new_password: string }) =>
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
export const createPost = (data: any) =>
  api.post('posts/posts/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

// E-commerce APIs
export const getCategories = () => api.get('marketplace/categories/');
export const getProducts = () => api.get('marketplace/products/');
export const getProductById = (productId: number) => api.get(`marketplace/products/${productId}/`);
export const createProduct = (data: any) =>
  api.post('marketplace/products/', data);
export const updateProduct = (productId: number, data: any) =>
  api.patch(`marketplace/products/${productId}/`, data);
export const deleteProduct = (productId: number) => api.delete(`marketplace/products/${productId}/`);
export const getOrders = () => api.get('marketplace/orders/');
export const getCart = () => api.get('marketplace/carts/');
export const addToCart = (cartId: number, data: any) =>
  api.post(`marketplace/carts/${cartId}/add_item/`, data);
export const removeFromCart = (cartId: number, data: any) =>
  api.post(`marketplace/carts/${cartId}/remove_item/`, data);
export const updateCartItemQuantity = (cartId: number, data: any) =>
  api.post(`marketplace/carts/${cartId}/update_item_quantity/`, data);
export const initiatePayment = (cartId: number, data: any) =>
  api.post(`marketplace/carts/${cartId}/initiate_payment/`, data, {
    headers: {
      'User-Agent': 'Mobile', // Ensure mobile callback URL
    },
  });
export const getCoupons = () => api.get('marketplace/coupons/');
export const applyCoupon = (couponCode: string) =>
  api.post('marketplace/coupons/apply_coupon/', { coupon_code: couponCode });
export const removeCoupon = (couponId: number) =>
  api.post(`marketplace/coupons/${couponId}/remove_coupon/`);
export const getShippingAddresses = () => api.get('marketplace/shipping-addresses/');
export const createShippingAddress = (data: any) =>
  api.post('marketplace/shipping-addresses/', data);
export const updateShippingAddress = (addressId: number, data: any) =>
  api.patch(`marketplace/shipping-addresses/${addressId}/`, data);
export const deleteShippingAddress = (addressId: number) =>
  api.delete(`marketplace/shipping-addresses/${addressId}/`);
export const checkPaymentStatus = (reference: string) =>
  api.get(`marketplace/payments/callback/?reference=${reference}`);
export const addShippingAddress = (data: any) => api.post('marketplace/shipping-addresses/', data);
export const setCurrentAddress = (addressId: number) => api.patch(`marketplace/shipping-addresses/${addressId}/`, { current_address: true });
export const verifyPayment = (reference: string) =>
  api.get(`marketplace/carts/verify-payment/?reference=${reference}`);

export default api;
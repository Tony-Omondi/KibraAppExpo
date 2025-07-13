import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) {
          setError('User not logged in');
          setLoading(false);
          return;
        }
        const response = await api.get(`users/${userId}/`);
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile');
        setLoading(false);
        console.error(err.response?.data || err.message);
      }
    };
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#94e0b2" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Profile not found'}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')} // Replace with profile pic if available later
        style={styles.profileImage}
        resizeMode="contain"
      />
      <Text style={styles.title}>Welcome, {user.username}!</Text>
      <Text style={styles.info}>Email: {user.email}</Text>
      <Text style={styles.info}>Role: {user.role}</Text>
      <Text style={styles.info}>
        Email Verified: {user.is_email_verified ? 'Yes' : 'No'}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('EditProfile')} // Placeholder for edit screen
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')} // Placeholder for home/dashboard
      >
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141f18',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  title: {
    color: '#94e0b2',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'NotoSans-Regular',
  },
  info: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'NotoSans-Regular',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'NotoSans-Regular',
  },
  button: {
    backgroundColor: '#94e0b2',
    width: '100%',
    maxWidth: 480,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    marginBottom: 12,
  },
  buttonText: {
    color: '#141f18',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.15,
  },
});

export default ProfileScreen;
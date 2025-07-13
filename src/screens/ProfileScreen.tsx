// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { getProfile, updateProfile, createProfile, getUser } from '../api/api';
import * as Font from 'expo-font';

interface User {
  id: number;
  username: string;
  email: string;
}

interface Profile {
  id: number;
  user: User;
  bio?: string;
  location?: string;
  profile_picture?: string;
}

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
  });

  useEffect(() => {
    const initialize = async () => {
      await Font.loadAsync({
        'NotoSans-Regular': require('../../assets/fonts/NotoSans-Regular.ttf'),
      });
      setFontsLoaded(true);
      
      if (Platform.OS !== 'web') {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
      
      await fetchUserProfile();
    };
    initialize();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');

      try {
        // Try to get existing profile
        const response = await getProfile(userId);
        setProfile(response.data);
        setFormData({
          bio: response.data.bio || '',
          location: response.data.location || '',
        });
      } catch (err) {
        // If profile doesn't exist (404), create new one
        if (err.response?.status === 404) {
          const userData = await getUser(userId);
          const newProfile = {
            user: userId,
            bio: '',
            location: '',
          };
          const createdProfile = await createProfile(newProfile);
          setProfile({
            ...createdProfile.data,
            user: userData.data
          });
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('Profile error:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');
      
      await updateProfile(userId, formData);
      setProfile(prev => prev ? {...prev, ...formData} : null);
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      const userId = await AsyncStorage.getItem('user_id');
      const data = new FormData();
      data.append('profile_picture', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await updateProfile(userId, data);
      setProfile(response.data);
    } catch (err) {
      console.error('Image error:', err);
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#94e0b2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={fetchUserProfile}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Profile not found</Text>
        <TouchableOpacity style={styles.button} onPress={fetchUserProfile}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={profile.profile_picture 
              ? { uri: profile.profile_picture } 
              : require('../../assets/_.jpeg')}
            style={styles.profileImage}
          />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={20} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.username}>{profile.user.username}</Text>
        <Text style={styles.email}>{profile.user.email}</Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Bio</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={formData.bio}
            onChangeText={text => setFormData({...formData, bio: text})}
            placeholder="Tell about yourself"
            placeholderTextColor="#aaa"
            multiline
          />
        ) : (
          <Text style={styles.sectionContent}>
            {profile.bio || 'No bio added yet'}
          </Text>
        )}
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Location</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={text => setFormData({...formData, location: text})}
            placeholder="Your location"
            placeholderTextColor="#aaa"
          />
        ) : (
          <Text style={styles.sectionContent}>
            {profile.location || 'No location added yet'}
          </Text>
        )}
      </View>

      <View style={styles.buttonGroup}>
        {editMode ? (
          <>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSaveProfile}
            >
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => setEditMode(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.button, styles.editButton]} 
              onPress={() => setEditMode(true)}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141f18',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#141f18',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#94e0b2',
  },
  cameraIcon: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: '#94e0b2',
    borderRadius: 15,
    padding: 5,
  },
  username: {
    color: '#94e0b2',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    fontFamily: 'NotoSans-Regular',
  },
  email: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 5,
    fontFamily: 'NotoSans-Regular',
  },
  profileSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#94e0b2',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'NotoSans-Regular',
  },
  sectionContent: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'NotoSans-Regular',
    padding: 10,
    backgroundColor: '#1e2b22',
    borderRadius: 8,
  },
  input: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'NotoSans-Regular',
    padding: 10,
    backgroundColor: '#1e2b22',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#94e0b2',
  },
  buttonGroup: {
    width: '100%',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#94e0b2',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'NotoSans-Regular',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'NotoSans-Regular',
  },
});

export default ProfileScreen;
// === 📁 src/screens/ProfileScreen.tsx ===

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
import {
  getProfileByUserId,
  updateProfile,
  createProfile,
  getUser,
} from '../api/api';
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
  const [pickedImage, setPickedImage] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      await Font.loadAsync({
        'NotoSans-Regular': require('../../assets/fonts/NotoSans-Regular.ttf'),
      });
      setFontsLoaded(true);

      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission required',
            'We need camera roll permissions to upload images'
          );
        }
      }

      await fetchUserProfile();
    };

    initialize();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userIdStr = await AsyncStorage.getItem('user_id');
      if (!userIdStr) throw new Error('User not logged in');
      const userId = parseInt(userIdStr, 10);

      // ✅ call new API function:
      const res = await getProfileByUserId(userId);
      setProfile(res.data);
      setFormData({
        bio: res.data.bio || '',
        location: res.data.location || '',
      });
    } catch (err: any) {
      if (err?.response?.status === 404) {
        console.log('No profile found. Prompt user to create.');
        setProfile(null);
      } else {
        console.error('Fetch profile error:', err);
        setError(err.message || 'Failed to load profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    try {
      setLoading(true);

      const userIdStr = await AsyncStorage.getItem('user_id');
      if (!userIdStr) throw new Error('User not logged in');
      const userId = parseInt(userIdStr, 10);

      let newProfileData: any = {
        user: userId,
        bio: formData.bio,
        location: formData.location,
      };

      if (pickedImage) {
        const data = new FormData();
        data.append('user', String(userId));
        data.append('bio', formData.bio);
        data.append('location', formData.location);
        data.append('profile_picture', {
          uri: pickedImage,
          type: 'image/jpeg',
          name: 'profile.jpg',
        } as any);

        const res = await createProfile(data);
        const userData = await getUser(userId);
        setProfile({
          ...res.data,
          user: userData.data,
        });
      } else {
        const res = await createProfile(newProfileData);
        const userData = await getUser(userId);
        setProfile({
          ...res.data,
          user: userData.data,
        });
      }

      Alert.alert('Success', 'Profile created successfully!');
      setEditMode(false);
    } catch (err: any) {
      console.error('Create profile error:', err?.response || err);
      Alert.alert('Error', 'Failed to create profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!profile) {
        Alert.alert('Error', 'No profile loaded.');
        return;
      }

      setLoading(true);

      if (pickedImage) {
        const data = new FormData();
        data.append('bio', formData.bio);
        data.append('location', formData.location);
        data.append('profile_picture', {
          uri: pickedImage,
          type: 'image/jpeg',
          name: 'profile.jpg',
        } as any);

        const response = await updateProfile(profile.id, data);
        setProfile(response.data);
      } else {
        const response = await updateProfile(profile.id, formData);
        setProfile(response.data);
      }

      setEditMode(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (err: any) {
      console.error('Save profile error:', err?.response || err);
      Alert.alert('Error', 'Failed to save profile.');
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

      setPickedImage(result.assets[0].uri);
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to pick image.');
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
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Create Your Profile</Text>

        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              pickedImage
                ? { uri: pickedImage }
                : require('../../assets/_.jpeg')
            }
            style={styles.profileImage}
          />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={20} color="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <TextInput
            style={styles.input}
            value={formData.bio}
            onChangeText={(text) =>
              setFormData({ ...formData, bio: text })
            }
            placeholder="Tell about yourself"
            placeholderTextColor="#aaa"
            multiline
          />
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(text) =>
              setFormData({ ...formData, location: text })
            }
            placeholder="Your location"
            placeholderTextColor="#aaa"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleCreateProfile}
        >
          <Text style={styles.buttonText}>Create Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              pickedImage
                ? { uri: pickedImage }
                : profile.profile_picture
                ? { uri: profile.profile_picture }
                : require('../../assets/_.jpeg')
            }
            style={styles.profileImage}
          />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={20} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.username}>{profile.user?.username}</Text>
        <Text style={styles.email}>{profile.user?.email}</Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Bio</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={formData.bio}
            onChangeText={(text) =>
              setFormData({ ...formData, bio: text })
            }
            placeholder="Tell about yourself"
            placeholderTextColor="#aaa"
            multiline
          />
        ) : (
          <Text style={styles.sectionContent}>
            {profile.bio || 'No bio added yet.'}
          </Text>
        )}
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Location</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(text) =>
              setFormData({ ...formData, location: text })
            }
            placeholder="Your location"
            placeholderTextColor="#aaa"
          />
        ) : (
          <Text style={styles.sectionContent}>
            {profile.location || 'No location added yet.'}
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
              onPress={() => {
                setEditMode(false);
                setPickedImage(null);
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => setEditMode(true)}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
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

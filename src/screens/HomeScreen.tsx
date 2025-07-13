import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'NotoSans-Regular': require('../assets/fonts/NotoSans-Regular.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      Alert.alert('Logged out', 'You have been logged out.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <Text style={styles.header}>Home</Text>

      {/* Dummy Posts Section */}
      <ScrollView style={styles.postsContainer}>
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.postCard}>
            <Text style={styles.postTitle}>Post #{item}</Text>
            <Text style={styles.postContent}>
              This is some dummy post content for testing layout. Replace with real posts later.
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Messages')} // Make sure this exists
        >
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141f18',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    color: '#94e0b2',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
    fontFamily: 'NotoSans-Regular',
  },
  postsContainer: {
    flex: 1,
    marginBottom: 80,
  },
  postCard: {
    backgroundColor: '#2a4133',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  postTitle: {
    color: '#94e0b2',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'NotoSans-Regular',
  },
  postContent: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'NotoSans-Regular',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2a4133',
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 12,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navText: {
    color: '#94e0b2',
    fontSize: 16,
    fontFamily: 'NotoSans-Regular',
  },
  logoutButton: {
    backgroundColor: '#94e0b2',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    marginBottom: 20,
  },
  logoutText: {
    color: '#141f18',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.15,
    fontFamily: 'NotoSans-Regular',
  },
});

// src/screens/HomeScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  ImageBackground,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { getPosts, getAds } from '../api/api';

interface User {
  name?: string;
  profile_image?: string;
}

interface Post {
  id: number;
  user?: User;
  created_at?: string;
  image?: string;
  content?: string;
  likes_count?: number;
  comments_count?: number;
  is_ad?: boolean;
}

const HomeScreen = () => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [ads, setAds] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFonts();
    fetchData();
  }, []);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        'NotoSans-Regular': require('../../assets/fonts/NotoSans-Regular.ttf'),
      });
      setFontsLoaded(true);
    } catch (error) {
      console.error('Error loading fonts:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [postsResponse, adsResponse] = await Promise.all([
        getPosts().catch(() => ({ data: [] })),
        getAds().catch(() => ({ data: { ads: [] } })),
      ]);
      
      setPosts(postsResponse?.data || []);
      setAds(adsResponse?.data?.ads || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load posts and ads');
      setPosts([]);
      setAds([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

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

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Just now';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h`;
      } else {
        return `${Math.floor(diffInHours / 24)}d`;
      }
    } catch {
      return 'Just now';
    }
  };

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#94e0b2" />
        </View>
      );
    }

    const mergedContent = [];
    let postIndex = 0;
    let adIndex = 0;
    
    while (postIndex < posts.length || adIndex < ads.length) {
      if (postIndex < posts.length) {
        mergedContent.push(renderPost(posts[postIndex], false));
        postIndex++;
      }
      if (postIndex < posts.length) {
        mergedContent.push(renderPost(posts[postIndex], false));
        postIndex++;
      }
      
      if (adIndex < ads.length) {
        mergedContent.push(renderPost({ ...ads[adIndex], is_ad: true }, true));
        adIndex++;
      }
    }

    return mergedContent.length > 0 ? mergedContent : (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No posts available</Text>
      </View>
    );
  };

  const renderPost = (post: Post, isAd: boolean) => {
    if (!post) return null;

    return (
      <View key={post.id} style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Image 
            source={{ uri: post.user?.profile_image || 'https://via.placeholder.com/150' }} 
            style={styles.profileImage}
            defaultSource={require('../../assets/_.jpeg')}
          />
          <View style={styles.postHeaderText}>
            <Text style={styles.username}>{post.user?.name || 'Unknown User'}</Text>
            <Text style={styles.postTime}>{formatTime(post.created_at)}</Text>
          </View>
          {isAd && (
            <View style={styles.sponsoredBadge}>
              <Text style={styles.sponsoredText}>Sponsored</Text>
            </View>
          )}
        </View>

        {post.image && (
          <ImageBackground
            source={{ uri: post.image }}
            style={styles.postImage}
            resizeMode="cover"
          >
            {isAd && (
              <View style={styles.adLabel}>
                <Text style={styles.adLabelText}>Ad</Text>
              </View>
            )}
          </ImageBackground>
        )}

        {post.content && (
          <Text style={styles.postContent}>{post.content}</Text>
        )}

        <View style={styles.postActions}>
          <View style={styles.actionButton}>
            <Ionicons name="heart-outline" size={24} color="#94e0b2" />
            <Text style={styles.actionText}>{post.likes_count || 0}</Text>
          </View>
          <View style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#94e0b2" />
            <Text style={styles.actionText}>{post.comments_count || 0}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#94e0b2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Ionicons name="menu" size={24} color="white" />
        <Text style={styles.headerTitle}>Kibra</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.postsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#94e0b2']}
            tintColor="#94e0b2"
          />
        }
      >
        {renderContent()}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButtonActive}>
          <Ionicons name="home" size={24} color="white" />
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="newspaper-outline" size={24} color="#94e0b2" />
          <Text style={styles.navText}>News</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="notifications-outline" size={24} color="#94e0b2" />
          <Text style={styles.navText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color="#94e0b2" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    flex: 1,
    backgroundColor: '#141f18',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: '#94e0b2',
    fontSize: 16,
    fontFamily: 'NotoSans-Regular',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#122118',
    borderBottomWidth: 1,
    borderBottomColor: '#264532',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'NotoSans-Regular',
  },
  postsContainer: {
    flex: 1,
    marginBottom: 60,
  },
  postContainer: {
    marginBottom: 16,
    backgroundColor: '#122118',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#2a4133',
  },
  postHeaderText: {
    flex: 1,
  },
  username: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'NotoSans-Regular',
  },
  postTime: {
    color: '#94e0b2',
    fontSize: 14,
    fontFamily: 'NotoSans-Regular',
  },
  sponsoredBadge: {
    backgroundColor: '#2a4133',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sponsoredText: {
    color: '#94e0b2',
    fontSize: 12,
    fontFamily: 'NotoSans-Regular',
  },
  postImage: {
    width: '100%',
    aspectRatio: 3/2,
    justifyContent: 'flex-end',
    backgroundColor: '#2a4133',
  },
  adLabel: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  adLabelText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'NotoSans-Regular',
  },
  postContent: {
    color: 'white',
    fontSize: 14,
    padding: 12,
    fontFamily: 'NotoSans-Regular',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    color: '#94e0b2',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'NotoSans-Regular',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1b3124',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#264532',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  navButtonActive: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  navText: {
    color: '#94e0b2',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'NotoSans-Regular',
  },
  navTextActive: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'NotoSans-Regular',
  },
});

export default HomeScreen;

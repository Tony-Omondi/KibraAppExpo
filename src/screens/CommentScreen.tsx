import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getCommentsForPost, addCommentToPost, getProfileByUserId } from '../api/api';
import { Ionicons } from '@expo/vector-icons';

interface User {
  id: number;
  username: string;
  email: string;
}

interface UserProfile {
  id: number;
  user: User;
  profile_image?: string;
  bio?: string;
}

interface Author {
  id: number;
  username: string;
  email: string;
  is_email_verified: boolean;
  role: string;
  verification_code: string | null;
}

interface Comment {
  id: number;
  user: Author;
  text: string;
  created_at: string;
}

const CommentScreen = () => {
  const route = useRoute();
  const { postId } = route.params as { postId: number };
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [profiles, setProfiles] = useState<Record<number, UserProfile>>({});

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await getCommentsForPost(postId);
      const commentsData = response.data || [];
      console.log('Comments Response:', commentsData);
      setComments(commentsData);

      const uniqueUserIds = [
        ...new Set(commentsData.map((c: Comment) => c.user.id).filter(id => typeof id === 'number')),
      ];

      const profs: Record<number, UserProfile> = {};
      const profilePromises = uniqueUserIds.map(async (userId: number) => {
        const profileRes = await getProfileByUserId(userId);
        profs[userId] = profileRes.data;
      });
      await Promise.all(profilePromises);
      setProfiles(profs);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!text.trim()) return;
    try {
      await addCommentToPost(postId, text.trim());
      setText('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const profile = profiles[item.user.id] || {
      user: { id: item.user.id, username: item.user.username || 'Unknown User', email: item.user.email || '' },
      profile_image: undefined,
    };
    return (
      <View style={styles.commentContainer}>
        <Image
          source={
            profile.profile_image
              ? { uri: profile.profile_image }
              : require('../../assets/_.jpeg')
          }
          style={styles.avatar}
        />
        <View style={styles.commentContent}>
          <Text style={styles.username}>{profile.user.username}</Text>
          <Text style={styles.text}>{item.text}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#94e0b2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderComment}
        contentContainerStyle={{ padding: 10 }}
      />
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Write a comment..."
          placeholderTextColor="#aaa"
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleAddComment}>
          <Ionicons name="send" size={26} color="#94e0b2" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141f18' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  commentContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    backgroundColor: '#122118',
    padding: 10,
    borderRadius: 8,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  commentContent: { flex: 1 },
  username: { color: '#94e0b2', fontWeight: 'bold', fontFamily: 'NotoSans-SemiBold' },
  text: { color: 'white', marginTop: 4, fontFamily: 'NotoSans-Regular' },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#122118',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#2a4133',
    borderRadius: 20,
    paddingHorizontal: 15,
    color: 'white',
    height: 40,
    marginRight: 10,
    fontFamily: 'NotoSans-Regular',
  },
});

export default CommentScreen;
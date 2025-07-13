import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getPosts } from '../api/api';

const NewsScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getPosts();
      console.log('API Response:', JSON.stringify(response.data, null, 2));
      setPosts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('API Error:', err.message, err.response?.data);
      setError('Failed to load news. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <Text style={styles.postTitle}>{item.title || 'No Title'}</Text>
      <Text style={styles.postContent}>{item.content || 'No Content'}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Kibra Community News</Text>
        <Text style={styles.error}>{error}</Text>
        <Button title="Retry" onPress={fetchPosts} />
        <Button
          title="Login to Post"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Kibra Community News</Text>
        <Text style={styles.empty}>No posts available</Text>
        <Button
          title="Login to Post"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kibra Community News</Text>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
        style={styles.list}
      />
      <Button
        title="Login to Post"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  list: { flex: 1 },
  postContainer: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  postContent: { fontSize: 14, color: '#333' },
  error: { fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 10 },
  empty: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 10 },
});

export default NewsScreen;
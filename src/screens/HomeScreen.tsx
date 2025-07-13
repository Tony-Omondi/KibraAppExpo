import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';

const dummyFeed = [
  {
    id: '1',
    type: 'post',
    title: 'Kibra Youth Empowerment Program',
    date: '2d',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAnSQXXu6y2Jt4ZF1ocw4laLObjg-pOvI35FSIchQZ8JOJk_Q5V2KJlcvynI6CwFBUfZm8jkaa0bRdsHNt3YYRW5sKidgCAbZ-31rM3PWXokCreUzz3k39QtvykO6IYQSeNML6ITqBE1cZZUwjoYjKwaei6sdS355xnnkWfu0pOuTooO1e_1Lxzh64UAMxvjnIdNU0mnPr3xHmPb4AECv8DxQKquTFcyGBssvLNLGLy8XNjqnQT79IkEwbtoSJ2HstwW8Z5RB1ECnym',
    content:
      'Join us for a workshop on digital skills and entrepreneurship. Learn how to leverage technology for personal and community growth.',
    likes: 23,
    comments: 5,
  },
  {
    id: 'ad-1',
    type: 'ad',
    title: 'Sponsored: Local Business Spotlight',
    date: '3d',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB2aSo3YDSMAyPHvoTYzAR6oExy5d__22nebHpqRSAWFf5tNZxe6QS4Y6sl1sxSHAbpjCq_TKEwtshMlD0sGyGCM61OevaKtrnG8XHXGD9gaVAfZcL-lnu9UOYSbZjpH1EnB8R3JpJhOCVQyR3kRw2XsXqu83PNZFsVL8faLCiZZiGFuZuDl23q1u-zm5Qb10v6BzuSN936V8beYtTYD5_11Qosms4EBNXRLUoXeQyeByuNoX5p0dqTk3lvkwjhuAgmFAY9B3VLuPEB',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAqvF6p-NkBvS_qcLZkf6s6mCX1sHvrclTXkpoQVxIIsOjtRmUjVKEVp2-_4CFA9KRz7HPxxaesfIJ6zcahM5MUBjNSDCsfDxea9Q16p_WgMw223Q9yYoMguU1TDwCVDBVzRDOa83l-1QLfXN4Br__R0_0jycQLNC-E2KjDL_z3e-cuFpu03KegykIDCzk1mtQKfrupYUkdYYHsv0c3BjvUCmNG1QgXzOmRlS-d_SaNcpp36Lg4aBFcKhLy8tlvTssu-7rKltB3K0sv',
    content:
      'Support local businesses in Kibra. Check out the latest offers from our community entrepreneurs.',
    likes: 35,
    comments: 8,
  },
  {
    id: '2',
    type: 'post',
    title: 'Community Clean-Up Drive',
    date: '1d',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDladBUbiBPV0nVpiEWko9qFASEGP5zdbbfXAXi4CEsmoudU9VHpKX6bhzDaHgOZpP5mLGs0cdnIH9p7NsD6Myw3jIQWlbN4pEXp_OWy4zhReEXY7biCTitCktm586jTpdkuX1I3kREiPg1knxws7PRambJaSsc4jh7qELs94s-RlIqQa2El3cQj24SDMJosXBrZc0EoPfB6rO-cZ3_0yjm8yoIJK2fCQWc1BTMFguebkYBtil7EUSqU01vLFT1y3xJWftiYFvVFQO4',
    content:
      'Let\'s keep Kibra clean! Join our community clean-up drive this Saturday. Gloves and bags will be provided.',
    likes: 18,
    comments: 3,
  },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'NotoSans-Regular': require('../../assets/fonts/NotoSans-Regular.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      Alert.alert('Logged out', 'You have been logged out.');
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Failed to logout');
    }
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
      <Text style={styles.header}>Home</Text>
      <ScrollView>
        {dummyFeed.map((item) =>
          item.type === 'post' ? (
            <View key={item.id} style={styles.postCard}>
              <ImageBackground
                source={{ uri: item.image }}
                style={styles.postImage}
                imageStyle={{ borderRadius: 12 }}
              />
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postDate}>{item.date}</Text>
              <Text style={styles.postContent}>{item.content}</Text>
              <View style={styles.reactions}>
                <Text style={styles.reactionText}>❤️ {item.likes}</Text>
                <Text style={styles.reactionText}>💬 {item.comments}</Text>
              </View>
            </View>
          ) : (
            <View key={item.id} style={styles.adCard}>
              <View style={styles.adHeader}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.adTitle}>{item.title}</Text>
                  <Text style={styles.adDate}>{item.date}</Text>
                </View>
              </View>
              <ImageBackground
                source={{ uri: item.image }}
                style={styles.adImage}
                imageStyle={{ borderRadius: 0 }}
              />
              <Text style={styles.adContent}>{item.content}</Text>
              <View style={styles.reactions}>
                <Text style={styles.reactionText}>❤️ {item.likes}</Text>
                <Text style={styles.reactionText}>💬 {item.comments}</Text>
              </View>
            </View>
          )
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Messages')}>
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#122118',
  },
  container: {
    flex: 1,
    backgroundColor: '#122118',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'NotoSans-Regular',
    marginBottom: 16,
    alignSelf: 'center',
  },
  postCard: {
    backgroundColor: '#2a4133',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    marginBottom: 8,
  },
  postTitle: {
    color: '#94e0b2',
    fontSize: 18,
    fontFamily: 'NotoSans-Regular',
    fontWeight: 'bold',
  },
  postDate: {
    color: '#96c5a9',
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'NotoSans-Regular',
  },
  postContent: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'NotoSans-Regular',
    marginBottom: 8,
  },
  adCard: {
    backgroundColor: '#122118',
    marginBottom: 20,
  },
  adHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  adTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'NotoSans-Regular',
    fontWeight: 'bold',
  },
  adDate: {
    color: '#96c5a9',
    fontSize: 12,
    fontFamily: 'NotoSans-Regular',
  },
  adImage: {
    width: '100%',
    height: 200,
  },
  adContent: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'NotoSans-Regular',
    padding: 12,
  },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  reactionText: {
    color: '#96c5a9',
    fontSize: 14,
    fontFamily: 'NotoSans-Regular',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2a4133',
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 16,
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

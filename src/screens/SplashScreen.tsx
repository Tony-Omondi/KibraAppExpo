import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Image,
  Text,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';

const SplashScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate gradient movement
    Animated.loop(
      Animated.timing(gradientAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      })
    ).start();

    setTimeout(async () => {
      const token = await AsyncStorage.getItem('access_token');
      navigation.replace(token ? 'Home' : 'Login');
    }, 4000);
  }, [fadeAnim, scaleAnim, navigation]);

  const translateX = gradientAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoWrapper,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <MaskedView
          maskElement={
            <View style={styles.mask}>
              <Text style={styles.maskedText}>KIBRACONNECT</Text>
            </View>
          }
        >
          <Animated.View style={{ transform: [{ translateX }] }}>
            <LinearGradient
              colors={['#94e0b2', '#2a4133', '#94e0b2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            />
          </Animated.View>
        </MaskedView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141f18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 30,
    borderRadius: 30,
    backgroundColor: '#2a4133',
    padding: 10,
  },
  maskedText: {
    fontSize: 36,
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: 2,
    color: 'black', // Needed for mask to work
  },
  mask: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    width: 400,
    height: 50,
  },
});

export default SplashScreen;

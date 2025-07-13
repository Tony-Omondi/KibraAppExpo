import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { login, googleLogin } from '../api/api';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { GOOGLE_CLIENT_ID } from '../utils/constants';

GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID,
});

const LoginScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    username: false,
    password: false,
  });

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10,15}$/;
    return re.test(phone);
  };

  const handleLogin = async () => {
    let isValid = true;
    const newErrors = { username: false, password: false };

    // Username validation (can be email or phone)
    if (!username) {
      newErrors.username = true;
      Alert.alert('Error', 'Username/Email/Phone is required');
      isValid = false;
    } else if (username.includes('@') && !validateEmail(username)) {
      newErrors.username = true;
      Alert.alert('Error', 'Please enter a valid email address');
      isValid = false;
    } else if (!isNaN(username) && !validatePhone(username)) {
      newErrors.username = true;
      Alert.alert('Error', 'Please enter a valid phone number (10-15 digits)');
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = true;
      Alert.alert('Error', 'Password is required');
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = true;
      Alert.alert('Error', 'Password must be at least 8 characters');
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await login(username, password);
      await AsyncStorage.setItem('access_token', res.data.access);
      await AsyncStorage.setItem('refresh_token', res.data.refresh);
      await AsyncStorage.setItem('user_id', res.data.user.id.toString());
      Alert.alert('Success', 'You are now logged in!');
      navigation.replace('Profile'); // Changed to Profile for consistency
    } catch (err) {
      console.error(err.response?.data || err.message);
      let errorMessage = 'Check your credentials';
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.non_field_errors) {
        errorMessage = err.response.data.non_field_errors.join('\n');
      }
      Alert.alert('Login Failed', errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const res = await googleLogin(userInfo.idToken);
      await AsyncStorage.setItem('access_token', res.data.access);
      await AsyncStorage.setItem('refresh_token', res.data.refresh);
      await AsyncStorage.setItem('user_id', res.data.user.id.toString());
      Alert.alert('Success', 'Logged in with Google!');
      navigation.replace('Profile'); // Changed to Profile for consistency
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert('Google Login Failed', 'Try again');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <TextInput
        placeholder="Phone Number or Email"
        placeholderTextColor="#9bbfaa"
        style={[styles.input, errors.username && styles.inputError]}
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          setErrors({...errors, username: false});
        }}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#9bbfaa"
        style={[styles.input, errors.password && styles.inputError]}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setErrors({...errors, password: false});
        }}
        secureTextEntry
      />

      <TouchableOpacity 
        style={styles.forgotPassword}
        onPress={() => navigation.navigate('ForgotPassword')} // Make sure you have this screen set up
      >
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <GoogleSigninButton
        style={styles.googleButton}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleGoogleLogin}
      />
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
  logo: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    maxWidth: 480,
    height: 56,
    backgroundColor: '#2a4133',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontFamily: 'NotoSans-Regular',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ff4d4f',
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
  googleButton: {
    width: 192,
    height: 48,
    marginTop: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    color: '#9bbfaa',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
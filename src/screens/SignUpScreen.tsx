import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { register, googleLogin } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { GOOGLE_CLIENT_ID } from '../utils/constants';

GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID,
});

const SignUpScreen = () => {
  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [errors, setErrors] = useState({
    username: false,
    email: false,
    password1: false,
    password2: false,
  });

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleRegister = async () => {
    let isValid = true;
    const newErrors = {
      username: false,
      email: false,
      password1: false,
      password2: false,
    };

    if (!username) {
      newErrors.username = true;
      Alert.alert('Error', 'Username is required');
      isValid = false;
    } else if (username.length < 4) {
      newErrors.username = true;
      Alert.alert('Error', 'Username must be at least 4 characters');
      isValid = false;
    }

    if (!email) {
      newErrors.email = true;
      Alert.alert('Error', 'Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = true;
      Alert.alert('Error', 'Please enter a valid email address');
      isValid = false;
    }

    if (!password1) {
      newErrors.password1 = true;
      Alert.alert('Error', 'Password is required');
      isValid = false;
    } else if (!validatePassword(password1)) {
      newErrors.password1 = true;
      Alert.alert('Error', 'Password must be at least 8 characters');
      isValid = false;
    }

    if (password1 !== password2) {
      newErrors.password2 = true;
      Alert.alert('Error', 'Passwords do not match');
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    try {
      await register(username, email, password1, password2);
      Alert.alert('Success', 'Account created! Check your email to verify.');
      navigation.navigate('VerifyEmail');
    } catch (err) {
      console.error(err.response?.data || err.message);
      let errorMessage = 'Registration failed. Please check your details.';

      if (err.response?.data) {
        const data = err.response.data;
        if (data.username) {
          errorMessage = `Username: ${data.username.join(' ')}`;
        } else if (data.email) {
          errorMessage = `Email: ${data.email.join(' ')}`;
        } else if (data.password1) {
          errorMessage = `Password: ${data.password1.join(' ')}`;
        } else if (data.non_field_errors) {
          errorMessage = data.non_field_errors.join('\n');
        }
      }

      Alert.alert('Registration Failed', errorMessage);
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
        placeholder="Username"
        style={[styles.input, errors.username && styles.inputError]}
        placeholderTextColor="#9bbfaa"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          setErrors({ ...errors, username: false });
        }}
      />

      <TextInput
        placeholder="Email"
        style={[styles.input, errors.email && styles.inputError]}
        placeholderTextColor="#9bbfaa"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrors({ ...errors, email: false });
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        style={[styles.input, errors.password1 && styles.inputError]}
        placeholderTextColor="#9bbfaa"
        secureTextEntry
        value={password1}
        onChangeText={(text) => {
          setPassword1(text);
          setErrors({ ...errors, password1: false });
        }}
      />

      <TextInput
        placeholder="Confirm Password"
        style={[styles.input, errors.password2 && styles.inputError]}
        placeholderTextColor="#9bbfaa"
        secureTextEntry
        value={password2}
        onChangeText={(text) => {
          setPassword2(text);
          setErrors({ ...errors, password2: false });
        }}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Login</Text>
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
});

export default SignUpScreen;
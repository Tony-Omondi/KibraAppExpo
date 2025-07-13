import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { verifyEmail } from '../api/api';

const VerifyEmailScreen = () => {
  const navigation = useNavigation();
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  const handleVerifyEmail = async () => {
    if (!verificationCode) {
      setError('Verification code is required');
      return;
    }

    try {
      const response = await verifyEmail({ verification_code: verificationCode });
      Alert.alert('Success', response.data.message || 'Email verified successfully!');
      navigation.navigate('Login'); // Or wherever you want
    } catch (err) {
      console.error(err.response?.data || err.message);
      let errorMessage = 'Verification failed. Please check the code.';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
      Alert.alert('Verification Failed', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.instruction}>
        Please enter the verification code sent to your email.
      </Text>

      <TextInput
        placeholder="Verification Code"
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#9bbfaa"
        value={verificationCode}
        onChangeText={(text) => {
          setVerificationCode(text);
          setError('');
        }}
        keyboardType="numeric"
        maxLength={6}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleVerifyEmail}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={styles.linkText}>Resend Code</Text>
      </TouchableOpacity>
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
  title: {
    color: '#94e0b2',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'NotoSans-Regular',
  },
  instruction: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'NotoSans-Regular',
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
  errorText: {
    color: '#ff4d4f',
    fontSize: 14,
    marginBottom: 12,
    fontFamily: 'NotoSans-Regular',
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
  linkButton: {
    marginTop: 16,
  },
  linkText: {
    color: '#94e0b2',
    fontSize: 16,
    textDecorationLine: 'underline',
    fontFamily: 'NotoSans-Regular',
  },
});

export default VerifyEmailScreen;

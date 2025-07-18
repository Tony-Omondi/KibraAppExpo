
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { verifyPayment } from '../api/api';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { authorizationUrl, reference, cartId, total } = route.params || {};

  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewError, setWebViewError] = useState(null);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'NotoSans-Regular': require('../../assets/fonts/NotoSans-Regular.ttf'),
          'NotoSans-SemiBold': require('../../assets/fonts/NotoSans-Regular.ttf'),
        });
        setFontsLoaded(true);
        setWebViewVisible(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        Alert.alert('Error', 'Failed to load fonts');
        setFontsLoaded(true);
      }
    };

    loadFonts();
    console.log('CheckoutScreen params:', { authorizationUrl, reference, cartId, total });
  }, []);

  const handleNavigationStateChange = async (navState) => {
    const { url } = navState;
    console.log('WebView navigation:', { url, reference });

    // Handle Paystack success page, deep link, or callback URLs
    if (
      url.includes('kibraconnect://payment-callback') ||
      url.includes('success=true') ||
      url.includes('/api/payments/callback/') ||
      url.includes('/api/marketplace/payments/callback/') ||
      url.includes('paystack.co/success') // Catch Paystack success page
    ) {
      console.log('Detected callback or success page, verifying payment...');
      setWebViewVisible(false);
      try {
        const referenceId = url.split('reference=')[1]?.split('&')[0] || reference;
        if (!referenceId) {
          throw new Error('No reference found in callback URL');
        }
        console.log('Verifying payment with reference:', referenceId);

        const response = await verifyPayment(referenceId);
        console.log('Verify payment response:', response.data);
        if (response.data?.status === 'success') {
          navigation.replace('PaymentSuccess', { orderId: response.data.order_id });
        } else {
          Alert.alert('Payment Failed', response.data?.error || 'Unknown failure.');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Payment verification failed:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        Alert.alert('Error', error.response?.data?.error || error.message || 'Payment verification failed');
        navigation.goBack();
      }
    }
  };

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', {
      url: nativeEvent.url,
      code: nativeEvent.code,
      description: nativeEvent.description,
      statusCode: nativeEvent.statusCode,
    });
    setWebViewError(nativeEvent.description);

    if (
      (nativeEvent.url.includes('/api/payments/callback/') ||
       nativeEvent.url.includes('/api/marketplace/payments/callback/')) &&
      nativeEvent.statusCode === 404
    ) {
      const referenceId = nativeEvent.url.split('reference=')[1]?.split('&')[0] || reference;
      if (referenceId) {
        console.log('Falling back to verifyPayment with reference:', referenceId);
        handleNavigationStateChange({ url: nativeEvent.url });
        return;
      }
    }

    Alert.alert('WebView Error', nativeEvent.description || 'Failed to load payment page');
    navigation.goBack();
  };

  if (!fontsLoaded || !authorizationUrl || !authorizationUrl.startsWith('https')) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#94e0b2" />
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#94e0b2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      {total && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>Total: KSh {total}</Text>
        </View>
      )}

      {webViewVisible && (
        <WebView
          source={{ uri: authorizationUrl }}
          style={styles.webview}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleWebViewError}
          onHttpError={handleWebViewError}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#94e0b2" />
              <Text style={styles.loadingText}>Loading payment...</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e1611',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#122118',
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a2a20',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'NotoSans-SemiBold',
    marginLeft: 10,
  },
  summaryContainer: {
    padding: 10,
    backgroundColor: '#122118',
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a2a20',
  },
  summaryText: {
    color: '#94e0b2',
    fontSize: 16,
    fontFamily: 'NotoSans-SemiBold',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0e1611',
  },
  loadingText: {
    color: '#94e0b2',
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'NotoSans-Regular',
  },
});

export default CheckoutScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { getOrders } from '../api/api';

interface Order {
  id: number;
  buyer: { id: number; username: string; email: string };
  product: { id: number; title: string; price: string; image?: string };
  ordered_at: string;
}

const OrdersScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadFonts();
    fetchOrders();
  }, []);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        'NotoSans-Regular': require('../../assets/fonts/NotoSans-Regular.ttf'),
        'NotoSans-SemiBold': require('../../assets/fonts/NotoSans-Regular.ttf'),
      });
      setFontsLoaded(true);
    } catch (error) {
      console.error('Error loading fonts:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
      if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else {
        return `${Math.floor(diffInHours / 24)}d ago`;
      }
    } catch {
      return 'Just now';
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderContainer}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.product.id })}
    >
      <Text style={styles.orderTitle}>{item.product.title}</Text>
      <Text style={styles.orderPrice}>${item.product.price}</Text>
      <Text style={styles.orderTime}>Ordered: {formatTime(item.ordered_at)}</Text>
    </TouchableOpacity>
  );

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#94e0b2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#94e0b2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Orders</Text>
      </View>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.orderList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No orders found</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141f18',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#122118',
    borderBottomWidth: 0.5,
    borderBottomColor: '#264532',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'NotoSans-SemiBold',
    marginLeft: 10,
  },
  orderList: {
    padding: 15,
  },
  orderContainer: {
    backgroundColor: '#122118',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  orderTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'NotoSans-SemiBold',
    marginBottom: 5,
  },
  orderPrice: {
    color: '#94e0b2',
    fontSize: 14,
    fontFamily: 'NotoSans-Regular',
    marginBottom: 5,
  },
  orderTime: {
    color: '#94e0b2',
    fontSize: 12,
    fontFamily: 'NotoSans-Regular',
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'NotoSans-Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141f18',
  },
});

export default OrdersScreen;
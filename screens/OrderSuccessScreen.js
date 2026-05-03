import React, { useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Animated,
  Dimensions, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OrderSuccessScreen({ navigation, route }) {
  const orderId = route.params?.orderId || '';
  const total = route.params?.total || '0.00';
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <MaterialIcons name="check" size={60} color="#ffffff" />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={styles.successTitle}>Order Placed! 🎉</Text>
          <Text style={styles.successSubtitle}>Your order has been confirmed and will be delivered soon.</Text>

          {/* Order Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ORDER ID</Text>
              <Text style={styles.detailValue}>#{orderId.slice(-8).toUpperCase()}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>TOTAL AMOUNT</Text>
              <Text style={styles.detailValueBig}>₹{total}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>PAYMENT</Text>
              <Text style={styles.detailValue}>Cash on Delivery</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>EST. DELIVERY</Text>
              <View style={styles.deliveryBadge}>
                <MaterialIcons name="bolt" size={14} color="#DC2626" />
                <Text style={styles.deliveryText}>10-15 mins</Text>
              </View>
            </View>
          </View>

          {/* Tracking Info */}
          <View style={styles.trackingCard}>
            <MaterialIcons name="local-shipping" size={24} color="#CDEFC0" />
            <Text style={styles.trackingText}>You can track your order in the Orders tab</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.ordersBtn} onPress={() => {
          navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'Orders' }] });
        }}>
          <MaterialIcons name="receipt-long" size={18} color="#16803C" />
          <Text style={styles.ordersBtnText}>View Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeBtn} onPress={() => {
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        }}>
          <Text style={styles.homeBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  iconContainer: { marginBottom: 30 },
  iconOuter: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(22,128,60,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconInner: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#16803C',
    alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: 28, fontWeight: '900', color: '#1e293b', marginBottom: 10 },
  successSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 30, paddingHorizontal: 20 },
  detailsCard: {
    width: width - 40, backgroundColor: '#f8fafc', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  detailLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 1 },
  detailValue: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  detailValueBig: { fontSize: 20, fontWeight: '900', color: '#16803C' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 4 },
  deliveryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deliveryText: { fontSize: 13, fontWeight: 'bold', color: '#ef4444' },
  trackingCard: {
    width: width - 40, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(22,128,60,0.05)', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(22,128,60,0.1)',
  },
  trackingText: { fontSize: 13, color: '#64748b', flex: 1 },
  bottomActions: { paddingHorizontal: 20, paddingBottom: 30, gap: 12 },
  ordersBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#16803C', borderRadius: 20, height: 52,
  },
  ordersBtnText: { fontSize: 15, fontWeight: '700', color: '#16803C' },
  homeBtn: {
    backgroundColor: '#16803C', borderRadius: 20, height: 52,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#16803C', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  homeBtnText: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
});

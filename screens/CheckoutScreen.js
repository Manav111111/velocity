import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Platform, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

export default function CheckoutScreen({ navigation, route }) {
  const {
    user, location, address, cartItems, cartTotal, cartItemCount,
    placeOrder, savedAddresses,
  } = useAppContext();

  const instructions = route.params?.instructions || '';
  const [placing, setPlacing] = useState(false);

  // Receiver details
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');

  // Autofill from active saved address or user profile
  useEffect(() => {
    const activeAddr = savedAddresses?.[0]; // Default address is sorted first
    if (activeAddr) {
      setReceiverName(activeAddr.receiverName || user?.displayName || '');
      setReceiverPhone(activeAddr.receiverPhone || '');
    } else if (user?.displayName) {
      setReceiverName(user.displayName);
    }
  }, [savedAddresses, user]);

  const deliveryFee = 12.50;
  const tax = parseFloat((cartTotal * 0.0763).toFixed(2));
  const total = (cartTotal + deliveryFee + tax).toFixed(2);

  const validate = () => {
    if (!receiverName.trim()) {
      Alert.alert('Error', 'Please enter receiver name.');
      return false;
    }
    if (!receiverPhone.trim() || !/^\d{10}$/.test(receiverPhone.trim())) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
      return false;
    }
    if (!location || location === 'Select Location') {
      Alert.alert('Address Required', 'Please select a delivery address.', [
        { text: 'Select Address', onPress: () => navigation.navigate('Location') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return false;
    }
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setPlacing(true);
    try {
      const orderId = await placeOrder({
        address: location,
        addressDetails: address,
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        instructions,
      });
      navigation.replace('OrderSuccess', { orderId, total });
    } catch (error) {
      console.error('Order placement error:', error);
      Alert.alert('Order Failed', 'Something went wrong. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Steps Indicator */}
        <View style={styles.stepsRow}>
          <View style={styles.stepDone}><MaterialIcons name="check" size={14} color="#ffffff" /></View>
          <View style={styles.stepLine} />
          <View style={styles.stepDone}><MaterialIcons name="check" size={14} color="#ffffff" /></View>
          <View style={styles.stepLine} />
          <View style={styles.stepCurrent}><Text style={styles.stepNum}>3</Text></View>
        </View>
        <View style={styles.stepLabels}>
          <Text style={styles.stepLabel}>Cart</Text>
          <Text style={styles.stepLabel}>Address</Text>
          <Text style={[styles.stepLabel, { color: '#b6a0ff' }]}>Payment</Text>
        </View>

        {/* Delivery Address */}
        <Text style={styles.sectionTitle}>DELIVERY ADDRESS</Text>
        <TouchableOpacity style={styles.addressCard} onPress={() => navigation.navigate('Location')}>
          <MaterialIcons name="location-on" size={22} color="#8b5cf6" />
          <View style={styles.addressInfo}>
            <Text style={styles.addressText} numberOfLines={2}>{location}</Text>
            <Text style={styles.changeText}>Tap to change address</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#64748b" />
        </TouchableOpacity>

        {/* Receiver Details */}
        <Text style={styles.sectionTitle}>RECEIVER DETAILS</Text>
        <View style={styles.receiverCard}>
          <View style={styles.inputGroup}>
            <MaterialIcons name="person" size={18} color="#8b5cf6" style={styles.inputIcon} />
            <TextInput
              style={styles.receiverInput}
              placeholder="Receiver full name"
              placeholderTextColor="#94a3b8"
              value={receiverName}
              onChangeText={setReceiverName}
            />
          </View>
          <View style={styles.inputDivider} />
          <View style={styles.inputGroup}>
            <MaterialIcons name="phone" size={18} color="#8b5cf6" style={styles.inputIcon} />
            <TextInput
              style={styles.receiverInput}
              placeholder="10-digit phone number"
              placeholderTextColor="#94a3b8"
              value={receiverPhone}
              onChangeText={setReceiverPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>

        {/* Order Items Summary */}
        <Text style={styles.sectionTitle}>ORDER ITEMS ({cartItemCount})</Text>
        <View style={styles.itemsCard}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.qty}x</Text>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemTotal}>₹{((item.price || 0) * item.qty).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Payment Method — COD Only */}
        <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
        <View style={[styles.paymentOption, styles.paymentActive]}>
          <View style={styles.paymentIconBox}>
            <MaterialIcons name="payments" size={22} color="#8b5cf6" />
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Cash on Delivery</Text>
            <Text style={styles.paymentDesc}>Pay when your order arrives at your door</Text>
          </View>
          <MaterialIcons name="radio-button-checked" size={22} color="#8b5cf6" />
        </View>
        <View style={styles.codNote}>
          <MaterialIcons name="info-outline" size={14} color="#64748b" />
          <Text style={styles.codNoteText}>Keep exact change ready for a smooth delivery</Text>
        </View>

        {/* Price Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{cartTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (7.63%)</Text>
            <Text style={styles.summaryValue}>₹{tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomLabel}>Total Amount</Text>
          <Text style={styles.bottomTotal}>₹{total}</Text>
        </View>
        <TouchableOpacity style={styles.placeBtn} onPress={handlePlaceOrder} disabled={placing}>
          {placing ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialIcons name="local-shipping" size={18} color="#ffffff" />
              <Text style={styles.placeBtnText}>PLACE ORDER</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  stepsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, marginTop: 10,
  },
  stepDone: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center',
  },
  stepCurrent: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(139,92,246,0.1)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#8b5cf6',
  },
  stepNum: { fontSize: 12, fontWeight: 'bold', color: '#8b5cf6' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#8b5cf6', marginHorizontal: 8 },
  stepLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 50, marginTop: 8, marginBottom: 25 },
  stepLabel: { fontSize: 11, fontWeight: '600', color: '#64748b' },
  sectionTitle: {
    fontSize: 10, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1.5,
    paddingHorizontal: 20, marginBottom: 12, marginTop: 10,
  },
  addressCard: {
    marginHorizontal: 20, backgroundColor: '#f8fafc', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  addressInfo: { flex: 1 },
  addressText: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 2, lineHeight: 20 },
  changeText: { fontSize: 11, color: '#8b5cf6' },

  // Receiver card
  receiverCard: {
    marginHorizontal: 20, backgroundColor: '#f8fafc', borderRadius: 16,
    marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden',
  },
  inputGroup: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  receiverInput: { flex: 1, fontSize: 14, color: '#1e293b', paddingVertical: 16 },
  inputDivider: { height: 1, backgroundColor: '#e2e8f0', marginHorizontal: 16 },

  // Items
  itemsCard: {
    marginHorizontal: 20, backgroundColor: '#f8fafc', borderRadius: 16, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0',
  },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  itemQty: { fontSize: 13, fontWeight: 'bold', color: '#8b5cf6', width: 32 },
  itemName: { flex: 1, fontSize: 14, color: '#1e293b', fontWeight: '600' },
  itemTotal: { fontSize: 14, fontWeight: '700', color: '#1e293b' },

  // Payment
  paymentOption: {
    marginHorizontal: 20, backgroundColor: '#f8fafc', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  paymentActive: { borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.05)' },
  paymentIconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(139,92,246,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  paymentInfo: { flex: 1 },
  paymentTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  paymentDesc: { fontSize: 12, color: '#64748b' },
  codNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, marginBottom: 16,
  },
  codNoteText: { fontSize: 11, color: '#64748b', flex: 1 },

  // Summary
  summaryCard: {
    marginHorizontal: 20, backgroundColor: '#f8fafc', borderRadius: 16, padding: 16,
    marginTop: 8, borderWidth: 1, borderColor: '#e2e8f0',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#64748b' },
  summaryValue: { fontSize: 14, color: '#1e293b', fontWeight: '600' },
  totalRow: {
    borderTopWidth: 1, borderTopColor: '#e2e8f0',
    paddingTop: 12, marginTop: 4, marginBottom: 0,
  },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  totalValue: { fontSize: 20, fontWeight: '900', color: '#8b5cf6' },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#ffffff', paddingHorizontal: 20, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#e2e8f0',
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  bottomInfo: { flex: 1 },
  bottomLabel: { fontSize: 11, color: '#64748b' },
  bottomTotal: { fontSize: 20, fontWeight: '900', color: '#8b5cf6' },
  placeBtn: {
    flexDirection: 'row', gap: 8,
    backgroundColor: '#8b5cf6', borderRadius: 16, paddingHorizontal: 22, height: 52,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  placeBtnText: { fontSize: 14, fontWeight: '800', color: '#ffffff', letterSpacing: 0.5 },
});

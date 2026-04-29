import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Dimensions, TextInput, Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function CartScreen({ navigation }) {
  const { cartItems, updateCartQty, removeFromCart, cartItemCount, cartTotal, location } = useAppContext();
  const [instructions, setInstructions] = useState('');

  const deliveryFee = cartItems.length > 0 ? 12.50 : 0;
  const tax = cartTotal * 0.0763;
  const total = cartTotal + deliveryFee + tax;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialIcons name="bolt" size={20} color="#8b5cf6" />
            <Text style={styles.headerBrand}>Velocity <Text style={{ color: '#8b5cf6' }}>Pro</Text></Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn}>
            <MaterialIcons name="person" size={20} color="#8b5cf6" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.label}>CHECKOUT FLOW</Text>
          <Text style={styles.pageTitle}>
            Your Cart <Text style={styles.countText}>({cartItemCount} Items)</Text>
          </Text>
        </View>

        {/* Empty Cart */}
        {cartItems.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="shopping-cart" size={60} color="#40485d" />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Add some fresh items to get started!</Text>
            <TouchableOpacity style={styles.shopNowBtn} onPress={() => navigation.navigate('HomeTab')}>
              <Text style={styles.shopNowText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cart Items */}
        {cartItems.map((item) => (
          <View key={item.id} style={styles.cartCard}>
            <View style={styles.cardTop}>
              <View style={[styles.itemImage, { backgroundColor: item.color || '#f1f5f9' }]}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={{ width: 70, height: 70, borderRadius: 14 }} resizeMode="cover" />
                ) : (
                  <MaterialIcons name="shopping-basket" size={30} color="#cbd5e1" />
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemCat}>{(item.cat || item.category || 'GROCERY').toUpperCase()}</Text>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{(item.price || 0).toFixed(2)}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteBtn}>
                <MaterialIcons name="delete-outline" size={20} color="#6d758c" />
              </TouchableOpacity>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartQty(item.id, -1)}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{item.qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartQty(item.id, 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {cartItems.length > 0 && (
          <>
            {/* Delivery Address */}
            <TouchableOpacity style={styles.addressCard} onPress={() => navigation.navigate('Location')}>
              <View style={styles.addressLeft}>
                <MaterialIcons name="location-on" size={20} color="#8b5cf6" />
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>DELIVER TO</Text>
                  <Text style={styles.addressText} numberOfLines={1}>{location}</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#6d758c" />
            </TouchableOpacity>

            {/* Delivery Instructions */}
            <View style={styles.instructionsSection}>
              <Text style={styles.instructionsLabel}>DELIVERY INSTRUCTIONS</Text>
              <TextInput
                style={styles.instructionsInput}
                placeholder="e.g. Leave by the front gate..."
                placeholderTextColor="#40485d"
                multiline numberOfLines={3}
                value={instructions} onChangeText={setInstructions}
              />
            </View>

            {/* Order Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{cartTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Estimated Taxes</Text>
                <Text style={styles.summaryValue}>₹{tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
              </View>

              {/* Proceed to Checkout */}
              <TouchableOpacity
                style={styles.placeOrderBtn}
                onPress={() => navigation.navigate('Checkout', { instructions, total })}
              >
                <Text style={styles.placeOrderText}>PROCEED TO CHECKOUT  →</Text>
              </TouchableOpacity>

              <View style={styles.secureRow}>
                <MaterialIcons name="lock" size={12} color="#6d758c" />
                <Text style={styles.secureText}>SECURE ENCRYPTED CHECKOUT</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(139,92,246,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerBrand: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  avatarBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(139,92,246,0.1)', alignItems: 'center', justifyContent: 'center' },
  titleSection: { paddingHorizontal: 20, marginBottom: 20 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#8b5cf6', letterSpacing: 2, marginBottom: 6 },
  pageTitle: { fontSize: 34, fontWeight: '900', color: '#1e293b' },
  countText: { color: '#8b5cf6' },
  cartCard: { marginHorizontal: 20, backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: 'row', marginBottom: 14 },
  itemImage: { width: 70, height: 70, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14, overflow: 'hidden' },
  itemInfo: { flex: 1 },
  itemCat: { fontSize: 9, fontWeight: 'bold', color: '#64748b', letterSpacing: 1, marginBottom: 4 },
  itemName: { fontSize: 17, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  itemPrice: { fontSize: 15, fontWeight: '700', color: '#8b5cf6' },
  deleteBtn: { padding: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', backgroundColor: '#f1f5f9', borderRadius: 12, overflow: 'hidden' },
  qtyBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  qtyValue: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginHorizontal: 12 },
  addressCard: { marginHorizontal: 20, backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#e2e8f0' },
  addressLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  addressInfo: { flex: 1 },
  addressLabel: { fontSize: 9, fontWeight: 'bold', color: '#64748b', letterSpacing: 1, marginBottom: 2 },
  addressText: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  instructionsSection: { marginHorizontal: 20, marginBottom: 20 },
  instructionsLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 1.5, marginBottom: 10 },
  instructionsInput: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 14, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0', textAlignVertical: 'top', minHeight: 80 },
  summaryCard: { marginHorizontal: 20, backgroundColor: '#f8fafc', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  summaryTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 18 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 14, color: '#64748b' },
  summaryValue: { fontSize: 14, color: '#1e293b', fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 14, marginTop: 6, marginBottom: 20 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  totalValue: { fontSize: 22, fontWeight: '900', color: '#8b5cf6' },
  placeOrderBtn: { backgroundColor: '#8b5cf6', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 14, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  placeOrderText: { fontSize: 14, fontWeight: '800', color: '#ffffff', letterSpacing: 1 },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  secureText: { fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 1 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: '#64748b', marginTop: 6 },
  shopNowBtn: { marginTop: 20, backgroundColor: '#8b5cf6', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 20 },
  shopNowText: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
});

import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

export default function CartScreen({ navigation }) {
  const {
    cartItems, updateCartQty, removeFromCart,
    cartItemCount, cartTotal, location,
  } = useAppContext();

  const [instructions, setInstructions] = useState('');

  const deliveryFee = cartItems.length > 0 ? 12.50 : 0;
  const tax = cartTotal * 0.0763;
  const total = cartTotal + deliveryFee + tax;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>CHECKOUT FLOW</Text>
          <Text style={styles.headerTitle}>
            Your Cart{' '}
            <Text style={styles.headerCount}>({cartItemCount})</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn}>
          <MaterialIcons name="person" size={18} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* ── Empty State ── */}
        {cartItems.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <MaterialIcons name="shopping-cart" size={36} color="#7C3AED" />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Add some fresh items to get started!</Text>
            <TouchableOpacity
              style={styles.shopNowBtn}
              onPress={() => navigation.navigate('HomeTab')}
            >
              <Text style={styles.shopNowText}>Shop Now</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Cart Items ── */}
        {cartItems.length > 0 && (
          <View style={styles.itemsList}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartCard}>
                <View style={styles.cardTop}>
                  {/* Image */}
                  <View style={[styles.itemImage, { backgroundColor: item.color || '#EDE9FE' }]}>
                    {item.images?.[0] || item.image ? (
                      <Image
                        source={{ uri: item.images?.[0] || item.image }}
                        style={styles.itemImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ fontSize: 28 }}>🛒</Text>
                    )}
                  </View>

                  {/* Info */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemCat}>
                      {(item.cat || item.category || 'GROCERY').toUpperCase()}
                    </Text>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemPrice}>₹{(item.price || 0).toFixed(2)}</Text>
                  </View>

                  {/* Delete */}
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.id)}
                    style={styles.deleteBtn}
                  >
                    <MaterialIcons name="delete-outline" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                {/* Qty controls */}
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateCartQty(item.id, -1)}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.qty}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateCartQty(item.id, 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {cartItems.length > 0 && (
          <>
            {/* ── Delivery Address ── */}
            <TouchableOpacity
              style={styles.addressCard}
              onPress={() => navigation.navigate('Location')}
            >
              <View style={styles.addressIconWrap}>
                <MaterialIcons name="location-on" size={18} color="#7C3AED" />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>DELIVER TO</Text>
                <Text style={styles.addressText} numberOfLines={1}>{location}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
            </TouchableOpacity>

            {/* ── Delivery Instructions ── */}
            <View style={styles.instructionsSection}>
              <Text style={styles.instructionsLabel}>DELIVERY INSTRUCTIONS</Text>
              <TextInput
                style={styles.instructionsInput}
                placeholder="e.g. Leave by the front gate..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={instructions}
                onChangeText={setInstructions}
              />
            </View>

            {/* ── Order Summary ── */}
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
                <Text style={styles.summaryLabel}>Taxes (7.63%)</Text>
                <Text style={styles.summaryValue}>₹{tax.toFixed(2)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => navigation.navigate('Checkout', { instructions, total })}
                activeOpacity={0.88}
              >
                <MaterialIcons name="local-shipping" size={18} color="#fff" />
                <Text style={styles.checkoutBtnText}>PROCEED TO CHECKOUT</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>

              <View style={styles.secureRow}>
                <MaterialIcons name="lock" size={12} color="#94A3B8" />
                <Text style={styles.secureText}>SECURE ENCRYPTED CHECKOUT</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
    backgroundColor: '#ffffff', borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0',
  },
  headerLabel: {
    fontSize: 10, fontWeight: '700', color: '#7C3AED', letterSpacing: 1.4, marginBottom: 4,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
  headerCount: { color: '#7C3AED' },
  avatarBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
    marginTop: 6,
  },

  // Items list
  itemsList: { padding: 16, gap: 12 },

  // Cart card
  cartCard: {
    backgroundColor: '#ffffff', borderRadius: 20,
    padding: 16, borderWidth: 0.5, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: 'row', marginBottom: 14 },
  itemImage: {
    width: 68, height: 68, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14, overflow: 'hidden',
  },
  itemImg: { width: 68, height: 68, borderRadius: 16 },
  itemInfo: { flex: 1 },
  itemCat: {
    fontSize: 9, fontWeight: '700', color: '#94A3B8',
    letterSpacing: 1.1, marginBottom: 4,
  },
  itemName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 5 },
  itemPrice: { fontSize: 15, fontWeight: '800', color: '#7C3AED' },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center',
  },

  // Qty
  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    alignSelf: 'flex-end', backgroundColor: '#F8FAFC',
    borderRadius: 12, borderWidth: 0.5, borderColor: '#E2E8F0', overflow: 'hidden',
  },
  qtyBtn: {
    width: 38, height: 38, alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 20, fontWeight: '600', color: '#0F172A' },
  qtyValue: {
    fontSize: 15, fontWeight: '800', color: '#0F172A', paddingHorizontal: 14,
  },

  // Address
  addressCard: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#fff', borderRadius: 16,
    padding: 14, flexDirection: 'row', alignItems: 'center',
    borderWidth: 0.5, borderColor: '#E2E8F0', gap: 12,
  },
  addressIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
  },
  addressInfo: { flex: 1 },
  addressLabel: {
    fontSize: 9, fontWeight: '700', color: '#94A3B8', letterSpacing: 1.1, marginBottom: 3,
  },
  addressText: { fontSize: 13, fontWeight: '700', color: '#0F172A' },

  // Instructions
  instructionsSection: { marginHorizontal: 16, marginBottom: 16 },
  instructionsLabel: {
    fontSize: 10, fontWeight: '700', color: '#94A3B8',
    letterSpacing: 1.3, marginBottom: 10,
  },
  instructionsInput: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    fontSize: 13, color: '#0F172A', borderWidth: 0.5, borderColor: '#E2E8F0',
    textAlignVertical: 'top', minHeight: 76,
  },

  // Summary
  summaryCard: {
    marginHorizontal: 16, backgroundColor: '#fff',
    borderRadius: 20, padding: 20,
    borderWidth: 0.5, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    marginBottom: 16,
  },
  summaryTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 18 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
  },
  summaryLabel: { fontSize: 13, color: '#64748b' },
  summaryValue: { fontSize: 13, color: '#0F172A', fontWeight: '600' },
  divider: { height: 0.5, backgroundColor: '#E2E8F0', marginVertical: 14 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20,
  },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  totalValue: { fontSize: 22, fontWeight: '900', color: '#7C3AED' },

  checkoutBtn: {
    backgroundColor: '#7C3AED', borderRadius: 16, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginBottom: 14,
    shadowColor: '#5B21B6', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 14, elevation: 8,
  },
  checkoutBtnText: { fontSize: 13, fontWeight: '800', color: '#ffffff', letterSpacing: 0.8 },

  secureRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  secureText: {
    fontSize: 10, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8,
  },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 70 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 28,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#64748b', marginBottom: 24 },
  shopNowBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#7C3AED', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16,
  },
  shopNowText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
});
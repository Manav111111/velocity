import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  TextInput, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const fallbackItemImage = { uri: 'https://via.placeholder.com/100' };

export default function CartScreen({ navigation }) {
  const {
    cartItems, updateCartQty, removeFromCart,
    cartItemCount, cartTotal, location,
  } = useAppContext();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);
  const [instructions, setInstructions] = useState('');

  const deliveryFee = cartItems.length > 0 ? 12.50 : 0;
  const tax = cartTotal * 0.0763;
  const total = cartTotal + deliveryFee + tax;
  const hasItems = cartItems.length > 0;

  const getItemImage = (item) => {
    const uri = item.images?.[0] || item.image;
    return uri ? { uri } : fallbackItemImage;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Cart</Text>
          <Text style={styles.headerSub}>
            {cartItemCount > 0 ? `${cartItemCount} item${cartItemCount !== 1 ? 's' : ''} ready for checkout` : 'Your basket is waiting'}
          </Text>
        </View>
        <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('HomeTab')} activeOpacity={0.82}>
          <MaterialIcons name="storefront" size={20} color="#16803C" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: (hasItems ? 132 : 92) + bottomInset }}
      >
        {!hasItems && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <MaterialIcons name="shopping-cart" size={38} color="#16803C" />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Add fresh groceries and daily essentials to get started.</Text>
            <TouchableOpacity
              style={styles.shopNowBtn}
              onPress={() => navigation.navigate('HomeTab')}
              activeOpacity={0.86}
            >
              <Text style={styles.shopNowText}>Start shopping</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {hasItems && (
          <>
            <View style={styles.deliveryPromise}>
              <View style={styles.promiseIcon}>
                <MaterialIcons name="bolt" size={20} color="#16803C" />
              </View>
              <View>
                <Text style={styles.promiseTitle}>Arrives in 10-15 minutes</Text>
                <Text style={styles.promiseSub}>Packed fresh from your nearest store</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Items in cart</Text>
                <Text style={styles.cardMeta}>{cartItemCount} total</Text>
              </View>

              {cartItems.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemImageBox}>
                    <Image source={getItemImage(item)} style={styles.itemImage} resizeMode="contain" />
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.itemCat} numberOfLines={1}>
                      {(item.cat || item.category || 'Grocery').toUpperCase()}
                    </Text>
                    <Text style={styles.itemPrice}>₹{(item.price || 0).toFixed(2)}</Text>
                  </View>

                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      onPress={() => removeFromCart(item.id)}
                      style={styles.removeBtn}
                      activeOpacity={0.78}
                    >
                      <MaterialIcons name="delete-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateCartQty(item.id, -1)}
                        activeOpacity={0.78}
                      >
                        <MaterialIcons name="remove" size={15} color="#16803C" />
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{item.qty}</Text>
                      <TouchableOpacity
                        style={[styles.qtyBtn, styles.qtyBtnPlus]}
                        onPress={() => updateCartQty(item.id, 1)}
                        activeOpacity={0.78}
                      >
                        <MaterialIcons name="add" size={15} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.addressCard}
              onPress={() => navigation.navigate('Location')}
              activeOpacity={0.84}
            >
              <View style={styles.addressIconWrap}>
                <MaterialIcons name="location-on" size={19} color="#16803C" />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>Deliver to</Text>
                <Text style={styles.addressText} numberOfLines={1}>{location}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.instructionsCard}>
              <View style={styles.instructionsHeader}>
                <MaterialIcons name="notes" size={18} color="#16803C" />
                <Text style={styles.instructionsLabel}>Delivery instructions</Text>
              </View>
              <TextInput
                style={styles.instructionsInput}
                placeholder="Add gate code, landmark, or drop-off note"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={instructions}
                onChangeText={setInstructions}
              />
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Bill details</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Item total</Text>
                <Text style={styles.summaryValue}>₹{cartTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery fee</Text>
                <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxes</Text>
                <Text style={styles.summaryValue}>₹{tax.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>To pay</Text>
                <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
              </View>
              <View style={styles.secureRow}>
                <MaterialIcons name="lock" size={12} color="#64748B" />
                <Text style={styles.secureText}>Secure checkout. Cash on delivery available.</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {hasItems && (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(bottomInset, 14) }]}>
          <View style={styles.bottomInfo}>
            <Text style={styles.bottomLabel}>Total</Text>
            <Text style={styles.bottomTotal}>₹{total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Checkout', { instructions, total })}
            activeOpacity={0.88}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F4' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE1',
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#111827' },
  headerSub: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 2 },
  homeBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#E8F8DE',
    borderWidth: 1,
    borderColor: '#CDEFC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryPromise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    margin: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  promiseIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#DDF6D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promiseTitle: { fontSize: 14, fontWeight: '900', color: '#111827' },
  promiseSub: { fontSize: 11, fontWeight: '700', color: '#64748B', marginTop: 2 },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5ECDC',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2E9',
  },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  cardMeta: { fontSize: 11, fontWeight: '800', color: '#718096' },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemImageBox: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: '#F0F7EA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImage: { width: 62, height: 62 },
  itemInfo: { flex: 1, justifyContent: 'center' },
  itemName: { fontSize: 14, lineHeight: 18, fontWeight: '900', color: '#111827' },
  itemCat: { fontSize: 9, fontWeight: '800', color: '#94A3B8', marginTop: 3 },
  itemPrice: { fontSize: 14, fontWeight: '900', color: '#16803C', marginTop: 5 },
  itemActions: { alignItems: 'flex-end', justifyContent: 'space-between' },
  removeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyBtnPlus: { backgroundColor: '#16803C' },
  qtyValue: { minWidth: 26, textAlign: 'center', fontSize: 13, fontWeight: '900', color: '#16803C' },
  addressCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    minHeight: 62,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5ECDC',
    gap: 12,
  },
  addressIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E8F8DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: { flex: 1 },
  addressLabel: { fontSize: 11, fontWeight: '800', color: '#718096', marginBottom: 2 },
  addressText: { fontSize: 13, fontWeight: '900', color: '#111827' },
  instructionsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5ECDC',
  },
  instructionsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  instructionsLabel: { fontSize: 14, fontWeight: '900', color: '#111827' },
  instructionsInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    minHeight: 74,
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#EEF2E9',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5ECDC',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  summaryLabel: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  summaryValue: { fontSize: 13, fontWeight: '900', color: '#111827' },
  divider: { height: 1, backgroundColor: '#EEF2E9', marginVertical: 14 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15, fontWeight: '900', color: '#111827' },
  totalValue: { fontSize: 22, fontWeight: '900', color: '#16803C' },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  secureText: { flex: 1, fontSize: 11, fontWeight: '700', color: '#64748B' },
  emptyState: { alignItems: 'center', paddingVertical: 82, paddingHorizontal: 30 },
  emptyIconWrap: {
    width: 82,
    height: 82,
    borderRadius: 14,
    backgroundColor: '#E8F8DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 21, fontWeight: '900', color: '#111827', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, lineHeight: 19, fontWeight: '600', color: '#64748B', textAlign: 'center', marginBottom: 24 },
  shopNowBtn: {
    height: 48,
    paddingHorizontal: 22,
    borderRadius: 8,
    backgroundColor: '#16803C',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shopNowText: { fontSize: 14, fontWeight: '900', color: '#ffffff' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E6ECE1',
  },
  bottomInfo: { flex: 1 },
  bottomLabel: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  bottomTotal: { fontSize: 20, fontWeight: '900', color: '#111827', marginTop: 1 },
  checkoutBtn: {
    flex: 1.45,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#16803C',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  checkoutText: { fontSize: 15, fontWeight: '900', color: '#ffffff' },
});

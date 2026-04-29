import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Image, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

import { useAppContext } from '../context/AppContext';

export default function WishlistScreen({ navigation }) {
  const { wishlistItems, addToCart, toggleWishlist } = useAppContext();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerBrand}>Velocity<Text style={{ color: '#8b5cf6' }}>Pro</Text></Text>
          <TouchableOpacity style={styles.avatarBtn}>
            <MaterialIcons name="notifications-none" size={20} color="#8b5cf6" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.label}>YOUR SAVED ITEMS</Text>
          <Text style={styles.pageTitle}>Wishlist</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{wishlistItems.length} SAVED</Text>
          </View>
        </View>

        {/* Empty State */}
        {wishlistItems.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="favorite-border" size={60} color="#40485d" />
            <Text style={styles.emptyTitle}>No saved items yet</Text>
            <Text style={styles.emptySubtitle}>Tap the heart icon on products to save them here.</Text>
          </View>
        )}

        {/* Wishlist Items */}
        {wishlistItems.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            {/* Image */}
            <View style={[styles.itemImage, { backgroundColor: item.color || '#1a2a4a' }]}>
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <MaterialIcons name="diamond" size={32} color="rgba(182,160,255,0.25)" />
              )}
            </View>

            {/* Info */}
            <View style={styles.itemInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                  ₹{typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat((item.price || '0').toString().replace('$', '')).toFixed(2)}
                </Text>
              </View>
              <Text style={styles.itemDesc}>{item.description || item.desc || 'Fresh item added to your wish list.'}</Text>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.addCartBtn} onPress={() => addToCart({ ...item, qty: 1 })}>
                  <MaterialIcons name="shopping-cart" size={14} color="#8b5cf6" />
                  <Text style={styles.addCartText}>Add to Cart</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeBtn} onPress={() => toggleWishlist(item)}>
                  <MaterialIcons name="close" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 50 : 20, paddingBottom: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  headerBrand: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  avatarBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  titleSection: { paddingHorizontal: 20, marginBottom: 20 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 2, marginBottom: 6 },
  pageTitle: { fontSize: 36, fontWeight: '900', color: '#1e293b', marginBottom: 10 },
  countBadge: {
    alignSelf: 'flex-start', backgroundColor: '#f1f5f9', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#e2e8f0',
  },
  countText: { fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 1 },
  itemCard: {
    marginHorizontal: 20, backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden',
    marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2,
  },
  itemImage: { width: '100%', height: 140, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  itemInfo: { padding: 16 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  itemName: { fontSize: 18, fontWeight: '800', color: '#1e293b', flex: 1, marginRight: 10 },
  itemPrice: { fontSize: 18, fontWeight: '800', color: '#8b5cf6' },
  itemDesc: { fontSize: 13, color: '#64748b', lineHeight: 19, marginBottom: 14 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addCartBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#8b5cf6', borderRadius: 14, paddingVertical: 12,
  },
  addCartText: { fontSize: 13, fontWeight: '700', color: '#8b5cf6' },
  removeBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: '#fffcfc', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.1)',
  },
  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: '#64748b', marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },
});

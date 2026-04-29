import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  SafeAreaView, Dimensions, StatusBar, Platform, Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ navigation, route }) {
  const { addToCart, wishlistItems, toggleWishlist, getProductsByCategory, getCartItemQty, updateCartQty, cartItemCount } = useAppContext();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const product = route.params?.product || {
    id: 'p1', name: 'Organic Hass Avocado', price: 4.50, rating: '4.8', reviews: '2.4k',
    delivery: '8-12 MINS DELIVERY',
    description: 'Experience the buttery perfection of our premium Organic Hass Avocados.',
    tags: ['NON-GMO', 'CERTIFIED ORGANIC'], category: 'Fruits', image: null, color: '#1a3a1a',
  };

  const pairsWellWith = getProductsByCategory(product.category).filter((p) => p.id !== product.id).slice(0, 4);
  const isFavorite = wishlistItems.some((i) => i.id === product.id);
  const total = ((product.price || 0) * qty).toFixed(2);
  const inCartQty = getCartItemQty(product.id);

  const tags = product.tags || [
    product.category?.toUpperCase() || 'FRESH',
    product.stock > 0 ? 'IN STOCK' : null,
  ].filter(Boolean);

  const handleAddToCart = () => {
    addToCart({ ...product, qty });
    setJustAdded(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
              <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
            </TouchableOpacity>
            <Text style={styles.headerBrand}>Velocity</Text>
          </View>
          <TouchableOpacity style={styles.headerRight} onPress={() => navigation.navigate('Cart')}>
            <MaterialIcons name="shopping-cart" size={18} color="#8b5cf6" />
            {cartItemCount > 0 && (
              <View style={styles.headerCartBadge}><Text style={styles.headerCartBadgeText}>{cartItemCount}</Text></View>
            )}
          </TouchableOpacity>
        </View>

        {/* Product Image */}
        <View style={[styles.imageContainer, { backgroundColor: product.color || '#1a3a1a' }]}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.fullImage} resizeMode="cover" />
          ) : (
            <MaterialIcons name="local-florist" size={120} color="rgba(182,160,255,0.4)" />
          )}
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Title & Favorite */}
        <View style={styles.titleRow}>
          <Text style={styles.productName}>{product.name}</Text>
          <TouchableOpacity onPress={() => toggleWishlist(product)}>
            <MaterialIcons name={isFavorite ? 'favorite' : 'favorite-border'} size={28} color="#8b5cf6" />
          </TouchableOpacity>
        </View>

        {/* Rating & Delivery */}
        <View style={styles.metaRow}>
          <View style={styles.ratingBadge}>
            <MaterialIcons name="star" size={14} color="#8b5cf6" />
            <Text style={styles.ratingText}>{product.rating || '4.8'}</Text>
            <Text style={styles.reviewText}>({product.reviews || '—'} reviews)</Text>
          </View>
          <View style={styles.deliveryRow}>
            <MaterialIcons name="bolt" size={16} color="#ff6e84" />
            <Text style={styles.deliveryText}>{product.delivery || '10 MINS DELIVERY'}</Text>
          </View>
        </View>

        {/* Price Box */}
        <View style={styles.priceBox}>
          <View>
            <Text style={styles.priceLabel}>PRICE PER UNIT</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>₹{(product.price || 0).toFixed(2)}</Text>
              <Text style={styles.priceSub}>/ unit</Text>
            </View>
          </View>
          <View style={styles.qtyBox}>
            <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))} style={styles.qtyBtn}>
              <MaterialIcons name="remove" size={18} color="#1e293b" />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity onPress={() => setQty(qty + 1)} style={[styles.qtyBtn, { backgroundColor: '#8b5cf6' }]}>
              <MaterialIcons name="add" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* In-cart indicator */}
        {inCartQty > 0 && (
          <View style={styles.inCartBanner}>
            <MaterialIcons name="check-circle" size={16} color="#4caf50" />
            <Text style={styles.inCartText}>{inCartQty} already in cart</Text>
          </View>
        )}

        {/* Description */}
        <Text style={styles.sectionTitle}>DESCRIPTION</Text>
        <Text style={styles.descText}>
          {product.description || product.desc || `Freshly sourced ${product.name} for your daily needs.`}
        </Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {tags.map((tag, idx) => (
            <View key={idx} style={styles.tagBadge}><Text style={styles.tagText}>{tag}</Text></View>
          ))}
        </View>

        {/* Pairs Well With */}
        {pairsWellWith.length > 0 && (
          <>
            <View style={styles.pairsHeader}>
              <Text style={styles.sectionTitle}>Pairs Well With</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {pairsWellWith.map((pair) => (
                <TouchableOpacity key={pair.id} style={styles.pairCard}
                  onPress={() => navigation.push('ProductDetail', { product: pair })}>
                  <View style={[styles.pairImagePlaceholder, { backgroundColor: pair.color || '#1a2a4a' }]}>
                    {pair.image && <Image source={{ uri: pair.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />}
                  </View>
                  <View style={styles.pairInfo}>
                    <Text style={styles.pairName} numberOfLines={1}>{pair.name}</Text>
                    <Text style={styles.pairPrice}>₹{(pair.price || 0).toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>

      {/* Sticky Bottom */}
      <View style={styles.bottomBar}>
        {justAdded || inCartQty > 0 ? (
          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.addMoreBtn} onPress={handleAddToCart}>
              <MaterialIcons name="add-shopping-cart" size={18} color="#8b5cf6" />
              <Text style={styles.addMoreText}>Add {qty} More</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.goToCartBtn} onPress={() => navigation.navigate('Cart')}>
              <MaterialIcons name="shopping-cart" size={18} color="#ffffff" />
              <Text style={styles.goToCartText}>Go to Cart</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
            <MaterialIcons name="shopping-bag" size={18} color="#ffffff" />
            <Text style={styles.addToCartText}>Add to Cart — ₹{total}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', paddingTop: Platform.OS === 'android' ? 40 : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, zIndex: 10, position: 'absolute', top: Platform.OS === 'android' ? 40 : 20, left: 0, right: 0 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center', marginRight: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  headerBrand: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  headerRight: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  headerCartBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#ef4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  headerCartBadgeText: { fontSize: 9, fontWeight: 'bold', color: '#fff' },
  imageContainer: { width: '100%', height: 350, alignItems: 'center', justifyContent: 'center', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  fullImage: { width: '100%', height: '100%' },
  pagination: { position: 'absolute', bottom: 20, flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { width: 24, backgroundColor: '#ffffff' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginTop: 25 },
  productName: { fontSize: 32, fontWeight: '900', color: '#1e293b', flex: 1, marginRight: 20, lineHeight: 38 },
  metaRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 15, gap: 15 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  ratingText: { fontSize: 13, fontWeight: 'bold', color: '#1e293b', marginHorizontal: 4 },
  reviewText: { fontSize: 12, color: '#64748b' },
  deliveryRow: { flexDirection: 'row', alignItems: 'center' },
  deliveryText: { fontSize: 11, fontWeight: 'bold', color: '#ef4444', letterSpacing: 1, marginLeft: 4 },
  priceBox: { marginHorizontal: 20, backgroundColor: '#f8fafc', borderRadius: 20, padding: 20, marginTop: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  priceLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 1, marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  priceValue: { fontSize: 34, fontWeight: '900', color: '#1e293b', lineHeight: 40 },
  priceSub: { fontSize: 14, color: '#64748b', marginBottom: 6 },
  qtyBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 16, padding: 4 },
  qtyBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  qtyValue: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginHorizontal: 16 },
  inCartBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 20, marginTop: 12, backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  inCartText: { fontSize: 13, fontWeight: '600', color: '#10b981' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', paddingHorizontal: 20, marginTop: 30, marginBottom: 15 },
  descText: { fontSize: 15, color: '#64748b', lineHeight: 24, paddingHorizontal: 20, marginBottom: 20 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10, marginBottom: 10 },
  tagBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  tagText: { fontSize: 10, fontWeight: 'bold', color: '#1e293b', letterSpacing: 0.5 },
  pairsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 },
  pairCard: { width: 160, backgroundColor: '#ffffff', borderRadius: 16, marginRight: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' },
  pairImagePlaceholder: { height: 100, width: '100%', overflow: 'hidden' },
  pairInfo: { padding: 12, paddingBottom: 16 },
  pairName: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  pairPrice: { fontSize: 13, color: '#8b5cf6', fontWeight: 'bold' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  bottomRow: { flexDirection: 'row', gap: 12 },
  addMoreBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#8b5cf6', borderRadius: 25, height: 52 },
  addMoreText: { fontSize: 14, fontWeight: '700', color: '#8b5cf6' },
  goToCartBtn: { flex: 1, backgroundColor: '#8b5cf6', borderRadius: 25, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  goToCartText: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
  addToCartBtn: { backgroundColor: '#8b5cf6', borderRadius: 25, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  addToCartText: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
});

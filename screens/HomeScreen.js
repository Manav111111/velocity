import React from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity,
  ScrollView, Dimensions, FlatList, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

function ProductImage({ uri, style, iconSize = 30 }) {
  if (uri) return <Image source={{ uri }} style={style} resizeMode="cover" />;
  return (
    <View style={[style, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }]}>
      <MaterialIcons name="image" size={iconSize} color="rgba(139,92,246,0.3)" />
    </View>
  );
}

function CartButton({ item, addToCart, getCartItemQty, updateCartQty, small = false }) {
  const qty = getCartItemQty(item.id);

  if (qty > 0) {
    return (
      <View style={small ? styles.qtyRowSmall : styles.qtyRow}>
        <TouchableOpacity style={small ? styles.qtyBtnSmall : styles.qtyBtn} onPress={() => updateCartQty(item.id, -1)}>
          <MaterialIcons name="remove" size={small ? 14 : 16} color="#1e293b" />
        </TouchableOpacity>
        <Text style={small ? styles.qtyTextSmall : styles.qtyText}>{qty}</Text>
        <TouchableOpacity style={[small ? styles.qtyBtnSmall : styles.qtyBtn, { backgroundColor: '#8b5cf6' }]} onPress={() => updateCartQty(item.id, 1)}>
          <MaterialIcons name="add" size={small ? 14 : 16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={small ? styles.addButtonSmall : styles.addButton}
      onPress={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, cat: item.category, color: '#f1f5f9' })}
    >
      <MaterialIcons name="add" size={small ? 16 : 18} color="#ffffff" />
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const {
    location, banners, categories, trendingProducts, products, loading,
    addToCart, getCartItemQty, updateCartQty,
    wishlistItems, toggleWishlist, cartItemCount,
  } = useAppContext();

  const handleProductPress = (item) => navigation.navigate('ProductDetail', { product: item });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={{ color: '#64748b', marginTop: 12, fontSize: 13 }}>Loading fresh products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Location')} style={{ flex: 1 }}>
            <Text style={styles.deliverLabel}>DELIVERING TO</Text>
            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={16} color="#8b5cf6" />
              <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={18} color="#64748b" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerBrand}>Velocity</Text>
          <TouchableOpacity style={styles.cartContainer} onPress={() => navigation.navigate('CartTab')}>
            <MaterialIcons name="shopping-cart" size={20} color="#8b5cf6" />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartItemCount}</Text></View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <TouchableOpacity style={styles.searchBar} activeOpacity={0.8} onPress={() => navigation.navigate('SearchTab')}>
            <MaterialIcons name="search" size={22} color="#64748b" />
            <Text style={styles.searchPlaceholder}>Search fresh groceries...</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Filter')}>
            <MaterialIcons name="tune" size={22} color="#8b5cf6" />
          </TouchableOpacity>
        </View>

        {/* Banners */}
        {banners.length > 0 ? (
          <FlatList
            data={banners}
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            style={{ marginBottom: 28 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.bannerContainer, { width: width - 40 }]} activeOpacity={0.9}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} resizeMode="cover" />
                ) : <View style={[styles.bannerImage, { backgroundColor: '#f1f5f9' }]} />}
                <View style={styles.bannerOverlay}>
                  <View style={styles.bannerBadge}><Text style={styles.bannerBadgeText}>EXCLUSIVE DEAL</Text></View>
                  <Text style={styles.bannerTitle}>{item.title || 'Special Offer'}</Text>
                  <Text style={styles.bannerSubtitle}>{item.subtitle || 'Check out our latest deals'}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <TouchableOpacity style={styles.bannerContainer} activeOpacity={0.9}>
            <Image source={require('../assets/vegetables.png')} style={styles.bannerImage} />
            <View style={styles.bannerOverlay}>
              <View style={styles.bannerBadge}><Text style={styles.bannerBadgeText}>EXCLUSIVE DEAL</Text></View>
              <Text style={styles.bannerTitle}>Flat 50% Off</Text>
              <Text style={styles.bannerSubtitle}>On your first organic basket</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CategoriesTab')}>
                <Text style={styles.viewAll}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 16, marginBottom: 32 }}>
              {categories.map((cat) => (
                <TouchableOpacity key={cat.id} style={styles.categoryItem}
                  onPress={() => navigation.navigate('SearchTab', { filterCategory: cat.name })}>
                  <View style={styles.categoryIcon}>
                    <MaterialIcons name={cat.resolvedIcon || 'category'} size={26} color="#8b5cf6" />
                  </View>
                  <Text style={styles.categoryLabel}>{(cat.name || '').toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Trending Now */}
        {trendingProducts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Now 🔥</Text>
            </View>
            <FlatList
              data={trendingProducts} horizontal showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.productCard} onPress={() => handleProductPress(item)} activeOpacity={0.9}>
                  <TouchableOpacity style={styles.heartIcon} onPress={() => toggleWishlist(item)}>
                    <MaterialIcons
                      name={wishlistItems.some((i) => i.id === item.id) ? 'favorite' : 'favorite-border'}
                      size={18} color={wishlistItems.some((i) => i.id === item.id) ? '#8b5cf6' : '#64748b'} />
                  </TouchableOpacity>
                  <ProductImage uri={item.image} style={styles.productImage} iconSize={40} />
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.productLabel}>{(item.category || 'FRESH').toUpperCase()}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>₹{(item.price || 0).toFixed(2)}</Text>
                    <CartButton item={item} addToCart={addToCart} getCartItemQty={getCartItemQty} updateCartQty={updateCartQty} />
                  </View>
                </TouchableOpacity>
              )}
            />
          </>
        )}


        {!loading && products.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="shopping-basket" size={60} color="#40485d" />
            <Text style={styles.emptyTitle}>No Products Yet</Text>
            <Text style={styles.emptySubtitle}>Check back soon for fresh arrivals!</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating cart bar */}
      {cartItemCount > 0 && (
        <TouchableOpacity style={styles.floatingCart} onPress={() => navigation.navigate('CartTab')} activeOpacity={0.9}>
          <View style={styles.floatingCartLeft}>
            <MaterialIcons name="shopping-cart" size={20} color="#ffffff" />
            <Text style={styles.floatingCartCount}>{cartItemCount} items</Text>
          </View>
          <Text style={styles.floatingCartPrice}>View Cart →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 12 },
  deliverLabel: { fontSize: 9, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  locationText: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  headerBrand: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  cartContainer: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(139,92,246,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  cartBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  searchRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: '#e2e8f0', gap: 10 },
  searchPlaceholder: { fontSize: 14, color: '#94a3b8' },
  filterButton: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  bannerContainer: { marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', marginBottom: 28, height: 170 },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(0,0,0,0.3)' },
  bannerBadge: { backgroundColor: '#8b5cf6', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 6 },
  bannerBadgeText: { fontSize: 9, fontWeight: 'bold', color: '#ffffff', letterSpacing: 1 },
  bannerTitle: { fontSize: 28, fontWeight: '900', color: '#fff' },
  bannerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  viewAll: { fontSize: 12, fontWeight: 'bold', color: '#8b5cf6', letterSpacing: 0.5 },
  categoryItem: { alignItems: 'center', gap: 8 },
  categoryIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(139,92,246,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(139,92,246,0.1)' },
  categoryLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 0.5 },
  productCard: { width: 170, backgroundColor: '#ffffff', borderRadius: 20, padding: 12, marginRight: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  heartIcon: { position: 'absolute', top: 12, right: 12, zIndex: 10 },
  productImage: { width: '100%', height: 120, borderRadius: 14, marginBottom: 10 },
  productName: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  productLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 0.5, marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 18, fontWeight: '800', color: '#8b5cf6' },
  addButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center' },
  addButtonSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center' },
  // Inline qty controls
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 14, overflow: 'hidden' },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 14, fontWeight: '800', color: '#1e293b', marginHorizontal: 6 },
  qtyRowSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, overflow: 'hidden' },
  qtyBtnSmall: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  qtyTextSmall: { fontSize: 12, fontWeight: '800', color: '#1e293b', marginHorizontal: 4 },
  // Grid
  allProductsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 14 },
  gridCard: { width: (width - 54) / 2, backgroundColor: '#ffffff', borderRadius: 18, padding: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  gridImage: { width: '100%', height: 100, borderRadius: 12, marginBottom: 8 },
  gridName: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  gridCategory: { fontSize: 9, fontWeight: 'bold', color: '#64748b', letterSpacing: 0.5, marginBottom: 6 },
  gridPrice: { fontSize: 16, fontWeight: '800', color: '#8b5cf6' },
  // Empty state
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: '#64748b', marginTop: 6 },
  // Floating cart
  floatingCart: {
    position: 'absolute', bottom: 16, left: 20, right: 20,
    backgroundColor: '#8b5cf6', borderRadius: 20, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  floatingCartLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  floatingCartCount: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
  floatingCartPrice: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
});

import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Dimensions, FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';
import BannerCarousel from '../components/BannerCarousel';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const {
    location, banners, categories, trendingProducts, featuredProducts, products, loading,
    addToCart, getCartItemQty, updateCartQty,
    wishlistItems, toggleWishlist, isInWishlist, cartItemCount, cartTotal,
  } = useAppContext();
  const insets = useSafeAreaInsets();

  const handleProductPress = (item) => navigation.navigate('ProductDetail', { product: item });
  const handleCategoryPress = (cat) =>
    navigation.navigate('SearchTab', { filterCategory: cat.name, filterTimestamp: Date.now() });

  const allProducts = products.slice(0, 6);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.deliverLabel}>DELIVERING TO</Text>
            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={14} color="#7C3AED" />
              <Text style={styles.locationText}>Loading...</Text>
            </View>
          </View>
          <Text style={styles.headerBrand}>Velocity<Text style={styles.brandDot}>.</Text></Text>
          <View style={styles.cartContainer}>
            <MaterialIcons name="shopping-cart" size={18} color="#7C3AED" />
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={20} color="#94a3b8" />
              <Text style={styles.searchPlaceholder}>Search fresh groceries...</Text>
            </View>
          </View>
          <SkeletonLoader variant="banner" />
          <SkeletonLoader variant="category" count={5} />
          <View style={{ marginTop: 12 }}>
            <SkeletonLoader variant="productCard" count={2} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Location')} style={{ flex: 1 }}>
          <Text style={styles.deliverLabel}>DELIVERING TO</Text>
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={14} color="#7C3AED" />
            <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} color="#94a3b8" />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerBrand}>
          Velocity<Text style={styles.brandDot}>.</Text>
        </Text>

        <TouchableOpacity
          style={styles.cartContainer}
          onPress={() => navigation.navigate('CartTab')}
        >
          <MaterialIcons name="shopping-cart" size={18} color="#7C3AED" />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: cartItemCount > 0 ? 120 : 60 }}
      >
        {/* ── Search + Filter ── */}
        <View style={styles.searchRowWrap}>
          <TouchableOpacity
            style={styles.searchBar}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SearchTab')}
          >
            <MaterialIcons name="search" size={20} color="#94a3b8" />
            <Text style={styles.searchPlaceholder}>Search fresh groceries...</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => navigation.navigate('Filter')}
          >
            <MaterialIcons name="tune" size={20} color="#7C3AED" />
          </TouchableOpacity>
        </View>

        {/* ── Promo Banner ── */}
        {banners.length > 0 ? (
          <BannerCarousel banners={banners} />
        ) : (
          <TouchableOpacity activeOpacity={0.9} style={{ marginHorizontal: 16, marginBottom: 20 }}>
            <LinearGradient
              colors={['#1E1B4B', '#2D1B69', '#4C1D95']}
              style={styles.promoBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.bannerOrb} />
              <View style={{ flex: 1, zIndex: 1 }}>
                <View style={styles.promoBadge}>
                  <Text style={styles.promoBadgeText}>LIMITED TIME</Text>
                </View>
                <Text style={styles.promoHeading}>
                  Get <Text style={styles.promoAccent}>30% off</Text>{'\n'}fresh fruits
                </Text>
                <Text style={styles.promoSub}>Use code VELOCITY30</Text>
                <View style={styles.promoCta}>
                  <Text style={styles.promoCtaText}>Shop now</Text>
                  <MaterialIcons name="arrow-forward" size={12} color="#7C3AED" />
                </View>
              </View>
              <Text style={styles.bannerEmoji}>🍎</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Categories ── */}
        {categories.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CategoriesTab')}>
                <Text style={styles.viewAll}>SEE ALL</Text>
              </TouchableOpacity>
            </View>
            <View style={{ marginBottom: 24 }}>
              <CategoryGrid
                categories={categories}
                variant="horizontal"
                onCategoryPress={handleCategoryPress}
              />
            </View>
          </View>
        )}

        {/* ── Trending Products ── */}
        {trendingProducts.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Trending Now</Text>
                <Text style={styles.sectionEmoji}>🔥</Text>
              </View>
            </View>
            <FlatList
              data={trendingProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}
              style={{ marginBottom: 24 }}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  variant="horizontal"
                  onPress={() => handleProductPress(item)}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist(item.id)}
                  cartQty={getCartItemQty(item.id)}
                  onUpdateQty={updateCartQty}
                />
              )}
            />
          </View>
        )}

        {/* ── Featured Products ── */}
        {featuredProducts.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Featured</Text>
                <Text style={styles.sectionEmoji}>⭐</Text>
              </View>
            </View>
            <FlatList
              data={featuredProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}
              style={{ marginBottom: 24 }}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  variant="horizontal"
                  onPress={() => handleProductPress(item)}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist(item.id)}
                  cartQty={getCartItemQty(item.id)}
                  onUpdateQty={updateCartQty}
                />
              )}
            />
          </View>
        )}

        {/* ── All Products Grid ── */}
        {allProducts.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Products</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SearchTab')}>
                <Text style={styles.viewAll}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.allProductsGrid}>
              {allProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  variant="grid"
                  onPress={() => handleProductPress(item)}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist(item.id)}
                  cartQty={getCartItemQty(item.id)}
                  onUpdateQty={updateCartQty}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── Empty State ── */}
        {!loading && products.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <MaterialIcons name="shopping-basket" size={36} color="#7C3AED" />
            </View>
            <Text style={styles.emptyTitle}>No Products Yet</Text>
            <Text style={styles.emptySubtitle}>Check back soon for fresh arrivals!</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Floating Cart Bar ── */}
      {cartItemCount > 0 && (
        <TouchableOpacity
          style={[styles.floatingCart, { bottom: insets.bottom + 10 }]}
          onPress={() => navigation.navigate('CartTab')}
          activeOpacity={0.9}
        >
          <View style={styles.floatingCartLeft}>
            <View style={styles.floatingCartIcon}>
              <MaterialIcons name="shopping-bag" size={18} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.floatingCartCount}>
                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
              </Text>
              <Text style={styles.floatingCartTotal}>₹{cartTotal.toFixed(0)}</Text>
            </View>
          </View>
          <View style={styles.floatingCartRight}>
            <Text style={styles.floatingCartLabel}>View Cart</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#ffffff" />
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 6, paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0',
  },
  deliverLabel: {
    fontSize: 9, fontWeight: '700', color: '#94a3b8', letterSpacing: 1.2, marginBottom: 2,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 1 },
  locationText: { fontSize: 13, fontWeight: '700', color: '#0F172A', maxWidth: 140 },
  headerBrand: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  brandDot: { color: '#7C3AED' },
  cartContainer: {
    width: 38, height: 38, borderRadius: 13,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#EF4444', borderRadius: 10,
    minWidth: 17, height: 17,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  cartBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },

  // Search
  searchRowWrap: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 10,
    backgroundColor: '#ffffff', borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0',
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 14,
    height: 44, borderWidth: 0.5, borderColor: '#E2E8F0', gap: 8,
  },
  searchPlaceholder: { fontSize: 13, color: '#94a3b8' },
  filterButton: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
  },

  // Promo banner (fallback when no CMS banners)
  promoBanner: {
    borderRadius: 20, padding: 22, flexDirection: 'row',
    alignItems: 'center', overflow: 'hidden',
  },
  bannerOrb: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(167,139,250,0.15)', right: -20, top: -30,
  },
  promoBadge: {
    backgroundColor: 'rgba(52,211,153,0.18)', borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)', borderRadius: 7,
    paddingHorizontal: 9, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8,
  },
  promoBadgeText: { fontSize: 9, fontWeight: '800', color: '#6EE7B7', letterSpacing: 1 },
  promoHeading: { fontSize: 20, fontWeight: '800', color: '#ffffff', lineHeight: 26, marginBottom: 6 },
  promoAccent: { color: '#A78BFA' },
  promoSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 12 },
  promoCta: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  promoCtaText: { fontSize: 12, fontWeight: '700', color: '#7C3AED' },
  bannerEmoji: { fontSize: 60, position: 'relative', zIndex: 1 },

  // Sections
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, marginBottom: 14, marginTop: 6,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  sectionEmoji: { fontSize: 15 },
  viewAll: { fontSize: 11, fontWeight: '700', color: '#7C3AED', letterSpacing: 0.4 },

  // Grid
  allProductsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 10, marginBottom: 20,
  },

  // Empty
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 24, backgroundColor: '#EDE9FE',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#64748b' },

  // Floating cart
  floatingCart: {
    position: 'absolute', bottom: 20, left: 16, right: 16,
    backgroundColor: '#7C3AED', borderRadius: 18, height: 60,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18,
    shadowColor: '#5B21B6', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 14,
  },
  floatingCartLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  floatingCartIcon: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  floatingCartCount: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  floatingCartTotal: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
  floatingCartRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  floatingCartLabel: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
});
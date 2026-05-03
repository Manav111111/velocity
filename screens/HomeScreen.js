import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  FlatList, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import BannerCarousel from '../components/BannerCarousel';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';

const vegetablesImg = require('../assets/vegetables.png');
const milkImg = require('../assets/milk.png');
const avocadoImg = require('../assets/avocado.png');

export default function HomeScreen({ navigation }) {
  const {
    location, banners, categories, trendingProducts, featuredProducts, products, loading,
    addToCart, getCartItemQty, updateCartQty,
    toggleWishlist, isInWishlist, cartItemCount, cartTotal,
  } = useAppContext();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);

  const handleProductPress = (item) => navigation.navigate('ProductDetail', { product: item });
  const handleCategoryPress = (cat) =>
    navigation.navigate('SearchTab', { filterCategory: cat.name, filterTimestamp: Date.now() });

  const quickProducts = trendingProducts.length > 0 ? trendingProducts : products.slice(0, 8);
  const featuredList = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8);
  const allProducts = products.slice(0, 8);

  const renderProduct = ({ item }) => (
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
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.brandArea}>
            <Text style={styles.deliveryTime}>Delivery in 10 minutes</Text>
            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={14} color="#16803C" />
              <Text style={styles.locationText}>Loading location...</Text>
            </View>
          </View>
          <View style={styles.cartButton}>
            <MaterialIcons name="shopping-bag" size={18} color="#16803C" />
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 + bottomInset }}>
          <View style={styles.searchShell}>
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={20} color="#64748B" />
              <Text style={styles.searchPlaceholder}>Search groceries...</Text>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Location')} style={styles.brandArea} activeOpacity={0.82}>
          <Text style={styles.deliveryTime}>Delivery in 10 minutes</Text>
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={14} color="#16803C" />
            <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} color="#64748B" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('CartTab')}
          activeOpacity={0.82}
        >
          <MaterialIcons name="shopping-bag" size={18} color="#16803C" />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: (cartItemCount > 0 ? 112 : 62) + bottomInset }}
      >
        <View style={styles.searchShell}>
          <TouchableOpacity
            style={styles.searchBar}
            activeOpacity={0.82}
            onPress={() => navigation.navigate('SearchTab')}
          >
            <MaterialIcons name="search" size={20} color="#64748B" />
            <Text style={styles.searchPlaceholder}>Search atta, milk, chips...</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => navigation.navigate('Filter')}
            activeOpacity={0.82}
          >
            <MaterialIcons name="tune" size={20} color="#16803C" />
          </TouchableOpacity>
        </View>

        <View style={styles.promiseStrip}>
          <View style={styles.promiseItem}>
            <MaterialIcons name="bolt" size={15} color="#166534" />
            <Text style={styles.promiseText}>Fast delivery</Text>
          </View>
          <View style={styles.promiseDivider} />
          <View style={styles.promiseItem}>
            <MaterialIcons name="verified" size={15} color="#166534" />
            <Text style={styles.promiseText}>Fresh daily</Text>
          </View>
          <View style={styles.promiseDivider} />
          <View style={styles.promiseItem}>
            <MaterialIcons name="payments" size={15} color="#166534" />
            <Text style={styles.promiseText}>COD</Text>
          </View>
        </View>

        {banners.length > 0 ? (
          <BannerCarousel banners={banners} />
        ) : (
          <TouchableOpacity activeOpacity={0.9} style={styles.heroCard}>
            <View style={styles.heroCopy}>
              <View style={styles.heroBadge}>
                <MaterialIcons name="local-offer" size={12} color="#166534" />
                <Text style={styles.heroBadgeText}>Fresh deals today</Text>
              </View>
              <Text style={styles.heroTitle}>Daily groceries{'\n'}at your doorstep</Text>
              <Text style={styles.heroSub}>Save up to 30% on fruits, dairy and essentials.</Text>
              <View style={styles.heroCta}>
                <Text style={styles.heroCtaText}>Shop now</Text>
                <MaterialIcons name="arrow-forward" size={13} color="#ffffff" />
              </View>
            </View>
            <View style={styles.heroImages}>
              <Image source={vegetablesImg} style={styles.heroVeg} resizeMode="contain" />
              <Image source={milkImg} style={styles.heroMilk} resizeMode="contain" />
              <Image source={avocadoImg} style={styles.heroAvocado} resizeMode="contain" />
            </View>
          </TouchableOpacity>
        )}

        {categories.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shop by category</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CategoriesTab')} activeOpacity={0.8}>
                <Text style={styles.viewAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.categoryBlock}>
              <CategoryGrid
                categories={categories.slice(0, 10)}
                variant="horizontal"
                onCategoryPress={handleCategoryPress}
              />
            </View>
          </View>
        )}

        {quickProducts.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Quick picks</Text>
                <Text style={styles.sectionSub}>Frequently ordered essentials</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('SearchTab')} activeOpacity={0.8}>
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={quickProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.productRow}
              renderItem={renderProduct}
            />
          </View>
        )}

        {featuredList.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Fresh for you</Text>
                <Text style={styles.sectionSub}>Handpicked from today's store</Text>
              </View>
            </View>
            <FlatList
              data={featuredList}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.productRow}
              renderItem={renderProduct}
            />
          </View>
        )}

        {allProducts.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All products</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SearchTab')} activeOpacity={0.8}>
                <Text style={styles.viewAll}>Browse</Text>
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

        {!loading && products.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <MaterialIcons name="shopping-basket" size={34} color="#16803C" />
            </View>
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptySubtitle}>Fresh arrivals will show here soon.</Text>
          </View>
        )}
      </ScrollView>

      {cartItemCount > 0 && (
        <TouchableOpacity
          style={[styles.floatingCart, { bottom: bottomInset + 10 }]}
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
            <Text style={styles.floatingCartLabel}>View cart</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#ffffff" />
          </View>
        </TouchableOpacity>
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
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
  },
  brandArea: { flex: 1, marginRight: 12 },
  deliveryTime: { fontSize: 22, fontWeight: '900', color: '#111827' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  locationText: { flexShrink: 1, fontSize: 12, fontWeight: '700', color: '#334155' },
  cartButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#E8F8DE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CDEFC0',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: { fontSize: 9, fontWeight: '900', color: '#ffffff' },
  searchShell: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE1',
  },
  searchBar: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#F5F7F3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#E4EADF',
  },
  searchPlaceholder: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F8DE',
    borderWidth: 1,
    borderColor: '#CDEFC0',
  },
  promiseStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  promiseItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  promiseDivider: { width: 1, height: 20, backgroundColor: '#BBF7D0' },
  promiseText: { fontSize: 11, fontWeight: '900', color: '#166534' },
  heroCard: {
    minHeight: 172,
    marginHorizontal: 16,
    marginBottom: 22,
    borderRadius: 12,
    backgroundColor: '#FFF6CF',
    borderWidth: 1,
    borderColor: '#F2DE8A',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  heroCopy: { flex: 1.08, padding: 16, justifyContent: 'center' },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  heroBadgeText: { fontSize: 10, fontWeight: '900', color: '#166534' },
  heroTitle: { fontSize: 22, lineHeight: 27, fontWeight: '900', color: '#111827', marginBottom: 6 },
  heroSub: { fontSize: 12, lineHeight: 17, fontWeight: '700', color: '#6B7280', marginBottom: 12 },
  heroCta: {
    alignSelf: 'flex-start',
    height: 32,
    borderRadius: 8,
    backgroundColor: '#16803C',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroCtaText: { fontSize: 12, fontWeight: '900', color: '#ffffff' },
  heroImages: { flex: 0.92, justifyContent: 'center', alignItems: 'center' },
  heroVeg: { width: 150, height: 122, position: 'absolute', right: -24, bottom: 4 },
  heroMilk: { width: 64, height: 84, position: 'absolute', left: 0, bottom: 18 },
  heroAvocado: { width: 70, height: 70, position: 'absolute', right: 34, top: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },
  sectionSub: { fontSize: 11, fontWeight: '700', color: '#718096', marginTop: 2 },
  viewAll: { fontSize: 12, fontWeight: '900', color: '#16803C' },
  categoryBlock: { marginBottom: 22 },
  productRow: { paddingHorizontal: 16, paddingBottom: 22 },
  allProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#E8F8DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '900', color: '#111827', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  floatingCart: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#16803C',
    borderRadius: 10,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 12,
  },
  floatingCartLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  floatingCartIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCartCount: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.82)' },
  floatingCartTotal: { fontSize: 16, fontWeight: '900', color: '#ffffff' },
  floatingCartRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  floatingCartLabel: { fontSize: 14, fontWeight: '900', color: '#ffffff' },
});

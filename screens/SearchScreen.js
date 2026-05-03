import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Dimensions, TextInput, Platform, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';

const { width } = Dimensions.get('window');
const catW = (width - 42) / 2;

const RECENT_SEARCHES_KEY = '@velocity_recent_searches';

export default function SearchScreen({ navigation, route }) {
  const {
    products, categories, trendingProducts, featuredProducts,
    searchProducts, getProductsByCategory, filterProducts, addToCart, loading,
    getCartItemQty, updateCartQty, toggleWishlist, isInWishlist,
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeFilters, setActiveFilters] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('');

  // Load recent searches from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(RECENT_SEARCHES_KEY).then((val) => {
      if (val) setRecentSearches(JSON.parse(val));
    });
  }, []);

  // Handle category filter passed from HomeScreen or CategoriesScreen
  const filterCategory = route?.params?.filterCategory;
  const filterTimestamp = route?.params?.filterTimestamp; // unique key to re-trigger
  // Handle filters passed from FilterScreen
  const routeFilters = route?.params?.filters;

  useEffect(() => {
    if (filterCategory) {
      setActiveCategoryFilter(filterCategory);
      setSearchQuery(filterCategory);
      setIsSearching(true);
      // Directly filter by category for precise results
      const categoryResults = getProductsByCategory(filterCategory);
      setSearchResults(categoryResults);
    }
  }, [filterCategory, filterTimestamp, getProductsByCategory]);

  useEffect(() => {
    if (routeFilters) {
      setActiveFilters(routeFilters);
    }
  }, [routeFilters]);

  // Save recent searches to AsyncStorage
  const saveRecentSearch = useCallback(async (query) => {
    if (!query.trim()) return;
    const updated = [query.trim(), ...recentSearches.filter((r) => r !== query.trim())].slice(0, 8);
    setRecentSearches(updated);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  // Remove one recent search
  const removeRecentSearch = useCallback(async (item) => {
    const updated = recentSearches.filter((r) => r !== item);
    setRecentSearches(updated);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  // Clear all recent searches
  const clearRecentSearches = useCallback(async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setActiveCategoryFilter('');
      return;
    }
    // Skip debounced text search if results were already set by category filter
    if (activeCategoryFilter && searchQuery === activeCategoryFilter) {
      return;
    }
    setIsSearching(true);
    setActiveCategoryFilter(''); // Clear category filter when manually searching
    const timer = setTimeout(() => {
      let results = searchProducts(searchQuery);
      if (activeFilters) {
        results = filterProducts(results, activeFilters);
      }
      setSearchResults(results);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchProducts, activeFilters, filterProducts]);

  // Apply filters to all products when no search query
  const allFilteredProducts = useCallback(() => {
    const base = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 12);
    if (!activeFilters) return base;
    return filterProducts(base, activeFilters);
  }, [featuredProducts, products, activeFilters, filterProducts]);

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
  }, []);

  const handleProductPress = (product) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
    }
    navigation.navigate('ProductDetail', { product });
  };

  const handleRecentPress = (item) => {
    setSearchQuery(item);
    setIsSearching(true);
  };

  const handleFilterPress = () => {
    navigation.navigate('Filter', { currentFilters: activeFilters });
  };

  const clearFilters = () => setActiveFilters(null);

  const displayCategories = categories.slice(0, 4).map((cat) => ({
    name: cat.name,
    badge: 'POPULAR',
    icon: cat.resolvedIcon || 'category',
    imageUrl: cat.imageUrl,
    color: cat.color || '#1a2a4a',
  }));

  const displayProducts = isSearching ? searchResults : allFilteredProducts();
  const hasActiveFilters = activeFilters && Object.values(activeFilters).some((v) => v !== undefined && v !== '' && v !== false && v !== 'popularity');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.avatarHolder}>
            <MaterialIcons name="person" size={16} color="#ffffff" />
          </View>
          <Text style={styles.headerBrand}>Velocity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Location')}>
            <MaterialIcons name="location-pin" size={22} color="#8b5cf6" />
          </TouchableOpacity>
        </View>
        <Text style={styles.pageTitle}>Explore</Text>
        <Text style={styles.pageSubtitle}>Find the freshest essentials delivered fast.</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#8b5cf6" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for products, categories..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => { if (searchQuery.trim()) saveRecentSearch(searchQuery.trim()); }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setIsSearching(false); }}>
                <MaterialIcons name="close" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleFilterPress} style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}>
              <MaterialIcons name="tune" size={18} color={hasActiveFilters ? '#ffffff' : '#1e293b'} />
            </TouchableOpacity>
          </View>

          {/* Active filters indicator */}
          {hasActiveFilters && (
            <View style={styles.filtersActiveRow}>
              <MaterialIcons name="filter-list" size={14} color="#8b5cf6" />
              <Text style={styles.filtersActiveText}>Filters applied</Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearFiltersText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Searches */}
        {!isSearching && recentSearches.length > 0 && (
          <View>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitleSmall}>RECENT SEARCHES</Text>
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text style={styles.clearText}>Clear all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              style={{ marginBottom: 20 }}
            >
              {recentSearches.map((item, idx) => (
                <View key={idx} style={styles.recentPillWrapper}>
                  <TouchableOpacity style={styles.recentPill} onPress={() => handleRecentPress(item)}>
                    <MaterialIcons name="history" size={13} color="#94a3b8" />
                    <Text style={styles.recentText}>{item}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeRecentSearch(item)} style={styles.recentDelete}>
                    <MaterialIcons name="close" size={12} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Search Results Header */}
        {isSearching && (
          <View style={styles.popularHeader}>
            <Text style={styles.sectionTitle}>
              {searchResults.length > 0
                ? `Results (${searchResults.length})`
                : 'No Results Found'}
            </Text>
          </View>
        )}

        {isSearching && searchResults.length === 0 && searchQuery.length > 0 && (
          <View style={styles.emptySearch}>
            <MaterialIcons name="search-off" size={50} color="#cbd5e1" />
            <Text style={styles.emptySearchText}>No products match "{searchQuery}"</Text>
            <Text style={styles.emptySearchSub}>Try a different search term or clear filters</Text>
          </View>
        )}

        {/* Trending Categories (when not searching) */}
        {!isSearching && displayCategories.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <View style={styles.trendingGrid}>
              {displayCategories.map((cat, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.trendCard}
                  onPress={() => setSearchQuery(cat.name)}
                >
                  <View style={[styles.trendImageFiller, { backgroundColor: cat.color }]}>
                    {cat.imageUrl ? (
                      <Image source={{ uri: cat.imageUrl }} style={{ width: '100%', height: '100%', opacity: 0.8 }} resizeMode="cover" />
                    ) : (
                      <MaterialIcons name={cat.icon} size={40} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', bottom: -10, right: -10 }} />
                    )}
                  </View>
                  <View style={styles.trendOverlay}>
                    <Text style={styles.trendName}>{cat.name}</Text>
                    <Text style={styles.trendBadge}>{cat.badge}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Product List Header */}
        {!isSearching && (
          <View style={styles.popularHeader}>
            <Text style={styles.sectionTitle}>
              {hasActiveFilters ? 'Filtered Products' : featuredProducts.length > 0 ? 'Featured Products' : 'Popular Results'}
            </Text>
          </View>
        )}

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {displayProducts.map((item) => (
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

        {loading && (
          <ActivityIndicator size="small" color="#8b5cf6" style={{ marginTop: 20 }} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, backgroundColor: '#ffffff' },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  avatarHolder: { width: 28, height: 28, borderRadius: 10, backgroundColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center' },
  headerBrand: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  pageTitle: { fontSize: 28, fontWeight: '900', color: '#1e293b', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  searchSection: { paddingHorizontal: 16, marginBottom: 14, backgroundColor: '#ffffff', paddingBottom: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, height: 44, paddingLeft: 14, paddingRight: 4, borderWidth: 1, borderColor: '#f1f5f9' },
  searchInput: { flex: 1, color: '#1e293b', fontSize: 13, marginHorizontal: 8 },
  filterBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  filterBtnActive: { backgroundColor: '#8b5cf6' },
  filtersActiveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4, marginTop: 8 },
  filtersActiveText: { fontSize: 12, color: '#8b5cf6', flex: 1 },
  clearFiltersText: { fontSize: 12, fontWeight: '700', color: '#ef4444' },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  sectionTitleSmall: { fontSize: 9, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1.5 },
  clearText: { fontSize: 11, fontWeight: '600', color: '#8b5cf6' },
  recentPillWrapper: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  recentPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1, borderColor: '#f1f5f9',
  },
  recentText: { fontSize: 12, color: '#1e293b' },
  recentDelete: { marginLeft: 4, padding: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', paddingHorizontal: 16, marginBottom: 12 },
  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 24 },
  trendCard: { width: catW, height: 120, borderRadius: 16, overflow: 'hidden' },
  trendImageFiller: { flex: 1, position: 'relative' },
  trendOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, backgroundColor: 'rgba(0,0,0,0.3)' },
  trendName: { fontSize: 14, fontWeight: '800', color: '#ffffff', marginBottom: 3 },
  trendBadge: { fontSize: 8, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  popularHeader: { marginBottom: 4 },

  // Products grid layout
  productsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 10,
  },

  emptySearch: { alignItems: 'center', paddingVertical: 40 },
  emptySearchText: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginTop: 12 },
  emptySearchSub: { fontSize: 13, color: '#64748b', marginTop: 4 },
});

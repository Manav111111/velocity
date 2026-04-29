import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  SafeAreaView, Dimensions, TextInput, Platform, Image,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');
const catW = (width - 55) / 2;

const RECENT_SEARCHES_KEY = '@velocity_recent_searches';

function ProductImage({ uri, style }) {
  if (uri) return <Image source={{ uri }} style={style} resizeMode="cover" />;
  return (
    <View style={[style, { alignItems: 'center', justifyContent: 'center' }]}>
      <MaterialIcons name="shopping-basket" size={30} color="#cbd5e1" />
    </View>
  );
}

export default function SearchScreen({ navigation, route }) {
  const {
    products, categories, trendingProducts, featuredProducts,
    searchProducts, filterProducts, addToCart, loading,
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeFilters, setActiveFilters] = useState(null);

  // Load recent searches from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(RECENT_SEARCHES_KEY).then((val) => {
      if (val) setRecentSearches(JSON.parse(val));
    });
  }, []);

  // Handle category filter passed from HomeScreen or CategoriesScreen
  const filterCategory = route?.params?.filterCategory;
  // Handle filters passed from FilterScreen
  const routeFilters = route?.params?.filters;

  useEffect(() => {
    if (filterCategory) {
      setSearchQuery(filterCategory);
      setIsSearching(true);
    }
  }, [filterCategory]);

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
      return;
    }
    setIsSearching(true);
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
    color: cat.color || '#1a2a4a',
  }));

  const displayProducts = isSearching ? searchResults : allFilteredProducts();
  const hasActiveFilters = activeFilters && Object.values(activeFilters).some((v) => v !== undefined && v !== '' && v !== false && v !== 'popularity');

  return (
    <SafeAreaView style={styles.container}>
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
          <>
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
          </>
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
            <MaterialIcons name="search-off" size={50} color="#40485d" />
            <Text style={styles.emptySearchText}>No products match "{searchQuery}"</Text>
            <Text style={styles.emptySearchSub}>Try a different search term or clear filters</Text>
          </View>
        )}

        {/* Trending Categories (when not searching) */}
        {!isSearching && displayCategories.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <View style={styles.trendingGrid}>
              {displayCategories.map((cat, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.trendCard}
                  onPress={() => setSearchQuery(cat.name)}
                >
                  <View style={[styles.trendImageFiller, { backgroundColor: cat.color }]}>
                    <MaterialIcons name={cat.icon} size={40} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', bottom: -10, right: -10 }} />
                  </View>
                  <View style={styles.trendOverlay}>
                    <Text style={styles.trendName}>{cat.name}</Text>
                    <Text style={styles.trendBadge}>{cat.badge}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Product List Header */}
        {!isSearching && (
          <View style={styles.popularHeader}>
            <Text style={styles.sectionTitle}>
              {hasActiveFilters ? 'Filtered Products' : featuredProducts.length > 0 ? 'Featured Products' : 'Popular Results'}
            </Text>
          </View>
        )}

        {/* Products */}
        {displayProducts.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.popularCard}
            onPress={() => handleProductPress(item)}
          >
            <View style={[styles.popularImg, { backgroundColor: '#f1f5f9' }]}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={{ width: 80, height: 80, borderRadius: 16 }} resizeMode="cover" />
              ) : (
                <MaterialIcons name="shopping-basket" size={30} color="#cbd5e1" />
              )}
            </View>
            <View style={styles.popularInfo}>
              <Text style={styles.popCat}>{(item.category || 'GROCERY').toUpperCase()}</Text>
              <Text style={styles.popName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.popDesc} numberOfLines={1}>{item.description || 'Fresh & premium quality'}</Text>
              <Text style={styles.popPrice}>₹{(item.price || 0).toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.popAddBtn}
              onPress={() => addToCart(item)}
            >
              <MaterialIcons name="add" size={20} color="#ffffff" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {loading && (
          <ActivityIndicator size="small" color="#8b5cf6" style={{ marginTop: 20 }} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', paddingTop: Platform.OS === 'android' ? 40 : 0 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  avatarHolder: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center' },
  headerBrand: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  pageTitle: { fontSize: 34, fontWeight: '900', color: '#1e293b', marginBottom: 8 },
  pageSubtitle: { fontSize: 13, color: '#64748b', lineHeight: 20 },
  searchSection: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 25, height: 50, paddingLeft: 20, paddingRight: 5, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, color: '#1e293b', fontSize: 13, marginHorizontal: 10 },
  filterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  filterBtnActive: { backgroundColor: '#8b5cf6' },
  filtersActiveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4, marginTop: 8 },
  filtersActiveText: { fontSize: 12, color: '#8b5cf6', flex: 1 },
  clearFiltersText: { fontSize: 12, fontWeight: '700', color: '#ef4444' },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  sectionTitleSmall: { fontSize: 9, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1.5 },
  clearText: { fontSize: 11, fontWeight: '600', color: '#8b5cf6' },
  recentPillWrapper: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  recentPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ffffff', paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0',
  },
  recentText: { fontSize: 12, color: '#1e293b' },
  recentDelete: { marginLeft: 4, padding: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', paddingHorizontal: 20, marginBottom: 15 },
  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 15, marginBottom: 30 },
  trendCard: { width: catW, height: 130, borderRadius: 20, overflow: 'hidden' },
  trendImageFiller: { flex: 1, position: 'relative' },
  trendOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, backgroundColor: 'rgba(0,0,0,0.2)' },
  trendName: { fontSize: 15, fontWeight: '800', color: '#ffffff', marginBottom: 4 },
  trendBadge: { fontSize: 8, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  popularHeader: { marginBottom: 5 },
  popularCard: {
    flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 24, padding: 16,
    marginHorizontal: 20, marginBottom: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2,
  },
  popularImg: { width: 80, height: 80, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16, overflow: 'hidden' },
  popularInfo: { flex: 1 },
  popCat: { fontSize: 9, fontWeight: 'bold', color: '#8b5cf6', letterSpacing: 1, marginBottom: 4 },
  popName: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  popDesc: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  popPrice: { fontSize: 17, fontWeight: '900', color: '#1e293b' },
  popAddBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#8b5cf6',
    alignItems: 'center', justifyContent: 'center', position: 'absolute', bottom: 16, right: 16,
  },
  emptySearch: { alignItems: 'center', paddingVertical: 40 },
  emptySearchText: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginTop: 12 },
  emptySearchSub: { fontSize: 13, color: '#64748b', marginTop: 4 },
});

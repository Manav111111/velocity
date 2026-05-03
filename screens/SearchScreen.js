import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  TextInput, Image, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { getCategoryFallbackSource, getCategoryImageSource } from '../utils/categoryMedia';

const RECENT_SEARCHES_KEY = '@velocity_recent_searches';

function CategoryThumb({ cat }) {
  const [failed, setFailed] = useState(false);
  const source = failed ? getCategoryFallbackSource(cat) : getCategoryImageSource(cat);

  return (
    <Image
      source={source}
      style={styles.categoryThumb}
      resizeMode="contain"
      onError={() => setFailed(true)}
    />
  );
}

export default function SearchScreen({ navigation, route }) {
  const {
    products, categories, featuredProducts,
    searchProducts, getProductsByCategory, filterProducts, addToCart, loading,
    getCartItemQty, updateCartQty, toggleWishlist, isInWishlist,
  } = useAppContext();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeFilters, setActiveFilters] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('');

  const categoryTileWidth = width >= 520 ? 126 : 104;
  const filterCategory = route?.params?.filterCategory;
  const filterTimestamp = route?.params?.filterTimestamp;
  const routeFilters = route?.params?.filters;

  useEffect(() => {
    AsyncStorage.getItem(RECENT_SEARCHES_KEY).then((val) => {
      if (val) setRecentSearches(JSON.parse(val));
    });
  }, []);

  useEffect(() => {
    if (filterCategory) {
      setActiveCategoryFilter(filterCategory);
      setSearchQuery(filterCategory);
      setIsSearching(true);
      setSearchResults(getProductsByCategory(filterCategory));
    }
  }, [filterCategory, filterTimestamp, getProductsByCategory]);

  useEffect(() => {
    if (routeFilters) {
      setActiveFilters(routeFilters);
    }
  }, [routeFilters]);

  const saveRecentSearch = useCallback(async (query) => {
    if (!query.trim()) return;
    const next = [query.trim(), ...recentSearches.filter((r) => r !== query.trim())].slice(0, 8);
    setRecentSearches(next);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  }, [recentSearches]);

  const removeRecentSearch = useCallback(async (item) => {
    const next = recentSearches.filter((r) => r !== item);
    setRecentSearches(next);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  }, [recentSearches]);

  const clearRecentSearches = useCallback(async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setActiveCategoryFilter('');
      return;
    }

    if (activeCategoryFilter && searchQuery === activeCategoryFilter) return;

    setIsSearching(true);
    setActiveCategoryFilter('');
    const timer = setTimeout(() => {
      let results = searchProducts(searchQuery);
      if (activeFilters) results = filterProducts(results, activeFilters);
      setSearchResults(results);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, searchProducts, activeFilters, filterProducts, activeCategoryFilter]);

  const saveAndOpenProduct = (product) => {
    if (searchQuery.trim()) saveRecentSearch(searchQuery.trim());
    navigation.navigate('ProductDetail', { product });
  };

  const openCategory = (cat) => {
    setActiveCategoryFilter(cat.name);
    setSearchQuery(cat.name);
    setIsSearching(true);
    setSearchResults(getProductsByCategory(cat.name));
  };

  const handleFilterPress = () => {
    navigation.navigate('Filter', { currentFilters: activeFilters });
  };

  const clearFilters = () => setActiveFilters(null);

  const baseProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 12);
  const displayProducts = isSearching
    ? searchResults
    : activeFilters
      ? filterProducts(baseProducts, activeFilters)
      : baseProducts;
  const hasActiveFilters = activeFilters && Object.values(activeFilters).some((v) => (
    v !== undefined && v !== '' && v !== false && v !== 'popularity'
  ));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Search store</Text>
          <Text style={styles.headerSub}>Fresh groceries, snacks and essentials</Text>
        </View>
        <TouchableOpacity onPress={handleFilterPress} style={[styles.headerFilter, hasActiveFilters && styles.headerFilterActive]} activeOpacity={0.82}>
          <MaterialIcons name="tune" size={20} color={hasActiveFilters ? '#ffffff' : '#16803C'} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for milk, atta, chips..."
            placeholderTextColor="#718096"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => { if (searchQuery.trim()) saveRecentSearch(searchQuery.trim()); }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setIsSearching(false); }} activeOpacity={0.75}>
              <MaterialIcons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 92 + bottomInset }}
        keyboardShouldPersistTaps="handled"
      >
        {hasActiveFilters && (
          <View style={styles.filtersBanner}>
            <View style={styles.filtersLeft}>
              <MaterialIcons name="filter-list" size={16} color="#16803C" />
              <Text style={styles.filtersText}>Filters applied</Text>
            </View>
            <TouchableOpacity onPress={clearFilters} activeOpacity={0.75}>
              <Text style={styles.clearFiltersText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isSearching && recentSearches.length > 0 && (
          <View style={styles.block}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent searches</Text>
              <TouchableOpacity onPress={clearRecentSearches} activeOpacity={0.75}>
                <Text style={styles.sectionAction}>Clear</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
              {recentSearches.map((item) => (
                <View key={item} style={styles.recentPillWrapper}>
                  <TouchableOpacity style={styles.recentPill} onPress={() => { setSearchQuery(item); setIsSearching(true); }} activeOpacity={0.82}>
                    <MaterialIcons name="history" size={14} color="#64748B" />
                    <Text style={styles.recentText}>{item}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeRecentSearch(item)} style={styles.recentDelete} activeOpacity={0.75}>
                    <MaterialIcons name="close" size={12} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {!isSearching && categories.length > 0 && (
          <View style={styles.block}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Browse categories</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CategoriesTab')} activeOpacity={0.75}>
                <Text style={styles.sectionAction}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {categories.slice(0, 10).map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, { width: categoryTileWidth }]}
                  onPress={() => openCategory(cat)}
                  activeOpacity={0.86}
                >
                  <View style={styles.categoryImageBox}>
                    <CategoryThumb cat={cat} />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={2}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              {isSearching ? (searchResults.length > 0 ? `Results for "${searchQuery}"` : 'No matches found') : hasActiveFilters ? 'Filtered products' : 'Popular products'}
            </Text>
            <Text style={styles.sectionSub}>{displayProducts.length} items available</Text>
          </View>
        </View>

        {isSearching && searchResults.length === 0 && searchQuery.length > 0 ? (
          <View style={styles.emptySearch}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="search-off" size={34} color="#16803C" />
            </View>
            <Text style={styles.emptySearchText}>No products match "{searchQuery}"</Text>
            <Text style={styles.emptySearchSub}>Try another word or clear filters.</Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {displayProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                variant="grid"
                onPress={() => saveAndOpenProduct(item)}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist(item.id)}
                cartQty={getCartItemQty(item.id)}
                onUpdateQty={updateCartQty}
              />
            ))}
          </View>
        )}

        {loading && (
          <ActivityIndicator size="small" color="#16803C" style={{ marginTop: 20 }} />
        )}
      </ScrollView>
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
    paddingBottom: 12,
    backgroundColor: '#ffffff',
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#111827' },
  headerSub: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 2 },
  headerFilter: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#E8F8DE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CDEFC0',
  },
  headerFilterActive: { backgroundColor: '#16803C', borderColor: '#16803C' },
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE1',
  },
  searchBar: {
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
  searchInput: { flex: 1, color: '#111827', fontSize: 14, fontWeight: '700' },
  filtersBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filtersLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filtersText: { fontSize: 12, fontWeight: '900', color: '#166534' },
  clearFiltersText: { fontSize: 12, fontWeight: '900', color: '#DC2626' },
  block: { marginTop: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },
  sectionSub: { fontSize: 11, fontWeight: '700', color: '#718096', marginTop: 2 },
  sectionAction: { fontSize: 12, fontWeight: '900', color: '#16803C' },
  recentRow: { paddingHorizontal: 16, gap: 8 },
  recentPillWrapper: { flexDirection: 'row', alignItems: 'center', marginRight: 6 },
  recentPill: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5ECDC',
  },
  recentText: { fontSize: 12, fontWeight: '800', color: '#334155' },
  recentDelete: { marginLeft: 2, padding: 6 },
  categoryRow: { paddingHorizontal: 16, gap: 10 },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5ECDC',
  },
  categoryImageBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryThumb: { width: '90%', height: '90%' },
  categoryName: { minHeight: 33, fontSize: 12, lineHeight: 16, fontWeight: '900', color: '#111827', textAlign: 'center' },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  emptySearch: { alignItems: 'center', paddingVertical: 42, paddingHorizontal: 30 },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#E8F8DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptySearchText: { fontSize: 16, fontWeight: '900', color: '#111827', textAlign: 'center' },
  emptySearchSub: { fontSize: 13, fontWeight: '600', color: '#64748B', marginTop: 5, textAlign: 'center' },
});

import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Image, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import SkeletonLoader from '../components/SkeletonLoader';
import { getCategoryFallbackSource, getCategoryImageSource } from '../utils/categoryMedia';

const CAT_THEMES = [
  { bg: '#EFFBEA', accent: '#16803C', imageBg: '#DDF6D5' },
  { bg: '#FFF7D6', accent: '#9A6B00', imageBg: '#FFECA3' },
  { bg: '#EAF7FF', accent: '#0877A6', imageBg: '#D5EEFF' },
  { bg: '#FFF0F3', accent: '#C33152', imageBg: '#FFE0E8' },
  { bg: '#F1F0FF', accent: '#5B45D6', imageBg: '#E3DFFF' },
  { bg: '#EDFFF8', accent: '#057A55', imageBg: '#D5F7E9' },
];

function CategoryArtwork({ cat }) {
  const [failed, setFailed] = useState(false);
  const source = failed ? getCategoryFallbackSource(cat) : getCategoryImageSource(cat);

  return (
    <Image
      source={source}
      style={styles.categoryImage}
      resizeMode="contain"
      onError={() => setFailed(true)}
    />
  );
}

export default function CategoriesScreen({ navigation }) {
  const { categories, loading, location, cartItemCount } = useAppContext();
  const { width } = useWindowDimensions();
  const columns = 3;
  const tileWidth = Math.floor((Math.max(width, 320) - 32 - (columns - 1) * 8) / columns);
  const totalProducts = categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0);

  const handleCategoryPress = (cat) => {
    navigation.navigate('SearchTab', { filterCategory: cat.name, filterTimestamp: Date.now() });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.topBar}>
          <View style={styles.brandBlock}>
            <Text style={styles.headerBrand}>Velocity</Text>
            <Text style={styles.locationText}>Loading fresh departments...</Text>
          </View>
          <View style={styles.cartButton}>
            <MaterialIcons name="shopping-bag" size={18} color="#16803C" />
          </View>
        </View>
        <View style={styles.searchBand}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={19} color="#718096" />
            <Text style={styles.searchPlaceholder}>Search groceries</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.loadingContent}>
          <SkeletonLoader variant="category" count={4} />
          <View style={{ height: 18 }} />
          <SkeletonLoader variant="category" count={4} />
          <View style={{ height: 18 }} />
          <SkeletonLoader variant="category" count={4} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <View style={styles.brandBlock}>
          <Text style={styles.headerBrand}>Velocity</Text>
          <TouchableOpacity
            style={styles.locationRow}
            onPress={() => navigation.navigate('Location')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="location-on" size={14} color="#16803C" />
            <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={15} color="#718096" />
          </TouchableOpacity>
        </View>
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

      <View style={styles.searchBand}>
        <TouchableOpacity
          style={styles.searchBox}
          onPress={() => navigation.navigate('SearchTab')}
          activeOpacity={0.82}
        >
          <MaterialIcons name="search" size={19} color="#718096" />
          <Text style={styles.searchPlaceholder}>Search for atta, milk, chips...</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate('Filter')}
          activeOpacity={0.82}
        >
          <MaterialIcons name="tune" size={20} color="#16803C" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.promiseStrip}>
          <View style={styles.promiseItem}>
            <MaterialIcons name="bolt" size={16} color="#16803C" />
            <Text style={styles.promiseText}>10 min delivery</Text>
          </View>
          <View style={styles.promiseDivider} />
          <View style={styles.promiseItem}>
            <MaterialIcons name="verified" size={16} color="#16803C" />
            <Text style={styles.promiseText}>Fresh stock</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Shop by category</Text>
            <Text style={styles.sectionMeta}>
              {categories.length} departments{totalProducts > 0 ? `, ${totalProducts} items` : ''}
            </Text>
          </View>
        </View>

        {categories.length > 0 ? (
          <View style={styles.catGrid}>
            {categories.map((cat, index) => {
              const theme = CAT_THEMES[index % CAT_THEMES.length];
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catCard, { width: tileWidth }]}
                  onPress={() => handleCategoryPress(cat)}
                  activeOpacity={0.86}
                >
                  <View style={[styles.catImageBox, { backgroundColor: theme.imageBg }]}>
                    <CategoryArtwork cat={cat} />
                  </View>
                  <Text style={styles.catName} numberOfLines={2}>{cat.name}</Text>
                  <Text style={styles.catCount}>
                    {cat.productCount > 0 ? `${cat.productCount} items` : 'Shop now'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <MaterialIcons name="grid-view" size={32} color="#16803C" />
            </View>
            <Text style={styles.emptyTitle}>No categories yet</Text>
            <Text style={styles.emptySubtitle}>Departments will appear here once added by admin.</Text>
          </View>
        )}

        {categories.length > 0 && (
          <TouchableOpacity
            style={styles.browseAllBtn}
            onPress={() => navigation.navigate('SearchTab')}
            activeOpacity={0.88}
          >
            <MaterialIcons name="apps" size={18} color="#ffffff" />
            <Text style={styles.browseAllText}>Browse all products</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F4' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
  },
  brandBlock: { flex: 1, marginRight: 12 },
  headerBrand: { fontSize: 22, fontWeight: '900', color: '#111827', letterSpacing: 0 },
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
  searchBand: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE1',
  },
  searchBox: {
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
  searchPlaceholder: { fontSize: 13, fontWeight: '600', color: '#718096' },
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
  scrollContent: { paddingBottom: 105 },
  loadingContent: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 14 },
  promiseStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 18,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  promiseItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  promiseDivider: { width: 1, height: 22, backgroundColor: '#BBF7D0' },
  promiseText: { fontSize: 12, fontWeight: '900', color: '#166534' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },
  sectionMeta: { fontSize: 11, fontWeight: '600', color: '#718096', marginTop: 2 },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  catCard: {
    backgroundColor: '#ffffff',
    borderRadius: 9,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E5ECDC',
  },
  catImageBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  categoryImage: { width: '92%', height: '92%' },
  catName: { minHeight: 31, fontSize: 11, lineHeight: 15, fontWeight: '900', color: '#111827', textAlign: 'center' },
  catCount: { fontSize: 10, fontWeight: '700', color: '#718096', marginTop: 2, textAlign: 'center' },
  browseAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 24,
    borderRadius: 8,
    backgroundColor: '#16803C',
  },
  browseAllText: { fontSize: 14, fontWeight: '900', color: '#ffffff' },
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 28 },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#E8F8DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 17, fontWeight: '900', color: '#111827', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center' },
});

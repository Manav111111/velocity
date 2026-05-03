import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Switch, Platform, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const SORT_OPTIONS = [
  { id: 'popularity', label: 'Popularity', icon: 'trending-up', desc: 'Best selling first' },
  { id: 'price-low', label: 'Price: Low to High', icon: 'arrow-upward', desc: 'Cheapest first' },
  { id: 'price-high', label: 'Price: High to Low', icon: 'arrow-downward', desc: 'Most expensive first' },
];

export default function FilterScreen({ navigation, route }) {
  const { categories, products } = useAppContext();

  const currentFilters = route?.params?.currentFilters || {};

  const [sortBy, setSortBy] = useState(currentFilters.sortBy || 'popularity');
  const [selectedCategory, setSelectedCategory] = useState(currentFilters.category || '');
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice !== undefined ? currentFilters.minPrice : 0);
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice !== undefined ? currentFilters.maxPrice : 1000);
  const [inStockOnly, setInStockOnly] = useState(currentFilters.inStockOnly || false);

  // Compute dynamic price range from products
  const productPrices = products.map((p) => p.price || 0);
  const globalMin = productPrices.length > 0 ? Math.floor(Math.min(...productPrices)) : 0;
  const globalMax = productPrices.length > 0 ? Math.ceil(Math.max(...productPrices)) : 1000;

  const handleReset = () => {
    setSortBy('popularity');
    setSelectedCategory('');
    setMinPrice(globalMin);
    setMaxPrice(globalMax);
    setInStockOnly(false);
  };

  const handleApply = () => {
    const filters = {
      sortBy,
      category: selectedCategory || undefined,
      minPrice: minPrice > globalMin ? minPrice : undefined,
      maxPrice: maxPrice < globalMax ? maxPrice : undefined,
      inStockOnly: inStockOnly || undefined,
    };
    navigation.navigate('SearchTab', { filters });
  };

  const activeFilterCount = [
    sortBy !== 'popularity',
    !!selectedCategory,
    minPrice > globalMin,
    maxPrice < globalMax,
    inStockOnly,
  ].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.supertext}>PREFERENCES</Text>
          <Text style={styles.headerTitle}>Refine Search</Text>
        </View>
        <View style={styles.headerRight}>
          {activeFilterCount > 0 && (
            <View style={styles.filterCountBadge}>
              <Text style={styles.filterCountText}>{activeFilterCount}</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <MaterialIcons name="close" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}>

        {/* Sort By */}
        <Text style={styles.sectionTitle}>Sort By</Text>
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.sortCard, sortBy === option.id && styles.sortCardActive]}
            onPress={() => setSortBy(option.id)}
          >
            <View style={[styles.sortIconBox, sortBy === option.id && styles.sortIconBoxActive]}>
              <MaterialIcons name={option.icon} size={20} color={sortBy === option.id ? '#060e20' : '#b6a0ff'} />
            </View>
            <View style={styles.sortInfo}>
              <Text style={[styles.sortLabel, sortBy === option.id && styles.sortLabelActive]}>{option.label}</Text>
              <Text style={styles.sortDesc}>{option.desc}</Text>
            </View>
            <MaterialIcons
              name={sortBy === option.id ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={22}
              color={sortBy === option.id ? '#b6a0ff' : '#40485d'}
            />
          </TouchableOpacity>
        ))}

        {/* Price Range */}
        <Text style={styles.sectionTitle}>Price Range</Text>
        <View style={styles.priceCard}>
          <View style={styles.priceDisplay}>
            <View style={styles.pricePill}>
              <Text style={styles.pricePillLabel}>MIN</Text>
              <Text style={styles.pricePillValue}>₹{Math.round(minPrice)}</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.pricePill}>
              <Text style={styles.pricePillLabel}>MAX</Text>
              <Text style={styles.pricePillValue}>₹{Math.round(maxPrice)}</Text>
            </View>
          </View>
          <Text style={styles.sliderLabel}>Minimum Price</Text>
          <Slider
            style={styles.slider}
            minimumValue={globalMin}
            maximumValue={globalMax}
            value={minPrice}
            onValueChange={(val) => {
              if (val < maxPrice) setMinPrice(val);
            }}
            minimumTrackTintColor="#8b5cf6"
            maximumTrackTintColor="#e2e8f0"
            thumbTintColor="#8b5cf6"
          />
          <Text style={styles.sliderLabel}>Maximum Price</Text>
          <Slider
            style={styles.slider}
            minimumValue={globalMin}
            maximumValue={globalMax}
            value={maxPrice}
            onValueChange={(val) => {
              if (val > minPrice) setMaxPrice(val);
            }}
            minimumTrackTintColor="#8b5cf6"
            maximumTrackTintColor="#e2e8f0"
            thumbTintColor="#8b5cf6"
          />
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.categoryGrid}>
          {/* All option */}
          <TouchableOpacity
            style={[styles.catPill, !selectedCategory && styles.catPillActive]}
            onPress={() => setSelectedCategory('')}
          >
            <MaterialIcons name="apps" size={16} color={!selectedCategory ? '#ffffff' : '#1e293b'} />
            <Text style={[styles.catPillText, !selectedCategory && styles.catPillTextActive]}>All</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catPill, selectedCategory === cat.name && styles.catPillActive]}
              onPress={() => setSelectedCategory(selectedCategory === cat.name ? '' : cat.name)}
            >
              <MaterialIcons
                name={cat.resolvedIcon || 'category'}
                size={16}
                color={selectedCategory === cat.name ? '#ffffff' : '#1e293b'}
              />
              <Text style={[styles.catPillText, selectedCategory === cat.name && styles.catPillTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Availability */}
        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <View style={styles.toggleIconBox}>
              <MaterialIcons name="inventory" size={20} color="#059669" />
            </View>
            <View>
              <Text style={styles.toggleLabel}>In Stock Only</Text>
              <Text style={styles.toggleDesc}>Show only available products</Text>
            </View>
          </View>
          <Switch
            value={inStockOnly}
            onValueChange={setInStockOnly}
            trackColor={{ false: '#e2e8f0', true: 'rgba(139,92,246,0.3)' }}
            thumbColor={inStockOnly ? '#8b5cf6' : '#94a3b8'}
          />
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <MaterialIcons name="refresh" size={18} color="#8b5cf6" />
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyText}>
            Apply{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
          <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 50 : 20, paddingBottom: 18,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  supertext: { fontSize: 9, fontWeight: 'bold', color: '#8b5cf6', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#1e293b' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  filterCountBadge: {
    backgroundColor: '#8b5cf6', borderRadius: 10, minWidth: 22, height: 22,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  filterCountText: { fontSize: 11, fontWeight: 'bold', color: '#ffffff' },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 2,
    marginBottom: 14, marginTop: 22,
  },
  // Sort
  sortCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  sortCardActive: { backgroundColor: 'rgba(139,92,246,0.05)', borderColor: '#8b5cf6' },
  sortIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(139,92,246,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  sortIconBoxActive: { backgroundColor: '#8b5cf6' },
  sortInfo: { flex: 1 },
  sortLabel: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  sortLabelActive: { color: '#8b5cf6' },
  sortDesc: { fontSize: 11, color: '#64748b' },
  // Price
  priceCard: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  priceDisplay: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  pricePill: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  pricePillLabel: { fontSize: 9, fontWeight: 'bold', color: '#64748b', letterSpacing: 1, marginBottom: 4 },
  pricePillValue: { fontSize: 18, fontWeight: '800', color: '#8b5cf6' },
  priceDivider: { width: 20, height: 2, backgroundColor: '#e2e8f0', marginHorizontal: 10 },
  sliderLabel: { fontSize: 11, color: '#64748b', marginBottom: 4 },
  slider: { width: '100%', height: 40 },
  // Categories
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  catPillActive: { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
  catPillText: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  catPillTextActive: { color: '#ffffff' },
  // Availability toggle
  toggleCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  toggleIconBox: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(5,150,105,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  toggleLabel: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  toggleDesc: { fontSize: 12, color: '#64748b' },
  // Bottom
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12,
    backgroundColor: '#ffffff', paddingHorizontal: 20, paddingVertical: 20,
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  resetBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 16, height: 52, borderWidth: 1.5, borderColor: '#8b5cf6',
  },
  resetText: { fontSize: 15, fontWeight: '700', color: '#8b5cf6' },
  applyBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#8b5cf6', borderRadius: 16, height: 52,
    shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6,
  },
  applyText: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
});

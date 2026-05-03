import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Switch, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { getCategoryFallbackSource, getCategoryImageSource } from '../utils/categoryMedia';

const SORT_OPTIONS = [
  { id: 'popularity', label: 'Popular', icon: 'trending-up' },
  { id: 'price-low', label: 'Low price', icon: 'arrow-downward' },
  { id: 'price-high', label: 'High price', icon: 'arrow-upward' },
];

const PRICE_PRESETS = [
  { label: 'Under ₹100', min: 0, max: 100 },
  { label: '₹100-₹300', min: 100, max: 300 },
  { label: '₹300+', min: 300, max: null },
];

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

export default function FilterScreen({ navigation, route }) {
  const { categories, products } = useAppContext();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);
  const currentFilters = route?.params?.currentFilters || {};

  const productPrices = products.map((p) => p.price || 0);
  const globalMin = productPrices.length > 0 ? Math.floor(Math.min(...productPrices)) : 0;
  const globalMax = productPrices.length > 0 ? Math.ceil(Math.max(...productPrices)) : 1000;
  const priceCeiling = Math.max(globalMax, globalMin + 1);

  const [sortBy, setSortBy] = useState(currentFilters.sortBy || 'popularity');
  const [selectedCategory, setSelectedCategory] = useState(currentFilters.category || '');
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice !== undefined ? currentFilters.minPrice : globalMin);
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice !== undefined ? currentFilters.maxPrice : priceCeiling);
  const [inStockOnly, setInStockOnly] = useState(currentFilters.inStockOnly || false);

  const activeFilterCount = [
    sortBy !== 'popularity',
    !!selectedCategory,
    minPrice > globalMin,
    maxPrice < priceCeiling,
    inStockOnly,
  ].filter(Boolean).length;

  const handleReset = () => {
    setSortBy('popularity');
    setSelectedCategory('');
    setMinPrice(globalMin);
    setMaxPrice(priceCeiling);
    setInStockOnly(false);
  };

  const handleApply = () => {
    const filters = {
      sortBy,
      category: selectedCategory || undefined,
      minPrice: minPrice > globalMin ? Math.round(minPrice) : undefined,
      maxPrice: maxPrice < priceCeiling ? Math.round(maxPrice) : undefined,
      inStockOnly: inStockOnly || undefined,
    };
    navigation.navigate('Home', { screen: 'SearchTab', params: { filters } });
  };

  const applyPricePreset = (preset) => {
    const nextMin = Math.min(Math.max(preset.min, globalMin), priceCeiling - 1);
    const nextMax = preset.max == null ? priceCeiling : Math.min(Math.max(preset.max, nextMin + 1), priceCeiling);
    setMinPrice(nextMin);
    setMaxPrice(nextMax);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Filters</Text>
          <Text style={styles.headerSub}>
            {activeFilterCount > 0 ? `${activeFilterCount} applied` : 'Find exactly what you need'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} activeOpacity={0.82}>
          <MaterialIcons name="close" size={21} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + bottomInset }]}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sort by</Text>
          <View style={styles.segmentRow}>
            {SORT_OPTIONS.map((option) => {
              const active = sortBy === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.segment, active && styles.segmentActive]}
                  onPress={() => setSortBy(option.id)}
                  activeOpacity={0.82}
                >
                  <MaterialIcons name={option.icon} size={16} color={active ? '#ffffff' : '#334155'} />
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Price range</Text>
            <Text style={styles.priceRangeText}>₹{Math.round(minPrice)} - ₹{Math.round(maxPrice)}</Text>
          </View>

          <View style={styles.pricePresetRow}>
            {PRICE_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={styles.pricePreset}
                onPress={() => applyPricePreset(preset)}
                activeOpacity={0.82}
              >
                <Text style={styles.pricePresetText}>{preset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sliderLabel}>Minimum</Text>
          <Slider
            style={styles.slider}
            minimumValue={globalMin}
            maximumValue={priceCeiling}
            value={minPrice}
            onValueChange={(val) => {
              if (val < maxPrice) setMinPrice(val);
            }}
            minimumTrackTintColor="#16803C"
            maximumTrackTintColor="#DDE7D6"
            thumbTintColor="#16803C"
          />

          <Text style={styles.sliderLabel}>Maximum</Text>
          <Slider
            style={styles.slider}
            minimumValue={globalMin}
            maximumValue={priceCeiling}
            value={maxPrice}
            onValueChange={(val) => {
              if (val > minPrice) setMaxPrice(val);
            }}
            minimumTrackTintColor="#16803C"
            maximumTrackTintColor="#DDE7D6"
            thumbTintColor="#16803C"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity
            style={[styles.categoryRow, !selectedCategory && styles.categoryRowActive]}
            onPress={() => setSelectedCategory('')}
            activeOpacity={0.82}
          >
            <View style={styles.allIconBox}>
              <MaterialIcons name="apps" size={20} color="#16803C" />
            </View>
            <Text style={styles.categoryName}>All categories</Text>
            {!selectedCategory && <MaterialIcons name="check-circle" size={20} color="#16803C" />}
          </TouchableOpacity>

          {categories.map((cat) => {
            const active = selectedCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryRow, active && styles.categoryRowActive]}
                onPress={() => setSelectedCategory(active ? '' : cat.name)}
                activeOpacity={0.82}
              >
                <View style={styles.categoryThumbBox}>
                  <CategoryThumb cat={cat} />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <Text style={styles.categoryMeta}>
                    {cat.productCount > 0 ? `${cat.productCount} items` : 'Available now'}
                  </Text>
                </View>
                {active ? (
                  <MaterialIcons name="check-circle" size={20} color="#16803C" />
                ) : (
                  <MaterialIcons name="radio-button-unchecked" size={20} color="#CBD5E1" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.stockCard}>
          <View style={styles.stockLeft}>
            <View style={styles.stockIconBox}>
              <MaterialIcons name="inventory-2" size={20} color="#16803C" />
            </View>
            <View>
              <Text style={styles.stockTitle}>In stock only</Text>
              <Text style={styles.stockSub}>Hide sold-out products</Text>
            </View>
          </View>
          <Switch
            value={inStockOnly}
            onValueChange={setInStockOnly}
            trackColor={{ false: '#DDE7D6', true: '#BEE7B1' }}
            thumbColor={inStockOnly ? '#16803C' : '#94A3B8'}
          />
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(bottomInset, 16) }]}>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.82}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.88}>
          <Text style={styles.applyText}>Show products</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
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
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE1',
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#111827' },
  headerSub: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 2 },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5ECDC',
  },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: '#111827', marginBottom: 12 },
  segmentRow: { flexDirection: 'row', gap: 8 },
  segment: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: '#F6F8F4',
    borderWidth: 1,
    borderColor: '#E5ECDC',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  segmentActive: { backgroundColor: '#16803C', borderColor: '#16803C' },
  segmentText: { fontSize: 12, fontWeight: '900', color: '#334155' },
  segmentTextActive: { color: '#ffffff' },
  priceRangeText: { fontSize: 13, fontWeight: '900', color: '#16803C', marginBottom: 12 },
  pricePresetRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  pricePreset: {
    flex: 1,
    minHeight: 36,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  pricePresetText: { fontSize: 11, fontWeight: '900', color: '#166534' },
  sliderLabel: { fontSize: 11, fontWeight: '800', color: '#64748B', marginTop: 4 },
  slider: { width: '100%', height: 38 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 58,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2E9',
  },
  categoryRowActive: { backgroundColor: '#ECFDF5', borderColor: '#86EFAC' },
  allIconBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#E8F8DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryThumbBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#F0F7EA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  categoryThumb: { width: 38, height: 38 },
  categoryInfo: { flex: 1 },
  categoryName: { flex: 1, fontSize: 13, fontWeight: '900', color: '#111827' },
  categoryMeta: { fontSize: 10, fontWeight: '700', color: '#718096', marginTop: 2 },
  stockCard: {
    minHeight: 68,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5ECDC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stockLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stockIconBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#E8F8DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockTitle: { fontSize: 14, fontWeight: '900', color: '#111827' },
  stockSub: { fontSize: 11, fontWeight: '700', color: '#718096', marginTop: 2 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E6ECE1',
  },
  resetBtn: {
    width: 104,
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#16803C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: { fontSize: 14, fontWeight: '900', color: '#16803C' },
  applyBtn: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#16803C',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  applyText: { fontSize: 15, fontWeight: '900', color: '#ffffff' },
});

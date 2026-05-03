import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import SkeletonLoader from '../components/SkeletonLoader';

const { width } = Dimensions.get('window');

// Per-category gradient pairs — cycles if more than 8 categories
const CAT_GRADIENTS = [
  { bg: '#EDE9FE', accent: '#7C3AED' },  // purple
  { bg: '#ECFDF5', accent: '#059669' },  // green
  { bg: '#FEF3C7', accent: '#D97706' },  // amber
  { bg: '#FCE7F3', accent: '#DB2777' },  // pink
  { bg: '#E0F2FE', accent: '#0284C7' },  // blue
  { bg: '#FEF2F2', accent: '#DC2626' },  // red
  { bg: '#F0FDF4', accent: '#16A34A' },  // emerald
  { bg: '#FFF7ED', accent: '#EA580C' },  // orange
];

export default function CategoriesScreen({ navigation }) {
  const { categories, loading } = useAppContext();

  const handleCategoryPress = (cat) => {
    navigation.navigate('SearchTab', { filterCategory: cat.name, filterTimestamp: Date.now() });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="bolt" size={20} color="#7C3AED" />
            <Text style={styles.headerBrand}>Velocity</Text>
          </View>
          <View style={styles.avatarHolder}>
            <MaterialIcons name="person" size={16} color="#ffffff" />
          </View>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
          <View style={{ height: 14 }} />
          <SkeletonLoader variant="category" count={3} />
          <View style={{ height: 20 }} />
          <SkeletonLoader variant="category" count={3} />
          <View style={{ height: 20 }} />
          <SkeletonLoader variant="category" count={3} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="bolt" size={20} color="#7C3AED" />
          <Text style={styles.headerBrand}>Velocity</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarHolder}
          onPress={() => navigation.navigate('ProfileTab')}
        >
          <MaterialIcons name="person" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Hero ── */}
        <View style={styles.heroSection}>
          <Text style={styles.supertext}>DEPARTMENTS</Text>
          <Text style={styles.pageTitle}>Explore{'\n'}Categories</Text>
          <Text style={styles.subtitle}>
            {categories.length > 0
              ? `Browse ${categories.length} categories of fresh groceries, delivered to your door.`
              : 'Categories will appear here once added by the admin.'}
          </Text>
        </View>

        {/* ── Category Grid ── */}
        {categories.length > 0 ? (
          <View style={styles.catGrid}>
            {categories.map((cat, index) => {
              const theme = CAT_GRADIENTS[index % CAT_GRADIENTS.length];
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catCard, { backgroundColor: theme.bg }]}
                  onPress={() => handleCategoryPress(cat)}
                  activeOpacity={0.85}
                >
                  {/* Icon */}
                  <View style={[styles.catIconWrap, { backgroundColor: theme.accent + '22' }]}>
                    <MaterialIcons
                      name={cat.resolvedIcon || 'category'}
                      size={26}
                      color={theme.accent}
                    />
                  </View>

                  {/* Name + count */}
                  <Text style={[styles.catName, { color: theme.accent }]}>{cat.name}</Text>
                  {cat.productCount != null && (
                    <Text style={styles.catCount}>{cat.productCount} items</Text>
                  )}

                  {/* Arrow */}
                  <View style={[styles.catArrow, { backgroundColor: theme.accent }]}>
                    <MaterialIcons name="arrow-forward" size={14} color="#fff" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <MaterialIcons name="grid-view" size={32} color="#7C3AED" />
            </View>
            <Text style={styles.emptyTitle}>No Categories Yet</Text>
            <Text style={styles.emptySubtitle}>
              Categories will appear here once added by admin.
            </Text>
          </View>
        )}

        {/* ── Browse All Button ── */}
        {categories.length > 0 && (
          <TouchableOpacity
            style={styles.browseAllBtn}
            onPress={() => navigation.navigate('SearchTab')}
            activeOpacity={0.88}
          >
            <MaterialIcons name="apps" size={18} color="#ffffff" />
            <Text style={styles.browseAllText}>Browse All Products</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 10, paddingBottom: 12,
    backgroundColor: '#ffffff', borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerBrand: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  avatarHolder: {
    width: 32, height: 32, borderRadius: 11,
    backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center',
  },

  // Hero
  heroSection: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 6 },
  supertext: {
    fontSize: 10, fontWeight: '700', color: '#7C3AED', letterSpacing: 1.6, marginBottom: 6,
  },
  pageTitle: {
    fontSize: 30, fontWeight: '900', color: '#0F172A', lineHeight: 36, marginBottom: 10,
  },
  subtitle: {
    fontSize: 13, color: '#64748b', lineHeight: 19, marginBottom: 20, paddingRight: 12,
  },

  // Grid
  catGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 12, marginBottom: 16,
  },
  catCard: {
    width: (width - 44) / 2,
    borderRadius: 20, padding: 18,
    position: 'relative', overflow: 'hidden',
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.04)',
  },
  catIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  catName: { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  catCount: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  catArrow: {
    position: 'absolute', bottom: 16, right: 16,
    width: 30, height: 30, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },

  // Browse all
  browseAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#7C3AED', borderRadius: 18, height: 52,
    marginHorizontal: 16, marginBottom: 24, marginTop: 4,
    shadowColor: '#5B21B6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 6,
  },
  browseAllText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center' },
});
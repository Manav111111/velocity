import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  SafeAreaView, Dimensions, Platform, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');
const cardW = (width - 60) / 2;

export default function CategoriesScreen({ navigation }) {
  const { categories, loading } = useAppContext();

  const handleCategoryPress = (cat) => {
    navigation.navigate('SearchTab', { filterCategory: cat.name });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={{ color: '#64748b', marginTop: 12 }}>Loading categories...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="bolt" size={20} color="#8b5cf6" />
          <Text style={styles.headerBrand}>Velocity</Text>
        </View>
        <TouchableOpacity style={styles.avatarHolder} onPress={() => navigation.navigate('ProfileTab')}>
          <MaterialIcons name="person" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
      >
        {/* Title Section */}
        <Text style={styles.supertext}>DEPARTMENTS</Text>
        <Text style={styles.pageTitle}>{'Explore\nCategories'}</Text>
        <Text style={styles.subtitle}>
          {categories.length > 0
            ? `Browse ${categories.length} categories of fresh groceries, delivered to your door.`
            : 'Categories will appear here once added by the admin.'}
        </Text>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <View style={styles.grid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.catCard}
                onPress={() => handleCategoryPress(cat)}
                activeOpacity={0.85}
              >
                <View style={[styles.imageBox, { backgroundColor: cat.color || '#f1f5f9' }]}>
                  <MaterialIcons
                    name={cat.resolvedIcon || 'category'}
                    size={46}
                    color="rgba(0,0,0,0.05)"
                  />
                  {cat.productCount > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{cat.productCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.catName}>{cat.name}</Text>
                <View style={styles.catArrow}>
                  <MaterialIcons name="arrow-forward" size={14} color="#8b5cf6" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="grid-view" size={50} color="#40485d" />
            <Text style={styles.emptyTitle}>No Categories Yet</Text>
            <Text style={styles.emptySubtitle}>Categories will appear here once added by admin.</Text>
          </View>
        )}

        {/* Browse All Button */}
        {categories.length > 0 && (
          <TouchableOpacity
            style={styles.browseAllBtn}
            onPress={() => navigation.navigate('SearchTab')}
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
  container: { flex: 1, backgroundColor: '#ffffff', paddingTop: Platform.OS === 'android' ? 40 : 0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerBrand: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  avatarHolder: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center',
  },
  supertext: { fontSize: 10, fontWeight: 'bold', color: '#8b5cf6', letterSpacing: 1.5, marginBottom: 8 },
  pageTitle: { fontSize: 40, fontWeight: '900', color: '#1e293b', lineHeight: 44, marginBottom: 12 },
  subtitle: { fontSize: 13, color: '#64748b', lineHeight: 20, marginBottom: 28, paddingRight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  catCard: {
    width: cardW, backgroundColor: '#ffffff', borderRadius: 22, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', paddingBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2,
  },
  imageBox: {
    width: '100%', height: cardW - 24, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12, position: 'relative',
  },
  countBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  countBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#1e293b' },
  catName: { fontSize: 15, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 6 },
  catArrow: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: 'rgba(139,92,246,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  // Browse all
  browseAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#8b5cf6', borderRadius: 20, height: 52, marginTop: 4,
    shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6,
  },
  browseAllText: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: '#64748b', marginTop: 4, textAlign: 'center' },
});

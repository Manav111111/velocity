import React, { memo } from 'react';
import {
  StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * CategoryGrid — displays categories in horizontal scroll or grid.
 * @param {Object} props
 * @param {'horizontal'|'grid'} props.variant
 * @param {Array} props.categories
 * @param {Function} props.onCategoryPress
 * @param {number} [props.columns=3] — columns for grid variant
 */
function CategoryGrid({ categories = [], onCategoryPress, variant = 'horizontal', columns = 3 }) {
  const { width } = useWindowDimensions();
  if (categories.length === 0) return null;

  if (variant === 'horizontal') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.horizontalItem}
            onPress={() => onCategoryPress?.(cat)}
            activeOpacity={0.75}
          >
            <View style={[styles.horizontalIcon, { backgroundColor: cat.color ? cat.color + '15' : '#f5f3ff' }]}>
              {cat.imageUrl ? (
                <Image source={{ uri: cat.imageUrl }} style={styles.horizontalImage} resizeMode="cover" />
              ) : (
                <MaterialIcons name={cat.resolvedIcon || 'category'} size={26} color="#8b5cf6" />
              )}
            </View>
            <Text style={styles.horizontalLabel} numberOfLines={1}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  // Grid variant
  const cardW = (Math.max(width, 320) - 32 - (columns - 1) * 10) / columns;

  return (
    <View style={styles.gridContainer}>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.gridCard, { width: cardW }]}
          onPress={() => onCategoryPress?.(cat)}
          activeOpacity={0.8}
        >
          <View style={[styles.gridImageBox, { backgroundColor: cat.color || '#f5f3ff' }]}>
            {cat.imageUrl ? (
              <Image source={{ uri: cat.imageUrl }} style={styles.gridImage} resizeMode="cover" />
            ) : (
              <MaterialIcons name={cat.resolvedIcon || 'category'} size={32} color="rgba(255,255,255,0.3)" />
            )}
            {cat.productCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{cat.productCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.gridName} numberOfLines={1}>{cat.name}</Text>
          <View style={styles.gridArrow}>
            <MaterialIcons name="arrow-forward" size={12} color="#8b5cf6" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default memo(CategoryGrid);

const styles = StyleSheet.create({
  // Horizontal variant
  horizontalContainer: { paddingHorizontal: 16, gap: 14, paddingBottom: 4 },
  horizontalItem: { alignItems: 'center', gap: 6 },
  horizontalIcon: {
    width: 60, height: 60, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.08)',
  },
  horizontalImage: { width: 40, height: 40, borderRadius: 12 },
  horizontalLabel: { fontSize: 11, fontWeight: '600', color: '#475569', letterSpacing: 0.2 },

  // Grid variant
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  gridCard: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 6, elevation: 2,
  },
  gridImageBox: {
    width: '100%', height: 72, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    position: 'relative', overflow: 'hidden',
  },
  gridImage: { width: '100%', height: '100%', borderRadius: 12 },
  countBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  countBadgeText: { fontSize: 9, fontWeight: 'bold', color: '#1e293b' },
  gridName: { fontSize: 12, fontWeight: '600', color: '#1e293b', textAlign: 'center', marginBottom: 4 },
  gridArrow: {
    width: 22, height: 22, borderRadius: 7,
    backgroundColor: '#f5f3ff',
    alignItems: 'center', justifyContent: 'center',
  },
});

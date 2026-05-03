import React, { memo, useState } from 'react';
import {
  StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getCategoryFallbackSource, getCategoryImageSource } from '../utils/categoryMedia';

/**
 * CategoryGrid displays categories in horizontal scroll or grid.
 * @param {Object} props
 * @param {'horizontal'|'grid'} props.variant
 * @param {Array} props.categories
 * @param {Function} props.onCategoryPress
 * @param {number} [props.columns=3] columns for grid variant
 */
function tintColor(color) {
  return typeof color === 'string' && color.startsWith('#') ? `${color}15` : '#ECFDF5';
}

function CategoryImage({ cat, style }) {
  const [failed, setFailed] = useState(false);
  const source = failed ? getCategoryFallbackSource(cat) : getCategoryImageSource(cat);

  return (
    <Image
      source={source}
      style={style}
      resizeMode="contain"
      onError={() => setFailed(true)}
    />
  );
}

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
            <View style={[styles.horizontalIcon, { backgroundColor: tintColor(cat.color) }]}>
              <CategoryImage
                cat={cat}
                style={styles.horizontalImage}
              />
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
          <View style={[styles.gridImageBox, { backgroundColor: tintColor(cat.color) }]}>
            <CategoryImage
              cat={cat}
              style={styles.gridImage}
            />
            {cat.productCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{cat.productCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.gridName} numberOfLines={1}>{cat.name}</Text>
          <View style={styles.gridArrow}>
            <MaterialIcons name="arrow-forward" size={12} color="#16803C" />
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
    width: 62, height: 62, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(22,128,60,0.08)',
  },
  horizontalImage: { width: 54, height: 54, borderRadius: 10 },
  horizontalLabel: { fontSize: 11, fontWeight: '700', color: '#334155', letterSpacing: 0 },

  // Grid variant
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  gridCard: {
    backgroundColor: '#ffffff', borderRadius: 10, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: '#E5ECDC',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 6, elevation: 2,
  },
  gridImageBox: {
    width: '100%', height: 72, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    position: 'relative', overflow: 'hidden',
  },
  gridImage: { width: '90%', height: '90%', borderRadius: 12 },
  countBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  countBadgeText: { fontSize: 9, fontWeight: 'bold', color: '#1e293b' },
  gridName: { fontSize: 12, fontWeight: '600', color: '#1e293b', textAlign: 'center', marginBottom: 4 },
  gridArrow: {
    width: 22, height: 22, borderRadius: 7,
    backgroundColor: '#ECFDF5',
    alignItems: 'center', justifyContent: 'center',
  },
});

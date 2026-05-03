import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * SkeletonLoader — animated shimmer placeholder.
 * @param {'banner'|'category'|'productCard'|'productRow'} variant
 */
export default function SkeletonLoader({ variant = 'productCard', count = 1 }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const SkeletonBox = ({ style }) => (
    <Animated.View style={[styles.skeleton, style, { opacity }]} />
  );

  const items = Array.from({ length: count });

  if (variant === 'banner') {
    return (
      <View style={styles.bannerContainer}>
        <SkeletonBox style={styles.bannerSkeleton} />
      </View>
    );
  }

  if (variant === 'category') {
    return (
      <View style={styles.categoryRow}>
        {items.map((_, i) => (
          <View key={i} style={styles.categoryItem}>
            <SkeletonBox style={styles.categorySkeleton} />
            <SkeletonBox style={styles.categoryLabel} />
          </View>
        ))}
      </View>
    );
  }

  if (variant === 'productRow') {
    return (
      <View style={styles.productRow}>
        {items.map((_, i) => (
          <View key={i} style={styles.productRowCard}>
            <SkeletonBox style={styles.productRowImage} />
            <View style={{ flex: 1, gap: 8 }}>
              <SkeletonBox style={styles.productRowTitle} />
              <SkeletonBox style={styles.productRowSub} />
              <SkeletonBox style={styles.productRowPrice} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  // Default: productCard
  return (
    <View style={styles.cardRow}>
      {items.map((_, i) => (
        <View key={i} style={styles.card}>
          <SkeletonBox style={styles.cardImage} />
          <SkeletonBox style={styles.cardTitle} />
          <SkeletonBox style={styles.cardSub} />
          <SkeletonBox style={styles.cardPrice} />
        </View>
      ))}
    </View>
  );
}

const CARD_W = 170;
const GRID_CARD_W = (width - 54) / 2;

const styles = StyleSheet.create({
  skeleton: { backgroundColor: '#e2e8f0', borderRadius: 12 },

  // Banner
  bannerContainer: { paddingHorizontal: 20, marginBottom: 24 },
  bannerSkeleton: { width: '100%', height: 180, borderRadius: 20 },

  // Category
  categoryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 16, marginBottom: 24 },
  categoryItem: { alignItems: 'center', gap: 8 },
  categorySkeleton: { width: 64, height: 64, borderRadius: 20 },
  categoryLabel: { width: 44, height: 10, borderRadius: 5 },

  // Product card (horizontal)
  cardRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 14 },
  card: { width: CARD_W, borderRadius: 20, padding: 12 },
  cardImage: { width: '100%', height: 120, borderRadius: 14, marginBottom: 10 },
  cardTitle: { width: '80%', height: 14, borderRadius: 7, marginBottom: 6 },
  cardSub: { width: '50%', height: 10, borderRadius: 5, marginBottom: 8 },
  cardPrice: { width: '40%', height: 16, borderRadius: 8 },

  // Product row
  productRow: { paddingHorizontal: 20, gap: 14 },
  productRowCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#ffffff', borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  productRowImage: { width: 70, height: 70, borderRadius: 14 },
  productRowTitle: { width: '70%', height: 14, borderRadius: 7 },
  productRowSub: { width: '50%', height: 10, borderRadius: 5 },
  productRowPrice: { width: '30%', height: 16, borderRadius: 8 },
});

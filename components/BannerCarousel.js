import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import {
  StyleSheet, View, Text, Image, FlatList, useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AUTO_SLIDE_INTERVAL = 4000;

function BannerCarousel({ banners = [], onBannerPress }) {
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);
  const { width } = useWindowDimensions();
  const pageWidth = Math.max(width, 320);
  const bannerWidth = pageWidth - 32;
  const bannerHeight = Math.min(210, Math.max(156, bannerWidth * 0.48));

  // Sort by priority (lower = higher priority)
  const sortedBanners = [...banners].sort((a, b) => (a.priority || 99) - (b.priority || 99));

  const startAutoSlide = useCallback(() => {
    if (sortedBanners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % sortedBanners.length;
        flatListRef.current?.scrollToOffset({ offset: next * pageWidth, animated: true });
        return next;
      });
    }, AUTO_SLIDE_INTERVAL);
  }, [pageWidth, sortedBanners.length]);

  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(timerRef.current);
  }, [startAutoSlide]);

  const onScrollEnd = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    setActiveIndex(Math.max(0, Math.min(idx, sortedBanners.length - 1)));
    // Reset auto-slide timer on manual swipe
    clearInterval(timerRef.current);
    startAutoSlide();
  };

  if (sortedBanners.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={sortedBanners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={pageWidth}
        decelerationRate="fast"
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.bannerPage, { width: pageWidth }]}
            activeOpacity={0.9}
            onPress={() => onBannerPress?.(item)}
          >
            <View style={[styles.bannerCard, { width: bannerWidth, height: bannerHeight }]}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} resizeMode="cover" />
              ) : (
                <View style={[styles.bannerImage, styles.bannerPlaceholder]}>
                  <View style={styles.placeholderPattern}>
                    <MaterialIcons name="local-offer" size={60} color="rgba(139,92,246,0.15)" />
                  </View>
                </View>
              )}
              <View style={styles.bannerOverlay}>
                <View style={styles.bannerBadge}>
                  <MaterialIcons name="bolt" size={10} color="#ffffff" />
                  <Text style={styles.bannerBadgeText}>EXCLUSIVE DEAL</Text>
                </View>
                <Text style={styles.bannerTitle} numberOfLines={1}>{item.title || 'Special Offer'}</Text>
                <Text style={styles.bannerSubtitle} numberOfLines={1}>{item.subtitle || 'Check out our latest deals'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      {/* Dot Indicators */}
      {sortedBanners.length > 1 && (
        <View style={styles.dotsRow}>
          {sortedBanners.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default memo(BannerCarousel);

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  bannerPage: {
    paddingHorizontal: 16,
  },
  bannerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  bannerImage: { width: '100%', height: '100%' },
  bannerPlaceholder: {
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderPattern: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16,
    paddingTop: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#8b5cf6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  bannerBadgeText: { fontSize: 8, fontWeight: 'bold', color: '#ffffff', letterSpacing: 0.8 },
  bannerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  bannerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: 10, gap: 5,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#e2e8f0',
  },
  dotActive: {
    width: 20, backgroundColor: '#8b5cf6', borderRadius: 4,
  },
});

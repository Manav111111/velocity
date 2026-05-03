import React, { memo } from 'react';
import {
  StyleSheet, View, Text, Image, TouchableOpacity, Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/**
 * ProductCard — reusable product display component.
 * @param {Object} props
 * @param {'horizontal'|'grid'} props.variant
 * @param {Object} props.product
 * @param {Function} props.onPress
 * @param {Function} props.onAddToCart
 * @param {Function} props.onToggleWishlist
 * @param {boolean} props.isInWishlist
 * @param {number} props.cartQty
 * @param {Function} props.onUpdateQty
 */
function ProductCard({
  product, variant = 'horizontal', onPress, onAddToCart,
  onToggleWishlist, isInWishlist = false, cartQty = 0, onUpdateQty,
}) {
  const imageUri = product.images?.[0] || product.image;
  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discount / 100)
    : product.price;
  const isOutOfStock = product.stock === 0;

  const renderImage = (style, iconSize = 30) => {
    if (imageUri) {
      return (
        <Image
          source={{ uri: imageUri }}
          style={style}
          resizeMode="cover"
        />
      );
    }
    return (
      <View style={[style, styles.imagePlaceholder]}>
        <MaterialIcons name="image" size={iconSize} color="rgba(139,92,246,0.2)" />
      </View>
    );
  };

  const renderCartControls = (small = false) => {
    if (isOutOfStock) {
      return (
        <View style={[small ? styles.addBtnSmall : styles.addBtn, styles.addBtnDisabled]}>
          <MaterialIcons name="block" size={small ? 14 : 16} color="#94a3b8" />
        </View>
      );
    }

    if (cartQty > 0) {
      return (
        <View style={small ? styles.qtyRowSmall : styles.qtyRow}>
          <TouchableOpacity
            style={small ? styles.qtyBtnSmall : styles.qtyBtn}
            onPress={() => onUpdateQty?.(product.id, -1)}
          >
            <MaterialIcons name="remove" size={small ? 14 : 16} color="#8b5cf6" />
          </TouchableOpacity>
          <Text style={small ? styles.qtyTextSmall : styles.qtyText}>{cartQty}</Text>
          <TouchableOpacity
            style={[small ? styles.qtyBtnSmall : styles.qtyBtn, styles.qtyBtnPlus]}
            onPress={() => onUpdateQty?.(product.id, 1)}
          >
            <MaterialIcons name="add" size={small ? 14 : 16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={small ? styles.addBtnSmall : styles.addBtn}
        onPress={() => onAddToCart?.({
          id: product.id, name: product.name,
          price: product.price, image: imageUri,
          cat: product.category, color: '#f1f5f9',
        })}
        activeOpacity={0.7}
      >
        <MaterialIcons name="add" size={small ? 16 : 18} color="#ffffff" />
      </TouchableOpacity>
    );
  };

  if (variant === 'grid') {
    const cardW = (width - 54) / 2;
    return (
      <TouchableOpacity
        style={[styles.gridCard, { width: cardW }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* Wishlist heart */}
        <TouchableOpacity style={styles.heartIcon} onPress={() => onToggleWishlist?.(product)}>
          <View style={styles.heartBg}>
            <MaterialIcons
              name={isInWishlist ? 'favorite' : 'favorite-border'}
              size={16}
              color={isInWishlist ? '#ef4444' : '#94a3b8'}
            />
          </View>
        </TouchableOpacity>

        {/* Discount badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{product.discount}% OFF</Text>
          </View>
        )}

        {renderImage(styles.gridImage, 36)}

        <View style={styles.gridContent}>
          <Text style={styles.gridName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.gridCategory}>{(product.category || 'GROCERY').toUpperCase()}</Text>

          <View style={styles.gridPriceRow}>
            <View style={styles.priceGroup}>
              <Text style={styles.gridPrice}>{"₹"}{(discountedPrice || 0).toFixed(0)}</Text>
              {hasDiscount && (
                <Text style={styles.gridOriginalPrice}>{"₹"}{(product.price || 0).toFixed(0)}</Text>
              )}
            </View>
            {renderCartControls(true)}
          </View>
        </View>

        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Horizontal variant
  return (
    <TouchableOpacity style={styles.horizontalCard} onPress={onPress} activeOpacity={0.85}>
      {/* Wishlist heart */}
      <TouchableOpacity style={styles.heartIcon} onPress={() => onToggleWishlist?.(product)}>
        <View style={styles.heartBg}>
          <MaterialIcons
            name={isInWishlist ? 'favorite' : 'favorite-border'}
            size={14}
            color={isInWishlist ? '#ef4444' : '#94a3b8'}
          />
        </View>
      </TouchableOpacity>

      {/* Discount badge */}
      {hasDiscount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountBadgeText}>{product.discount}% OFF</Text>
        </View>
      )}

      {renderImage(styles.horizontalImage, 40)}

      <View style={styles.horizontalContent}>
        <Text style={styles.horizontalName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.horizontalCategory}>{(product.category || 'FRESH').toUpperCase()}</Text>

        <View style={styles.horizontalPriceRow}>
          <View style={styles.priceGroup}>
            <Text style={styles.horizontalPrice}>{"₹"}{(discountedPrice || 0).toFixed(0)}</Text>
            {hasDiscount && (
              <Text style={styles.horizontalOriginalPrice}>{"₹"}{(product.price || 0).toFixed(0)}</Text>
            )}
          </View>
          {renderCartControls(false)}
        </View>
      </View>

      {isOutOfStock && (
        <View style={styles.outOfStockOverlay}>
          <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default memo(ProductCard);

const styles = StyleSheet.create({
  // === Image placeholder ===
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },

  // === Horizontal card ===
  horizontalCard: {
    width: 160,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  horizontalImage: {
    width: '100%',
    height: 120,
  },
  horizontalContent: {
    padding: 10,
  },
  horizontalName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
    lineHeight: 18,
  },
  horizontalCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  horizontalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horizontalPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  horizontalOriginalPrice: {
    fontSize: 11,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },

  // === Grid card ===
  gridCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridContent: {
    padding: 10,
  },
  gridName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
    lineHeight: 18,
    minHeight: 36,
  },
  gridCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  gridPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  gridOriginalPrice: {
    fontSize: 11,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },

  // === Price group ===
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  // === Shared ===
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  heartBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: '#ef4444',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  discountBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.3,
  },

  // Cart controls
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#f1f5f9',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ede9fe',
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnPlus: {
    backgroundColor: '#8b5cf6',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8b5cf6',
    marginHorizontal: 6,
  },
  qtyRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ede9fe',
    overflow: 'hidden',
  },
  qtyBtnSmall: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyTextSmall: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8b5cf6',
    marginHorizontal: 4,
  },

  // Out of stock
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  outOfStockText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ef4444',
    letterSpacing: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import {
  subscribeToCollection, subscribeWithQuery, addDocument,
  subscribeToUserOrders, subscribeToSubcollection,
} from '../services/firestoreService';

const AppContext = createContext();

// Map emoji icons → MaterialIcons names
const EMOJI_TO_ICON = {
  '🍎': 'local-florist', '🍏': 'local-florist', '🥬': 'eco', '🥦': 'eco',
  '🥕': 'eco', '🥛': 'water-drop', '🧀': 'water-drop', '🍕': 'fastfood',
  '🍔': 'fastfood', '🍿': 'fastfood', '🥩': 'restaurant', '🍞': 'bakery-dining',
  '🧁': 'bakery-dining', '☕': 'local-cafe', '🧃': 'local-cafe',
  '🧹': 'cleaning-services', '🏠': 'cleaning-services', '🐟': 'set-meal', '❄️': 'ac-unit',
};

function resolveIcon(iconValue) {
  if (!iconValue) return 'category';
  if (/^[a-z]/.test(iconValue) && iconValue.length > 1) return iconValue;
  return EMOJI_TO_ICON[iconValue] || 'category';
}

export function AppProvider({ children }) {
  // --- Auth ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- Firebase data ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Local state ---
  const [location, setLocation] = useState('Select Location');
  const [address, setAddress] = useState(null); // { text, lat, lng }
  const [activeAddressId, setActiveAddressId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [dataReady, setDataReady] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // ==========================================
  // AUTH: Persistent session via onAuthStateChanged
  // ==========================================
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubAuth();
  }, []);

  // ==========================================
  // TOAST helper
  // ==========================================
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  }, []);

  // ==========================================
  // Load persisted data from AsyncStorage
  // ==========================================
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const [savedCart, savedWishlist, savedLocation, savedAddress, savedActiveId] = await Promise.all([
          AsyncStorage.getItem('@velocity_cart'),
          AsyncStorage.getItem('@velocity_wishlist'),
          AsyncStorage.getItem('@velocity_location'),
          AsyncStorage.getItem('@velocity_address'),
          AsyncStorage.getItem('@velocity_active_address_id'),
        ]);
        if (savedCart) setCartItems(JSON.parse(savedCart));
        if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist));
        if (savedLocation) setLocation(savedLocation);
        if (savedAddress) setAddress(JSON.parse(savedAddress));
        if (savedActiveId) setActiveAddressId(savedActiveId);
      } catch (e) {
        console.error('[AsyncStorage] Load error:', e);
      } finally {
        setDataReady(true);
      }
    };
    loadPersistedData();
  }, []);

  // Persist on change
  useEffect(() => {
    if (!dataReady) return;
    AsyncStorage.setItem('@velocity_cart', JSON.stringify(cartItems)).catch(console.error);
  }, [cartItems, dataReady]);

  useEffect(() => {
    if (!dataReady) return;
    AsyncStorage.setItem('@velocity_wishlist', JSON.stringify(wishlistItems)).catch(console.error);
  }, [wishlistItems, dataReady]);

  useEffect(() => {
    if (!dataReady) return;
    AsyncStorage.setItem('@velocity_location', location).catch(console.error);
  }, [location, dataReady]);

  useEffect(() => {
    if (!dataReady || !address) return;
    AsyncStorage.setItem('@velocity_address', JSON.stringify(address)).catch(console.error);
  }, [address, dataReady]);

  useEffect(() => {
    if (!dataReady) return;
    if (activeAddressId) {
      AsyncStorage.setItem('@velocity_active_address_id', activeAddressId).catch(console.error);
    } else {
      AsyncStorage.removeItem('@velocity_active_address_id').catch(console.error);
    }
  }, [activeAddressId, dataReady]);

  // ==========================================
  // Firebase real-time subscriptions
  // ==========================================
  useEffect(() => {
    let loadingCount = 3;
    const decrementLoading = () => { loadingCount--; if (loadingCount <= 0) setLoading(false); };

    const unsubProducts = subscribeToCollection('products', (data) => {
      const active = data.filter((p) => !p.status || p.status === 'active');
      setProducts(active);
      decrementLoading();
    });

    const unsubCategories = subscribeToCollection('categories', (data) => {
      const resolved = data.map((cat) => ({ ...cat, resolvedIcon: resolveIcon(cat.icon) }));
      setCategories(resolved);
      decrementLoading();
    });

    const unsubBanners = subscribeWithQuery('banners',
      [{ field: 'isActive', operator: '==', value: true }],
      (data) => { setBanners(data); decrementLoading(); }
    );

    return () => { unsubProducts(); unsubCategories(); unsubBanners(); };
  }, []);

  // Subscribe to user orders when user is authenticated
  useEffect(() => {
    if (!user) { setOrders([]); return; }
    const unsub = subscribeToUserOrders(user.uid, (data) => setOrders(data));
    return () => unsub();
  }, [user]);

  // Subscribe to user saved addresses
  useEffect(() => {
    if (!user) { setSavedAddresses([]); return; }
    const unsub = subscribeToSubcollection('users', user.uid, 'addresses', (data) => {
      // Sort so default address is first
      data.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
      setSavedAddresses(data);
      // Auto-set location from default address if none set
      const defaultAddr = data.find((a) => a.isDefault);
      if (defaultAddr && location === 'Select Location') {
        setLocation(defaultAddr.addressLine1 || defaultAddr.label);
        setAddress(defaultAddr);
        setActiveAddressId(defaultAddr.id);
      }
    });
    return () => unsub();
  }, [user]);

  // ==========================================
  // Computed data
  // ==========================================
  const trendingProducts = products.filter((p) => p.isTrending === true);
  const featuredProducts = products.filter((p) => p.isFeatured === true);

  // ==========================================
  // Search & filter
  // ==========================================
  const searchProducts = useCallback((queryStr) => {
    if (!queryStr || queryStr.trim() === '') return products;
    const q = queryStr.toLowerCase().trim();
    return products.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  }, [products]);

  const getProductsByCategory = useCallback((categoryName) => {
    if (!categoryName) return products;
    return products.filter((p) => p.category?.toLowerCase() === categoryName.toLowerCase());
  }, [products]);

  /**
   * Filter products by a set of filter params:
   * { category, minPrice, maxPrice, sortBy, inStockOnly }
   */
  const filterProducts = useCallback((allProducts, filters = {}) => {
    let result = [...allProducts];

    if (filters.category) {
      result = result.filter((p) =>
        p.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }
    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      result = result.filter((p) => (p.price || 0) >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      result = result.filter((p) => (p.price || 0) <= parseFloat(filters.maxPrice));
    }
    if (filters.inStockOnly) {
      result = result.filter((p) => p.inStock !== false && p.stock !== 0);
    }
    if (filters.sortBy === 'price-low') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (filters.sortBy === 'price-high') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    // default: leave in original (popularity) order

    return result;
  }, []);

  // ==========================================
  // Cart operations
  // ==========================================
  const addToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + (product.qty || 1) } : item
        );
      }
      return [...prev, { ...product, qty: product.qty || 1 }];
    });
    showToast(`${product.name} added to cart`);
  };

  const updateCartQty = (id, delta) => {
    setCartItems((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  const getCartItemQty = useCallback((productId) => {
    const item = cartItems.find((i) => i.id === productId);
    return item ? item.qty : 0;
  }, [cartItems]);

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // ==========================================
  // Wishlist operations
  // ==========================================
  const toggleWishlist = (product) => {
    setWishlistItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        showToast(`${product.name} removed from wishlist`);
        return prev.filter((item) => item.id !== product.id);
      }
      showToast(`${product.name} added to wishlist`);
      return [...prev, product];
    });
  };

  const isInWishlist = (productId) => wishlistItems.some((item) => item.id === productId);

  // ==========================================
  // Address operations (set active address)
  // ==========================================
  const selectAddress = (addr) => {
    setLocation(addr.addressLine1 || addr.fullAddress || addr.label);
    setAddress(addr);
    setActiveAddressId(addr.id);
  };

  // ==========================================
  // Order operations
  // ==========================================
  const placeOrder = async (orderData) => {
    if (!user) throw new Error('User not authenticated');
    const order = {
      userId: user.uid,
      userName: orderData.receiverName || user.displayName || 'Customer',
      userEmail: user.email || '',
      receiverName: orderData.receiverName || user.displayName || 'Customer',
      receiverPhone: orderData.receiverPhone || '',
      products: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image || null,
        category: item.cat || item.category || '',
      })),
      itemCount: cartItemCount,
      subtotal: cartTotal,
      deliveryFee: 12.50,
      tax: parseFloat((cartTotal * 0.0763).toFixed(2)),
      total: parseFloat((cartTotal + 12.50 + cartTotal * 0.0763).toFixed(2)),
      address: orderData.address || location,
      addressDetails: orderData.addressDetails || address,
      paymentMethod: 'COD',
      status: 'confirmed',
      instructions: orderData.instructions || '',
      createdAt: new Date().toISOString(),
    };
    const orderId = await addDocument('orders', order);
    clearCart();
    return orderId;
  };

  return (
    <AppContext.Provider value={{
      // Auth
      user, authLoading,
      // Firebase data
      products, categories, banners, trendingProducts, featuredProducts, loading,
      orders,
      // Saved addresses
      savedAddresses, activeAddressId, selectAddress,
      // Search / filter
      searchProducts, getProductsByCategory, filterProducts,
      // Location
      location, setLocation, address, setAddress,
      // Cart
      cartItems, addToCart, updateCartQty, removeFromCart, clearCart,
      getCartItemQty, cartTotal, cartItemCount,
      // Wishlist
      wishlistItems, toggleWishlist, isInWishlist,
      // Orders
      placeOrder,
      // Toast
      toastMessage, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

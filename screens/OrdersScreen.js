import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions,
  ActivityIndicator, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

const STATUS_CONFIG = {
  confirmed:       { color: '#2563eb', label: 'CONFIRMED',  icon: 'check-circle-outline' },
  preparing:       { color: '#d97706', label: 'PREPARING',  icon: 'restaurant' },
  out_for_delivery:{ color: '#8b5cf6', label: 'ON THE WAY', icon: 'delivery-dining' },
  delivered:       { color: '#059669', label: 'DELIVERED',  icon: 'done-all' },
  cancelled:       { color: '#dc2626', label: 'CANCELLED',  icon: 'cancel' },
};

function getStatus(status) {
  return STATUS_CONFIG[status] || { color: '#6d758c', label: (status || 'PENDING').toUpperCase(), icon: 'schedule' };
}

export default function OrdersScreen({ navigation }) {
  const { orders, loading, user } = useAppContext();
  const [tab, setTab] = useState('recent');

  // FIX: "Recent" → last 5 orders regardless of status
  // FIX: "All Orders" → every single order (no status filter)
  const displayOrders = tab === 'recent'
    ? orders.slice(0, 5)          // most recent 5 (already sorted newest-first)
    : orders;                     // every order

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingTop: 50 }]}>
        <MaterialIcons name="lock-outline" size={56} color="#40485d" />
        <Text style={styles.emptyTitle}>Login Required</Text>
        <Text style={styles.emptySubtitle}>Please login to view your orders</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginBtnText}>Login Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 6 }}>
              <MaterialIcons name="arrow-back" size={22} color="#1e293b" />
            </TouchableOpacity>
            <MaterialIcons name="bolt" size={20} color="#8b5cf6" />
            <Text style={styles.headerBrand}>Velocity</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('ProfileTab')}
          >
            <MaterialIcons name="person" size={20} color="#8b5cf6" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.trackingLabel}>ORDER TRACKING</Text>
          <Text style={styles.pageTitle}>My Orders</Text>
        </View>

        {/* Stats row */}
        {orders.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{orders.length}</Text>
              <Text style={styles.statLabel}>TOTAL</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {orders.filter((o) => o.status === 'delivered').length}
              </Text>
              <Text style={styles.statLabel}>DELIVERED</Text>
            </View>
            <View style={[styles.statItem, styles.statHighlight]}>
              <Text style={styles.statValueHighlight}>
                ₹{orders.reduce((s, o) => s + (o.total || 0), 0).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>SPENT</Text>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, tab === 'recent' && styles.tabActive]}
            onPress={() => setTab('recent')}
          >
            <Text style={[styles.tabText, tab === 'recent' && styles.tabTextActive]}>Recent</Text>
            {tab === 'recent' && orders.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{Math.min(orders.length, 5)}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'all' && styles.tabActive]}
            onPress={() => setTab('all')}
          >
            <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>All Orders</Text>
            {tab === 'all' && orders.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{orders.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <ActivityIndicator size="large" color="#8b5cf6" style={{ marginTop: 40 }} />
        ) : displayOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt-long" size={60} color="#40485d" />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('HomeTab')}>
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          displayOrders.map((order) => {
            const { color, label, icon } = getStatus(order.status);
            const date = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : '';

            return (
              <View key={order.id} style={styles.orderCard}>
                {/* Status band */}
                <View style={[styles.statusBand, { backgroundColor: color + '18' }]}>
                  <MaterialIcons name={icon} size={14} color={color} />
                  <Text style={[styles.statusText, { color }]}>{label}</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.orderDate}>{date}</Text>
                </View>

                {/* Order info */}
                <View style={styles.orderBody}>
                  <View style={styles.orderMeta}>
                    <Text style={styles.orderId}>#{order.id?.slice(-8).toUpperCase()}</Text>
                    <Text style={styles.orderItems}>{order.itemCount || order.products?.length || 0} items</Text>
                  </View>
                  <Text style={styles.orderTotal}>₹{(order.total || 0).toFixed(2)}</Text>
                </View>

                {/* Product tags */}
                {order.products && (
                  <View style={styles.tagRow}>
                    {order.products.slice(0, 3).map((p, i) => (
                      <View key={i} style={styles.orderTag}>
                        <Text style={styles.orderTagText} numberOfLines={1}>{p.qty}× {p.name}</Text>
                      </View>
                    ))}
                    {order.products.length > 3 && (
                      <View style={styles.orderTag}>
                        <Text style={styles.orderTagText}>+{order.products.length - 3} more</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Bottom meta */}
                <View style={styles.orderFooter}>
                  <View style={styles.footerItem}>
                    <MaterialIcons name="payments" size={13} color="#6d758c" />
                    <Text style={styles.footerText}>COD</Text>
                  </View>
                  {order.receiverName && (
                    <View style={styles.footerItem}>
                      <MaterialIcons name="person" size={13} color="#6d758c" />
                      <Text style={styles.footerText}>{order.receiverName}</Text>
                    </View>
                  )}
                  <View style={styles.footerItem}>
                    <MaterialIcons name="location-on" size={13} color="#6d758c" />
                    <Text style={styles.footerText} numberOfLines={1}>
                      {order.address || '—'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 50 : 50, paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerBrand: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  avatarBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(139,92,246,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  titleSection: { paddingHorizontal: 20, marginBottom: 18 },
  trackingLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 2, marginBottom: 6 },
  pageTitle: { fontSize: 36, fontWeight: '900', color: '#1e293b' },

  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  statItem: {
    flex: 1, backgroundColor: '#f8fafc', borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0',
  },
  statHighlight: { backgroundColor: '#f1f5f9', borderColor: '#8b5cf6' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  statValueHighlight: { fontSize: 18, fontWeight: '800', color: '#8b5cf6', marginBottom: 4 },
  statLabel: { fontSize: 8, fontWeight: 'bold', color: '#64748b', letterSpacing: 1 },

  // Tabs
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 10 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  tabActive: { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#ffffff', fontWeight: '700' },
  tabBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  tabBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#ffffff' },

  // Order card
  orderCard: {
    marginHorizontal: 20, backgroundColor: '#ffffff', borderRadius: 20,
    marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2,
  },
  statusBand: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  statusText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  orderDate: { fontSize: 10, color: '#64748b' },
  orderBody: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4,
  },
  orderMeta: {},
  orderId: { fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 0.5, marginBottom: 4 },
  orderItems: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  orderTotal: { fontSize: 22, fontWeight: '900', color: '#8b5cf6' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 16, paddingTop: 8 },
  orderTag: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, maxWidth: 160 },
  orderTagText: { fontSize: 11, color: '#64748b' },
  orderFooter: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16,
    paddingTop: 10, paddingBottom: 14,
    borderTopWidth: 1, borderTopColor: '#f1f5f9', marginTop: 10,
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: 180 },
  footerText: { fontSize: 11, color: '#64748b', flexShrink: 1 },

  // Empty / login
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: '#64748b', marginTop: 6 },
  shopBtn: { marginTop: 20, backgroundColor: '#8b5cf6', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 20 },
  shopBtnText: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
  loginBtn: { marginTop: 20, backgroundColor: '#8b5cf6', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 20 },
  loginBtnText: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
});

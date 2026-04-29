import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Dimensions, Alert, TextInput, Modal, ActivityIndicator, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { signOut, updateProfile } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useAppContext } from '../context/AppContext';
import { setDocument } from '../services/firestoreService';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const { user, orders, wishlistItems, cartItemCount, savedAddresses } = useAppContext();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const displayName = user?.displayName || 'Guest User';
  const displayEmail = user?.email || '';

  useEffect(() => {
    setEditName(user?.displayName || '');
  }, [user]);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch (error) {
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    if (editPhone && !/^\d{10}$/.test(editPhone.trim())) {
      Alert.alert('Error', 'Enter a valid 10-digit phone number.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: editName.trim() });
      if (user?.uid) {
        await setDocument('users', user.uid, {
          fullName: editName.trim(),
          phone: editPhone.trim(),
          email: user.email,
        });
      }
      setShowEditModal(false);
    } catch (err) {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const recentOrders = orders.slice(0, 3);

  const quickActions = [
    {
      icon: 'location-on',
      label: 'Saved Addresses',
      sub: `${savedAddresses.length} address${savedAddresses.length !== 1 ? 'es' : ''} saved`,
      onPress: () => navigation.navigate('Location'),
      color: '#b6a0ff',
    },
    {
      icon: 'favorite',
      label: 'Wishlist',
      sub: `${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''}`,
      badge: wishlistItems.length,
      onPress: () => navigation.navigate('Wishlist'),
      color: '#ff6e84',
    },
    {
      icon: 'shopping-cart',
      label: 'My Cart',
      sub: `${cartItemCount} item${cartItemCount !== 1 ? 's' : ''} in cart`,
      badge: cartItemCount,
      onPress: () => navigation.navigate('CartTab'),
      color: '#4caf50',
    },
    {
      icon: 'receipt-long',
      label: 'All Orders',
      sub: `${orders.length} total orders`,
      onPress: () => navigation.navigate('Orders'),
      color: '#ff9800',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="bolt" size={20} color="#b6a0ff" />
            <Text style={styles.headerBrand}>Velocity</Text>
          </View>
          <TouchableOpacity style={styles.editProfileBtn} onPress={() => setShowEditModal(true)}>
            <MaterialIcons name="edit" size={18} color="#b6a0ff" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarLarge} onPress={() => setShowEditModal(true)}>
            <MaterialIcons name="person" size={50} color="#8b5cf6" />
            <View style={styles.editBadge}>
              <MaterialIcons name="edit" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{displayEmail}</Text>
          {user && (
            <View style={styles.memberChip}>
              <MaterialIcons name="bolt" size={13} color="#8b5cf6" />
              <Text style={styles.memberChipText}>Velocity Member</Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>ORDERS</Text>
          </View>
          <View style={[styles.statItem, styles.statHighlight]}>
            <Text style={styles.statValueHighlight}>₹{totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLabel}>SPENT</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{wishlistItems.length}</Text>
            <Text style={styles.statLabel}>WISHLIST</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((item, i) => (
            <TouchableOpacity key={i} style={styles.actionCard} onPress={item.onPress}>
              <View style={[styles.actionIconBox, { backgroundColor: item.color + '18' }]}>
                <MaterialIcons name={item.icon} size={22} color={item.color} />
                {item.badge > 0 && (
                  <View style={styles.actionBadge}>
                    <Text style={styles.actionBadgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.actionLabel}>{item.label}</Text>
              <Text style={styles.actionSub}>{item.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>RECENT ORDERS</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentOrders.map((order) => {
              const statusColor = order.status === 'delivered' ? '#059669' : order.status === 'cancelled' ? '#dc2626' : '#8b5cf6';
              return (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderLeft}>
                    <Text style={styles.orderItems}>{order.products?.length || 0} items</Text>
                    <Text style={styles.orderDate}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Text style={styles.orderPrice}>₹{(order.total || 0).toFixed(0)}</Text>
                    <View style={[styles.statusPill, { backgroundColor: statusColor + '20' }]}>
                      <Text style={[styles.statusPillText, { color: statusColor }]}>
                        {(order.status || 'confirmed').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <View style={styles.logoutIconBox}>
            <MaterialIcons name="logout" size={20} color="#ff6e84" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
          <MaterialIcons name="chevron-right" size={20} color="#40485d" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <MaterialIcons name="close" size={22} color="#dee5ff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Full Name</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="person" size={18} color="#b6a0ff" />
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your full name"
                placeholderTextColor="#40485d"
              />
            </View>

            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="phone" size={18} color="#b6a0ff" />
              <TextInput
                style={styles.modalInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="10-digit mobile number"
                placeholderTextColor="#40485d"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <Text style={styles.emailNote}>
              <MaterialIcons name="lock" size={12} color="#40485d" /> Email: {displayEmail}
            </Text>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  editProfileBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  profileSection: { alignItems: 'center', marginTop: 10, marginBottom: 24 },
  avatarLarge: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, borderWidth: 2, borderColor: '#e2e8f0',
  },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center',
  },
  profileName: { fontSize: 24, fontWeight: '900', color: '#1e293b', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  memberChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)',
  },
  memberChipText: { fontSize: 12, fontWeight: '700', color: '#8b5cf6' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 28 },
  statItem: {
    flex: 1, backgroundColor: '#f8fafc', borderRadius: 16, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0',
  },
  statHighlight: { backgroundColor: '#f1f5f9', borderColor: '#8b5cf6' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  statValueHighlight: { fontSize: 18, fontWeight: '800', color: '#8b5cf6', marginBottom: 4 },
  statLabel: { fontSize: 9, fontWeight: 'bold', color: '#64748b', letterSpacing: 1 },
  sectionTitle: {
    fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 2,
    paddingHorizontal: 20, marginBottom: 12, marginTop: 4,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12, marginTop: 4 },
  seeAllText: { fontSize: 12, fontWeight: '700', color: '#8b5cf6' },
  // Actions grid
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: 12, marginBottom: 24 },
  actionCard: {
    width: (width - 52) / 2, backgroundColor: '#ffffff', borderRadius: 18,
    padding: 16, borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2,
  },
  actionIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10, position: 'relative' },
  actionBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#8b5cf6', borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  actionBadgeText: { fontSize: 9, fontWeight: 'bold', color: '#ffffff' },
  actionLabel: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 3 },
  actionSub: { fontSize: 11, color: '#64748b' },
  // Orders
  orderCard: {
    marginHorizontal: 20, backgroundColor: '#ffffff', borderRadius: 14, padding: 14,
    marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  orderLeft: {},
  orderItems: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  orderDate: { fontSize: 11, color: '#64748b' },
  orderRight: { alignItems: 'flex-end', gap: 6 },
  orderPrice: { fontSize: 16, fontWeight: '800', color: '#8b5cf6' },
  statusPill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusPillText: { fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 20, backgroundColor: '#fffcfc', borderRadius: 16, padding: 16,
    marginTop: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.1)',
  },
  logoutIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#ef4444' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#e2e8f0',
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  fieldLabel: { fontSize: 11, fontWeight: 'bold', color: '#64748b', letterSpacing: 1, marginBottom: 8, marginTop: 14 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 16,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  modalInput: { flex: 1, fontSize: 15, color: '#1e293b', paddingVertical: 14 },
  emailNote: { fontSize: 12, color: '#94a3b8', marginTop: 12 },
  saveBtn: {
    backgroundColor: '#8b5cf6', borderRadius: 16, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 24,
    shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6,
  },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
});

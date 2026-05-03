import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Dimensions, Alert, TextInput, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { signOut, updateProfile } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useAppContext } from '../context/AppContext';
import { setDocument } from '../services/firestoreService';
import { signOutFromGoogle } from '../services/googleAuthService';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const { user, orders, wishlistItems, cartItemCount, savedAddresses } = useAppContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const displayName = user?.displayName || 'Guest User';
  const displayEmail = user?.email || 'Login to sync orders and addresses';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'V';

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
            await signOutFromGoogle();
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
      label: 'Addresses',
      sub: `${savedAddresses.length} saved`,
      onPress: () => navigation.navigate('Location'),
      color: '#16803C',
      bg: '#E8F8DE',
    },
    {
      icon: 'favorite',
      label: 'Wishlist',
      sub: `${wishlistItems.length} items`,
      badge: wishlistItems.length,
      onPress: () => navigation.navigate('Wishlist'),
      color: '#DC2626',
      bg: '#FEF2F2',
    },
    {
      icon: 'shopping-cart',
      label: 'Cart',
      sub: `${cartItemCount} in cart`,
      badge: cartItemCount,
      onPress: () => navigation.navigate('Home', { screen: 'CartTab' }),
      color: '#16803C',
      bg: '#ECFDF5',
    },
    {
      icon: 'receipt-long',
      label: 'Orders',
      sub: `${orders.length} total`,
      onPress: () => navigation.navigate('Orders'),
      color: '#9A6B00',
      bg: '#FFF7D6',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSub}>Manage your account and orders</Text>
        </View>
        <TouchableOpacity style={styles.editProfileBtn} onPress={() => setShowEditModal(true)} activeOpacity={0.82}>
          <MaterialIcons name="edit" size={18} color="#16803C" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarLarge} onPress={() => setShowEditModal(true)} activeOpacity={0.84}>
            <Text style={styles.avatarInitials}>{initials}</Text>
            <View style={styles.editBadge}>
              <MaterialIcons name="edit" size={12} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.profileEmail} numberOfLines={1}>{displayEmail}</Text>
            <View style={styles.memberChip}>
              <MaterialIcons name="verified" size={13} color="#166534" />
              <Text style={styles.memberChipText}>{user ? 'Velocity member' : 'Guest browsing'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹{totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{wishlistItems.length}</Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((item) => (
            <TouchableOpacity key={item.label} style={styles.actionCard} onPress={item.onPress} activeOpacity={0.84}>
              <View style={[styles.actionIconBox, { backgroundColor: item.bg }]}>
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

        {recentOrders.length > 0 && (
          <View>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitleInline}>Recent orders</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Orders')} activeOpacity={0.78}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            {recentOrders.map((order) => {
              const statusColor = order.status === 'delivered' ? '#16803C' : order.status === 'cancelled' ? '#DC2626' : '#9A6B00';
              return (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderIcon}>
                    <MaterialIcons name="shopping-bag" size={19} color="#16803C" />
                  </View>
                  <View style={styles.orderLeft}>
                    <Text style={styles.orderItems}>{order.products?.length || 0} items</Text>
                    <Text style={styles.orderDate}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Text style={styles.orderPrice}>₹{(order.total || 0).toFixed(0)}</Text>
                    <View style={[styles.statusPill, { backgroundColor: `${statusColor}18` }]}>
                      <Text style={[styles.statusPillText, { color: statusColor }]}>
                        {(order.status || 'confirmed').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.84}>
          <View style={styles.logoutIconBox}>
            <MaterialIcons name="logout" size={20} color="#DC2626" />
          </View>
          <View style={styles.logoutCopy}>
            <Text style={styles.logoutText}>Logout</Text>
            <Text style={styles.logoutSub}>Sign out from this device</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.closeBtn} activeOpacity={0.78}>
                <MaterialIcons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Full name</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="person-outline" size={18} color="#16803C" />
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your full name"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <Text style={styles.fieldLabel}>Phone number</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="phone" size={18} color="#16803C" />
              <TextInput
                style={styles.modalInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="10-digit mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <View style={styles.emailNoteRow}>
              <MaterialIcons name="lock" size={12} color="#94A3B8" />
              <Text style={styles.emailNote}>Email: {displayEmail}</Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving} activeOpacity={0.88}>
              {saving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveBtnText}>Save changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F4' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE1',
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#111827' },
  headerSub: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 2 },
  editProfileBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#E8F8DE',
    borderWidth: 1,
    borderColor: '#CDEFC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { paddingBottom: 104 },
  profileCard: {
    margin: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5ECDC',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#E8F8DE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CDEFC0',
  },
  avatarInitials: { fontSize: 24, fontWeight: '900', color: '#16803C' },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#16803C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 3 },
  profileEmail: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 9 },
  memberChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  memberChipText: { fontSize: 11, fontWeight: '900', color: '#166534' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  statItem: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5ECDC',
  },
  statValue: { fontSize: 18, fontWeight: '900', color: '#16803C', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '800', color: '#64748B' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#111827', paddingHorizontal: 16, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 22 },
  actionCard: {
    width: (width - 42) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E5ECDC',
  },
  actionIconBox: { width: 42, height: 42, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionBadgeText: { fontSize: 9, fontWeight: '900', color: '#ffffff' },
  actionLabel: { fontSize: 14, fontWeight: '900', color: '#111827', marginBottom: 3 },
  actionSub: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitleInline: { fontSize: 18, fontWeight: '900', color: '#111827' },
  seeAllText: { fontSize: 12, fontWeight: '900', color: '#16803C' },
  orderCard: {
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5ECDC',
    gap: 10,
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E8F8DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderLeft: { flex: 1 },
  orderItems: { fontSize: 14, fontWeight: '900', color: '#111827', marginBottom: 4 },
  orderDate: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  orderRight: { alignItems: 'flex-end', gap: 6 },
  orderPrice: { fontSize: 16, fontWeight: '900', color: '#16803C' },
  statusPill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusPillText: { fontSize: 9, fontWeight: '900', letterSpacing: 0 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutCopy: { flex: 1 },
  logoutText: { fontSize: 15, fontWeight: '900', color: '#DC2626' },
  logoutSub: { fontSize: 11, fontWeight: '700', color: '#64748B', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.42)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5ECDC',
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: { fontSize: 12, fontWeight: '900', color: '#334155', marginBottom: 8, marginTop: 12 },
  inputRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#E4EADF',
  },
  modalInput: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
  emailNoteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  emailNote: { flex: 1, fontSize: 12, fontWeight: '700', color: '#94A3B8' },
  saveBtn: {
    backgroundColor: '#16803C',
    borderRadius: 8,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  saveBtnText: { fontSize: 16, fontWeight: '900', color: '#ffffff' },
});

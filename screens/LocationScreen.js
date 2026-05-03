import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Platform, ActivityIndicator, Alert,
  Animated, Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAppContext } from '../context/AppContext';
import {
  addSubDocument, updateSubDocument, deleteSubDocument,
  setDocument, updateDocument,
} from '../services/firestoreService';

const { width, height } = Dimensions.get('window');

// Fake map pins for visual effect
const MAP_PINS = [
  { x: 0.18, y: 0.22 }, { x: 0.52, y: 0.35 }, { x: 0.75, y: 0.18 },
  { x: 0.30, y: 0.55 }, { x: 0.65, y: 0.62 }, { x: 0.85, y: 0.45 },
  { x: 0.10, y: 0.70 }, { x: 0.45, y: 0.75 }, { x: 0.70, y: 0.80 },
];

const MAP_ROAD_H = [
  { y: 0.3, opacity: 0.15 }, { y: 0.55, opacity: 0.1 }, { y: 0.70, opacity: 0.08 },
];
const MAP_ROAD_V = [
  { x: 0.25, opacity: 0.12 }, { x: 0.55, opacity: 0.09 }, { x: 0.78, opacity: 0.07 },
];

const ADDRESS_LABELS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'work', label: 'Work', icon: 'work' },
  { id: 'other', label: 'Other', icon: 'location-on' },
];

export default function LocationScreen({ navigation }) {
  const { user, setLocation, setAddress, savedAddresses, selectAddress, activeAddressId } = useAppContext();
  const [fetching, setFetching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  // Form state
  const [labelType, setLabelType] = useState('home');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const formSlide = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    Animated.spring(formSlide, {
      toValue: showForm ? 0 : height,
      tension: 100,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [showForm]);

  const resetForm = () => {
    setLabelType('home');
    setReceiverName('');
    setReceiverPhone('');
    setAddressLine1('');
    setLandmark('');
    setCity('');
    setPincode('');
    setEditingAddress(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (addr) => {
    setEditingAddress(addr);
    setLabelType(addr.labelType || 'home');
    setReceiverName(addr.receiverName || '');
    setReceiverPhone(addr.receiverPhone || '');
    setAddressLine1(addr.addressLine1 || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city || '');
    setPincode(addr.pincode || '');
    setShowForm(true);
  };

  const handleUseCurrentLocation = async () => {
    setFetching(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location access in your device settings.');
        setFetching(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        setAddressLine1([place.name, place.street].filter(Boolean).join(', '));
        setCity(place.city || place.district || '');
        setPincode(place.postalCode || '');
      }
      if (!showForm) setShowForm(true);
    } catch (error) {
      Alert.alert('Location Error', 'Could not fetch location. Please enter manually.');
    } finally {
      setFetching(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!addressLine1.trim()) {
      Alert.alert('Error', 'Please enter the address.');
      return;
    }
    if (!receiverName.trim()) {
      Alert.alert('Error', 'Please enter receiver name.');
      return;
    }
    if (!receiverPhone.trim() || !/^\d{10}$/.test(receiverPhone.trim())) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'Please login to save addresses.');
      return;
    }

    setSavingAddress(true);
    const labelInfo = ADDRESS_LABELS.find((l) => l.id === labelType) || ADDRESS_LABELS[0];
    const addressData = {
      labelType,
      label: labelInfo.label,
      icon: labelInfo.icon,
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      addressLine1: addressLine1.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      isDefault: savedAddresses.length === 0 && !editingAddress,
    };

    try {
      if (editingAddress) {
        await updateSubDocument('users', user.uid, 'addresses', editingAddress.id, addressData);
      } else {
        await addSubDocument('users', user.uid, 'addresses', addressData);
      }
      setShowForm(false);
      resetForm();
    } catch (e) {
      Alert.alert('Error', 'Could not save address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = (addr) => {
    Alert.alert('Delete Address', `Remove "${addr.label}" address?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSubDocument('users', user.uid, 'addresses', addr.id);
          } catch (e) {
            Alert.alert('Error', 'Could not delete address.');
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (addr) => {
    if (!user) return;
    try {
      // Clear all defaults
      for (const a of savedAddresses) {
        if (a.isDefault && a.id !== addr.id) {
          await updateSubDocument('users', user.uid, 'addresses', a.id, { isDefault: false });
        }
      }
      await updateSubDocument('users', user.uid, 'addresses', addr.id, { isDefault: true });
    } catch (e) {
      Alert.alert('Error', 'Could not set default address.');
    }
  };

  const handleSelectAddress = (addr) => {
    selectAddress(addr);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Location</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Fake Map Visual ── */}
        <View style={styles.mapContainer}>
          {/* Map background with grid */}
          <View style={styles.mapBg}>
            {/* Grid lines horizontal */}
            {MAP_ROAD_H.map((r, i) => (
              <View key={`h${i}`} style={[styles.roadH, { top: `${r.y * 100}%`, opacity: r.opacity }]} />
            ))}
            {/* Grid lines vertical */}
            {MAP_ROAD_V.map((r, i) => (
              <View key={`v${i}`} style={[styles.roadV, { left: `${r.x * 100}%`, opacity: r.opacity }]} />
            ))}

            {/* Fake location pins */}
            {MAP_PINS.map((pin, i) => (
              <View
                key={i}
                style={[styles.mapPin, {
                  left: `${pin.x * 100}%`,
                  top: `${pin.y * 100}%`,
                  opacity: 0.4 + (i % 3) * 0.15,
                }]}
              >
                <MaterialIcons name="location-on" size={10 + (i % 3) * 3} color="#8b5cf6" />
              </View>
            ))}

            {/* Central big pin with pulse */}
            <View style={styles.centerPinWrapper}>
              <Animated.View style={[styles.pinPulseOuter, { transform: [{ scale: pulseAnim }] }]} />
              <View style={styles.pinPulseInner} />
              <MaterialIcons name="location-on" size={40} color="#8b5cf6" style={styles.centerPin} />
            </View>

            {/* Map overlay gradient */}
            <View style={styles.mapOverlay} />

            {/* Map label */}
            <View style={styles.mapLabel}>
              <MaterialIcons name="explore" size={14} color="#8b5cf6" />
              <Text style={styles.mapLabelText}>Tap to set delivery area</Text>
            </View>

            {/* Compass */}
            <View style={styles.compass}>
              <MaterialIcons name="explore" size={20} color="rgba(139,92,246,0.6)" />
            </View>

            {/* Scale bar */}
            <View style={styles.scaleBar}>
              <View style={styles.scaleBarLine} />
              <Text style={styles.scaleBarText}>500m</Text>
            </View>
          </View>
        </View>

        {/* ── Current Location Button ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.currentLocBtn} onPress={handleUseCurrentLocation} disabled={fetching}>
            {fetching ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <MaterialIcons name="my-location" size={20} color="#ffffff" />
            )}
            <Text style={styles.currentLocText}>
              {fetching ? 'Detecting...' : 'Use Current Location'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={openAddForm}>
            <MaterialIcons name="add" size={20} color="#8b5cf6" />
            <Text style={styles.addBtnText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {/* ── Saved Addresses ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SAVED ADDRESSES</Text>
          {!user && (
            <View style={styles.loginPrompt}>
              <MaterialIcons name="lock" size={18} color="#6d758c" />
              <Text style={styles.loginPromptText}>Login to save and manage addresses</Text>
            </View>
          )}
          {user && savedAddresses.length === 0 && (
            <View style={styles.emptyAddresses}>
              <MaterialIcons name="add-location-alt" size={36} color="#40485d" />
              <Text style={styles.emptyText}>No saved addresses yet</Text>
              <Text style={styles.emptySubText}>Add your Home or Work address for faster checkout</Text>
            </View>
          )}
          {savedAddresses.map((addr) => (
            <TouchableOpacity
              key={addr.id}
              style={[styles.addressCard, activeAddressId === addr.id && styles.addressCardActive]}
              onPress={() => handleSelectAddress(addr)}
              activeOpacity={0.85}
            >
              <View style={[styles.addrIconBox, { backgroundColor: addr.labelType === 'home' ? 'rgba(139,92,246,0.1)' : addr.labelType === 'work' ? 'rgba(5,150,105,0.1)' : 'rgba(217,119,6,0.1)' }]}>
                <MaterialIcons
                  name={addr.icon || 'location-on'}
                  size={22}
                  color={addr.labelType === 'home' ? '#8b5cf6' : addr.labelType === 'work' ? '#059669' : '#d97706'}
                />
              </View>
              <View style={styles.addrInfo}>
                <View style={styles.addrLabelRow}>
                  <Text style={styles.addrLabel}>{addr.label}</Text>
                  {addr.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addrText} numberOfLines={1}>{addr.addressLine1}</Text>
                {addr.city ? <Text style={styles.addrCity}>{addr.city}{addr.pincode ? ` - ${addr.pincode}` : ''}</Text> : null}
                <Text style={styles.addrReceiver}>For: {addr.receiverName} • {addr.receiverPhone}</Text>
              </View>
              <View style={styles.addrActions}>
                {activeAddressId === addr.id ? (
                  <MaterialIcons name="check-circle" size={22} color="#8b5cf6" />
                ) : (
                  <View style={styles.addrActBtns}>
                    {!addr.isDefault && (
                      <TouchableOpacity onPress={() => handleSetDefault(addr)} style={styles.addrActBtn}>
                        <MaterialIcons name="star-border" size={18} color="#6d758c" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => openEditForm(addr)} style={styles.addrActBtn}>
                      <MaterialIcons name="edit" size={18} color="#6d758c" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteAddress(addr)} style={styles.addrActBtn}>
                      <MaterialIcons name="delete-outline" size={18} color="#ff6e84" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ── Add/Edit Address Bottom Sheet ── */}
      {showForm && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBg} onPress={() => setShowForm(false)} />
          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: formSlide }] }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{editingAddress ? 'Edit Address' : 'Add New Address'}</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <MaterialIcons name="close" size={22} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.formContent}>
              {/* Label selector */}
              <Text style={styles.fieldLabel}>Address Type</Text>
              <View style={styles.labelSelector}>
                {ADDRESS_LABELS.map((l) => (
                  <TouchableOpacity
                    key={l.id}
                    style={[styles.labelPill, labelType === l.id && styles.labelPillActive]}
                    onPress={() => setLabelType(l.id)}
                  >
                    <MaterialIcons name={l.icon} size={16} color={labelType === l.id ? '#ffffff' : '#8b5cf6'} />
                    <Text style={[styles.labelPillText, labelType === l.id && styles.labelPillTextActive]}>{l.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* GPS button inside form */}
              <TouchableOpacity style={styles.gpsInForm} onPress={handleUseCurrentLocation} disabled={fetching}>
                <MaterialIcons name="my-location" size={18} color="#8b5cf6" />
                <Text style={styles.gpsInFormText}>{fetching ? 'Detecting location...' : 'Auto-fill from GPS'}</Text>
                {fetching && <ActivityIndicator size="small" color="#8b5cf6" style={{ marginLeft: 8 }} />}
              </TouchableOpacity>

              <Text style={styles.fieldLabel}>Receiver Name *</Text>
              <TextInput
                style={styles.inputField}
                value={receiverName}
                onChangeText={setReceiverName}
                placeholder="Full name of receiver"
                placeholderTextColor="#40485d"
              />

              <Text style={styles.fieldLabel}>Phone Number *</Text>
              <TextInput
                style={styles.inputField}
                value={receiverPhone}
                onChangeText={setReceiverPhone}
                placeholder="10-digit mobile number"
                placeholderTextColor="#40485d"
                keyboardType="phone-pad"
                maxLength={10}
              />

              <Text style={styles.fieldLabel}>Address *</Text>
              <TextInput
                style={[styles.inputField, { height: 70 }]}
                value={addressLine1}
                onChangeText={setAddressLine1}
                placeholder="House/Flat No., Street, Area"
                placeholderTextColor="#40485d"
                multiline
              />

              <Text style={styles.fieldLabel}>Landmark (Optional)</Text>
              <TextInput
                style={styles.inputField}
                value={landmark}
                onChangeText={setLandmark}
                placeholder="Near school, temple, etc."
                placeholderTextColor="#40485d"
              />

              <View style={styles.rowFields}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>City</Text>
                  <TextInput
                    style={styles.inputField}
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                    placeholderTextColor="#40485d"
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Pincode</Text>
                  <TextInput
                    style={styles.inputField}
                    value={pincode}
                    onChangeText={setPincode}
                    placeholder="123456"
                    placeholderTextColor="#40485d"
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress} disabled={savingAddress}>
                {savingAddress ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveBtnText}>{editingAddress ? 'Update Address' : 'Save Address'}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1e293b' },

  // Map
  mapContainer: { marginHorizontal: 20, marginBottom: 16, borderRadius: 24, overflow: 'hidden', height: 200 },
  mapBg: { flex: 1, backgroundColor: '#f1f5f9', position: 'relative' },
  roadH: { position: 'absolute', left: 0, right: 0, height: 12, backgroundColor: '#e2e8f0' },
  roadV: { position: 'absolute', top: 0, bottom: 0, width: 10, backgroundColor: '#e2e8f0' },
  mapPin: { position: 'absolute', transform: [{ translateX: -8 }, { translateY: -8 }] },
  centerPinWrapper: { position: 'absolute', left: '50%', top: '50%', alignItems: 'center', justifyContent: 'center', transform: [{ translateX: -20 }, { translateY: -40 }] },
  pinPulseOuter: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(139,92,246,0.15)', top: 10, left: 0 },
  pinPulseInner: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(139,92,246,0.3)', top: 22, left: 12 },
  centerPin: { zIndex: 10 },
  mapOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(255,255,255,0.6)' },
  mapLabel: { position: 'absolute', bottom: 14, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  mapLabelText: { fontSize: 12, color: '#8b5cf6', fontWeight: '600' },
  compass: { position: 'absolute', top: 12, right: 14 },
  scaleBar: { position: 'absolute', bottom: 36, right: 14, alignItems: 'flex-end' },
  scaleBarLine: { width: 40, height: 2, backgroundColor: 'rgba(139,92,246,0.4)', marginBottom: 3 },
  scaleBarText: { fontSize: 8, color: 'rgba(139,92,246,0.6)', fontWeight: 'bold' },

  // Buttons
  actionRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  currentLocBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#8b5cf6', borderRadius: 16, height: 48, gap: 8,
    shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  currentLocText: { fontSize: 13, fontWeight: '700', color: '#ffffff' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#8b5cf6', borderRadius: 16, height: 48, paddingHorizontal: 16, gap: 6,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#8b5cf6' },

  // Section
  section: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 2, marginBottom: 14 },
  loginPrompt: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f8fafc', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  loginPromptText: { fontSize: 13, color: '#64748b' },
  emptyAddresses: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  emptySubText: { fontSize: 12, color: '#64748b', textAlign: 'center', lineHeight: 18 },

  // Address Cards
  addressCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#ffffff', borderRadius: 18, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2,
  },
  addressCardActive: { borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.02)' },
  addrIconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  addrInfo: { flex: 1 },
  addrLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  addrLabel: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
  defaultBadge: { backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  defaultBadgeText: { fontSize: 8, fontWeight: 'bold', color: '#8b5cf6', letterSpacing: 1 },
  addrText: { fontSize: 13, color: '#64748b', marginBottom: 2 },
  addrCity: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  addrReceiver: { fontSize: 11, color: '#64748b', marginTop: 2 },
  addrActions: { marginLeft: 8, alignItems: 'flex-end' },
  addrActBtns: { flexDirection: 'row', gap: 4 },
  addrActBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },

  // Bottom Sheet
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  overlayBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: height * 0.88,
    borderTopWidth: 1, borderTopColor: '#e2e8f0',
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0', alignSelf: 'center', marginTop: 12, marginBottom: 6 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },

  // Form
  formContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 16 },
  fieldLabel: { fontSize: 11, fontWeight: 'bold', color: '#64748b', letterSpacing: 1, marginBottom: 8, marginTop: 14 },
  labelSelector: { flexDirection: 'row', gap: 10 },
  labelPill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', paddingVertical: 10, backgroundColor: '#f8fafc' },
  labelPillActive: { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
  labelPillText: { fontSize: 13, fontWeight: '700', color: '#8b5cf6' },
  labelPillTextActive: { color: '#ffffff' },
  gpsInForm: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(139,92,246,0.05)', borderRadius: 12, padding: 12, marginTop: 10,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.1)',
  },
  gpsInFormText: { fontSize: 13, color: '#8b5cf6', fontWeight: '600', flex: 1 },
  inputField: {
    backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 14, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0',
  },
  rowFields: { flexDirection: 'row' },
  saveBtn: {
    backgroundColor: '#8b5cf6', borderRadius: 18, height: 54,
    alignItems: 'center', justifyContent: 'center', marginTop: 24,
    shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6,
  },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
});

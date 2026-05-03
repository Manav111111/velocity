import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Animated, Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAppContext } from '../context/AppContext';
import {
  addSubDocument, updateSubDocument, deleteSubDocument,
} from '../services/firestoreService';

const { height } = Dimensions.get('window');

const DELIVERY_BLOCKS = [
  { left: '5%', top: '12%', width: '24%', height: 34, bg: '#DDF6D5' },
  { left: '35%', top: '8%', width: '26%', height: 46, bg: '#FFF7D6' },
  { left: '68%', top: '13%', width: '22%', height: 36, bg: '#EAF7FF' },
  { left: '8%', top: '45%', width: '20%', height: 48, bg: '#F0F7EA' },
  { left: '38%', top: '48%', width: '24%', height: 38, bg: '#ECFDF5' },
  { left: '70%', top: '50%', width: '21%', height: 44, bg: '#FFF0F3' },
  { left: '16%', top: '74%', width: '28%', height: 36, bg: '#EDFFF8' },
  { left: '55%', top: '76%', width: '31%', height: 34, bg: '#E8F8DE' },
];

const MAP_PINS = [
  { left: '20%', top: '26%' },
  { left: '78%', top: '27%' },
  { left: '18%', top: '66%' },
  { left: '72%', top: '68%' },
];

const ADDRESS_LABELS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'work', label: 'Work', icon: 'work' },
  { id: 'other', label: 'Other', icon: 'location-on' },
];

export default function LocationScreen({ navigation }) {
  const { user, savedAddresses, selectAddress, activeAddressId } = useAppContext();
  const [fetching, setFetching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const [labelType, setLabelType] = useState('home');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const formSlide = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.26, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    Animated.spring(formSlide, {
      toValue: showForm ? 0 : height,
      tension: 100,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [showForm, formSlide]);

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

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.82}>
          <MaterialIcons name="arrow-back" size={21} color="#16803C" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Delivery location</Text>
          <Text style={styles.headerSub}>Choose where we should deliver</Text>
        </View>
        <TouchableOpacity onPress={openAddForm} style={styles.headerAddBtn} activeOpacity={0.82}>
          <MaterialIcons name="add" size={21} color="#16803C" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mapCard}>
          <View style={styles.mapBg}>
            <View style={styles.roadMainH} />
            <View style={styles.roadMainV} />
            <View style={styles.roadSoftH} />
            <View style={styles.roadSoftV} />
            {DELIVERY_BLOCKS.map((block, index) => (
              <View key={index} style={[styles.mapBlock, block]} />
            ))}
            {MAP_PINS.map((pin, index) => (
              <View key={index} style={[styles.smallPin, pin]}>
                <MaterialIcons name="place" size={16} color="#16803C" />
              </View>
            ))}
            <View style={styles.centerPinWrapper}>
              <Animated.View style={[styles.pinPulseOuter, { transform: [{ scale: pulseAnim }] }]} />
              <View style={styles.pinDot} />
              <View style={styles.centerPin}>
                <MaterialIcons name="my-location" size={24} color="#ffffff" />
              </View>
            </View>
            <View style={styles.mapTopChip}>
              <MaterialIcons name="bolt" size={14} color="#166534" />
              <Text style={styles.mapTopChipText}>Serviceable delivery zone</Text>
            </View>
            <View style={styles.mapBottomPanel}>
              <View>
                <Text style={styles.mapTitle}>Set precise drop point</Text>
                <Text style={styles.mapSub}>Use GPS or add your address manually.</Text>
              </View>
              <MaterialIcons name="near-me" size={22} color="#16803C" />
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.currentLocBtn} onPress={handleUseCurrentLocation} disabled={fetching} activeOpacity={0.88}>
            {fetching ? <ActivityIndicator color="#ffffff" size="small" /> : <MaterialIcons name="my-location" size={20} color="#ffffff" />}
            <Text style={styles.currentLocText}>{fetching ? 'Detecting...' : 'Use current location'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={openAddForm} activeOpacity={0.84}>
            <MaterialIcons name="edit-location-alt" size={20} color="#16803C" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved addresses</Text>
            <Text style={styles.sectionMeta}>{savedAddresses.length} saved</Text>
          </View>
          {!user && (
            <View style={styles.loginPrompt}>
              <View style={styles.promptIcon}>
                <MaterialIcons name="lock" size={18} color="#16803C" />
              </View>
              <Text style={styles.loginPromptText}>Login to save and manage addresses.</Text>
            </View>
          )}
          {user && savedAddresses.length === 0 && (
            <View style={styles.emptyAddresses}>
              <View style={styles.emptyIconWrap}>
                <MaterialIcons name="add-location-alt" size={34} color="#16803C" />
              </View>
              <Text style={styles.emptyText}>No saved addresses yet</Text>
              <Text style={styles.emptySubText}>Add home or work once for faster checkout.</Text>
            </View>
          )}
          {savedAddresses.map((addr) => {
            const isActive = activeAddressId === addr.id;
            return (
              <TouchableOpacity
                key={addr.id}
                style={[styles.addressCard, isActive && styles.addressCardActive]}
                onPress={() => handleSelectAddress(addr)}
                activeOpacity={0.85}
              >
                <View style={styles.addrIconBox}>
                  <MaterialIcons name={addr.icon || 'location-on'} size={22} color="#16803C" />
                </View>
                <View style={styles.addrInfo}>
                  <View style={styles.addrLabelRow}>
                    <Text style={styles.addrLabel}>{addr.label}</Text>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addrText} numberOfLines={2}>{addr.addressLine1}</Text>
                  {addr.city ? <Text style={styles.addrCity}>{addr.city}{addr.pincode ? ` - ${addr.pincode}` : ''}</Text> : null}
                  <Text style={styles.addrReceiver}>For: {addr.receiverName} | {addr.receiverPhone}</Text>
                </View>
                <View style={styles.addrActions}>
                  {isActive ? (
                    <MaterialIcons name="check-circle" size={23} color="#16803C" />
                  ) : (
                    <View style={styles.addrActBtns}>
                      {!addr.isDefault && (
                        <TouchableOpacity onPress={() => handleSetDefault(addr)} style={styles.addrActBtn} activeOpacity={0.78}>
                          <MaterialIcons name="star-border" size={18} color="#64748B" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={() => openEditForm(addr)} style={styles.addrActBtn} activeOpacity={0.78}>
                        <MaterialIcons name="edit" size={18} color="#64748B" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteAddress(addr)} style={styles.addrActBtn} activeOpacity={0.78}>
                        <MaterialIcons name="delete-outline" size={18} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {showForm && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBg} onPress={() => setShowForm(false)} activeOpacity={1} />
          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: formSlide }] }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{editingAddress ? 'Edit address' : 'Add new address'}</Text>
              <TouchableOpacity onPress={() => setShowForm(false)} style={styles.closeBtn} activeOpacity={0.78}>
                <MaterialIcons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll} contentContainerStyle={styles.formContent}>
              <Text style={styles.fieldLabel}>Address type</Text>
              <View style={styles.labelSelector}>
                {ADDRESS_LABELS.map((l) => (
                  <TouchableOpacity
                    key={l.id}
                    style={[styles.labelPill, labelType === l.id && styles.labelPillActive]}
                    onPress={() => setLabelType(l.id)}
                    activeOpacity={0.82}
                  >
                    <MaterialIcons name={l.icon} size={16} color={labelType === l.id ? '#ffffff' : '#16803C'} />
                    <Text style={[styles.labelPillText, labelType === l.id && styles.labelPillTextActive]}>{l.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.gpsInForm} onPress={handleUseCurrentLocation} disabled={fetching} activeOpacity={0.84}>
                <MaterialIcons name="my-location" size={18} color="#16803C" />
                <Text style={styles.gpsInFormText}>{fetching ? 'Detecting location...' : 'Auto-fill from GPS'}</Text>
                {fetching && <ActivityIndicator size="small" color="#16803C" />}
              </TouchableOpacity>

              <Text style={styles.fieldLabel}>Receiver name *</Text>
              <TextInput
                style={styles.inputField}
                value={receiverName}
                onChangeText={setReceiverName}
                placeholder="Full name of receiver"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.fieldLabel}>Phone number *</Text>
              <TextInput
                style={styles.inputField}
                value={receiverPhone}
                onChangeText={setReceiverPhone}
                placeholder="10-digit mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
              />

              <Text style={styles.fieldLabel}>Address *</Text>
              <TextInput
                style={[styles.inputField, styles.addressInput]}
                value={addressLine1}
                onChangeText={setAddressLine1}
                placeholder="House/Flat No., Street, Area"
                placeholderTextColor="#94A3B8"
                multiline
              />

              <Text style={styles.fieldLabel}>Landmark</Text>
              <TextInput
                style={styles.inputField}
                value={landmark}
                onChangeText={setLandmark}
                placeholder="Near school, temple, etc."
                placeholderTextColor="#94A3B8"
              />

              <View style={styles.rowFields}>
                <View style={styles.rowField}>
                  <Text style={styles.fieldLabel}>City</Text>
                  <TextInput
                    style={styles.inputField}
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View style={styles.rowField}>
                  <Text style={styles.fieldLabel}>Pincode</Text>
                  <TextInput
                    style={styles.inputField}
                    value={pincode}
                    onChangeText={setPincode}
                    placeholder="123456"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress} disabled={savingAddress} activeOpacity={0.88}>
                {savingAddress ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveBtnText}>{editingAddress ? 'Update address' : 'Save address'}</Text>}
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F4' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE1',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#E8F8DE',
    borderWidth: 1,
    borderColor: '#CDEFC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#111827' },
  headerSub: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 2 },
  headerAddBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#E8F8DE',
    borderWidth: 1,
    borderColor: '#CDEFC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { paddingBottom: 42 },
  mapCard: {
    margin: 16,
    marginBottom: 12,
    height: 224,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CDEFC0',
    backgroundColor: '#ffffff',
  },
  mapBg: { flex: 1, backgroundColor: '#F4FAF0', position: 'relative' },
  roadMainH: { position: 'absolute', left: -20, right: -20, top: '42%', height: 24, backgroundColor: '#ffffff', transform: [{ rotate: '-8deg' }] },
  roadMainV: { position: 'absolute', top: -20, bottom: -20, left: '48%', width: 24, backgroundColor: '#ffffff', transform: [{ rotate: '10deg' }] },
  roadSoftH: { position: 'absolute', left: -12, right: -12, top: '68%', height: 12, backgroundColor: 'rgba(255,255,255,0.78)', transform: [{ rotate: '5deg' }] },
  roadSoftV: { position: 'absolute', top: -12, bottom: -12, left: '24%', width: 12, backgroundColor: 'rgba(255,255,255,0.78)', transform: [{ rotate: '-5deg' }] },
  mapBlock: { position: 'absolute', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(22,128,60,0.08)' },
  smallPin: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  centerPinWrapper: { position: 'absolute', left: '50%', top: '50%', width: 62, height: 62, marginLeft: -31, marginTop: -31, alignItems: 'center', justifyContent: 'center' },
  pinPulseOuter: { position: 'absolute', width: 62, height: 62, borderRadius: 31, backgroundColor: 'rgba(22,128,60,0.15)' },
  pinDot: { position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(22,128,60,0.20)' },
  centerPin: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#16803C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 10,
  },
  mapTopChip: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  mapTopChipText: { fontSize: 11, fontWeight: '900', color: '#166534' },
  mapBottomPanel: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    minHeight: 56,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: '#E5ECDC',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mapTitle: { fontSize: 14, fontWeight: '900', color: '#111827' },
  mapSub: { fontSize: 11, fontWeight: '700', color: '#64748B', marginTop: 2 },
  actionRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  currentLocBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16803C',
    borderRadius: 8,
    height: 50,
    gap: 8,
  },
  currentLocText: { fontSize: 14, fontWeight: '900', color: '#ffffff' },
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#E8F8DE',
    borderWidth: 1,
    borderColor: '#CDEFC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },
  sectionMeta: { fontSize: 11, fontWeight: '800', color: '#64748B' },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5ECDC',
  },
  promptIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#E8F8DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPromptText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#64748B' },
  emptyAddresses: {
    alignItems: 'center',
    paddingVertical: 34,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5ECDC',
  },
  emptyIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#E8F8DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyText: { fontSize: 16, fontWeight: '900', color: '#111827', marginBottom: 5 },
  emptySubText: { fontSize: 12, fontWeight: '700', color: '#64748B', textAlign: 'center' },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5ECDC',
  },
  addressCardActive: { borderColor: '#16803C', backgroundColor: '#F7FCF4' },
  addrIconBox: { width: 42, height: 42, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: '#E8F8DE' },
  addrInfo: { flex: 1 },
  addrLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  addrLabel: { fontSize: 14, fontWeight: '900', color: '#111827' },
  defaultBadge: { backgroundColor: '#ECFDF5', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: '#BBF7D0' },
  defaultBadgeText: { fontSize: 9, fontWeight: '900', color: '#166534' },
  addrText: { fontSize: 12, lineHeight: 17, fontWeight: '700', color: '#64748B', marginBottom: 2 },
  addrCity: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 2 },
  addrReceiver: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginTop: 2 },
  addrActions: { marginLeft: 8, alignItems: 'flex-end' },
  addrActBtns: { flexDirection: 'row', gap: 3 },
  addrActBtn: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  overlayBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.42)' },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: height * 0.88,
    borderTopWidth: 1,
    borderTopColor: '#E5ECDC',
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginTop: 12, marginBottom: 6 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sheetTitle: { fontSize: 19, fontWeight: '900', color: '#111827' },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetScroll: { flex: 1 },
  formContent: { paddingHorizontal: 18, paddingBottom: 40, paddingTop: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '900', color: '#334155', marginBottom: 8, marginTop: 14 },
  labelSelector: { flexDirection: 'row', gap: 9 },
  labelPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CDEFC0',
    paddingVertical: 10,
    backgroundColor: '#E8F8DE',
  },
  labelPillActive: { backgroundColor: '#16803C', borderColor: '#16803C' },
  labelPillText: { fontSize: 13, fontWeight: '900', color: '#16803C' },
  labelPillTextActive: { color: '#ffffff' },
  gpsInForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  gpsInFormText: { fontSize: 13, color: '#166534', fontWeight: '900', flex: 1 },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 13,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E4EADF',
  },
  addressInput: { minHeight: 72, textAlignVertical: 'top' },
  rowFields: { flexDirection: 'row', gap: 10 },
  rowField: { flex: 1 },
  saveBtn: {
    backgroundColor: '#16803C',
    borderRadius: 8,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  saveBtnText: { fontSize: 16, fontWeight: '900', color: '#ffffff' },
});

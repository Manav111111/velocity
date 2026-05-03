import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { signInWithGoogle } from '../services/googleAuthService';

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        phone,
        createdAt: new Date().toISOString(),
        tier: 'Bronze',
        points: 0,
      });

      navigation.replace('Home');
    } catch (error) {
      let msg = 'Signup failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') msg = 'An account with this email already exists.';
      else if (error.code === 'auth/invalid-email') msg = 'Invalid email address.';
      else if (error.code === 'auth/weak-password') msg = 'Password is too weak. Use at least 6 characters.';
      Alert.alert('Signup Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle(navigation);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.82}>
              <MaterialIcons name="arrow-back" size={21} color="#16803C" />
            </TouchableOpacity>
            <View style={styles.headerCopy}>
              <Text style={styles.brandTitle}>Create account</Text>
              <Text style={styles.brandSubtitle}>Get fresh groceries delivered quickly.</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>Full name</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person-outline" size={18} color="#16803C" />
              <TextInput
                style={styles.input}
                placeholder="Your full name"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="mail-outline" size={18} color="#16803C" />
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.fieldLabel}>Phone number</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="phone" size={18} color="#16803C" />
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile number"
                placeholderTextColor="#94A3B8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={18} color="#16803C" />
              <TextInput
                style={styles.input}
                placeholder="Minimum 6 characters"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} activeOpacity={0.78}>
                <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleSignup} disabled={loading} activeOpacity={0.88}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.createButtonText}>Create account</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignup}
              disabled={googleLoading}
              activeOpacity={0.86}
            >
              {googleLoading ? (
                <ActivityIndicator color="#16803C" />
              ) : (
                <>
                  <Text style={styles.googleMark}>G</Text>
                  <Text style={styles.googleButtonText}>Sign up with Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>Login</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#F6F8F4' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 42 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 22, paddingBottom: 18 },
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
  brandTitle: { fontSize: 26, fontWeight: '900', color: '#111827' },
  brandSubtitle: { fontSize: 13, fontWeight: '700', color: '#64748B', marginTop: 3 },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5ECDC',
  },
  fieldLabel: { fontSize: 12, fontWeight: '900', color: '#334155', marginBottom: 8, marginTop: 8 },
  inputContainer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#E4EADF',
    marginBottom: 10,
  },
  input: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
  eyeIcon: { padding: 4 },
  createButton: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#16803C',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 10,
  },
  createButtonText: { fontSize: 16, fontWeight: '900', color: '#ffffff' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5ECDC' },
  dividerText: { fontSize: 12, fontWeight: '900', color: '#94A3B8' },
  googleButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5ECDC',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  googleMark: { fontSize: 18, fontWeight: '900', color: '#EA4335' },
  googleButtonText: { fontSize: 14, fontWeight: '900', color: '#111827' },
  footer: { alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  footerLink: { color: '#16803C', fontWeight: '900' },
});

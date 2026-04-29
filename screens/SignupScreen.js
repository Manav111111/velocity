import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Dimensions, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { signInWithGoogle } from '../services/googleAuthService';

const { width } = Dimensions.get('window');

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignup = () => signInWithGoogle(navigation);

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

      // Update display name
      await updateProfile(user, { displayName: fullName });

      // Save user data to Firestore
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

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Section */}
          <View style={styles.topSection}>
            <Text style={styles.brandName}>V E L O C I T Y   P R O</Text>
            <Text style={styles.pageTitle}>Create Account</Text>
            <Text style={styles.pageSubtitle}>Join our exclusive network today.</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {/* Full Name */}
            <Text style={styles.fieldLabel}>FULL NAME</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#40485d"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Email */}
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="john@velocity.pro"
                placeholderTextColor="#40485d"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone Number */}
            <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor="#40485d"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Password */}
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor="#40485d"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#6d758c" />
              </TouchableOpacity>
            </View>

            {/* Create Account Button */}
            <TouchableOpacity style={styles.createButton} onPress={handleSignup} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#060e20" />
              ) : (
                <Text style={styles.createButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Social Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>SOCIAL ENTRY</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Button */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignup}>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.socialLabel}>GOOGLE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already part of the network?  <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>Login</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  topSection: { alignItems: 'center', marginTop: 60, marginBottom: 32 },
  brandName: { fontSize: 13, fontWeight: 'bold', color: '#8b5cf6', letterSpacing: 3, marginBottom: 18 },
  pageTitle: { fontSize: 32, fontWeight: '900', color: '#1e293b', marginBottom: 8 },
  pageSubtitle: { fontSize: 14, color: '#64748b' },
  formSection: { marginBottom: 20 },
  fieldLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 1.5, marginBottom: 8, marginTop: 12 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 16, height: 54,
    borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 4,
  },
  input: { flex: 1, fontSize: 15, color: '#1e293b' },
  eyeIcon: { padding: 4 },
  createButton: {
    backgroundColor: '#8b5cf6', borderRadius: 16, height: 56,
    alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 24,
    shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8,
  },
  createButtonText: { fontSize: 17, fontWeight: '700', color: '#ffffff' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1.5, marginHorizontal: 12 },
  socialContainer: { width: '100%' },
  socialButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ffffff', borderRadius: 14, height: 50, gap: 8,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  googleIcon: { fontSize: 18, fontWeight: 'bold', color: '#f4c20d' },
  socialLabel: { fontSize: 12, fontWeight: 'bold', color: '#1e293b', letterSpacing: 0.5 },
  footer: { alignItems: 'center', marginTop: 28 },
  footerText: { fontSize: 14, color: '#64748b' },
  footerLink: { color: '#8b5cf6', fontWeight: '700' },
});

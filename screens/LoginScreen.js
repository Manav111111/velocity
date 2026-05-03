import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { signInWithGoogle } from '../services/googleAuthService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('Home');
    } catch (error) {
      let msg = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') msg = 'No account found with this email.';
      else if (error.code === 'auth/wrong-password') msg = 'Incorrect password.';
      else if (error.code === 'auth/invalid-email') msg = 'Invalid email address.';
      else if (error.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
          <View style={styles.brandHeader}>
            <View style={styles.logoBox}>
              <MaterialIcons name="shopping-bag" size={30} color="#16803C" />
            </View>
            <Text style={styles.brandTitle}>Velocity</Text>
            <Text style={styles.brandSubtitle}>Fresh groceries delivered fast</Text>
          </View>

          <View style={styles.promiseStrip}>
            <View style={styles.promiseItem}>
              <MaterialIcons name="bolt" size={15} color="#166534" />
              <Text style={styles.promiseText}>10 min delivery</Text>
            </View>
            <View style={styles.promiseDivider} />
            <View style={styles.promiseItem}>
              <MaterialIcons name="verified" size={15} color="#166534" />
              <Text style={styles.promiseText}>Fresh daily</Text>
            </View>
          </View>

          <View style={styles.loginCard}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>Login to continue shopping fresh essentials.</Text>

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

            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={18} color="#16803C" />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} activeOpacity={0.78}>
                <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.continueButton} onPress={handleLogin} disabled={loading} activeOpacity={0.88}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.continueText}>Login</Text>
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
              onPress={handleGoogleLogin}
              disabled={googleLoading}
              activeOpacity={0.86}
            >
              {googleLoading ? (
                <ActivityIndicator color="#16803C" />
              ) : (
                <>
                  <Text style={styles.googleMark}>G</Text>
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              New here? <Text style={styles.footerLink} onPress={() => navigation.navigate('Signup')}>Create account</Text>
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
  brandHeader: { alignItems: 'center', paddingTop: 54, paddingBottom: 18 },
  logoBox: {
    width: 62,
    height: 62,
    borderRadius: 12,
    backgroundColor: '#E8F8DE',
    borderWidth: 1,
    borderColor: '#CDEFC0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  brandTitle: { fontSize: 32, fontWeight: '900', color: '#111827', letterSpacing: 0 },
  brandSubtitle: { fontSize: 13, fontWeight: '700', color: '#64748B', marginTop: 4 },
  promiseStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    marginBottom: 14,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  promiseItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  promiseDivider: { width: 1, height: 22, backgroundColor: '#BBF7D0' },
  promiseText: { fontSize: 12, fontWeight: '900', color: '#166534' },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5ECDC',
  },
  welcomeTitle: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 6 },
  welcomeSubtitle: { fontSize: 13, lineHeight: 19, fontWeight: '700', color: '#64748B', marginBottom: 18 },
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
  continueButton: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#16803C',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 10,
  },
  continueText: { fontSize: 16, fontWeight: '900', color: '#ffffff' },
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

import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Dimensions, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { signInWithGoogle } from '../services/googleAuthService';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => signInWithGoogle(navigation);

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

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Section */}
          <View style={styles.topSection}>
            <View style={styles.logoIcon}>
              <MaterialIcons name="bolt" size={32} color="#8b5cf6" />
            </View>
            <Text style={styles.brandTitle}>Velocity Pro</Text>
            <Text style={styles.brandSubtitle}>ELEVATE YOUR WORKFLOW</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Please enter your details to continue.</Text>

            {/* Email Field */}
            <Text style={styles.fieldLabel}>EMAIL OR PHONE NUMBER</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="name@company.com"
                placeholderTextColor="#40485d"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Field */}
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter password"
                placeholderTextColor="#40485d"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#6d758c" />
              </TouchableOpacity>
            </View>

            {/* Continue Button */}
            <TouchableOpacity style={styles.continueButton} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#060e20" />
              ) : (
                <Text style={styles.continueText}>Continue</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR LOGIN WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Button */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
                <Text style={styles.socialIcon}>G</Text>
                <Text style={styles.socialLabel}>GOOGLE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              New here?  <Text style={styles.footerLink} onPress={() => navigation.navigate('Signup')}>Create Account</Text>
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
  topSection: { alignItems: 'center', marginTop: 80, marginBottom: 40 },
  logoIcon: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(139,92,246,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  brandTitle: { fontSize: 28, fontWeight: '900', color: '#1e293b', marginBottom: 6 },
  brandSubtitle: { fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 2.5 },
  loginCard: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5,
  },
  welcomeTitle: { fontSize: 24, fontWeight: '800', color: '#1e293b', marginBottom: 6 },
  welcomeSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  fieldLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 1.5, marginBottom: 8, marginTop: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 16, height: 52,
    borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12,
  },
  input: { flex: 1, fontSize: 15, color: '#1e293b' },
  eyeIcon: { padding: 4 },
  continueButton: {
    backgroundColor: '#8b5cf6', borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 20,
    shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  continueText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1, marginHorizontal: 12 },
  socialContainer: { width: '100%' },
  socialButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ffffff', borderRadius: 14, height: 48, gap: 8,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  socialIcon: { fontSize: 16, fontWeight: 'bold', color: '#f4c20d' },
  socialLabel: { fontSize: 12, fontWeight: 'bold', color: '#1e293b', letterSpacing: 0.5 },
  footer: { alignItems: 'center', marginTop: 28 },
  footerText: { fontSize: 14, color: '#64748b' },
  footerLink: { color: '#8b5cf6', fontWeight: '600' },
});

import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const { user, authLoading } = useAppContext();
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Navigate after animation AND auth check completes
  useEffect(() => {
    if (authLoading) return; // Wait for auth to resolve

    const timer = setTimeout(() => {
      if (user) {
        // User is already logged in — skip onboarding/login
        navigation.replace('Home');
      } else {
        navigation.replace('Login');
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [authLoading, user]);

  return (
    <View style={styles.container}>
      <View style={styles.glowLayer1} />
      <View style={styles.glowLayer2} />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBox}>
            <MaterialIcons name="bolt" size={60} color="#8b5cf6" />
          </View>
        </View>
        <Text style={styles.title}>
          Velocity<Text style={styles.titlePro}>Pro</Text>
        </Text>
        <Text style={styles.subtitle}>ULTIMATE DELIVERY INFRASTRUCTURE</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.statusContainer}>
          <View style={styles.pulseContainer}>
            <View style={styles.pulseDot} />
            <Animated.View style={[styles.pulseRing, {
              transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2] }) }],
              opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] })
            }]} />
          </View>
          <Text style={styles.statusText}>OPENING STORE</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  glowLayer1: { position: 'absolute', width: width * 1.5, height: width * 1.5, backgroundColor: 'rgba(139,92,246,0.02)', borderRadius: 999, top: height / 2 - (width * 1.5) / 2, left: width / 2 - (width * 1.5) / 2 },
  glowLayer2: { position: 'absolute', width: width * 0.8, height: width * 0.8, backgroundColor: 'rgba(139,92,246,0.03)', borderRadius: 999, top: height / 2 - (width * 0.8) / 2, left: width / 2 - (width * 0.8) / 2 },
  content: { alignItems: 'center', marginBottom: 100, zIndex: 10 },
  iconContainer: { marginBottom: 32, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  iconBox: { width: 120, height: 120, backgroundColor: '#f1f5f9', borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 48, fontWeight: '900', color: '#1e293b', letterSpacing: -1.5, marginBottom: 8 },
  titlePro: { color: '#8b5cf6' },
  subtitle: { fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 2 },
  footer: { position: 'absolute', bottom: 90, width: '100%', alignItems: 'center', paddingHorizontal: 40 },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  pulseContainer: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  pulseDot: { width: 8, height: 8, backgroundColor: '#8b5cf6', borderRadius: 4, position: 'absolute', zIndex: 2 },
  pulseRing: { width: 16, height: 16, backgroundColor: '#8b5cf6', borderRadius: 8, position: 'absolute', zIndex: 1 },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#64748b', letterSpacing: 1.5 },
});

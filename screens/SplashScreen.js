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
            <MaterialIcons name="shopping-bag" size={54} color="#16803C" />
          </View>
        </View>
        <Text style={styles.title}>
          Velocity
        </Text>
        <Text style={styles.subtitle}>FRESH GROCERIES DELIVERED FAST</Text>
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
  container: { flex: 1, backgroundColor: '#F6F8F4', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  glowLayer1: { position: 'absolute', width: width * 1.5, height: width * 1.5, backgroundColor: 'rgba(22,128,60,0.04)', borderRadius: 999, top: height / 2 - (width * 1.5) / 2, left: width / 2 - (width * 1.5) / 2 },
  glowLayer2: { position: 'absolute', width: width * 0.8, height: width * 0.8, backgroundColor: 'rgba(22,128,60,0.06)', borderRadius: 999, top: height / 2 - (width * 0.8) / 2, left: width / 2 - (width * 0.8) / 2 },
  content: { alignItems: 'center', marginBottom: 100, zIndex: 10 },
  iconContainer: { marginBottom: 32, shadowColor: '#166534', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 10 },
  iconBox: { width: 118, height: 118, backgroundColor: '#E8F8DE', borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#CDEFC0' },
  title: { fontSize: 48, fontWeight: '900', color: '#111827', letterSpacing: 0, marginBottom: 8 },
  titlePro: { color: '#16803C' },
  subtitle: { fontSize: 10, fontWeight: '900', color: '#64748B', letterSpacing: 1.4 },
  footer: { position: 'absolute', bottom: 90, width: '100%', alignItems: 'center', paddingHorizontal: 40 },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  pulseContainer: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  pulseDot: { width: 8, height: 8, backgroundColor: '#16803C', borderRadius: 4, position: 'absolute', zIndex: 2 },
  pulseRing: { width: 16, height: 16, backgroundColor: '#16803C', borderRadius: 8, position: 'absolute', zIndex: 1 },
  statusText: { fontSize: 12, fontWeight: '900', color: '#64748B', letterSpacing: 1.2 },
});

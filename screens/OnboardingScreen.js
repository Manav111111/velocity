import React, { useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  Dimensions, Animated, StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const STATS = [
  { value: '10\'', label: 'Delivery' },
  { value: '5K+', label: 'Products' },
  { value: '4.9★', label: 'Rating' },
];

export default function OnboardingScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scooterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scooterAnim, { toValue: -8, duration: 800, useNativeDriver: true }),
        Animated.timing(scooterAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

      {/* ── Hero Section ── */}
      <LinearGradient
        colors={['#1E1B4B', '#2D1B69', '#4C1D95']}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative orbs */}
        <View style={styles.orb1} />
        <View style={styles.orb2} />

        {/* Live badge */}
        <Animated.View style={[styles.liveBadge, { opacity: fadeAnim }]}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>10 min delivery</Text>
        </Animated.View>

        {/* Scooter emoji */}
        <Animated.Text
          style={[styles.scooterEmoji, { transform: [{ translateY: scooterAnim }] }]}
        >
          🛵
        </Animated.Text>

        {/* Flash tag */}
        <View style={styles.flashTag}>
          <MaterialIcons name="bolt" size={12} color="#6EE7B7" />
          <Text style={styles.flashTagText}>LIGHTNING FAST</Text>
        </View>
      </LinearGradient>

      {/* ── Body ── */}
      <Animated.View
        style={[styles.body, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        {/* Dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Text style={styles.title}>
          Fresh groceries{'\n'}
          <Text style={styles.titleAccent}>at lightning speed</Text>
        </Text>
        <Text style={styles.desc}>
          Get farm-fresh produce, pantry essentials & daily needs delivered to your door — in under 10 minutes.
        </Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {STATS.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.getStartedBtn}
          onPress={() => navigation.replace('Login')}
          activeOpacity={0.88}
        >
          <Text style={styles.getStartedText}>Get started</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity onPress={() => navigation.replace('Home')} activeOpacity={0.6}>
          <Text style={styles.skipText}>SKIP FOR NOW</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },

  // Hero
  hero: {
    height: height * 0.46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(167,139,250,0.18)', top: -60, right: -60,
  },
  orb2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(124,58,237,0.2)', bottom: -30, left: -40,
  },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    marginBottom: 24,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#34D399' },
  liveBadgeText: { fontSize: 12, color: '#C4B5FD', fontWeight: '600' },
  scooterEmoji: { fontSize: 90, marginBottom: 10 },
  flashTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(52,211,153,0.12)',
    borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  flashTagText: { fontSize: 10, color: '#6EE7B7', fontWeight: '700', letterSpacing: 1.2 },

  // Body
  body: {
    flex: 1, backgroundColor: '#ffffff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -20, paddingHorizontal: 28, paddingTop: 30, paddingBottom: 20,
  },
  dotsRow: { flexDirection: 'row', gap: 6, marginBottom: 22 },
  dot: { width: 8, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0' },
  dotActive: { width: 24, backgroundColor: '#7C3AED' },

  title: { fontSize: 30, fontWeight: '800', color: '#0F172A', lineHeight: 38, marginBottom: 12 },
  titleAccent: { color: '#7C3AED' },
  desc: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 24 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1, backgroundColor: '#FAFAF9',
    borderRadius: 16, borderWidth: 0.5, borderColor: '#E2E8F0',
    paddingVertical: 14, alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#7C3AED', marginBottom: 2 },
  statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', letterSpacing: 0.5 },

  getStartedBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#7C3AED', borderRadius: 18, height: 54,
    marginBottom: 16,
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28, shadowRadius: 16, elevation: 10,
  },
  getStartedText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },

  skipText: {
    textAlign: 'center', fontSize: 12, fontWeight: '700',
    color: '#94A3B8', letterSpacing: 1.4,
  },
});
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header Title */}
      <Text style={styles.headerTitle}>
        Velocity<Text style={styles.headerPro}>Pro</Text>
      </Text>

      {/* Card */}
      <View style={styles.card}>
        {/* Live Tracking Badge */}
        <View style={styles.badge}>
          <View style={styles.badgeIcon}>
            <MaterialIcons name="bolt" size={18} color="#8b5cf6" />
          </View>
          <View>
            <Text style={styles.badgeTitle}>LIVE TRACKING</Text>
            <Text style={styles.badgeSubtitle}>Real-time status updates</Text>
          </View>
        </View>

        {/* Scooter Image */}
        <Image
          source={require('../assets/scooter.png')}
          style={styles.scooterImage}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>
        Ultra–Fast <Text style={styles.titleHighlight}>Delivery</Text>
      </Text>
      <Text style={styles.description}>
        Get your groceries and essentials in under{'\n'}10 minutes.
      </Text>



      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={() => navigation.replace('Login')}>
        <Text style={styles.nextButtonText}>Next  →</Text>
      </TouchableOpacity>

      {/* Skip */}
      <TouchableOpacity onPress={() => navigation.replace('Home')}>
        <Text style={styles.skipText}>SKIP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#8b5cf6', marginBottom: 20 },
  headerPro: { color: '#8b5cf6' },
  card: {
    width: width - 48, backgroundColor: '#f8fafc', borderRadius: 24, padding: 16, marginBottom: 32,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(139,92,246,0.05)',
    borderRadius: 12, padding: 10, marginBottom: 16, alignSelf: 'flex-start',
  },
  badgeIcon: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(139,92,246,0.1)',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  badgeTitle: { fontSize: 11, fontWeight: 'bold', color: '#8b5cf6', letterSpacing: 1 },
  badgeSubtitle: { fontSize: 12, color: '#64748b', marginTop: 1 },
  scooterImage: { width: '100%', height: 200, borderRadius: 12 },
  title: { fontSize: 34, fontWeight: '900', color: '#1e293b', textAlign: 'center', marginBottom: 10 },
  titleHighlight: { color: '#8b5cf6' },
  description: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  nextButton: {
    width: width - 64, height: 56, backgroundColor: '#8b5cf6', borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8,
  },
  nextButtonText: { fontSize: 17, fontWeight: '700', color: '#ffffff' },
  skipText: { fontSize: 13, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1.5 },
});

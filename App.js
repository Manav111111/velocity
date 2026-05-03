import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import OrdersScreen from './screens/OrdersScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import ProfileScreen from './screens/ProfileScreen';
import CartScreen from './screens/CartScreen';
import SignupScreen from './screens/SignupScreen';
import LocationScreen from './screens/LocationScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import FilterScreen from './screens/FilterScreen';
import WishlistScreen from './screens/WishlistScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import OrderSuccessScreen from './screens/OrderSuccessScreen';
import { AppProvider, useAppContext } from './context/AppContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { cartItemCount } = useAppContext();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);
  const tabBarHeight = 58 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          height: tabBarHeight,
          paddingBottom: Math.max(bottomInset, 6),
          paddingTop: 6,
          elevation: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
        },
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#16803C',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
          letterSpacing: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = 'home';
          else if (route.name === 'SearchTab') iconName = 'search';
          else if (route.name === 'CategoriesTab') iconName = 'grid-view';
          else if (route.name === 'CartTab') iconName = 'shopping-cart';
          else if (route.name === 'ProfileTab') iconName = 'person-outline';
          return <MaterialIcons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'HOME' }} />
      <Tab.Screen name="SearchTab" component={SearchScreen} options={{ tabBarLabel: 'SEARCH' }} />
      <Tab.Screen name="CategoriesTab" component={CategoriesScreen} options={{ tabBarLabel: 'CATEGORIES' }} />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: 'CART',
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#16803C', fontSize: 10, fontWeight: 'bold' },
        }}
      />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'PROFILE' }} />
    </Tab.Navigator>
  );
}

// Toast component
function Toast() {
  const { toastMessage } = useAppContext();
  const insets = useSafeAreaInsets();
  
  if (!toastMessage) return null;

  return (
    <View style={[styles.toastContainer, { bottom: Math.max(insets.bottom, 0) + 86 }]}>
      <View style={styles.toast}>
        <MaterialIcons name="check-circle" size={18} color="#10b981" />
        <Text style={styles.toastText}>{toastMessage}</Text>
      </View>
    </View>
  );
}

function AppContent() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Home" component={MainTabs} />
          <Stack.Screen name="Orders" component={OrdersScreen} />
          <Stack.Screen name="Location" component={LocationScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="Filter" component={FilterScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="Wishlist" component={WishlistScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ gestureEnabled: false }} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
});

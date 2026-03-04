import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { COLORS } from './src/constants/theme';

// Screens
import SearchScreen from './src/screens/SearchScreen';
import HotelDetailScreen from './src/screens/HotelDetailScreen';
import BookingScreen from './src/screens/BookingScreen';
import BookingConfirmScreen from './src/screens/BookingConfirmScreen';
import AdminDashboard from './src/screens/admin/AdminDashboard';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Public Stack (Search → Detail → Booking → Confirm)
const PublicStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="Search"
      component={SearchScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="HotelDetail"
      component={HotelDetailScreen}
      options={{ title: 'Detail Hotel' }}
    />
    <Stack.Screen
      name="Booking"
      component={BookingScreen}
      options={{ title: 'Booking' }}
    />
    <Stack.Screen
      name="BookingConfirm"
      component={BookingConfirmScreen}
      options={{ title: 'Konfirmasi', headerLeft: () => null }}
    />
  </Stack.Navigator>
);

// Main Tab Navigator
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.border,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarLabelStyle: { fontWeight: '600', fontSize: 12 },
        }}
      >
        <Tab.Screen
          name="Explore"
          component={PublicStack}
          options={{
            tabBarLabel: 'Cari Hotel',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🔍</Text>,
          }}
        />
        <Tab.Screen
          name="Admin"
          component={AdminDashboard}
          options={{
            tabBarLabel: 'Admin',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚙️</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/patient/HomeScreen';
import ServicesScreen from '../screens/patient/ServicesScreen';
import PatientProfileScreen from '../screens/patient/PatientProfileScreen';
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();

export default function PatientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.surface },
        headerShadowVisible: false,
        headerTitleStyle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 65,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Home: 'home-outline',
            Services: 'test-tube',
            Profile: 'account-circle-outline',
          };
          return (
            <MaterialCommunityIcons
              name={(icons[route.name] || 'circle') as any}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Profile" component={PatientProfileScreen} />
    </Tab.Navigator>
  );
}

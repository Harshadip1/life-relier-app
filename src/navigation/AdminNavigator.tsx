import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DashboardScreen from '../screens/admin/DashboardScreen';
import ExploreScreen from '../screens/admin/ExploreScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
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
            Dashboard: 'view-dashboard-outline',
            Explore: 'compass-outline',
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
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Profile" component={AdminProfileScreen} />
    </Tab.Navigator>
  );
}

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons }   from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

import PhlebotomistHomeScreen     from '../screens/phlebotomist/PhlebotomistHomeScreen';
import PhlebotomistSettingsScreen from '../screens/phlebotomist/PhlebotomistSettingsScreen';

const Tab = createBottomTabNavigator();

export default function PhlebotomistNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarIcon: ({ color, focused }) => {
          if (route.name === 'Samples')
            return <MaterialCommunityIcons name={focused ? 'test-tube' : 'test-tube-empty'} size={24} color={color} />;
          if (route.name === 'Settings')
            return <MaterialCommunityIcons name={focused ? 'cog' : 'cog-outline'} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Samples"  component={PhlebotomistHomeScreen}     options={{ title: 'Samples'  }} />
      <Tab.Screen name="Settings" component={PhlebotomistSettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import RefDoctorHomeScreen from '../screens/refdoctor/RefDoctorHomeScreen';
import BillsScreen         from '../screens/shared/BillsScreen';
import SharedReportsScreen from '../screens/shared/SharedReportsScreen';
import OffersScreen        from '../screens/shared/OffersScreen';

const Tab = createBottomTabNavigator();

export default function RefDoctorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle:        { fontSize: 11, fontWeight: '700', marginTop: 2 },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 64, paddingBottom: 8, paddingTop: 8,
          borderTopWidth: 1, borderTopColor: '#F1F5F9',
          elevation: 12, shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 10,
        },
      }}
    >
      <Tab.Screen
        name="MyPatients"
        component={RefDoctorHomeScreen}
        options={{
          title: 'Patients',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-group-outline" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Bills"
        component={BillsScreen}
        options={{
          title: 'Bills',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="receipt" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={SharedReportsScreen}
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => <Feather name="file-text" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Offers"
        component={OffersScreen}
        options={{
          title: 'Offers',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="tag-multiple-outline" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

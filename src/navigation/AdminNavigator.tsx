import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/admin/DashboardScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import NewRegistrationScreen from '../screens/admin/NewRegistrationScreen';
import PatientsScreen from '../screens/admin/PatientsScreen';
import SamplesScreen from '../screens/admin/SamplesScreen';
import ReportsScreen from '../screens/admin/ReportsScreen';
import PendingReportsScreen from '../screens/admin/PendingReportsScreen'; 
import DoctorManagementScreen from '../screens/admin/DoctorManagementScreen';
import AdminBookAppointmentScreen from '../screens/admin/AdminBookAppointmentScreen';
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="NewRegistration" component={NewRegistrationScreen} />
      <Stack.Screen name="PendingReports" component={PendingReportsScreen} />
      <Stack.Screen name="AdminBookAppointment" component={AdminBookAppointmentScreen} />
    </Stack.Navigator>
  );
}

function PatientsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientsMain" component={PatientsScreen} />
      <Stack.Screen name="NewRegistration" component={NewRegistrationScreen} />
    </Stack.Navigator>
  );
}

// 👇 Create a new Stack for the Profile Tab!
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={AdminProfileScreen} />
      {/* Now the Profile Screen can open the Doctor Management Screen */}
      <Stack.Screen name="DoctorManagement" component={DoctorManagementScreen} />
    </Stack.Navigator>
  );
}

const PlaceholderScreen = ({ route }: any) => (
  <View style={styles.placeholder}>
    <Ionicons name="construct-outline" size={50} color={COLORS.primary} />
    <Text style={styles.placeholderText}>{route.name} Screen</Text>
    <Text style={styles.placeholderSub}>Coming soon...</Text>
  </View>
);

export default function AdminNavigator() {
  
  const getTabBarStyle = (route: any) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? '';

    if (
      routeName !== '' && 
      routeName !== 'DashboardMain' && 
      routeName !== 'PatientsMain' && 
      routeName !== 'SamplesMain' && 
      routeName !== 'ReportsMain' && 
      routeName !== 'ProfileMain'
    ) {
      return { display: 'none' as const };
    }

    return {
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#F1F5F9',
      height: 65,
      paddingBottom: 8,
      paddingTop: 8,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
    };
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: getTabBarStyle(route),
        tabBarActiveTintColor: COLORS.primary || '#0D9488',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 4 },
        tabBarIcon: ({ color, focused }) => {
          let iconName: any = 'circle';
          switch (route.name) {
            case 'Dashboard': iconName = focused ? 'home' : 'home-outline'; break;
            case 'Patients': iconName = focused ? 'people' : 'people-outline'; break;
            case 'Samples': iconName = focused ? 'flask' : 'flask-outline'; break;
            case 'Reports': iconName = focused ? 'document-text' : 'document-text-outline'; break;
            case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Patients" component={PatientsStack} />
      <Tab.Screen name="Samples" component={SamplesScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      {/* 👇 Hook up the Profile Stack here */}
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  placeholderText: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginTop: 12 },
  placeholderSub: { fontSize: 14, color: '#64748B', marginTop: 4 }
});
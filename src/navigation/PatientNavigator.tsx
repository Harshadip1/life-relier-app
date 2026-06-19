import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Dimensions } from 'react-native';
// Import your actual screens
import HomeScreen from '../screens/patient/HomeScreen';
import ServicesScreen from '../screens/patient/ServicesScreen';
import PatientProfileScreen from '../screens/patient/PatientProfileScreen';
import PersonalInfoScreen from '../screens/patient/PersonalInfoScreen';
import MyBookingsScreen from '../screens/patient/MyBookingsScreen';
import PaymentsScreen from '../screens/patient/PaymentsScreen';
import ReportsScreen from '../screens/patient/ReportsScreen';
import ScheduleCollectionScreen from '../screens/patient/ScheduleCollectionScreen';

import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const screenWidth = Dimensions.get('window').width;

// Stack for Home tab
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
      <Stack.Screen name="ScheduleCollection" component={ScheduleCollectionScreen} />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
    </Stack.Navigator>
  );
}

// Stack for Reports tab
function ReportsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReportsMain" component={ReportsScreen} />
      <Stack.Screen name="Services" component={ServicesScreen} />
    </Stack.Navigator>
  );
}

// Stack for Profile tab
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={PatientProfileScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
      <Stack.Screen name="ScheduleCollection" component={ScheduleCollectionScreen} />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
    </Stack.Navigator>
  );
}

export default function PatientNavigator() {
  
  // ─── DYNAMIC TAB BAR LOGIC ───
  const getTabBarStyle = (route: any) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? '';

    // If we navigate deeper than the main screens, hide the tab bar completely
    if (routeName !== '' && routeName !== 'HomeMain' && routeName !== 'ReportsMain' && routeName !== 'ProfileMain') {
      return { display: 'none' as const };
    }

    // Exact floating pill styling
    return {
      position: 'absolute' as const,
      bottom: 15,          
      
      // 👇 THE ULTIMATE FIX: Exact physical pixels instead of percentages
      width: screenWidth - 40, // Total screen width minus 20px for each side
      left: 20,                // Push exactly 20px from the left wall
      
      backgroundColor: '#FFFFFF',
      borderRadius: 40,    
      height: 70,          
      borderTopWidth: 0,   
      paddingBottom: 0,
      
      elevation: 8,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
    };
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        
        // 👇 FIX 1: This stops React Navigation from squishing the bottom of the pill!
        safeAreaInsets: { bottom: 0 }, 
        
        tabBarStyle: {
          position: 'absolute' as const,
          
          // 👇 FIX 2: Push it higher so it escapes the phone's physical bezel
          bottom: 10,          
          
          width: screenWidth - 40,
          left: 20, 
          
          backgroundColor: '#FFFFFF',
          borderRadius: 40,    
          height: 70,          
          borderTopWidth: 0,   
          paddingBottom: 0,
          
          elevation: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 15,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 12,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { 
          fontSize: 12, 
          fontWeight: '700', 
          marginTop: 4 
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Reports') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          
          return <Ionicons name={iconName} size={26} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Reports" component={ReportsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

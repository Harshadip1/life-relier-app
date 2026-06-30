import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import your actual screens
import HomeScreen from '../screens/patient/HomeScreen';
import ServicesScreen from '../screens/patient/ServicesScreen';
import PatientProfileScreen from '../screens/patient/PatientProfileScreen';
import PersonalInfoScreen from '../screens/patient/PersonalInfoScreen';
import MyBookingsScreen from '../screens/patient/BookingTests';
import PaymentsScreen from '../screens/patient/PaymentsScreen';
import ReportsScreen from '../screens/patient/ReportsScreen';
import ScheduleCollectionScreen from '../screens/patient/ScheduleCollectionScreen';
import BookAppointmentScreen from '../screens/patient/BookAppointmentScreen';

import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack for Home tab
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
      <Stack.Screen name="ScheduleCollection" component={ScheduleCollectionScreen} />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
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

    // ─── STANDARD FLAT TAB BAR ───
    return {
      backgroundColor: '#FFFFFF',
      height: 65,          
      borderTopWidth: 1,
      borderTopColor: '#F1F5F9', // Clean, subtle line separating it from content
      paddingBottom: 8,          // Slight padding for modern phones
      paddingTop: 8,
      elevation: 10,
      shadowColor: '#000000',
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
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
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
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
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

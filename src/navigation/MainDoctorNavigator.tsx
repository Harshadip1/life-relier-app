import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import MainDoctorHomeScreen from '../screens/doctor/MainDoctorHomeScreen';
import ReportingMenuScreen from '../screens/doctor/ReportingMenuScreen';
import TestResultEntryScreen from '../screens/doctor/TestResultEntryScreen';
import AddResultWithTestParamScreen from '../screens/doctor/AddResultWithTestParamScreen';
import TATPatientWiseScreen from '../screens/doctor/TATPatientWiseScreen';
import DoctorSettingsScreen from '../screens/refdoctor/DoctorSettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const PRIMARY = '#0D9488';

function ReportingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReportingMenu" component={ReportingMenuScreen} />
      <Stack.Screen name="TestResultEntry" component={TestResultEntryScreen} />
      <Stack.Screen name="AddResultWithTestParam" component={AddResultWithTestParamScreen} />
      <Stack.Screen name="TATPatientWise" component={TATPatientWiseScreen} />
    </Stack.Navigator>
  );
}

export default function MainDoctorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
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
          if (route.name === 'Home') return <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} size={24} color={color} />;
          if (route.name === 'Reporting') return <MaterialCommunityIcons name={focused ? 'file-document-multiple' : 'file-document-multiple-outline'} size={24} color={color} />;
          if (route.name === 'Settings') return <MaterialCommunityIcons name={focused ? 'cog' : 'cog-outline'} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={MainDoctorHomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Reporting" component={ReportingStack} options={{ title: 'Reporting' }} />
      <Tab.Screen name="Settings" component={DoctorSettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

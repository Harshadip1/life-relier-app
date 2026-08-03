import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator }     from '@react-navigation/stack';
import { MaterialCommunityIcons }   from '@expo/vector-icons';

import DoctorAppointmentsScreen  from '../screens/refdoctor/DoctorAppointmentsScreen';
import ConsultationDetailScreen  from '../screens/refdoctor/ConsultationDetailScreen';
import RefPatientsScreen         from '../screens/refdoctor/RefPatientsScreen';
import RefReportsScreen          from '../screens/refdoctor/RefReportsScreen';
import DoctorSettingsScreen     from '../screens/refdoctor/DoctorSettingsScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();
const PRIMARY = '#0D9488';

// ── Today's Appointments + Consultation Detail stack ──────────────────────────
function AppointmentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TodaysAppointments" component={DoctorAppointmentsScreen} />
      <Stack.Screen name="ConsultationDetail" component={ConsultationDetailScreen} />
    </Stack.Navigator>
  );
}

// ── Patients stack (history + profile + consultation) ──────────────────────────
function PatientsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyPatients" component={RefPatientsScreen} />
      <Stack.Screen name="ConsultationDetail" component={ConsultationDetailScreen} />
    </Stack.Navigator>
  );
}

export default function RefDoctorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   PRIMARY,
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
          if (route.name === 'Today')    return <MaterialCommunityIcons name={focused ? 'calendar-today' : 'calendar-today-outline'} size={24} color={color} />;
          if (route.name === 'Patients') return <MaterialCommunityIcons name={focused ? 'account-group' : 'account-group-outline'} size={24} color={color} />;
          if (route.name === 'Reports')  return <MaterialCommunityIcons name={focused ? 'file-document' : 'file-document-outline'} size={24} color={color} />;
          if (route.name === 'Settings') return <MaterialCommunityIcons name={focused ? 'cog' : 'cog-outline'} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Today"    component={AppointmentsStack}    options={{ title: "Today's Appointments" }} />
      <Tab.Screen name="Patients" component={PatientsStack}        options={{ title: "My Patients" }} />
      <Tab.Screen name="Reports"  component={RefReportsScreen}     options={{ title: "Test Reports" }} />
      <Tab.Screen name="Settings" component={DoctorSettingsScreen} options={{ title: "Settings" }} />
    </Tab.Navigator>
  );
}

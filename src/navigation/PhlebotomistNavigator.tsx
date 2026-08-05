import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator }     from '@react-navigation/stack';
import { MaterialCommunityIcons }   from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { COLORS } from '../utils/constants';

import PhlebotomistHomeScreen     from '../screens/phlebotomist/PhlebotomistHomeScreen';
import PhlebotomistSettingsScreen from '../screens/phlebotomist/PhlebotomistSettingsScreen';
import FliboFrontDeskScreen       from '../screens/phlebotomist/FliboFrontDeskScreen';

import NewRegistrationScreen      from '../screens/admin/NewRegistrationScreen';
import PatientsScreen             from '../screens/admin/PatientsScreen';
import EditPatientScreen          from '../screens/admin/EditPatientScreen';
import ShowAppointmentScreen      from '../screens/admin/ShowAppointmentScreen';
import SearchAvailableSlotsScreen from '../screens/admin/SearchAvailableSlotsScreen';
import CompletedReportsScreen     from '../screens/admin/CompletedReportsScreen';
import PendingReportsScreen       from '../screens/admin/PendingReportsScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const TAB_ROOTS = new Set(['SamplesMain', 'FrontDeskMain', 'SettingsMain']);

function getTabStyle(route: any) {
  const name = getFocusedRouteNameFromRoute(route) ?? '';
  if (name !== '' && !TAB_ROOTS.has(name)) return { display: 'none' as const };
  return {
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
  };
}

// ── SAMPLES STACK ─────────────────────────────────────────────────────────────
function SamplesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SamplesMain" component={PhlebotomistHomeScreen} />
    </Stack.Navigator>
  );
}

// ── FRONT DESK STACK (Register + Appointments + Billing + Reports) ────────────
function FrontDeskStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Root — Front Desk landing page */}
      <Stack.Screen name="FrontDeskMain"        component={FliboFrontDeskScreen} />
      <Stack.Screen name="NewRegistration"      component={NewRegistrationScreen} />
      <Stack.Screen name="PatientStatus"        component={PatientsScreen} />
      <Stack.Screen name="EditPatient"          component={EditPatientScreen} />
      <Stack.Screen name="Appointments"         component={ShowAppointmentScreen} />
      <Stack.Screen name="SearchAvailableSlots" component={SearchAvailableSlotsScreen} />
      <Stack.Screen name="Reports"              component={CompletedReportsScreen} />
      <Stack.Screen name="PendingReports"       component={PendingReportsScreen} />
      <Stack.Screen name="Billing"              component={PatientsScreen} />
    </Stack.Navigator>
  );
}

// ── ROOT TAB NAVIGATOR ────────────────────────────────────────────────────────
export default function PhlebotomistNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        tabBarStyle: getTabStyle(route),
        tabBarIcon: ({ color, focused }) => {
          switch (route.name) {
            case 'Samples':
              return <MaterialCommunityIcons name={focused ? 'test-tube' : 'test-tube-empty'} size={24} color={color} />;
            case 'FrontDesk':
              return <MaterialCommunityIcons name={focused ? 'desk' : 'desk'} size={24} color={color} />;
            case 'Settings':
              return <MaterialCommunityIcons name={focused ? 'cog' : 'cog-outline'} size={24} color={color} />;
            default:
              return <MaterialCommunityIcons name="circle-outline" size={24} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Samples"   component={SamplesStack}              options={{ title: 'Samples'    }} />
      <Tab.Screen name="FrontDesk" component={FrontDeskStack}            options={{ title: 'Front Desk' }} />
      <Tab.Screen name="Settings"  component={PhlebotomistSettingsScreen} options={{ title: 'Settings'   }} />
    </Tab.Navigator>
  );
}

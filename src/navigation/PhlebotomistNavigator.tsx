import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator }     from '@react-navigation/stack';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { COLORS } from '../utils/constants';

// Flibo home (samples)
import PhlebotomistHomeScreen     from '../screens/phlebotomist/PhlebotomistHomeScreen';
import PhlebotomistSettingsScreen from '../screens/phlebotomist/PhlebotomistSettingsScreen';

// Reuse admin screens
import NewRegistrationScreen  from '../screens/admin/NewRegistrationScreen';
import PatientsScreen         from '../screens/admin/PatientsScreen';
import EditPatientScreen      from '../screens/admin/EditPatientScreen';
import ShowAppointmentScreen  from '../screens/admin/ShowAppointmentScreen';
import SearchAvailableSlotsScreen from '../screens/admin/SearchAvailableSlotsScreen';
import CompletedReportsScreen from '../screens/admin/CompletedReportsScreen';
import PendingReportsScreen   from '../screens/admin/PendingReportsScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// Screens that should show the tab bar
const TAB_ROOTS = new Set([
  'SamplesMain', 'RegistrationMain', 'AppointmentsMain', 'BillingMain', 'ReportsMain',
]);

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

// ── 1. SAMPLES STACK ─────────────────────────────────────────────────────────
function SamplesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SamplesMain"         component={PhlebotomistHomeScreen} />
      <Stack.Screen name="NewRegistration"     component={NewRegistrationScreen} />
      <Stack.Screen name="Appointments"        component={ShowAppointmentScreen} />
      <Stack.Screen name="SearchAvailableSlots" component={SearchAvailableSlotsScreen} />
      <Stack.Screen name="Reports"             component={CompletedReportsScreen} />
      <Stack.Screen name="PendingReports"      component={PendingReportsScreen} />
      <Stack.Screen name="Billing"             component={PatientsScreen} />
      <Stack.Screen name="EditPatient"         component={EditPatientScreen} />
    </Stack.Navigator>
  );
}

// ── 2. REGISTRATION STACK ────────────────────────────────────────────────────
function RegistrationStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RegistrationMain" component={PatientsScreen} />
      <Stack.Screen name="NewRegistration"  component={NewRegistrationScreen} />
      <Stack.Screen name="EditPatient"      component={EditPatientScreen} />
    </Stack.Navigator>
  );
}

// ── 3. APPOINTMENTS STACK ────────────────────────────────────────────────────
function AppointmentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppointmentsMain"      component={ShowAppointmentScreen} />
      <Stack.Screen name="SearchAvailableSlots"  component={SearchAvailableSlotsScreen} />
      <Stack.Screen name="NewRegistration"       component={NewRegistrationScreen} />
    </Stack.Navigator>
  );
}

// ── 4. BILLING STACK ─────────────────────────────────────────────────────────
function BillingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BillingMain"     component={PatientsScreen} />
      <Stack.Screen name="NewRegistration" component={NewRegistrationScreen} />
      <Stack.Screen name="EditPatient"     component={EditPatientScreen} />
    </Stack.Navigator>
  );
}

// ── 5. REPORTS STACK ─────────────────────────────────────────────────────────
function ReportsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReportsMain"    component={CompletedReportsScreen} />
      <Stack.Screen name="PendingReports" component={PendingReportsScreen} />
    </Stack.Navigator>
  );
}

// ── ROOT NAVIGATOR ────────────────────────────────────────────────────────────
export default function PhlebotomistNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
        tabBarStyle: getTabStyle(route),
        tabBarIcon: ({ color, focused }) => {
          switch (route.name) {
            case 'Samples':
              return <MaterialCommunityIcons name={focused ? 'test-tube' : 'test-tube-empty'} size={22} color={color} />;
            case 'Registration':
              return <MaterialCommunityIcons name={focused ? 'account-plus' : 'account-plus-outline'} size={22} color={color} />;
            case 'Appointments':
              return <MaterialCommunityIcons name={focused ? 'calendar-check' : 'calendar-check-outline'} size={22} color={color} />;
            case 'Billing':
              return <MaterialCommunityIcons name={focused ? 'receipt' : 'receipt-outline'} size={22} color={color} />;
            case 'Reports':
              return <MaterialCommunityIcons name={focused ? 'file-chart' : 'file-chart-outline'} size={22} color={color} />;
            case 'Settings':
              return <MaterialCommunityIcons name={focused ? 'cog' : 'cog-outline'} size={22} color={color} />;
            default:
              return <Feather name="circle" size={22} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Samples"      component={SamplesStack}       options={{ title: 'Samples' }} />
      <Tab.Screen name="Registration" component={RegistrationStack}  options={{ title: 'Register' }} />
      <Tab.Screen name="Appointments" component={AppointmentsStack}  options={{ title: 'Appts' }} />
      <Tab.Screen name="Billing"      component={BillingStack}       options={{ title: 'Billing' }} />
      <Tab.Screen name="Reports"      component={ReportsStack}        options={{ title: 'Reports' }} />
      <Tab.Screen name="Settings"     component={PhlebotomistSettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator }     from '@react-navigation/stack';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

import PhlebotomistHomeScreen        from '../screens/phlebotomist/PhlebotomistHomeScreen';
import PhlebotomistAppointmentsScreen from '../screens/phlebotomist/PhlebotomistAppointmentsScreen';
import PhlebotomistCollectionScreen   from '../screens/phlebotomist/PhlebotomistCollectionScreen';
import PhlebotomistProfileScreen      from '../screens/phlebotomist/PhlebotomistProfileScreen';
import SampleCollectionScreen         from '../screens/phlebotomist/SampleCollectionScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PhleboHomeMain"        component={PhlebotomistHomeScreen} />
      <Stack.Screen name="PhleboAppointments"    component={PhlebotomistAppointmentsScreen} />
      <Stack.Screen name="PhleboCollection"      component={PhlebotomistCollectionScreen} />
      <Stack.Screen name="SampleCollection"      component={SampleCollectionScreen} />
    </Stack.Navigator>
  );
}

function AppointmentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PhleboAppointmentsMain" component={PhlebotomistAppointmentsScreen} />
      <Stack.Screen name="SampleCollection"       component={SampleCollectionScreen} />
    </Stack.Navigator>
  );
}

function CollectionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PhleboCollectionMain" component={PhlebotomistCollectionScreen} />
      <Stack.Screen name="SampleCollection"     component={SampleCollectionScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PhleboProfileMain" component={PhlebotomistProfileScreen} />
    </Stack.Navigator>
  );
}

export default function PhlebotomistNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
        },
        tabBarIcon: ({ color, focused }) => {
          switch (route.name) {
            case 'Home':
              return <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} size={22} color={color} />;
            case 'Appointments':
              return <MaterialCommunityIcons name={focused ? 'calendar-check' : 'calendar-check-outline'} size={22} color={color} />;
            case 'Collection':
              return <MaterialCommunityIcons name={focused ? 'test-tube' : 'test-tube-empty'} size={22} color={color} />;
            case 'Profile':
              return <MaterialCommunityIcons name={focused ? 'account-circle' : 'account-circle-outline'} size={22} color={color} />;
            default:
              return <Feather name="circle" size={22} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home"         component={HomeStack}         options={{ title: 'Home'         }} />
      <Tab.Screen name="Appointments" component={AppointmentsStack} options={{ title: 'Appointments' }} />
      <Tab.Screen name="Collection"   component={CollectionStack}   options={{ title: 'Collection'   }} />
      <Tab.Screen name="Profile"      component={ProfileStack}      options={{ title: 'Profile'      }} />
    </Tab.Navigator>
  );
}

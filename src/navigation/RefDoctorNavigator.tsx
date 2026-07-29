import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RefDoctorHomeScreen from '../screens/refdoctor/RefDoctorHomeScreen';

const Stack = createStackNavigator();

export default function RefDoctorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RefDoctorHome" component={RefDoctorHomeScreen} />
    </Stack.Navigator>
  );
}

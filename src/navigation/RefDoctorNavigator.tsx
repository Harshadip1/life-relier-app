import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import RefPatientsScreen from '../screens/refdoctor/RefPatientsScreen';
import RefBillsScreen    from '../screens/refdoctor/RefBillsScreen';
import RefReportsScreen  from '../screens/refdoctor/RefReportsScreen';
import RefOffersScreen   from '../screens/refdoctor/RefOffersScreen';
import { useAuth }       from '../context/AuthContext';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();
const PRIMARY = '#0D9488';

// ── Header shared by all ref doctor tabs ──────────────────────────────────────
function RefDoctorHeader() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good Morning 🌅' : h < 17 ? 'Good Afternoon ☀️' : 'Good Evening 🌆';

  return (
    <View style={[hdr.band, { paddingTop: Math.max(insets.top, 14) }]}>
      <View style={{ flex: 1 }}>
        <Text style={hdr.greeting}>{greeting}</Text>
        <Text style={hdr.name}>{user?.name || 'Doctor'}</Text>
      </View>
      <TouchableOpacity style={hdr.iconBtn} onPress={() => logout()}>
        <Feather name="log-out" size={18} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const hdr = StyleSheet.create({
  band:    { backgroundColor: PRIMARY, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'flex-end' },
  greeting:{ fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  name:    { fontSize: 20, fontWeight: '800', color: '#FFF', marginTop: 2 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
});

export default function RefDoctorNavigator() {
  return (
    <>
      <RefDoctorHeader />
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
            if (route.name === 'Patients') return <MaterialCommunityIcons name={focused ? 'account-group' : 'account-group-outline'} size={24} color={color} />;
            if (route.name === 'Bills')    return <MaterialCommunityIcons name={focused ? 'receipt' : 'receipt-outline'} size={24} color={color} />;
            if (route.name === 'Reports')  return <MaterialCommunityIcons name={focused ? 'file-document' : 'file-document-outline'} size={24} color={color} />;
            if (route.name === 'Offers')   return <MaterialCommunityIcons name={focused ? 'gift' : 'gift-outline'} size={24} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Patients" component={RefPatientsScreen} />
        <Tab.Screen name="Bills"    component={RefBillsScreen}    />
        <Tab.Screen name="Reports"  component={RefReportsScreen}  />
        <Tab.Screen name="Offers"   component={RefOffersScreen}   />
      </Tab.Navigator>
    </>
  );
}

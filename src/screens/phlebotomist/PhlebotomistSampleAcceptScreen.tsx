import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const T = {
  primary: '#0D9488', tealDark: '#0F766E', tealBg: '#F0FDFA',
  bg: '#FFFFFF', screenBg: '#F8FAFC', text: '#0F172A',
  sub: '#64748B', muted: '#94A3B8', border: '#E2E8F0',
};

const ITEMS = [
  {
    label: 'Sample Collection',
    sub:   'Collect & accept samples from patients',
    icon:  'test-tube',
    color: '#0369A1', bg: '#F0F9FF', border: '#BAE6FD',
    screen: 'PhleboSampleCollection',
  },
  {
    label: 'Phlebo Status',
    sub:   'View patient collection status',
    icon:  'clipboard-pulse-outline',
    color: '#B45309', bg: '#FFFBEB', border: '#FDE68A',
    screen: 'PhleboStatusScreen',
  },
];

export default function PhlebotomistSampleAcceptScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 0) }]}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.iconBox}>
          <MaterialCommunityIcons name="test-tube" size={22} color="#FFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Sample Collection</Text>
          <Text style={s.headerSub}>Manage sample collection & status</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        {ITEMS.map(item => (
          <TouchableOpacity
            key={item.label}
            style={[s.card, { backgroundColor: item.bg, borderColor: item.border }]}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.75}
          >
            <View style={[s.cardIcon, { backgroundColor: '#FFF' }]}>
              <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.cardLabel, { color: item.color }]}>{item.label}</Text>
              <Text style={s.cardSub}>{item.sub}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={T.muted} />
          </TouchableOpacity>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: T.screenBg },
  header:    { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: T.primary, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  iconBox:   { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  list:      { padding: 16, gap: 12 },
  card:      { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  cardIcon:  { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  cardLabel: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  cardSub:   { fontSize: 12, color: T.sub },
});

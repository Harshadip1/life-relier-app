import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const T = {
  primary: '#0D9488', bg: '#FFFFFF', screenBg: '#F8FAFC',
  text: '#0F172A', sub: '#64748B', border: '#E2E8F0',
};

const OFFERS = [
  { id: '1', title: 'Full Body Checkup', subtitle: '65 tests included', discount: '20% OFF', price: '₹1,599', original: '₹1,999', color: '#0D9488', bg: '#F0FDFA' },
  { id: '2', title: 'Diabetes Care Package', subtitle: 'HbA1c, Blood Sugar, KFT', discount: '15% OFF', price: '₹849',  original: '₹999',  color: '#7C3AED', bg: '#F5F3FF' },
  { id: '3', title: 'Heart Health Package', subtitle: 'Lipid profile + ECG', discount: '25% OFF', price: '₹1,124', original: '₹1,499', color: '#DC2626', bg: '#FEF2F2' },
  { id: '4', title: 'Women Wellness', subtitle: '45 tests for women', discount: '10% OFF', price: '₹1,349', original: '₹1,499', color: '#DB2777', bg: '#FDF2F8' },
  { id: '5', title: 'Senior Citizen Panel', subtitle: 'Comprehensive for 60+', discount: '30% OFF', price: '₹699',  original: '₹999',  color: '#0369A1', bg: '#F0F9FF' },
];

export default function OffersScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[st.root, { paddingTop: Math.max(insets.top, 0) }]}>
      <View style={st.header}>
        <Text style={st.title}>Offers & Packages</Text>
        <Text style={st.sub}>Special discounts for patients</Text>
      </View>
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        {OFFERS.map(offer => (
          <TouchableOpacity key={offer.id} style={[st.card, { borderLeftColor: offer.color, borderLeftWidth: 4 }]} activeOpacity={0.85}>
            <View style={[st.iconBox, { backgroundColor: offer.bg }]}>
              <MaterialCommunityIcons name="tag-multiple-outline" size={24} color={offer.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.offerTitle}>{offer.title}</Text>
              <Text style={st.offerSub}>{offer.subtitle}</Text>
              <View style={st.priceRow}>
                <Text style={[st.price, { color: offer.color }]}>{offer.price}</Text>
                <Text style={st.original}>{offer.original}</Text>
              </View>
            </View>
            <View style={[st.discountBadge, { backgroundColor: offer.bg }]}>
              <Text style={[st.discountText, { color: offer.color }]}>{offer.discount}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root:         { flex: 1, backgroundColor: T.screenBg },
  header:       { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12, backgroundColor: T.bg, borderBottomWidth: 1, borderBottomColor: T.border },
  title:        { fontSize: 20, fontWeight: '800', color: T.text },
  sub:          { fontSize: 12, color: T.sub, marginTop: 2 },
  scroll:       { paddingHorizontal: 14, paddingTop: 14 },
  card:         { flexDirection: 'row', alignItems: 'center', backgroundColor: T.bg, borderRadius: 14, borderWidth: 1, borderColor: T.border, padding: 14, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  iconBox:      { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  offerTitle:   { fontSize: 15, fontWeight: '700', color: T.text, marginBottom: 2 },
  offerSub:     { fontSize: 12, color: T.sub, marginBottom: 6 },
  priceRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price:        { fontSize: 16, fontWeight: '800' },
  original:     { fontSize: 13, color: '#94A3B8', textDecorationLine: 'line-through' },
  discountBadge:{ paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  discountText: { fontSize: 12, fontWeight: '800' },
});

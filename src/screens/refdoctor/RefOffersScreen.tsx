import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const T = {
  primary: '#0D9488', tealDark: '#0F766E', tealBg: '#F0FDFA',
  bg: '#FFFFFF', screenBg: '#F8FAFC', text: '#0F172A',
  sub: '#64748B', muted: '#94A3B8', border: '#E2E8F0',
};

const OFFERS = [
  {
    id: '1', title: '20% Off on CBC',
    desc: 'Complete Blood Count at special rate for referred patients.',
    badge: '20% OFF', color: '#0369A1', bg: '#EFF6FF', border: '#BAE6FD',
    icon: 'flask-outline', validTill: '31 Aug 2026',
  },
  {
    id: '2', title: 'Free Thyroid Profile',
    desc: 'With every Lipid Profile test booked through your referral.',
    badge: 'FREE', color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0',
    icon: 'butterfly-outline', validTill: '15 Sep 2026',
  },
  {
    id: '3', title: '10% Referral Incentive',
    desc: 'Earn 10% on every patient billing for tests referred by you.',
    badge: '10% EARN', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
    icon: 'cash-multiple', validTill: '30 Sep 2026',
  },
  {
    id: '4', title: 'Priority Report Delivery',
    desc: 'Reports for your referred patients delivered within 4 hours.',
    badge: 'PRIORITY', color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA',
    icon: 'rocket-outline', validTill: 'Ongoing',
  },
  {
    id: '5', title: 'Bulk Referral Bonus',
    desc: 'Refer 10+ patients in a month and earn a special bonus.',
    badge: 'BONUS', color: T.tealDark, bg: T.tealBg, border: '#CCFBF1',
    icon: 'star-outline', validTill: 'Monthly',
  },
];

export default function RefOffersScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={s.header}>
        <Text style={s.title}>Offers & Benefits</Text>
        <Text style={s.sub2}>Exclusive for referral doctors</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={s.banner}>
          <MaterialCommunityIcons name="gift-outline" size={36} color="#FFF" style={{ marginBottom: 8 }} />
          <Text style={s.bannerTitle}>Your Referral Benefits</Text>
          <Text style={s.bannerSub}>Earn rewards and priority services for every patient you refer to Life Relier.</Text>
        </View>

        {/* Offer cards */}
        {OFFERS.map(offer => (
          <TouchableOpacity key={offer.id} style={[s.card, { borderColor: offer.border, backgroundColor: offer.bg }]} activeOpacity={0.8}>
            <View style={s.cardLeft}>
              <View style={[s.iconBox, { backgroundColor: '#FFF' }]}>
                <MaterialCommunityIcons name={offer.icon as any} size={22} color={offer.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={[s.offerTitle, { color: offer.color }]}>{offer.title}</Text>
                  <View style={[s.badge, { backgroundColor: offer.color }]}>
                    <Text style={s.badgeTxt}>{offer.badge}</Text>
                  </View>
                </View>
                <Text style={s.offerDesc}>{offer.desc}</Text>
                <Text style={[s.validity, { color: offer.color }]}>Valid till: {offer.validTill}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Contact banner */}
        <View style={s.contactCard}>
          <MaterialCommunityIcons name="headset" size={28} color={T.tealDark} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={s.contactTitle}>Need more info?</Text>
            <Text style={s.contactSub}>Contact Life Relier support for custom referral packages.</Text>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.screenBg },
  header:      { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  title:       { fontSize: 18, fontWeight: '800', color: T.text },
  sub2:        { fontSize: 12, color: T.sub, marginTop: 2 },
  scroll:      { paddingHorizontal: 16 },
  banner:      { backgroundColor: T.primary, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16, marginTop: 6 },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 6 },
  bannerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 19 },
  card:        { borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 12 },
  cardLeft:    { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox:     { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  offerTitle:  { fontSize: 14, fontWeight: '800', flex: 1 },
  badge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeTxt:    { fontSize: 9, fontWeight: '800', color: '#FFF' },
  offerDesc:   { fontSize: 12, color: T.sub, lineHeight: 17, marginBottom: 5 },
  validity:    { fontSize: 11, fontWeight: '600' },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.tealBg, borderRadius: 14, borderWidth: 1, borderColor: '#CCFBF1', padding: 16, marginTop: 4 },
  contactTitle:{ fontSize: 14, fontWeight: '700', color: T.tealDark, marginBottom: 2 },
  contactSub:  { fontSize: 12, color: T.sub, lineHeight: 17 },
});

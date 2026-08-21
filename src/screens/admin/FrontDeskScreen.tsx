import React, { useState } from 'react';
import { COLORS } from '../../utils/constants';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface ModuleItem {
  title:   string;
  sub:     string;
  icon:    string;
  fam:     string;
  color:   string;
  bg:      string;
  border:  string;
  screen:  string;
  future?: boolean;
}

const MODULES: ModuleItem[] = [
  {
    title:   'New Registration',
    sub:     'Register walk-in patients & create IDs',
    icon:    'user-plus',
    fam:     'feather',
    color:   '#0F766E',
    bg:      '#F0FDFA',
    border:  '#CCFBF1',
    screen:  'NewRegistration',
  },
  {
    title:   'Patient Status',
    sub:     'Track patient journey from registration to delivery',
    icon:    'account-clock-outline',
    fam:     'material',
    color:   '#1D4ED8',
    bg:      '#EFF6FF',
    border:  '#BFDBFE',
    screen:  'PatientStatus',
  },
  {
    title:   'Bill Payment',
    sub:     'Collect payments and generate receipts',
    icon:    'cash-register',
    fam:     'material',
    color:   '#15803D',
    bg:      '#F0FDF4',
    border:  '#BBF7D0',
    screen:  'BillPayment',
  },
];

export default function FrontDeskScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const T = { primary: COLORS.primary, bg: COLORS.background, card: COLORS.card, text: COLORS.textPrimary, sub: COLORS.textSecondary, muted: COLORS.textMuted, border: COLORS.cardBorder };
  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 0) }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Front Desk</Text>
          <Text style={styles.headerSub}>Patient registration & billing</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Feather name="bell" size={22} color={COLORS.textPrimary} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* ── Search Patient ── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={COLORS.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patient by name, ID or phone..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={styles.sectionTitle}>Modules</Text>

        {MODULES.map((m) => (
          <TouchableOpacity
            key={m.title}
            style={[styles.moduleCard, { borderLeftColor: m.color, borderLeftWidth: 4 }]}
            onPress={() => navigation.navigate(m.screen)}
            activeOpacity={0.75}
          >
            {/* Icon */}
            <View style={[styles.iconBox, { backgroundColor: m.bg }]}>
              {m.fam === 'feather'
                ? <Feather name={m.icon as any} size={22} color={m.color} />
                : <MaterialCommunityIcons name={m.icon as any} size={24} color={m.color} />}
            </View>

            {/* Text */}
            <View style={styles.moduleText}>
              <View style={styles.moduleTitleRow}>
                <Text style={styles.moduleTitle}>{m.title}</Text>
                {m.future && (
                  <View style={styles.futureBadge}>
                    <Text style={styles.futureBadgeText}>Soon</Text>
                  </View>
                )}
              </View>
              <Text style={styles.moduleSub}>{m.sub}</Text>
            </View>

            {/* Arrow */}
            <View style={[styles.arrowBox, { backgroundColor: m.bg }]}>
              <Feather name="chevron-right" size={18} color={m.color} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  headerSub:   { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  notifBtn: { position: 'relative', padding: 6 },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: COLORS.card },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceVariant, borderRadius: 12, paddingHorizontal: 14, height: 46 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  scroll: { padding: 14, paddingBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  moduleCard: { backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.cardBorder, flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, marginBottom: 10, elevation: 1, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  moduleText: { flex: 1 },
  moduleTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  moduleTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  moduleSub:   { fontSize: 11.5, color: COLORS.textSecondary, lineHeight: 17 },
  futureBadge: { backgroundColor: '#FEF3C7', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, marginLeft: 7 },
  futureBadgeText: { fontSize: 9, fontWeight: '800', color: '#92400E' },
  arrowBox: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
});

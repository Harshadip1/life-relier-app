import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

/**
 * Generic placeholder used for screens not yet implemented.
 * Pass `route.params.title` and optionally `route.params.icon` to customise.
 */
export default function PlaceholderScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const title: string = route?.params?.title ?? route?.name ?? 'Screen';
  const icon: string  = route?.params?.icon  ?? 'construct-outline';

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name={icon as any} size={54} color={COLORS.primary} />
        </View>
        <Text style={styles.comingTitle}>{title}</Text>
        <Text style={styles.comingSub}>This module is coming soon.</Text>
        <TouchableOpacity style={styles.backBtn2} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={16} color={COLORS.primary} />
          <Text style={styles.backBtn2Text}>Go Back</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 - Life Relier Infosoft Pvt Ltd</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },

  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconBox: {
    width: 100, height: 100, borderRadius: 20,
    backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, borderWidth: 1, borderColor: '#CCFBF1',
  },
  comingTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  comingSub: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  backBtn2: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.primary,
    borderRadius: 24, paddingHorizontal: 20, paddingVertical: 10, gap: 8,
  },
  backBtn2Text: { fontSize: 14, fontWeight: '700', color: COLORS.primary },

  footer: { backgroundColor: COLORS.primary, paddingVertical: 12, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#FFF', fontWeight: '500' },
});

import React from 'react';
import { COLORS } from '../../utils/constants';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function PlaceholderScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const title: string = route?.params?.title ?? route?.name ?? 'Screen';
  const icon: string  = route?.params?.icon  ?? 'construct-outline';

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, paddingTop: Math.max(insets.top, 10) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: COLORS.divider }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: '700', color: COLORS.textPrimary }}>{title}</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <View style={{ width: 100, height: 100, borderRadius: 20, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: COLORS.primary + '40' }}>
          <MaterialCommunityIcons name={icon as any} size={54} color={COLORS.primary} />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 }}>{title}</Text>
        <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>This module is coming soon.</Text>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 24, paddingHorizontal: 20, paddingVertical: 10, gap: 8 }} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={16} color={COLORS.primary} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>

      <View style={{ backgroundColor: COLORS.primary, paddingVertical: 12, alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: '#FFF', fontWeight: '500' }}>© 2026 - Life Relier Infosoft Pvt Ltd</Text>
      </View>
    </View>
  );
}

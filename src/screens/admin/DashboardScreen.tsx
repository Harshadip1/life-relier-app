import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>
      
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>
            Good Morning, <Text style={styles.adminText}>Admin</Text>
          </Text>
          <View style={styles.labNameRow}>
            <Text style={styles.labName}>CityCare Diagnostics Laboratory</Text>
            <MaterialCommunityIcons name="check-decagram" size={16} color="#0D9488" style={{ marginLeft: 4 }} />
          </View>
        </View>
        
        {/* Only the Notification Bell remains here */}
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
            <Feather name="bell" size={24} color="#0F172A" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>6</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ── Stats Grid (Perfectly Colored) ── */}
        <View style={styles.statsGrid}>
          <StatCard 
            value="48" 
            label="Today's Registrations" 
            icon="user-plus" 
            color="#0F766E"       
            bgColor="#CCFBF1"     
            valueColor="#0F766E"  
            cardBg="#F0FDFA"      
          />
          <StatCard 
            value="26" 
            label="Pending Collections" 
            icon="flask-outline" 
            iconFamily="material"
            color="#1D4ED8"       
            bgColor="#DBEAFE"     
            valueColor="#1D4ED8"  
            cardBg="#EFF6FF"      
          />
          <StatCard 
            value="14" 
            label="Pending Reports" 
            icon="file-text" 
            color="#C2410C"       
            bgColor="#FFEDD5"     
            valueColor="#C2410C"  
            cardBg="#FFF7ED"
            onPress={() => navigation.navigate('PendingReports')}      
          />
          <StatCard 
            value="₹42,560" 
            label="Today's Revenue" 
            icon="wallet-outline" 
            iconFamily="material"
            color="#15803D"       
            bgColor="#DCFCE7"     
            valueColor="#15803D"  
            cardBg="#F0FDF4"      
          />
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionCard label="New Registration" icon="user-plus" color="#0F766E" bgColor="#F0FDFA" onPress={() => navigation.navigate('NewRegistration')} />
          <QuickActionCard label="Sample Collection" icon="flask-outline" iconFamily="material" color="#1D4ED8" bgColor="#EFF6FF" onPress={() => navigation.navigate('SampleCollection')} />
          <QuickActionCard label="Result Entry" icon="clipboard-list-outline" iconFamily="material" color="#C2410C" bgColor="#FFF7ED" onPress={() => navigation.navigate('ResultEntry')} />
          <QuickActionCard label="Bill Payment" icon="currency-inr" iconFamily="material" color="#15803D" bgColor="#F0FDF4" onPress={() => navigation.navigate('BillPayment')} />
          <QuickActionCard label="Book Consult" icon="stethoscope" iconFamily="material" color="#4F46E5" bgColor="#EEF2FF"onPress={() => navigation.navigate('AdminBookAppointment')} />
        </View>
          

        {/* ── Recent Activity ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
        </View>
        <View style={styles.activityCard}>
          <ActivityItem 
            name="Rahul Sharma" action="Patient Registered" time="10:15 AM"
            icon="user-plus" color="#0D9488" bgColor="#F0FDFA"
            avatar="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop"
          />
          <ActivityItem 
            name="Priya Patil" action="Sample Collected" time="10:05 AM"
            icon="flask-outline" iconFamily="material" color="#3B82F6" bgColor="#EFF6FF"
            avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
          />
          <ActivityItem 
            name="Arjun Khan" action="Report Generated" time="09:45 AM"
            icon="file-text" color="#F97316" bgColor="#FFF7ED"
            avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
          />
          <ActivityItem 
            name="Sneha Joshi" action="Payment Received" time="09:20 AM"
            icon="currency-inr" iconFamily="material" color="#15803D" bgColor="#F0FDF4"
            avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"
            isLast
          />
        </View>

        {/* ── Critical Alerts ── */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Critical Alerts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.alertsScroll}>
          <AlertCard number="14" label="Pending\nReports" icon="file-alert-outline"
          onPress={() => navigation.navigate('PendingReports')}
          />
          <AlertCard number="3" label="Critical Test\nResults" icon="alert-triangle" iconFamily="feather" />
          <AlertCard number="5" label="Approval\nRequests" icon="account-alert-outline" />
        </ScrollView>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ─── Reusable Components ─────────────────────────────────────────────────────

function StatCard({ value, label, icon, iconFamily = 'feather', color, bgColor, valueColor, cardBg, onPress }: any) {
  return (
    <TouchableOpacity 
      style={[styles.statCard, { backgroundColor: cardBg, borderColor: bgColor }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.statIconBox, { backgroundColor: bgColor }]}>
        {iconFamily === 'feather' 
          ? <Feather name={icon} size={22} color={color} />
          : <MaterialCommunityIcons name={icon} size={24} color={color} />
        }
      </View>
      <View style={styles.statTextWrap}>
        <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

// 👇 Add onPress here
function QuickActionCard({ label, icon, iconFamily = 'feather', color, bgColor, onPress }: any) {
  return (
    // 👇 And add onPress={onPress} here
    <TouchableOpacity style={styles.qaCard} activeOpacity={0.7} onPress={onPress}>
      <View style={[styles.qaIconBox, { backgroundColor: bgColor }]}>
        {iconFamily === 'feather' 
          ? <Feather name={icon} size={20} color={color} />
          : <MaterialCommunityIcons name={icon} size={22} color={color} />
        }
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
      <Feather name="chevron-right" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
}

function ActivityItem({ name, action, time, avatar, icon, iconFamily = 'feather', color, bgColor, isLast }: any) {
  return (
    <View style={[styles.activityRow, !isLast && styles.activityBorder]}>
      <View style={styles.activityAvatarWrap}>
        <Image source={{ uri: avatar }} style={styles.activityAvatar} />
        <View style={[styles.activityIconBadge, { backgroundColor: bgColor }]}>
          {iconFamily === 'feather' 
            ? <Feather name={icon} size={10} color={color} />
            : <MaterialCommunityIcons name={icon} size={10} color={color} />
          }
        </View>
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityName}>{name}</Text>
        <Text style={styles.activityAction}>{action}</Text>
      </View>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  );
}

function AlertCard({ number, label, icon, iconFamily = 'material', onPress }: any) {
  return (
    // 👇 Added onPress here
    <TouchableOpacity style={styles.alertCard} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.alertIconBox}>
        {iconFamily === 'feather' 
          ? <Feather name={icon} size={24} color="#EF4444" />
          : <MaterialCommunityIcons name={icon} size={26} color="#EF4444" />
        }
      </View>
      <View style={styles.alertTextWrap}>
        <Text style={styles.alertNumber}>{number}</Text>
        <Text style={styles.alertLabel}>{label}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#EF4444" style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  headerLeft: { flex: 1 },
  greetingText: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  adminText: { color: '#0D9488' },
  labNameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  labName: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  bellBtn: { position: 'relative' },
  badge: { 
    position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', 
    width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#FAFAFA'
  },
  badgeText: { fontSize: 9, color: '#FFF', fontWeight: 'bold' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

  // Section Headers
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 14, marginTop: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 14 },
  viewAllText: { fontSize: 13, fontWeight: '600', color: '#0D9488' },

  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  statCard: { 
    width: '48%', borderRadius: 16, padding: 14, 
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, elevation: 0,
  },
  statIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  statTextWrap: { flex: 1 },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '500' },

  // Quick Actions
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  qaCard: { 
    width: '48%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, 
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#F1F5F9', elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6,
  },
  qaIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  qaLabel: { flex: 1, fontSize: 12, fontWeight: '600', color: '#0F172A' },

  // Recent Activity
  activityCard: { 
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#F1F5F9', elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6,
  },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  activityAvatarWrap: { position: 'relative', marginRight: 14 },
  activityAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E2E8F0' },
  activityIconBadge: { 
    position: 'absolute', bottom: -2, right: -4, width: 20, height: 20, borderRadius: 10, 
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF'
  },
  activityInfo: { flex: 1 },
  activityName: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  activityAction: { fontSize: 12, color: '#64748B' },
  activityTime: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },

  // Critical Alerts
  alertsScroll: { overflow: 'visible' },
  alertCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, marginRight: 12,
    borderWidth: 1, borderColor: '#FEE2E2', minWidth: 160,
  },
  alertIconBox: { marginRight: 12 },
  alertTextWrap: { flex: 1 },
  alertNumber: { fontSize: 20, fontWeight: '800', color: '#EF4444' },
  alertLabel: { fontSize: 11, color: '#64748B', fontWeight: '500', marginTop: 2 },
});
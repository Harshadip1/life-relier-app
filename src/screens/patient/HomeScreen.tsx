import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';


const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { id: 'reports', icon: 'file-document-plus-outline', label: 'View\nReports', color: '#0D9488', bg: '#F0FDFA' },
  { id: 'book', icon: 'flask-outline', label: 'Book\nTest', color: '#65A30D', bg: '#F7FEE7' },
  { id: 'pay', icon: 'credit-card-outline', label: 'Pay\nOnline', color: '#E11D48', bg: '#FFF1F2' },
  { id: 'contact', icon: 'phone-outline', label: 'Contact\nLab', color: '#7C3AED', bg: '#F5F3FF' },
];

const STEPS = [
  { id: 1, label: 'Registration\nComplete', date: '20 May 2025', status: 'done' },
  { id: 2, label: 'Sample\nCollected', date: '20 May 2025', status: 'done' },
  { id: 3, label: 'Report\nProcessing', date: '—', status: 'active' },
  { id: 4, label: 'Report\nReady', date: '—', status: 'pending' },
];

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const currentDate = 'Tuesday, 20 May 2025';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning, {user?.name?.split(' ')[0] || 'Patient'} 👋</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => {}}>
          <Ionicons name="notifications-outline" size={26} color="#1F2937" />
          <View style={styles.notifBadge}>
            <Text style={styles.notifBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>


      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Health Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconBox}>
              <MaterialCommunityIcons name="heart-pulse" size={20} color="#0D9488" />
            </View>
            <Text style={styles.summaryTitle}>Health Summary</Text>
          </View>
          
          <View style={styles.summaryGrid}>
            <SummaryItem icon="file-document-outline" value="12" label="Total Reports Available" color="#0D9488" />
            <View style={styles.vDivider} />
            <SummaryItem icon="clock-outline" value="2" label="Pending Reports" color="#0891B2" />
            <View style={styles.vDivider} />
            <SummaryItem icon="calendar-blank-outline" value="15 Jun 2025" label="Last Test Date" color="#0D9488" />
            <View style={styles.vDivider} />
            <SummaryItem icon="wallet-outline" value="₹1,250" label="Outstanding Balance" color="#E11D48" isDanger />
          </View>
          
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3233/3233486.png' }} 
            style={styles.summaryBgImage} 
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity key={action.id} style={styles.actionCard} onPress={() => {}}>
              <View style={[styles.actionIconBox, { backgroundColor: action.bg }]}>
                <MaterialCommunityIcons name={action.icon as any} size={28} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Reports */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
            <Text style={styles.viewAll}>View All <Feather name="chevron-right" size={14} /></Text>
          </TouchableOpacity>
        </View>

        <ReportItem 
          title="CBC Report" 
          date="15 Jun 2026" 
          icon="water-outline" 
          iconColor="#E11D48" 
          iconBg="#FFF1F2" 
        />
        <ReportItem 
          title="Thyroid Profile" 
          date="10 Jun 2026" 
          icon="rhombus-outline" 
          iconColor="#8B5CF6" 
          iconBg="#F5F3FF" 
        />

        {/* Booking Status */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Booking Status</Text>
        </View>
        <View style={styles.statusCard}>
          <View style={styles.stepperRow}>
            {STEPS.map((step, index) => (
              <View key={step.id} style={styles.stepContainer}>
                {index !== 0 && (
                  <View style={[
                    styles.connector, 
                    { backgroundColor: index <= 2 ? '#0D9488' : '#E2E8F0' }
                  ]} />
                )}
                <View style={[
                  styles.stepCircle, 
                  step.status === 'done' ? styles.circleDone : 
                  step.status === 'active' ? styles.circleActive : styles.circlePending
                ]}>
                  {step.status === 'done' ? (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  ) : step.status === 'active' ? (
                    <View style={styles.activeDot} />
                  ) : null}
                </View>
                <Text style={[styles.stepLabel, step.status === 'active' && { color: '#1F2937', fontWeight: '800' }]}>
                  {step.label}
                </Text>
                <Text style={styles.stepDate}>{step.date}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Appointment */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
        </View>
        <View style={styles.appointmentCard}>
          <View style={styles.aptMain}>
            <View style={styles.aptIconContainer}>
              <Ionicons name="home" size={24} color="#fff" />
            </View>
            <View style={styles.aptDetails}>
              <View style={styles.homeBadge}>
                <Text style={styles.homeBadgeText}>Home Collection</Text>
              </View>
              <Text style={styles.aptTitle}>Full Body Checkup</Text>
              <View style={styles.aptTimeRow}>
                <Feather name="calendar" size={14} color="#64748B" />
                <Text style={styles.aptTimeText}>22 May 2025 • 09:00 AM</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.hDivider} />
          
          <View style={styles.phleboRow}>
            <View>
              <Text style={styles.phleboLabel}>Assigned Phlebotomist</Text>
              <View style={styles.phleboInfo}>
                <View style={styles.phleboAvatar}>
                  <Feather name="user" size={16} color="#6366F1" />
                </View>
                <Text style={styles.phleboName}>Rizwan Ahmed</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ icon, value, label, color, isDanger }: any) {
  return (
    <View style={styles.summaryItem}>
      <View style={styles.summaryIconCircle}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.summaryValue, isDanger && { color: '#E11D48' }]}>{value}</Text>
      <Text style={styles.summaryLabelText}>{label}</Text>
    </View>
  );
}

function ReportItem({ title, date, icon, iconColor, iconBg }: any) {
  return (
    <View style={styles.reportCard}>
      <View style={[styles.reportIconBox, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.reportCardInfo}>
        <Text style={styles.reportCardTitle}>{title}</Text>
        <View style={styles.reportMetaRow}>
          <Text style={styles.reportCardDate}>{date}</Text>
          <View style={styles.readyBadge}>
            <Text style={styles.readyBadgeText}>Ready</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.viewReportBtn}>
        <Feather name="eye" size={16} color="#0D9488" />
        <Text style={styles.viewReportText}>View Report</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 25, // Increased from 10 to move content down
    paddingBottom: 25,
    backgroundColor: '#fff',
  },

  greeting: { fontSize: 20, fontWeight: '800', color: '#1F2937' },
  dateText: { fontSize: 13, color: '#64748B', marginTop: 2, fontWeight: '500' },
  notifBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  notifBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#0D9488', width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff',
  },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

  // Summary Card
  summaryCard: {
    backgroundColor: '#E0F2F1',
    borderRadius: 24,
    padding: 16,
    marginBottom: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  summaryIconBox: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  summaryGrid: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryIconCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  summaryValue: { fontSize: 14, fontWeight: '800', color: '#111827' },
  summaryLabelText: { fontSize: 8, color: '#64748B', textAlign: 'center', marginTop: 2, fontWeight: '600' },
  vDivider: { width: 1, height: 40, backgroundColor: '#F1F5F9', alignSelf: 'center' },
  summaryBgImage: { position: 'absolute', right: -10, top: -10, width: 80, height: 80, opacity: 0.15 },

  // Sections
  sectionHeader: { marginBottom: 15 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  viewAll: { fontSize: 13, color: '#0D9488', fontWeight: '700' },

  // Quick Actions
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  actionCard: {
    width: (width - 60) / 4,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
  },
  actionIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 11, fontWeight: '700', color: '#374151', textAlign: 'center' },

  // Report Items
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reportIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  reportCardInfo: { flex: 1 },
  reportCardTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  reportMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  reportCardDate: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  readyBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
  readyBadgeText: { fontSize: 10, color: '#166534', fontWeight: '800' },
  viewReportBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 6,
  },
  viewReportText: { fontSize: 12, fontWeight: '700', color: '#0D9488' },

  // Booking Status
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  stepperRow: { flexDirection: 'row', justifyContent: 'space-between', position: 'relative' },
  stepContainer: { flex: 1, alignItems: 'center' },
  connector: { position: 'absolute', top: 12, height: 3, width: '100%', left: '-50%', zIndex: 0 },
  stepCircle: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10, zIndex: 1,
  },
  circleDone: { backgroundColor: '#0D9488' },
  circleActive: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#0D9488' },
  circlePending: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#E2E8F0' },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fbbf24' },
  stepLabel: { fontSize: 9, color: '#64748B', textAlign: 'center', fontWeight: '600' },
  stepDate: { fontSize: 8, color: '#94A3B8', marginTop: 4, fontWeight: '700' },

  // Appointment Card
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 10,
  },
  aptMain: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  aptIconContainer: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#0D9488', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  aptDetails: { flex: 1 },
  homeBadge: { backgroundColor: '#0D9488', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 6 },
  homeBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  aptTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  aptTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  aptTimeText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  hDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 15 },
  phleboRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  phleboLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 6 },
  phleboInfo: { flexDirection: 'row', alignItems: 'center' },
  phleboAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  phleboName: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
});

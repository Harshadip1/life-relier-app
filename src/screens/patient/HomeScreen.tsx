import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  Linking,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import SectionHeader from '../../components/SectionHeader';
import ReportCard from '../../components/ReportCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { DUMMY_REPORTS } from '../../utils/dummy_data';
import { saveAppointment, updateAppointment, deleteAppointment } from '../../services/appointmentService';
import { ReportItem } from '../../utils/types';
import { SafeAreaView } from 'react-native-safe-area-context';

const QUICK_ACTIONS = [
  { id: 'reports', icon: 'file-document-plus', label: 'View\nReports', color: '#0D9488', bg: '#E0F2F1' },
  { id: 'book', icon: 'flask', label: 'Book\nTest', color: '#16A34A', bg: '#DCFCE7' },
  { id: 'pay', icon: 'credit-card', label: 'Pay\nOnline', color: '#EF4444', bg: '#FEE2E2' },
  { id: 'contact', icon: 'phone', label: 'Contact\nLab', color: '#8B5CF6', bg: '#EDE9FE' },
];

const BOOKING_STEPS = [
  { id: 1, label: 'Registration\nComplete', done: true, date: '20 May 2025' },
  { id: 2, label: 'Sample\nCollected', done: true, date: '20 May 2025' },
  { id: 3, label: 'Report\nProcessing', active: true, date: '—' },
  { id: 4, label: 'Report\nReady', done: false, date: '—' },
];

const AVAILABLE_TESTS = [
  { name: 'Lipid Panel', price: 600, duration: '24 hrs delivery', icon: 'heart-pulse' },
  { name: 'Blood Sugar (HbA1c)', price: 200, duration: '12 hrs delivery', icon: 'water-percent' },
  { name: 'Liver Function Test', price: 900, duration: '24 hrs delivery', icon: 'bottle-tonic-plus-outline' },
  { name: 'Vitamin D (25-Hydroxy)', price: 500, duration: '36 hrs delivery', icon: 'pill' },
  { name: 'Thyroid Profile (T3, T4, TSH)', price: 750, duration: '18 hrs delivery', icon: 'butterfly-outline' },
];

interface AppointmentItem {
  id: string;
  testName: string;
  date: string;
  collectionType: 'home' | 'lab';
  phlebotomist: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const [outstandingBalance, setOutstandingBalance] = useState(1250);
  const [upcomingTests, setUpcomingTests] = useState<AppointmentItem[]>([
    {
      id: 'appt_1',
      testName: 'Full Body Checkup',
      date: '22 May 2025 • 09:00 AM',
      collectionType: 'home',
      phlebotomist: 'Rizwan Ahmed',
    },
  ]);
  const [totalReportsCount, setTotalReportsCount] = useState(12);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);

  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [selectedTest, setSelectedTest] = useState<typeof AVAILABLE_TESTS[0] | null>(null);
  const [collectionType, setCollectionType] = useState<'home' | 'lab'>('home');
  const [bookingDate, setBookingDate] = useState('2026-06-18');
  const [bookingTime, setBookingTime] = useState('09:00 AM');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  // Patient detail fields for appointment
  const [apptFirstName, setApptFirstName] = useState('');
  const [apptLastName, setApptLastName]   = useState('');
  const [apptMobile, setApptMobile]       = useState('');
  const [apptAddress, setApptAddress]     = useState('');
  const [apptDob, setApptDob]             = useState('');
  const [apptGender, setApptGender]       = useState<1|2|3>(1);   // 1=Male 2=Female 3=Other
  const [apptInitial, setApptInitial]     = useState<1|2|3|4>(1); // 1=Mr 2=Mrs 3=Ms 4=Dr
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'net_banking'>('upi');
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }

  const greetingName = user?.name || user?.username || 'User';
  const displayDateStr = 'Tuesday, 20 May 2025';

  function handleQuickAction(actionId: string) {
    if (actionId === 'reports') {
      navigation.navigate('Reports');
    } else if (actionId === 'book') {
      
      navigation.navigate('MyBookings');
      
    } else if (actionId === 'pay') {
      if (outstandingBalance === 0) {
        Alert.alert('No Balance Due', 'Your outstanding balance is already ₹0. Thank you!');
      } else {
        setPayModalVisible(true);
      }
    } else if (actionId === 'contact') {
      setContactModalVisible(true);
    }
  }

  async function handleConfirmBooking() {
    if (!selectedTest) return;
    if (!apptFirstName.trim() || !apptLastName.trim() || !apptMobile.trim()) {
      Alert.alert('Missing Info', 'Please fill in First Name, Last Name and Mobile before confirming.');
      return;
    }
    setIsBookingSubmitting(true);
    try {
      const result = await saveAppointment({
        DrId: 20,
        FirstName: apptFirstName.trim(),
        LastName: apptLastName.trim(),
        Mobile: apptMobile.trim(),
        AppointmentDate: bookingDate,          // already "YYYY-MM-DD"
        Slot: bookingTime,
        Address: apptAddress.trim() || '',
        GenderId: apptGender,
        InitialId: apptInitial,
        BirthDate: apptDob || '1990-01-01',
        BranchId: Number(user?.branchID) || 1,
        CreatedBy: user?.username || 'App',
      });

      const newAppt: AppointmentItem = {
        id: `appt_${result.AppointmentId}`,
        testName: selectedTest.name,
        date: `${bookingDate} • ${bookingTime}`,
        collectionType,
        phlebotomist: collectionType === 'home' ? 'Amit Kumar' : 'Lab Front Desk',
      };
      setUpcomingTests([newAppt, ...upcomingTests]);
      setBookModalVisible(false);
      Alert.alert(
        '✅ Booking Confirmed!',
        `Appointment ID: ${result.AppointmentId}\nTest: ${selectedTest.name}\nDate: ${bookingDate} at ${bookingTime}`
      );
      // reset form
      setApptFirstName(''); setApptLastName(''); setApptMobile('');
      setApptAddress(''); setApptDob(''); setBookingStep(1); setSelectedTest(null);
    } catch (err: any) {
      Alert.alert('Booking Failed', err.message || 'Could not save appointment. Please try again.');
    } finally {
      setIsBookingSubmitting(false);
    }
  }

  async function handleDeleteAppointment(apptId: number) {
    Alert.alert(
      'Delete Appointment',
      `Are you sure you want to delete appointment #${apptId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAppointment({
                AppointmentId: apptId,
                BranchId: Number(user?.branchID) || 1,
              });
              setUpcomingTests((prev) => prev.filter((t) => t.id !== `appt_${apptId}`));
              Alert.alert('✅ Deleted', `Appointment #${apptId} deleted successfully.`);
            } catch (err: any) {
              Alert.alert('Delete Failed', err.message || 'Could not delete appointment.');
            }
          },
        },
      ]
    );
  }

  function handleConfirmPayment() {
    setIsPaymentSubmitting(true);
    setTimeout(() => {
      setOutstandingBalance(0);
      setIsPaymentSubmitting(false);
      setPayModalVisible(false);
      Alert.alert('Payment Successful!', '₹1,250 has been successfully paid. Your balance is now cleared.');
    }, 1500);
  }

  function handleDownloadPdf(reportName: string) {
    setIsDownloadingPdf(true);
    setTimeout(() => {
      setIsDownloadingPdf(false);
      Alert.alert('Success', `${reportName}_Report.pdf downloaded successfully to your device.`);
    }, 1500);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.content, { paddingBottom: 30 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Header */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Good Morning, {greetingName} 👋</Text>
            <Text style={styles.date}>{displayDateStr}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} activeOpacity={0.8} onPress={() => Alert.alert('Notifications', 'You have no new notifications.')}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#0F172A" />
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Health Summary Banner */}
        <LinearGradient
          colors={['#E6F4F8', '#CBECE8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerContainer}
        >
          {/* Banner Title Pill */}
          <View style={styles.bannerTitlePill}>
            <View style={styles.bannerTitleIconCircle}>
              <MaterialCommunityIcons name="heart-pulse" size={14} color="#0D9488" />
            </View>
            <Text style={styles.bannerTitle}>Health Summary</Text>
          </View>

          {/* 3D microscope image */}
          <Image
            source={require('../../../assets/microscope.png')}
            style={styles.microscopeImage}
            resizeMode="contain"
          />

          {/* Inner White Stats Card */}
          <View style={styles.bannerWhiteCard}>
            <View style={styles.bStat}>
              <View style={[styles.statIconCircle, { backgroundColor: '#E0F2F1' }]}>
                <MaterialCommunityIcons name="file-document-outline" size={16} color="#0D9488" />
              </View>
              <Text style={styles.bStatVal}>{totalReportsCount}</Text>
              <Text style={styles.bStatLabel}>Total Reports{'\n'}Available</Text>
            </View>

            <View style={styles.bDivider} />

            <View style={styles.bStat}>
              <View style={[styles.statIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#0284C7" />
              </View>
              <Text style={styles.bStatVal}>2</Text>
              <Text style={styles.bStatLabel}>Pending{'\n'}Reports</Text>
            </View>

            <View style={styles.bDivider} />

            <View style={styles.bStat}>
              <View style={[styles.statIconCircle, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons name="calendar-month-outline" size={16} color="#2E7D32" />
              </View>
              <Text style={styles.bStatVal}>15 Jun 2025</Text>
              <Text style={styles.bStatLabel}>Last Test{'\n'}Date</Text>
            </View>

            <View style={styles.bDivider} />

            <View style={styles.bStat}>
              <View style={[styles.statIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <MaterialCommunityIcons name="wallet-outline" size={16} color="#EF4444" />
              </View>
              <Text style={[styles.bStatVal, { color: outstandingBalance > 0 ? COLORS.danger : '#10B981' }]}>
                ₹{outstandingBalance.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.bStatLabel}>Outstanding{'\n'}Balance</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.quickRow}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.quickCard}
              activeOpacity={0.8}
              onPress={() => handleQuickAction(a.id)} 
            >
              <View style={[styles.quickIcon, { backgroundColor: a.bg }]}>
                <MaterialCommunityIcons name={a.icon as any} size={26} color={a.color} />
              </View>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Reports */}
        <SectionHeader title="Recent Reports" onViewAll={() => navigation.navigate('Reports')} />
        {DUMMY_REPORTS.filter((r) => r.status === 'ready').map((r) => (
          <ReportCard
            key={r.id}
            report={r}
            onView={() => {
              setSelectedReport(r);
              setReportModalVisible(true);
            }}
          />
        ))}

        {/* Booking Status */}
        <SectionHeader title="Booking Status" />
        <View style={styles.statusCard}>
          <View style={styles.statusTrack}>
            {BOOKING_STEPS.map((step, idx) => (
              <View key={step.id} style={styles.stepWrapper}>
                {idx > 0 && (
                  <View style={[
                    styles.stepLine,
                    (step.done || step.active) ? styles.stepLineDone : styles.stepLineEmpty
                  ]} />
                )}
                <View style={[
                  styles.stepCircle,
                  step.done ? styles.stepDone : step.active ? styles.stepActive : styles.stepEmpty,
                ]}>
                  {step.done
                    ? <MaterialCommunityIcons name="check" size={14} color="#fff" />
                    : step.active
                    ? <View style={styles.stepActiveDot} />
                    : null}
                </View>
                <Text style={[styles.stepLabel, step.active && styles.stepLabelActive]}>{step.label}</Text>
                <Text style={styles.stepDate}>{step.date}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Consult Doctor Button ── */}
<TouchableOpacity 
  style={styles.consultCard} 
  activeOpacity={0.8}
  // 👇 Here is exactly where the navigation goes!
  onPress={() => navigation.navigate('BookAppointment')}
>
  <View style={styles.consultCardLeft}>
    <Text style={styles.consultCardTitle}>Consult a Doctor</Text>
    <Text style={styles.consultCardSub}>Book a clinic appointment with our top specialists.</Text>
  </View>
  <View style={styles.consultIconBox}>
    <MaterialCommunityIcons name="stethoscope" size={32} color="#0F766E" />
  </View>
</TouchableOpacity>

        {/* Upcoming Appointment */}
        <SectionHeader title="Upcoming Appointment" />
        {upcomingTests.length === 0 ? (
          <View style={styles.noApptCard}>
            <Text style={styles.noApptText}>No upcoming appointments scheduled.</Text>
          </View>
        ) : (
          upcomingTests.map((t) => (
            <View key={t.id} style={styles.apptCard}>
              <View style={styles.apptLeft}>
                <View style={styles.apptIconBox}>
                  <MaterialCommunityIcons
                    name={t.collectionType === 'home' ? 'home' : 'hospital-building'}
                    size={28}
                    color="#fff"
                  />
                </View>
                <View style={styles.apptInfoCol}>
                  <View style={styles.apptBadge}>
                    <Text style={styles.apptBadgeText}>
                      {t.collectionType === 'home' ? 'Home Collection' : 'Lab Visit'}
                    </Text>
                  </View>
                  <Text style={styles.apptName}>{t.testName}</Text>
                  <View style={styles.apptDateRow}>
                    <MaterialCommunityIcons name="calendar-blank-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.apptDate}>{t.date}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.apptPhlebotomist}>
                <Text style={styles.apptPhlLabel}>
                  {t.collectionType === 'home' ? 'Assigned Phlebotomist' : 'Location'}
                </Text>
                <View style={styles.apptPhlRow}>
                  <View style={styles.apptPhlAvatar}>
                    <MaterialCommunityIcons
                      name={t.collectionType === 'home' ? 'account-outline' : 'map-marker-outline'}
                      size={16}
                      color={COLORS.textSecondary}
                    />
                  </View>
                  <Text style={styles.apptPhlName}>{t.phlebotomist}</Text>
                </View>
                {/* Edit & Delete action buttons */}
                <View style={styles.apptActionRow}>
                  <TouchableOpacity
                    style={styles.editApptBtn}
                    onPress={() => {
                      const idNum = parseInt(t.id.replace('appt_', '')) || 0;
                      setEditApptId(idNum);
                      setEditFirstName(''); setEditLastName(''); setEditMobile('');
                      setEditAddress(''); setEditDob('');
                      setEditDate('2026-06-18'); setEditSlot('09:00 AM');
                      setEditModalVisible(true);
                    }}
                  >
                    <MaterialCommunityIcons name="pencil-outline" size={13} color={COLORS.primary} />
                    <Text style={styles.editApptBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteApptBtn}
                    onPress={() => {
                      const idNum = parseInt(t.id.replace('appt_', '')) || 0;
                      handleDeleteAppointment(idNum);
                    }}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={13} color="#EF4444" />
                    <Text style={styles.deleteApptBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* ================= MODALS ================= */}
      {/* 1. VIEW REPORT DETAIL MODAL */}
      <Modal
        visible={reportModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.statIconCircle, { backgroundColor: '#E0F2F1', marginBottom: 0 }]}>
                  <MaterialCommunityIcons name="flask-outline" size={18} color="#0D9488" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>{selectedReport?.reportName}</Text>
                  <Text style={styles.modalSubtitle}>Patient: {greetingName} • Male, 25 yrs</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setReportModalVisible(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Date of Testing</Text>
                  <Text style={styles.metaVal}>{selectedReport?.date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Status</Text>
                  <Text style={[styles.metaVal, { color: '#10B981', fontWeight: 'bold' }]}>Completed / Ready</Text>
                </View>
              </View>

              <View style={styles.tableHeader}>
                <Text style={[styles.tableCol, { flex: 2, fontWeight: '700' }]}>Test Parameter</Text>
                <Text style={[styles.tableCol, { flex: 1, fontWeight: '700', textAlign: 'right' }]}>Result</Text>
                <Text style={[styles.tableCol, { flex: 1.2, fontWeight: '700', textAlign: 'right' }]}>Reference Range</Text>
              </View>

              {selectedReport?.reportName === 'CBC Report' && (
                <View>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCol, { flex: 2 }]}>Hemoglobin (Hb)</Text>
                    <Text style={[styles.tableCol, { flex: 1, fontWeight: 'bold', textAlign: 'right', color: '#0F172A' }]}>14.5 g/dL</Text>
                    <Text style={[styles.tableCol, { flex: 1.2, color: '#64748B', textAlign: 'right' }]}>13.0 - 17.0</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCol, { flex: 2 }]}>Red Blood Cell (RBC)</Text>
                    <Text style={[styles.tableCol, { flex: 1, fontWeight: 'bold', textAlign: 'right', color: '#0F172A' }]}>4.9 M/µL</Text>
                    <Text style={[styles.tableCol, { flex: 1.2, color: '#64748B', textAlign: 'right' }]}>4.5 - 5.5</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCol, { flex: 2 }]}>Platelet Count</Text>
                    <Text style={[styles.tableCol, { flex: 1, fontWeight: 'bold', textAlign: 'right', color: '#D97706' }]}>142,000 /µL ⬇</Text>
                    <Text style={[styles.tableCol, { flex: 1.2, color: '#64748B', textAlign: 'right' }]}>150k - 450k</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCol, { flex: 2 }]}>White Blood Cell (WBC)</Text>
                    <Text style={[styles.tableCol, { flex: 1, fontWeight: 'bold', textAlign: 'right', color: '#0F172A' }]}>7,200 /µL</Text>
                    <Text style={[styles.tableCol, { flex: 1.2, color: '#64748B', textAlign: 'right' }]}>4.0k - 11.0k</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCol, { flex: 2 }]}>Packed Cell Volume (PCV)</Text>
                    <Text style={[styles.tableCol, { flex: 1, fontWeight: 'bold', textAlign: 'right', color: '#0F172A' }]}>44.2 %</Text>
                    <Text style={[styles.tableCol, { flex: 1.2, color: '#64748B', textAlign: 'right' }]}>40.0 - 50.0</Text>
                  </View>
                </View>
              )}

              {selectedReport?.reportName === 'Thyroid Profile' && (
                <View>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCol, { flex: 2 }]}>T3 (Triiodothyronine)</Text>
                    <Text style={[styles.tableCol, { flex: 1, fontWeight: 'bold', textAlign: 'right', color: '#0F172A' }]}>1.2 ng/mL</Text>
                    <Text style={[styles.tableCol, { flex: 1.2, color: '#64748B', textAlign: 'right' }]}>0.8 - 2.0</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCol, { flex: 2 }]}>T4 (Thyroxine)</Text>
                    <Text style={[styles.tableCol, { flex: 1, fontWeight: 'bold', textAlign: 'right', color: '#0F172A' }]}>8.5 µg/dL</Text>
                    <Text style={[styles.tableCol, { flex: 1.2, color: '#64748B', textAlign: 'right' }]}>5.1 - 14.1</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCol, { flex: 2 }]}>TSH (Thyrotropin)</Text>
                    <Text style={[styles.tableCol, { flex: 1, fontWeight: 'bold', textAlign: 'right', color: '#DC2626' }]}>4.9 µIU/mL ⬆</Text>
                    <Text style={[styles.tableCol, { flex: 1.2, color: '#64748B', textAlign: 'right' }]}>0.5 - 4.5</Text>
                  </View>
                </View>
              )}

              <View style={styles.disclaimerBox}>
                <MaterialCommunityIcons name="information-outline" size={16} color="#475569" style={{ marginTop: 2 }} />
                <Text style={styles.disclaimerText}>
                  Please consult your doctor for diagnosis. Values flagged with arrows represent out-of-range parameters.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              activeOpacity={0.8}
              onPress={() => handleDownloadPdf(selectedReport?.reportName || 'Lab')}
              disabled={isDownloadingPdf}
            >
              {isDownloadingPdf ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="file-pdf-box" size={20} color="#fff" />
                  <Text style={styles.modalPrimaryBtnText}>Download PDF Report</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 2. BOOK TEST WIZARD MODAL */}
      <Modal
        visible={bookModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBookModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Book a Lab Test</Text>
                <Text style={styles.modalSubtitle}>Step {bookingStep} of 3</Text>
              </View>
              <TouchableOpacity onPress={() => setBookModalVisible(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalScroll}>
              {bookingStep === 1 && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.wizardSectionTitle}>Select Diagnostic Test</Text>
                  {AVAILABLE_TESTS.map((t) => (
                    <TouchableOpacity
                      key={t.name}
                      style={[
                        styles.testSelectCard,
                        selectedTest?.name === t.name && styles.testSelectCardActive,
                      ]}
                      onPress={() => setSelectedTest(t)}
                    >
                      <View style={[styles.statIconCircle, { backgroundColor: '#E0F2F1', marginBottom: 0 }]}>
                        <MaterialCommunityIcons name={t.icon as any} size={18} color="#0D9488" />
                      </View>
                      <View style={{ flex: 1, paddingLeft: 8 }}>
                        <Text style={styles.testSelectName}>{t.name}</Text>
                        <Text style={styles.testSelectInfo}>{t.duration}</Text>
                      </View>
                      <Text style={styles.testSelectPrice}>₹{t.price}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {bookingStep === 2 && (
                <ScrollView showsVerticalScrollIndicator={false} style={{ gap: SPACING.md }}>

                  {/* ── Patient Details ── */}
                  <Text style={styles.wizardSectionTitle}>Patient Details</Text>

                  {/* Initial + Gender row */}
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                    {([{ id: 1, label: 'Mr' }, { id: 2, label: 'Mrs' }, { id: 3, label: 'Ms' }, { id: 4, label: 'Dr' }] as const).map((i) => (
                      <TouchableOpacity
                        key={i.id}
                        style={[styles.dateChoiceBtn, apptInitial === i.id && styles.dateChoiceBtnActive]}
                        onPress={() => setApptInitial(i.id)}
                      >
                        <Text style={[styles.dateChoiceText, apptInitial === i.id && styles.dateChoiceTextActive]}>{i.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* First & Last Name */}
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                    <TextInput
                      style={[styles.apptInput, { flex: 1 }]}
                      placeholder="First Name *"
                      placeholderTextColor="#94A3B8"
                      value={apptFirstName}
                      onChangeText={setApptFirstName}
                    />
                    <TextInput
                      style={[styles.apptInput, { flex: 1 }]}
                      placeholder="Last Name *"
                      placeholderTextColor="#94A3B8"
                      value={apptLastName}
                      onChangeText={setApptLastName}
                    />
                  </View>

                  {/* Mobile */}
                  <TextInput
                    style={[styles.apptInput, { marginBottom: 10 }]}
                    placeholder="Mobile Number *"
                    placeholderTextColor="#94A3B8"
                    value={apptMobile}
                    onChangeText={setApptMobile}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />

                  {/* DOB */}
                  <TextInput
                    style={[styles.apptInput, { marginBottom: 10 }]}
                    placeholder="Birth Date (YYYY-MM-DD)"
                    placeholderTextColor="#94A3B8"
                    value={apptDob}
                    onChangeText={setApptDob}
                  />

                  {/* Address */}
                  <TextInput
                    style={[styles.apptInput, { marginBottom: 10, height: 60 }]}
                    placeholder="Address"
                    placeholderTextColor="#94A3B8"
                    value={apptAddress}
                    onChangeText={setApptAddress}
                    multiline
                  />

                  {/* Gender */}
                  <Text style={[styles.wizardSectionTitle, { marginTop: 4 }]}>Gender</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    {([{ id: 1, label: 'Male' }, { id: 2, label: 'Female' }, { id: 3, label: 'Other' }] as const).map((g) => (
                      <TouchableOpacity
                        key={g.id}
                        style={[styles.dateChoiceBtn, apptGender === g.id && styles.dateChoiceBtnActive, { flex: 1 }]}
                        onPress={() => setApptGender(g.id)}
                      >
                        <Text style={[styles.dateChoiceText, apptGender === g.id && styles.dateChoiceTextActive]}>{g.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* ── Schedule ── */}
                  <Text style={styles.wizardSectionTitle}>Appointment Date</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                    {(['2026-06-18', '2026-06-19', '2026-06-20'] as const).map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.dateChoiceBtn, bookingDate === d && styles.dateChoiceBtnActive]}
                        onPress={() => setBookingDate(d)}
                      >
                        <Text style={[styles.dateChoiceText, bookingDate === d && styles.dateChoiceTextActive]}>
                          {d.split('-')[2]} {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(d.split('-')[1]) - 1]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.wizardSectionTitle}>Time Slot</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                    {(['09:00 AM', '11:00 AM', '02:00 PM'] as const).map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.dateChoiceBtn, bookingTime === t && styles.dateChoiceBtnActive]}
                        onPress={() => setBookingTime(t)}
                      >
                        <Text style={[styles.dateChoiceText, bookingTime === t && styles.dateChoiceTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Collection Mode */}
                  <Text style={styles.wizardSectionTitle}>Collection Mode</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                    <TouchableOpacity
                      style={[styles.modeSelectBtn, collectionType === 'home' && styles.modeSelectBtnActive]}
                      onPress={() => setCollectionType('home')}
                    >
                      <MaterialCommunityIcons name="home-outline" size={22} color={collectionType === 'home' ? '#0D9488' : '#64748B'} />
                      <Text style={[styles.modeSelectText, collectionType === 'home' && styles.modeSelectTextActive]}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modeSelectBtn, collectionType === 'lab' && styles.modeSelectBtnActive]}
                      onPress={() => setCollectionType('lab')}
                    >
                      <MaterialCommunityIcons name="hospital-building" size={22} color={collectionType === 'lab' ? '#0D9488' : '#64748B'} />
                      <Text style={[styles.modeSelectText, collectionType === 'lab' && styles.modeSelectTextActive]}>Lab Visit</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}

              {bookingStep === 3 && (
                <View style={{ gap: 16 }}>
                  <Text style={styles.wizardSectionTitle}>Review details</Text>
                  <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Patient Name</Text>
                      <Text style={styles.summaryVal}>{apptFirstName} {apptLastName}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Mobile</Text>
                      <Text style={styles.summaryVal}>{apptMobile}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Test Name</Text>
                      <Text style={styles.summaryVal}>{selectedTest?.name}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Mode</Text>
                      <Text style={styles.summaryVal}>{collectionType === 'home' ? 'Home Collection' : 'Lab Visit'}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Date & Time</Text>
                      <Text style={styles.summaryVal}>{bookingDate} @ {bookingTime}</Text>
                    </View>
                    <View style={[styles.summaryRow, { borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 10, marginTop: 4 }]}>
                      <Text style={[styles.summaryLabel, { fontWeight: '700', color: '#0F172A' }]}>Amount to Pay</Text>
                      <Text style={[styles.summaryVal, { fontWeight: '800', color: '#0D9488', fontSize: 16 }]}>₹{selectedTest?.price}</Text>
                    </View>
                  </View>

                  <View style={styles.disclaimerBox}>
                    <MaterialCommunityIcons name="information-outline" size={16} color="#475569" />
                    <Text style={styles.disclaimerText}>
                      No upfront payment required. You can pay online later or at sample collection.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              {bookingStep > 1 && (
                <TouchableOpacity
                  style={[styles.modalSecondaryBtn, { flex: 1 }]}
                  onPress={() => setBookingStep((bookingStep - 1) as any)}
                >
                  <Text style={styles.modalSecondaryBtnText}>Back</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.modalPrimaryBtn,
                  { flex: 2 },
                  bookingStep === 1 && !selectedTest && { opacity: 0.5 }
                ]}
                onPress={() => {
                  if (bookingStep === 1 && selectedTest) {
                    setBookingStep(2);
                  } else if (bookingStep === 2) {
                    setBookingStep(3);
                  } else if (bookingStep === 3) {
                    handleConfirmBooking();
                  }
                }}
                disabled={bookingStep === 1 && !selectedTest || isBookingSubmitting}
              >
                {isBookingSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.modalPrimaryBtnText}>
                      {bookingStep === 3 ? 'Confirm Booking' : 'Next Step'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. PAY ONLINE MODAL */}
      <Modal
        visible={payModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPayModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Outstanding Invoice Payment</Text>
                <Text style={styles.modalSubtitle}>Secure Checkout</Text>
              </View>
              <TouchableOpacity onPress={() => setPayModalVisible(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalScroll}>
              <View style={styles.paymentBalanceCard}>
                <Text style={styles.payBalLabel}>Outstanding Amount</Text>
                <Text style={styles.payBalVal}>₹{outstandingBalance}</Text>
                <Text style={styles.payBalSubtitle}>Invoice: LIMS-2025-08429</Text>
              </View>

              <Text style={styles.wizardSectionTitle}>Select Payment Method</Text>

              <TouchableOpacity
                style={[styles.payMethodRow, paymentMethod === 'upi' && styles.payMethodRowActive]}
                onPress={() => setPaymentMethod('upi')}
              >
                <MaterialCommunityIcons name="google-play" size={20} color={paymentMethod === 'upi' ? '#0D9488' : '#64748B'} />
                <Text style={styles.payMethodText}>UPI / GooglePay / PhonePe</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.payMethodRow, paymentMethod === 'card' && styles.payMethodRowActive]}
                onPress={() => setPaymentMethod('card')}
              >
                <MaterialCommunityIcons name="credit-card-outline" size={20} color={paymentMethod === 'card' ? '#0D9488' : '#64748B'} />
                <Text style={styles.payMethodText}>Debit / Credit Card</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.payMethodRow, paymentMethod === 'net_banking' && styles.payMethodRowActive]}
                onPress={() => setPaymentMethod('net_banking')}
              >
                <MaterialCommunityIcons name="bank-outline" size={20} color={paymentMethod === 'net_banking' ? '#0D9488' : '#64748B'} />
                <Text style={styles.payMethodText}>Net Banking</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              activeOpacity={0.8}
              onPress={handleConfirmPayment}
              disabled={isPaymentSubmitting}
            >
              {isPaymentSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="shield-check" size={20} color="#fff" />
                  <Text style={styles.modalPrimaryBtnText}>Pay ₹{outstandingBalance} Securely</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 4. CONTACT LAB MODAL */}
      <Modal
        visible={contactModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setContactModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Contact Life Relier Lab</Text>
                <Text style={styles.modalSubtitle}>Support & Consultations</Text>
              </View>
              <TouchableOpacity onPress={() => setContactModalVisible(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <View style={styles.contactItemBox}>
                <View style={styles.contactItemHeader}>
                  <MaterialCommunityIcons name="map-marker" size={18} color="#0D9488" />
                  <Text style={styles.contactItemTitle}>Lab Location</Text>
                </View>
                <Text style={styles.contactItemText}>Life Relier Laboratory Services, Satellite, Ahmedabad, Gujarat - 380015</Text>
                <TouchableOpacity
                  style={styles.contactItemAction}
                  onPress={() => Linking.openURL('https://maps.google.com/?q=Life+Relier+Lab')}
                >
                  <Text style={styles.contactItemActionText}>Get Directions on Maps</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.contactItemBox}>
                <View style={styles.contactItemHeader}>
                  <MaterialCommunityIcons name="phone" size={18} color="#0D9488" />
                  <Text style={styles.contactItemTitle}>Helpline Phone</Text>
                </View>
                <Text style={styles.contactItemText}>+91 98765 43210 (Toll-Free)</Text>
                <TouchableOpacity
                  style={styles.contactItemAction}
                  onPress={() => Linking.openURL('tel:+919876543210')}
                >
                  <Text style={styles.contactItemActionText}>Call Helpline Now</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.contactItemBox}>
                <View style={styles.contactItemHeader}>
                  <MaterialCommunityIcons name="email" size={18} color="#0D9488" />
                  <Text style={styles.contactItemTitle}>Email Support</Text>
                </View>
                <Text style={styles.contactItemText}>support@liferelier.com</Text>
                <TouchableOpacity
                  style={styles.contactItemAction}
                  onPress={() => Linking.openURL('mailto:support@liferelier.com')}
                >
                  <Text style={styles.contactItemActionText}>Send an Email</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.contactItemBox}>
                <View style={styles.contactItemHeader}>
                  <MaterialCommunityIcons name="clock-outline" size={18} color="#0D9488" />
                  <Text style={styles.contactItemTitle}>Business Hours</Text>
                </View>
                <Text style={styles.contactItemText}>Monday - Saturday: 07:00 AM - 09:00 PM</Text>
                <Text style={styles.contactItemText}>Sunday: 08:00 AM - 02:00 PM (Sample collection only)</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: SPACING.md },

  // Header
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  greeting: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  date: { fontSize: 13, color: '#64748B', marginTop: 4 },
  notifBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notifBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' },

  quickRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16 
  },
  quickCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  quickIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 8 
  },
  quickLabel: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#0F172A', 
    textAlign: 'center', 
    lineHeight: 15 
  },

  // Banner
  bannerContainer: {
    borderRadius: 24,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  bannerTitlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 44,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bannerTitleIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  microscopeImage: {
    position: 'absolute',
    right: 10,
    top: 2,
    width: 110,
    height: 110,
    zIndex: 1,
  },
  bannerWhiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    flexDirection: 'row',
    padding: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 2,
  },
  bStat: { flex: 1, alignItems: 'flex-start', paddingHorizontal: 2 },
  statIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bStatVal: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  bStatLabel: { fontSize: 9, color: '#64748B', marginTop: 3, lineHeight: 12 },
  bDivider: { width: 1, height: '80%', backgroundColor: '#E2E8F0', alignSelf: 'center', marginHorizontal: 2 },

  // Booking Status
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  statusTrack: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  stepWrapper: { flex: 1, alignItems: 'center', position: 'relative' },
  stepLine: { position: 'absolute', right: '50%', left: '-50%' },
  stepLineDone: {
    backgroundColor: '#10B981',
    height: 3,
    top: 11,
  },
  stepLineEmpty: {
    borderStyle: 'dashed',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 1,
    height: 0,
    top: 12,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    zIndex: 1,
  },
  stepDone: { backgroundColor: '#10B981' },
  stepActive: { backgroundColor: '#FFFFFF', borderWidth: 2.5, borderColor: '#F59E0B' },
  stepActiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B' },
  stepEmpty: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#CBD5E1' },
  stepLabel: { fontSize: 10, color: '#64748B', textAlign: 'center', marginBottom: 4, lineHeight: 13 },
  stepLabelActive: { color: '#0F172A', fontWeight: '700' },
  stepDate: { fontSize: 9, color: '#94A3B8', textAlign: 'center' },

  // Upcoming Appointment
  apptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  noApptCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  noApptText: { color: '#64748B', fontSize: 13 },
  apptLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  apptIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  apptInfoCol: { flex: 1, gap: 2 },
  apptBadge: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  apptBadgeText: { fontSize: 9, color: '#FFFFFF', fontWeight: '700' },
  apptName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  apptDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  apptDate: { fontSize: 11, color: '#64748B' },

  apptPhlebotomist: { alignItems: 'flex-start', paddingLeft: 8 },
  apptPhlLabel: { fontSize: 9, color: '#94A3B8', marginBottom: 4 },
  apptPhlRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  apptPhlAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  apptPhlName: { fontSize: 12, fontWeight: '700', color: '#0F172A' },

  editApptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0D9488',
    alignSelf: 'flex-start',
  },
  editApptBtnText: { fontSize: 12, color: '#0D9488', fontWeight: '600' },

  apptActionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  deleteApptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignSelf: 'flex-start',
  },
  deleteApptBtnText: { fontSize: 12, color: '#EF4444', fontWeight: '600' },

  // ================= MODALS STYLES =================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  reportModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 16,
    marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  modalSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    maxHeight: 400,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: { fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', fontWeight: '600' },
  metaVal: { fontSize: 13, color: '#0F172A', fontWeight: '700', marginTop: 4 },

  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  tableCol: {
    fontSize: 12,
    color: '#475569',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  disclaimerBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  disclaimerText: { fontSize: 11, color: '#475569', flex: 1, lineHeight: 15 },

  modalPrimaryBtn: {
    backgroundColor: '#0D9488',
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  modalPrimaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  modalSecondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryBtnText: { color: '#475569', fontSize: 14, fontWeight: '700' },

  wizardSectionTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  testSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    marginBottom: 8,
  },
  testSelectCardActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  testSelectName: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  testSelectInfo: { fontSize: 10, color: '#64748B', marginTop: 2 },
  testSelectPrice: { fontSize: 14, fontWeight: '800', color: '#0D9488' },

  modeSelectBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    gap: 6,
  },
  modeSelectBtnActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  modeSelectText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  modeSelectTextActive: { color: '#0F766E', fontWeight: '700' },

  apptInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },

  dateChoiceBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
  },
  dateChoiceBtnActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  dateChoiceText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  dateChoiceTextActive: { color: '#0F766E', fontWeight: '700' },

  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: { fontSize: 12, color: '#64748B' },
  summaryVal: { fontSize: 12, color: '#0F172A', fontWeight: '700' },

  paymentBalanceCard: {
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    marginBottom: 20,
  },
  payBalLabel: { fontSize: 11, color: '#EF4444', textTransform: 'uppercase', fontWeight: '700' },
  payBalVal: { fontSize: 28, fontWeight: '900', color: '#EF4444', marginVertical: 6 },
  payBalSubtitle: { fontSize: 10, color: '#94A3B8' },

  payMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    marginBottom: 10,
  },
  payMethodRowActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  payMethodText: { fontSize: 13, color: '#0F172A', fontWeight: '700' },

  contactItemBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  contactItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  contactItemTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  contactItemText: { fontSize: 12, color: '#64748B', lineHeight: 16 },
  contactItemAction: { alignSelf: 'flex-start', marginTop: 8 },
  contactItemActionText: { color: '#0D9488', fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' },
<<<<<<< HEAD
});
=======

  consultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA', // Light Teal background
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 16,
  },
  consultCardLeft: {
    flex: 1,
    paddingRight: 16,
  },
  consultCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F766E',
    marginBottom: 4,
  },
  consultCardSub: {
    fontSize: 12,
    color: '#115E59',
    lineHeight: 18,
  },
  consultIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
>>>>>>> 8be68597c5b7e5bd61e576296b97e322a74a2eb8

import { BookingItem, ReportItem, DashboardStats, UpcomingTest } from './types';

export const DUMMY_BOOKINGS: BookingItem[] = [
  { id: '1', patientName: 'Rudra Patel', testName: 'CBC Report', date: '15 Jun 2026', status: 'ready', amount: 450 },
  { id: '2', patientName: 'Anita Shah', testName: 'Thyroid Profile', date: '14 Jun 2026', status: 'processing', amount: 750 },
  { id: '3', patientName: 'Mehul Joshi', testName: 'Lipid Panel', date: '13 Jun 2026', status: 'collected', amount: 600 },
  { id: '4', patientName: 'Priya Mehta', testName: 'Blood Sugar', date: '12 Jun 2026', status: 'pending', amount: 200 },
  { id: '5', patientName: 'Karan Desai', testName: 'Liver Function', date: '11 Jun 2026', status: 'ready', amount: 900 },
];

export const DUMMY_REPORTS: ReportItem[] = [
  { id: '1', reportName: 'CBC Report', date: '15 Jun 2026', status: 'ready', patientName: 'Rudra Patel' },
  { id: '2', reportName: 'Thyroid Profile', date: '10 Jun 2026', status: 'ready', patientName: 'Rudra Patel' },
  { id: '3', reportName: 'Lipid Panel', date: '05 Jun 2026', status: 'processing', patientName: 'Rudra Patel' },
];

export const DUMMY_DASHBOARD_STATS: DashboardStats = {
  totalBookings: 128,
  pendingReports: 14,
  todayRevenue: 18500,
  totalPatients: 342,
};

export const DUMMY_UPCOMING_TESTS: UpcomingTest[] = [
  { id: '1', testName: 'Full Body Checkup', date: '22 Jun 2026 • 09:00 AM', status: 'sample_collected', collectionType: 'home' },
  { id: '2', testName: 'Vitamin D Test', date: '25 Jun 2026 • 10:30 AM', status: 'scheduled', collectionType: 'lab' },
];

export const ADMIN_EXPLORE_CARDS = [
  {
    section: 'Front Desk',
    items: [
      { id: 'booking', title: 'Booking', icon: 'calendar-plus', color: '#0D9488', bgColor: '#CCFBF1' },
      { id: 'edit_booking', title: 'Edit Booking', icon: 'calendar-edit', color: '#6366F1', bgColor: '#EEF2FF' },
      { id: 'booking_status', title: 'Booking Status', icon: 'clipboard-list', color: '#F59E0B', bgColor: '#FEF3C7' },
      { id: 'print_report', title: 'Print Report', icon: 'printer', color: '#3B82F6', bgColor: '#DBEAFE' },
    ],
  },
  {
    section: 'Sample Collection',
    items: [
      { id: 'status', title: 'Status', icon: 'test-tube', color: '#10B981', bgColor: '#D1FAE5' },
      { id: 'reporting', title: 'Reporting', icon: 'file-chart', color: '#8B5CF6', bgColor: '#EDE9FE' },
      { id: 'result_entry', title: 'Result Entry', icon: 'pencil-box', color: '#EC4899', bgColor: '#FCE7F3' },
    ],
  },
  {
    section: 'Billing',
    items: [
      { id: 'bill_payment', title: 'Bill Payment', icon: 'credit-card', color: '#EF4444', bgColor: '#FEE2E2' },
      { id: 'daily_cash', title: 'Daily Cash', icon: 'cash-multiple', color: '#0D9488', bgColor: '#CCFBF1' },
    ],
  },
];

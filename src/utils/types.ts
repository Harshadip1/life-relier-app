export type UserRole = 'Admin' | 'Patient' | string;

export interface User {
  id: string;
  username: string;
  userType: UserRole;
  branchID: string;
  name?: string; // Optional for backward compatibility in UI
  email?: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  token?: string | null;
  role: UserRole | null;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  username: string;
  id: string;
  userType: UserRole;
  branchID: string;
}

export interface BookingItem {
  id: string;
  patientName: string;
  testName: string;
  date: string;
  status: 'pending' | 'collected' | 'processing' | 'ready';
  amount: number;
}

export interface ReportItem {
  id: string;
  reportName: string;
  date: string;
  status: 'ready' | 'pending' | 'processing';
  patientName: string;
}

export interface DashboardStats {
  totalBookings: number;
  pendingReports: number;
  todayRevenue: number;
  totalPatients: number;
}

export interface UpcomingTest {
  id: string;
  testName: string;
  date: string;
  status: 'scheduled' | 'sample_collected' | 'processing' | 'ready';
  collectionType: 'home' | 'lab';
}

export interface ServiceCard {
  id: string;
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  screen: string;
}

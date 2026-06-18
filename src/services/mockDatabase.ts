import { User, UserRole } from '../utils/types';

// Mock user database - credentials stored here, not shown in UI
interface DBUser {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
}

const USERS_DB: DBUser[] = [
  {
    id: 'admin_001',
    username: 'admin',
    password: '123',
    name: 'Admin User',
    email: 'admin@liferelier.com',
    role: 'admin',
    phone: '+91 98765 43210',
    address: 'Life Relier Lab, Ahmedabad, Gujarat',
  },
  {
    id: 'patient_001',
    username: 'rudra',
    password: '123',
    name: 'Rudra Patel',
    email: 'rudra@example.com',
    role: 'patient',
    phone: '+91 91234 56789',
    address: 'B-12, Satellite, Ahmedabad, Gujarat',
  },
];

export function authenticateUser(username: string, password: string): { user: User; token: string; role: UserRole } | null {
  const found = USERS_DB.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );
  if (!found) return null;

  const user: User = {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
    phone: found.phone,
    address: found.address,
  };

  // Generate a simple mock token
  const token = `mock_token_${found.id}_${Date.now()}`;
  return { user, token, role: found.role };
}

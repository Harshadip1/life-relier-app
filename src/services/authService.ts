import { LoginCredentials, AuthResponse, User, UserRole } from '../utils/types';
import { API_BASE_URL } from '../utils/constants';

/**
 * POST /api/ManageUser/Login
 * Body   : { UserName: string, Password: string }
 *
 * The API may return different shapes depending on the backend.
 * We normalise whatever comes back into the AuthResponse the app expects.
 */
export async function loginUser(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const requestBody = {
    UserName: credentials.username,
    Password: credentials.password,
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/ManageUser/Login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
  } catch (networkErr: any) {
    // Device has no internet or DNS failed
    throw new Error(
      'Cannot reach the server. Please check your internet connection.',
    );
  }

  // Parse body (guard against empty / non-JSON responses)
  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const msg =
      data?.message ||
      data?.Message ||
      data?.title ||
      `Login failed (HTTP ${response.status})`;
    throw new Error(msg);
  }

  // ── Normalise API response → AuthResponse ─────────────────────────────────
  //
  // The backend may return the user fields at the top level or nested.
  // Common shapes handled:
  //   { token, userId, userName, role, fullName, email, ... }   ← flat
  //   { token, user: { id, name, email, role, ... } }           ← nested
  //   { Token, UserId, UserName, Role, ... }                     ← Pascal case
  //

  const raw = data ?? {};

  // Resolve token
  const token: string =
    raw.token || raw.Token || raw.accessToken || raw.AccessToken || 'no-token';

  // Resolve role — default to 'admin' if the API doesn't return one yet
  const rawRole: string =
    (raw.role || raw.Role || raw.userRole || raw.UserRole || 'admin')
      .toString()
      .toLowerCase();

  const role: UserRole =
    rawRole === 'patient' ? 'patient' : 'admin';

  // Resolve user fields (handle both flat and nested)
  const nested = raw.user || raw.User || {};
  const user: User = {
    id:    String(raw.userId   || raw.UserId   || nested.id   || nested.Id   || raw.id   || ''),
    name:  String(raw.fullName || raw.FullName || nested.name || nested.Name || raw.name || raw.userName || raw.UserName || credentials.username),
    email: String(raw.email    || raw.Email    || nested.email || nested.Email || ''),
    role,
    phone: raw.phone   || raw.Phone   || nested.phone   || undefined,
  };

  return { user, token, role };
}

export async function logoutUser(): Promise<void> {
  // Token is stateless (JWT) — clearing local storage in AuthContext is enough.
  // Add a server-side invalidation call here if the backend supports it.
  await new Promise(res => setTimeout(res, 100));
}

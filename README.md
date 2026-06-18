# Life Relier LIMS - Setup Guide

## Install & Run

```bash
cd lims-app
npm install
npx expo start
```

## Test Credentials

| Role    | Username | Password |
|---------|----------|----------|
| Admin   | admin    | 123      |
| Patient | rudra    | 123      |

## Project Structure

```
lims-app/
├── App.tsx
├── src/
│   ├── context/AuthContext.tsx      # Auth state + login/logout
│   ├── navigation/
│   │   ├── RootNavigator.tsx        # Role-based routing
│   │   ├── AuthNavigator.tsx
│   │   ├── AdminNavigator.tsx       # Bottom tabs: Dashboard, Explore, Profile
│   │   └── PatientNavigator.tsx     # Bottom tabs: Home, Services, Profile
│   ├── screens/
│   │   ├── auth/LoginScreen.tsx
│   │   ├── admin/DashboardScreen.tsx
│   │   ├── admin/ExploreScreen.tsx
│   │   ├── admin/AdminProfileScreen.tsx
│   │   ├── patient/HomeScreen.tsx
│   │   ├── patient/ServicesScreen.tsx
│   │   └── patient/PatientProfileScreen.tsx
│   ├── components/                  # Reusable UI components
│   ├── services/                    # API + mock database
│   └── utils/                       # Types, constants, dummy data
```

## Notes
- Assets (icon.png, splash.png, adaptive-icon.png) need to be placed in `/assets/`
- You can use any 1024x1024 PNG for the icon
- The app uses a mock database - replace `src/services/authService.ts` with real API calls

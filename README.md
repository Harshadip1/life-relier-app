# Life Relier LIMS

A React Native (Expo) mobile app for the Life Relier LIMS system.

---

## ⚙️ First-time Setup (after cloning or pulling)

> **Important:** `node_modules` is not committed. You must install dependencies every time you clone or after major pulls.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npx expo start
```

Then scan the QR code with **Expo Go** on your phone, or press `a` for Android emulator / `i` for iOS simulator.

---

## 🔑 API

The app connects to:
```
https://dn8labapi.liferelier.in
```

This is a live server — no local backend setup needed. Make sure your device/emulator has internet access.

---

## 🔐 Test Credentials

| Role    | Username | Password |
|---------|----------|----------|
| Admin   | admin    | 123      |
| Patient | rudra    | 123      |

---

## 📁 Project Structure

```
life-relier-app/
├── App.tsx                          # App entry, splash screen control
├── app.json                         # Expo config (icons, splash, plugins)
├── assets/                          # App icons and splash image
└── src/
    ├── context/
    │   └── AuthContext.tsx           # Auth state, login/logout, session restore
    ├── navigation/
    │   ├── RootNavigator.tsx         # Role-based routing (admin / patient)
    │   ├── AuthNavigator.tsx
    │   ├── AdminNavigator.tsx
    │   └── PatientNavigator.tsx
    ├── screens/
    │   ├── auth/LoginScreen.tsx
    │   ├── admin/                    # Admin module screens
    │   └── patient/                  # Patient module screens
    ├── components/                   # Reusable UI components
    ├── services/
    │   ├── apiService.ts             # Axios instance with interceptors
    │   ├── authService.ts            # Login / logout API calls
    │   └── doctorScheduleService.ts  # Doctor schedule API calls
    └── utils/
        ├── constants.ts              # API URL, colors, spacing, storage keys
        ├── types.ts                  # TypeScript types
        └── dummy_data.ts
```

---

## 🛠️ Common Issues

### "Network Error" or API error after pulling
Run `npm install` — node_modules is not included in the repo.

### Splash screen not showing
Do a clean start: `npx expo start --clear`

### Metro bundler cache issues
```bash
npx expo start --clear
```

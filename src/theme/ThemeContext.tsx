import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, AppColors } from './colors';

interface ThemeContextType {
  colors:  AppColors;
  isDark:  boolean;
  scheme:  'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({
  colors: lightColors,
  isDark: false,
  scheme: 'light',
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();  // auto-updates when device theme changes
  const isDark  = systemScheme === 'dark';
  const colors  = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, scheme: isDark ? 'dark' : 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Use this in every screen instead of hardcoded color objects */
export function useTheme(): ThemeContextType {
  return useContext(ThemeContext);
}

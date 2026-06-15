import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import AdminNavigator from './AdminNavigator';
import PatientNavigator from './PatientNavigator';
import LoadingScreen from '../components/LoadingScreen';

export default function RootNavigator() {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading Life Relier..." />;
  }

  return (
    <NavigationContainer>
      {user === null
        ? <AuthNavigator />
        : role === 'admin'
        ? <AdminNavigator />
        : <PatientNavigator />}
    </NavigationContainer>
  );
}

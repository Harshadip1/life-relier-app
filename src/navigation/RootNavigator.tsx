import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator         from './AuthNavigator';
import AdminNavigator        from './AdminNavigator';
import PatientNavigator      from './PatientNavigator';
import PhlebotomistNavigator from './PhlebotomistNavigator';
import RefDoctorNavigator    from './RefDoctorNavigator';
import MainDoctorNavigator   from './MainDoctorNavigator';
import LoadingScreen         from '../components/LoadingScreen';

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
        : role === 'phlebotomist'
        ? <PhlebotomistNavigator />
        : role === 'doctor'
        ? <MainDoctorNavigator />
        : role === 'refdoctor'
        ? <RefDoctorNavigator />
        : <PatientNavigator />}
    </NavigationContainer>
  );
}

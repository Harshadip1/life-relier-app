import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const PRIMARY = '#0D9488';

export default function MainDoctorHomeScreen({ navigation }: any) {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.doctorName}>Dr. {user?.name}</Text>
        </View>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="doctor" size={28} color={PRIMARY} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('Reporting')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
            <MaterialCommunityIcons name="file-document-multiple" size={28} color="#0284C7" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Reporting Module</Text>
            <Text style={styles.cardDesc}>View Test Results, TAT, and add Results with Parameters.</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  greeting: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  doctorName: { fontSize: 22, color: '#0F172A', fontWeight: '700', marginTop: 2 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 15 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#64748B', lineHeight: 18 },
});

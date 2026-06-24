import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

export default function PersonalInfoScreen({ navigation }: any) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [dob, setDob] = useState('12/05/1995');
  const [gender, setGender] = useState('Male');

  const handleUpdate = () => {
    Alert.alert('Success', 'Profile updated successfully');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{name.charAt(0)}</Text>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Feather name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          <InputField label="Full Name" value={name} onChangeText={setName} icon="user" />
          <InputField label="Email Address" value={email} onChangeText={setEmail} icon="mail" keyboardType="email-address" />
          <InputField label="Phone Number" value={phone} onChangeText={setPhone} icon="phone" keyboardType="phone-pad" />
          <InputField label="Date of Birth" value={dob} onChangeText={setDob} icon="calendar" />
          <InputField label="Gender" value={gender} onChangeText={setGender} icon="users" />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InputField({ label, value, onChangeText, icon, keyboardType = 'default' }: any) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Feather name={icon} size={18} color={COLORS.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor={COLORS.textMuted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { marginRight: SPACING.md },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  content: { padding: SPACING.lg },
  avatarSection: { alignItems: 'center', marginBottom: SPACING.xl },
  avatarBox: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  avatarText: { fontSize: 40, fontWeight: '800', color: COLORS.primary },
  editAvatarBtn: {
    position: 'absolute', right: 0, bottom: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  form: { gap: SPACING.lg },
  inputWrapper: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 56,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 56, borderRadius: BORDER_RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    marginTop: SPACING.xxl,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

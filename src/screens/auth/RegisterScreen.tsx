import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
  Image, ImageBackground, Dimensions, StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

const { width, height } = Dimensions.get('window');

const BG_IMAGE = 'https://th.bing.com/th/id/OIP.xl8T2seL8gQkgKz5x3xHWQHaQd?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3';
const LOGO_IMAGE = 'https://media.licdn.com/dms/image/v2/D4D0BAQGUElF2YnVswQ/company-logo_200_200/company-logo_200_200/0/1736934578140?e=2147483647&v=beta&t=wFaY-cVe0ezRImOrxBa96UWFWU22-yaskrQZHJArLCM';

type RoleOption = { label: string; value: string; icon: string };

const ROLES: RoleOption[] = [
  { label: 'Patient',  value: 'patient', icon: 'account-heart-outline' },
  { label: 'Doctor',   value: 'doctor',  icon: 'stethoscope' },
  { label: 'Staff',    value: 'staff',   icon: 'account-tie-outline' },
];

export default function RegisterScreen() {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList, 'Register'>>();

  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [selectedRole, setRole]   = useState<string>('');
  const [showPass, setShowPass]   = useState(false);
  const [agreed, setAgreed]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<Record<string, string | undefined>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!fullName.trim())    e.fullName = 'Full Name is required';
    if (!username.trim())    e.username = 'Username is required';
    if (!email.trim())       e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password.trim())    e.password = 'Password is required';
    else if (password.length < 4) e.password = 'Minimum 4 characters';
    if (!selectedRole)       e.role     = 'Please select a role';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    if (!agreed) {
      Alert.alert('Agreement Required', 'Please agree to the Terms & Conditions');
      return;
    }
    setLoading(true);
    // TODO: replace with real API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'Login Now', onPress: () => navigation.navigate('Login') },
      ]);
    }, 1500);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={{ uri: BG_IMAGE }} style={styles.background}>
        <LinearGradient
          colors={['rgba(21,101,192,0.4)', 'rgba(106,27,154,0.6)', 'rgba(74,20,140,0.7)']}
          style={StyleSheet.absoluteFill}
        />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>

              {/* Logo */}
              <View style={styles.logoSection}>
                <Image source={{ uri: LOGO_IMAGE }} style={styles.logo} resizeMode="contain" />
                <Text style={styles.brand}>Life Relier</Text>
              </View>

              <Text style={styles.title}>Create Account</Text>
              <View style={styles.titleUnderline} />

              {/* Full Name */}
              <Field
                icon="person-outline"
                placeholder="Full Name"
                value={fullName}
                onChangeText={(t) => { setFullName(t); setErrors((e) => ({ ...e, fullName: undefined })); }}
                error={errors.fullName}
                editable={!loading}
              />

              {/* Username */}
              <Field
                icon="at-outline"
                placeholder="Username"
                value={username}
                onChangeText={(t) => { setUsername(t); setErrors((e) => ({ ...e, username: undefined })); }}
                error={errors.username}
                editable={!loading}
                autoCapitalize="none"
              />

              {/* Email */}
              <Field
                icon="mail-outline"
                placeholder="Email"
                value={email}
                onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
                error={errors.email}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Password */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#FFF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={password}
                    onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
                    secureTextEntry={!showPass}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              </View>

              {/* Role Selection */}
              <View style={styles.roleSection}>
                <Text style={styles.roleLabel}>Select Role</Text>
                <View style={styles.roleRow}>
                  {ROLES.map((r) => {
                    const active = selectedRole === r.value;
                    return (
                      <TouchableOpacity
                        key={r.value}
                        style={[styles.roleCard, active && styles.roleCardActive]}
                        onPress={() => { setRole(r.value); setErrors((e) => ({ ...e, role: undefined })); }}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons
                          name={r.icon as any}
                          size={24}
                          color={active ? '#fff' : 'rgba(255,255,255,0.7)'}
                        />
                        <Text style={[styles.roleCardText, active && styles.roleCardTextActive]}>
                          {r.label}
                        </Text>
                        {active && (
                          <MaterialCommunityIcons name="check-circle" size={14} color="#fff" style={styles.roleCheck} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.role ? <Text style={styles.errorText}>{errors.role}</Text> : null}
              </View>

              {/* Terms */}
              <TouchableOpacity style={styles.termsSection} onPress={() => setAgreed(!agreed)} activeOpacity={0.6}>
                <MaterialCommunityIcons
                  name={agreed ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={20}
                  color="#FFF"
                />
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink}>Terms & Conditions</Text>
                </Text>
              </TouchableOpacity>

              {/* Register Button */}
              <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.8} style={styles.btnWrapper}>
                <LinearGradient
                  colors={['rgba(138,43,226,0.7)', 'rgba(106,27,154,0.8)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.btn}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.btnText}>Register</Text>}
                </LinearGradient>
              </TouchableOpacity>

              {/* Back to Login */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

// ── Reusable Field ──────────────────────────────────────────────────────────
function Field({
  icon, placeholder, value, onChangeText, error, editable,
  keyboardType, autoCapitalize,
}: {
  icon: string; placeholder: string; value: string;
  onChangeText: (t: string) => void; error?: string;
  editable?: boolean; keyboardType?: any; autoCapitalize?: any;
}) {
  return (
    <View style={styles.inputContainer}>
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <Ionicons name={icon as any} size={20} color="#FFF" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:   { flex: 1 },
  background:  { flex: 1, width, height },
  scroll:      { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, paddingVertical: 40 },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 40,
    paddingHorizontal: 24,
    paddingVertical: 36,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    elevation: 5,
  },
  logoSection:   { alignItems: 'center', marginBottom: 16 },
  logo:          { width: 76, height: 76, borderRadius: 14, marginBottom: 4 },
  brand:         { fontSize: 17, color: '#FFF', fontWeight: '700', marginTop: 6 },
  title:         { fontSize: 22, fontWeight: '800', color: '#FFF', marginTop: 8 },
  titleUnderline:{ width: 40, height: 3, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2, marginTop: 6, marginBottom: 24 },
  inputContainer:{ width: '100%', marginBottom: 14 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20, paddingHorizontal: 16, height: 55,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  inputError:    { borderColor: 'rgba(255,82,82,0.6)' },
  inputIcon:     { marginRight: 12 },
  input:         { flex: 1, fontSize: 15, color: '#FFF', fontWeight: '500' },
  eyeBtn:        { padding: 8 },
  errorText:     { color: '#FF5252', fontSize: 12, marginTop: 4, marginLeft: 4 },

  // Role
  roleSection:   { width: '100%', marginBottom: 18 },
  roleLabel:     { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginBottom: 10 },
  roleRow:       { flexDirection: 'row', gap: 10 },
  roleCard: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    gap: 6, position: 'relative',
  },
  roleCardActive:     { backgroundColor: 'rgba(138,43,226,0.55)', borderColor: 'rgba(255,255,255,0.5)' },
  roleCardText:       { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  roleCardTextActive: { color: '#fff' },
  roleCheck:          { position: 'absolute', top: 6, right: 6 },

  // Terms
  termsSection:  { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 22 },
  termsText:     { color: '#FFF', fontSize: 13, marginLeft: 10, opacity: 0.9 },
  termsLink:     { color: '#90CAF9', fontWeight: '600' },

  // Button
  btnWrapper:    { width: '100%' },
  btn:           { height: 55, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  btnText:       { color: '#FFF', fontSize: 17, fontWeight: '700' },

  // Footer
  footer:        { flexDirection: 'row', alignItems: 'center', marginTop: 28 },
  footerText:    { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  loginLink:     { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

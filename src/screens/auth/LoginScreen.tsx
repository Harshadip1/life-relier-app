import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const { height } = Dimensions.get('window');

const TEAL = '#0D9488';
const BLUE = '#2563EB';
const NAVY = '#1E3A8A';
const RED  = '#DC2626';

const CROSSES = [
  { top: 55,  left: 22  },
  { top: 45,  right: 35 },
  { top: 170, left: 55  },
  { top: 190, right: 18 },
  { top: height - 210, left: 28  },
  { top: height - 185, right: 48 },
  { top: height - 85,  left: 95  },
  { top: height - 105, right: 18 },
];

const companyLogo = require('../../../assets/splash.png');

export default function LoginScreen() {
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<{ username?: string; password?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!username.trim()) e.username = 'Username is required';
    if (!password.trim()) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ username: username.trim(), password });
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />
      <View style={s.bg} />

      {/* Decorative crosses */}
      {CROSSES.map((pos, i) => (
        <Text key={i} style={[s.cross, pos]}>✛</Text>
      ))}
      <View style={[s.dot, { top: 125, left: 44  }]} />
      <View style={[s.dot, { top: 255, right: 32 }]} />
      <View style={[s.dot, { top: height - 265, left: 52  }]} />
      <View style={[s.dot, { top: height - 155, right: 58 }]} />

      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.card}>

            {/* ── Header: logo left + company name right ── */}
            <View style={s.header}>
              {/* Logo image */}
              <Image
                source={companyLogo}
                style={s.logoImg}
                resizeMode="contain"
              />

              {/* Company name block */}
              <View style={s.nameBlock}>
                <Text style={s.companyName}>Life Relier Infosoft</Text>
                <View style={s.subRow}>
                  <View style={s.redLine} />
                  <Text style={s.privateLtd}>Private Limited</Text>
                  <View style={s.redLine} />
                </View>
              </View>
            </View>

            {/* ── Username field ── */}
            <View style={s.fieldWrap}>
              <View style={[s.inputBox, errors.username && s.inputBoxError]}>
                <TextInput
                  style={s.input}
                  placeholder="Username"
                  placeholderTextColor="#9CA3AF"
                  value={username}
                  onChangeText={t => { setUsername(t); setErrors(e => ({ ...e, username: undefined })); }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
              {errors.username ? <Text style={s.errorText}>{errors.username}</Text> : null}
            </View>

            {/* ── Password field ── */}
            <View style={s.fieldWrap}>
              <View style={[s.inputBox, errors.password && s.inputBoxError]}>
                <TextInput
                  style={s.input}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={t => { setPassword(t); setErrors(e => ({ ...e, password: undefined })); }}
                  secureTextEntry={!showPass}
                  editable={!loading}
                />
              </View>
              {errors.password ? <Text style={s.errorText}>{errors.password}</Text> : null}
            </View>

            {/* ── Forgot password ── */}
            <TouchableOpacity style={s.forgotRow} activeOpacity={0.7}>
              <Text style={s.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* ── Submit ── */}
            <TouchableOpacity
              style={[s.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={s.submitText}>Submit</Text>}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: TEAL,
  },

  cross: {
    position: 'absolute',
    fontSize: 26,
    color: 'rgba(255,255,255,0.20)',
    fontWeight: '300',
  },
  dot: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.20)',
  },

  kav:    { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },

  // ── White card ──
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },

  // ── Header row ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImg: {
    width: 100,
    height: 87,
    marginRight: 14,
  },
  nameBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  companyName: {
    fontSize: 20,
    fontWeight: '800',
    color: NAVY,
    lineHeight: 26,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 6,
    alignSelf: 'stretch',   // match width of nameBlock (same as companyName line)
  },
  redLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: RED,
    maxWidth: 32,           // cap so right line doesn't overshoot the text above
  },
  privateLtd: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.2,
  },

  // ── Input fields ──
  fieldWrap: {
    marginBottom: 14,
  },
  inputBox: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    height: 54,
    justifyContent: 'center',
  },
  inputBoxError: {
    borderColor: '#EF4444',
  },
  input: {
    fontSize: 15,
    color: '#111827',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },

  // ── Forgot password ──
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 22,
  },
  forgotText: {
    fontSize: 14,
    color: BLUE,
    fontWeight: '600',
  },

  // ── Submit button ──
  submitBtn: {
    height: 54,
    borderRadius: 30,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

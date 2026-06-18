import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
  Image, ImageBackground, Dimensions, StatusBar
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const BG_IMAGE = "https://th.bing.com/th/id/OIP.xl8T2seL8gQkgKz5x3xHWQHaQd?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3";
const LOGO_IMAGE = "https://media.licdn.com/dms/image/v2/D4D0BAQGUElF2YnVswQ/company-logo_200_200/company-logo_200_200/0/1736934578140?e=2147483647&v=beta&t=wFaY-cVe0ezRImOrxBa96UWFWU22-yaskrQZHJArLCM";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!fullName.trim()) e.fullName = 'Full Name is required';
    if (!email.trim()) e.email = 'Email is required';
    if (!password.trim()) e.password = 'Password is required';
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
    // Registration logic would go here
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Account created successfully!');
    }, 1500);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={{ uri: BG_IMAGE }} style={styles.background}>
        <LinearGradient
          colors={['rgba(21, 101, 192, 0.4)', 'rgba(106, 27, 154, 0.6)', 'rgba(74, 20, 140, 0.7)']}
          style={styles.gradientOverlay}
        />
        
        <KeyboardAvoidingView
          style={styles.root}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView 
            contentContainerStyle={styles.scroll} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <Image source={{ uri: LOGO_IMAGE }} style={styles.logo} resizeMode="contain" />
                <Text style={styles.cloudVersion}>Life Relier</Text>
              </View>

              <View style={styles.titleSection}>
                <Text style={styles.title}>Registration</Text>
                <View style={styles.titleUnderline} />
              </View>

              {/* Full Name Field */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, errors.fullName ? styles.inputError : null]}>
                  <Ionicons name="person-outline" size={20} color="#FFF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={fullName}
                    onChangeText={(t) => { setFullName(t); setErrors((e) => ({ ...e, fullName: undefined })); }}
                    editable={!loading}
                  />
                </View>
                {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
              </View>

              {/* Email Field */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
                  <Ionicons name="mail-outline" size={20} color="#FFF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={email}
                    onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </View>
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              {/* Password Field */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#FFF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={password}
                    onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
                    secureTextEntry={!showPass}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    <Ionicons
                      name={showPass ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#FFF"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              </View>

              {/* Terms Checkbox */}
              <TouchableOpacity 
                style={styles.termsSection} 
                onPress={() => setAgreed(!agreed)}
                activeOpacity={0.5}
              >
                <MaterialCommunityIcons 
                  name={agreed ? "checkbox-marked" : "checkbox-blank-outline"} 
                  size={20} 
                  color="#FFF" 
                />
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink}>Terms & Conditions</Text>
                </Text>
              </TouchableOpacity>

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
                style={styles.registerBtnWrapper}
              >
                <LinearGradient
                  colors={['rgba(138, 43, 226, 0.6)', 'rgba(106, 27, 154, 0.7)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.registerBtn}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.registerBtnText}>Register</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Reduced opacity for card
    borderRadius: 40,
    paddingHorizontal: 24,
    paddingVertical: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 5,
  },
  cloudVersion: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '700',
    opacity: 0.9,
    marginTop: 8,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4a148c', // Darker purple title as per image
    marginBottom: 5,
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: '#999',
    borderRadius: 2,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Reduced opacity for inputs
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  inputError: {
    borderColor: 'rgba(255, 82, 82, 0.5)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 8,
  },
  termsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    marginBottom: 25,
  },
  termsText: {
    color: '#FFF',
    fontSize: 13,
    marginLeft: 10,
    opacity: 0.9,
  },
  termsLink: {
    color: '#007AFF', // Blue link coloration
    fontWeight: '600',
  },
  registerBtnWrapper: {
    width: '100%',
    marginTop: 10,
  },
  registerBtn: {
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  loginLink: {
    color: '#4a148c',
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 5,
  },
});

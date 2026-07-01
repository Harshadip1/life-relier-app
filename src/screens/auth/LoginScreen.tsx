import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
  Image, ImageBackground, Dimensions, StatusBar
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

const { width, height } = Dimensions.get('window');

const BG_IMAGE = "https://th.bing.com/th/id/OIP.xl8T2seL8gQkgKz5x3xHWQHaQd?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3";
const LOGO_IMAGE = "https://media.licdn.com/dms/image/v2/D4D0BAQGUElF2YnVswQ/company-logo_200_200/company-logo_200_200/0/1736934578140?e=2147483647&v=beta&t=wFaY-cVe0ezRImOrxBa96UWFWU22-yaskrQZHJArLCM";

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList, 'Login'>>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

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
      // Removed Alert to speed up navigation transition
    } catch (err: any) {
      console.log(err);
      if (err.message.includes('API') || err.message.includes('network')) {
        Alert.alert('Error', 'Cannot connect to API');
      } else {
        Alert.alert('Error', 'Invalid Username or Password');
      }
    } finally {
      setLoading(false);
    }
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

              {/* Username Field */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, errors.username ? styles.inputError : null]}>
                  <Ionicons name="person-outline" size={20} color="#FFF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={username}
                    onChangeText={(t) => { setUsername(t); setErrors((e) => ({ ...e, username: undefined })); }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
                {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
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

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
                style={styles.loginBtnWrapper}
              >
                <LinearGradient
                  colors={['rgba(138, 43, 226, 0.6)', 'rgba(106, 27, 154, 0.7)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginBtn}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.loginBtnText}>Login</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Remember Me & Forget Password */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberSection}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.5}
                >
                  <MaterialCommunityIcons
                    name={rememberMe ? "checkbox-marked" : "checkbox-blank-outline"}
                    size={20}
                    color="#FFF"
                  />
                  <Text style={styles.optionText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.5}>
                  <Text style={styles.optionText}>Forget password?</Text>
                </TouchableOpacity>
              </View>

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text style={styles.noAccountText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerText}>Register</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    marginBottom: 40,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 16,
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
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 58,
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
  loginBtnWrapper: {
    width: '100%',
    marginTop: 10,
  },
  loginBtn: {
    height: 58,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    marginBottom: 35,
  },
  rememberSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    color: '#FFF',
    fontSize: 13,
    marginLeft: 8,
    opacity: 0.9,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noAccountText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  registerText: {
    color: '#FFF',
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

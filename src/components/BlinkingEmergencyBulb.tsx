import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, StyleProp, ViewStyle, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface BlinkingEmergencyBulbProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  showText?: boolean;
  text?: string;
}

export default function BlinkingEmergencyBulb({
  size = 18,
  color = '#EF4444',
  style,
  showText = false,
  text = 'EMERGENCY',
}: BlinkingEmergencyBulbProps) {
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.15,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [blinkAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: blinkAnim }, style]}>
      <MaterialCommunityIcons name="lightbulb-on" size={size} color={color} />
      {showText && (
        <Text style={[styles.text, { color, fontSize: Math.max(10, size - 6) }]}>
          {text}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

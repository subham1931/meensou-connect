import {useEffect, useRef} from 'react';
import {Animated, Text, View} from 'react-native';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View className="flex-1 items-center justify-center bg-blue-600 px-6">
      {/* Decorative Background Elements */}
      <View className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-500/30" />
      <View className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-indigo-500/20" />

      <Animated.View
        className="items-center"
        style={{
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}],
        }}>
        <View className="h-24 w-24 items-center justify-center rounded-[32px] bg-white/20 shadow-lg">
          <Text className="text-[40px] font-extrabold text-white">MC</Text>
        </View>
        <Text className="mt-6 text-[34px] font-bold tracking-tight text-white">
          Meensou Connect
        </Text>
        <View className="mt-3 rounded-full bg-white/10 px-4 py-1.5">
          <Text className="text-[14px] font-semibold tracking-wide text-blue-50 uppercase">
            Employee Portal
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}


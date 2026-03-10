import {Text, View} from 'react-native';

export default function SplashScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-blue-600 px-6">
      <View className="h-20 w-20 items-center justify-center rounded-3xl bg-white/20">
        <Text className="text-3xl font-bold text-white">MC</Text>
      </View>
      <Text className="mt-5 text-3xl font-bold text-white">Meensou Connect</Text>
      <Text className="mt-2 text-base text-blue-100">Employee App</Text>
    </View>
  );
}


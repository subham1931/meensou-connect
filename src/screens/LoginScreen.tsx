import {useState} from 'react';
import {Pressable, Text, TextInput, View} from 'react-native';

type LoginScreenProps = {
  onLogin?: () => void;
};

export default function LoginScreen({onLogin}: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="flex-1 justify-center bg-slate-100 px-6">
      <View className="absolute -top-14 -right-10 h-40 w-40 rounded-full bg-blue-200/40" />
      <View className="absolute -left-16 top-24 h-36 w-36 rounded-full bg-indigo-200/30" />

      <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <View className="mb-5 items-center">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-500">
            <Text className="text-2xl text-white">🔐</Text>
          </View>
          <Text className="mt-4 text-3xl font-bold text-slate-900">
            Welcome Back
          </Text>
          <Text className="mt-1 text-[15px] text-slate-500">Login to continue</Text>
        </View>

        <View className="gap-2.5">
          <View className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
            <Text className="text-[13px] font-medium text-slate-500">
              Username / Email
            </Text>
            <TextInput
              className="mt-0.5 text-[16px] text-slate-900"
              placeholder="john@example.com"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
            />
          </View>

          <View className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
            <Text className="text-[13px] font-medium text-slate-500">Password</Text>
            <View className="mt-0.5 flex-row items-center">
              <TextInput
                className="flex-1 text-[16px] text-slate-900"
                placeholder="********"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(prev => !prev)}>
                <Text className="text-base text-slate-500">
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable className="mt-3 self-end">
          <Text className="text-[13px] font-medium text-blue-600">
            Forgot Password?
          </Text>
        </Pressable>

        <Pressable
          className="mt-5 items-center rounded-2xl bg-blue-500 py-4"
          onPress={onLogin}>
          <Text className="text-base font-semibold text-white">Login</Text>
        </Pressable>
      </View>
    </View>
  );
}


import {useState} from 'react';
import {Pressable, Text, TextInput, View} from 'react-native';

export default function LoginScreen({navigation, route}: any) {
  const [showPassword, setShowPassword] = useState(false);
  const onLogin = route.params?.onLogin;

  return (
    <View className="flex-1 justify-center bg-slate-100 px-6 pt-8">
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

        <View className="gap-4">
          <View>
            <Text className="mb-1.5 text-[13px] font-medium text-slate-500">
              Username or Email
            </Text>
            <View className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <TextInput
                className="text-[16px] text-slate-900"
                placeholder="john@example.com"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View>
            <Text className="mb-1.5 text-[13px] font-medium text-slate-500">
              Password
            </Text>
            <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
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
          className="mt-5 items-center rounded-2xl bg-blue-500 py-3.5"
          onPress={onLogin}>
          <Text className="text-base font-semibold text-white">Login</Text>
        </Pressable>

        <View className="mt-5 flex-row items-center justify-center">
          <Text className="text-[14px] text-slate-500">Don't have an account? </Text>
          <Pressable onPress={() => navigation.navigate('SignUp')}>
            <Text className="text-[14px] font-semibold text-blue-600">Sign Up</Text>
          </Pressable>
        </View>

        <View className="mt-5 flex-row items-center">
          <View className="flex-1 h-px bg-slate-200" />
          <Text className="mx-3 text-[12px] font-medium text-slate-400">OR CONNECT WITH</Text>
          <View className="flex-1 h-px bg-slate-200" />
        </View>

        <View className="mt-5 flex-row gap-3">
          <Pressable className="flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-3 flex-row gap-2">
            <Text className="text-[15px] font-medium text-slate-700">Google</Text>
          </Pressable>
          <Pressable className="flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-3 flex-row gap-2">
            <Text className="text-[15px] font-medium text-slate-700">Microsoft</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}


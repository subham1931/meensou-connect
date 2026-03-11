import {useState} from 'react';
import {Pressable, Text, TextInput, View, ScrollView} from 'react-native';

export default function SignUpScreen({navigation}: any) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ScrollView className="flex-1 bg-slate-100 px-6 pt-12" showsVerticalScrollIndicator={false}>
      <View className="absolute -top-14 -right-10 h-40 w-40 rounded-full bg-blue-200/40" />
      <View className="absolute -left-16 top-24 h-36 w-36 rounded-full bg-indigo-200/30" />

      <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm mb-10">
        <View className="mb-5 items-center">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-500">
            <Text className="text-2xl text-white">✨</Text>
          </View>
          <Text className="mt-4 text-[26px] font-bold text-slate-900">
            Create Account
          </Text>
          <Text className="mt-1 text-[15px] text-slate-500 text-center">Join the team and start tracking</Text>
        </View>

        <View className="gap-2.5">
          <View className="flex-row gap-2.5">
            <View className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              <Text className="text-[11px] font-medium text-slate-500">First Name</Text>
              <TextInput
                className="mt-0.5 text-[15px] text-slate-900 h-6"
                placeholder="John"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              <Text className="text-[11px] font-medium text-slate-500">Last Name</Text>
              <TextInput
                className="mt-0.5 text-[15px] text-slate-900 h-6"
                placeholder="Doe"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
            <Text className="text-[12px] font-medium text-slate-500">
              Company Email
            </Text>
            <TextInput
              className="mt-0.5 text-[15px] text-slate-900 h-6"
              placeholder="john@company.com"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
            <Text className="text-[12px] font-medium text-slate-500">Password</Text>
            <View className="mt-0.5 flex-row items-center">
              <TextInput
                className="flex-1 text-[15px] text-slate-900 h-6"
                placeholder="********"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(prev => !prev)}>
                <Text className="text-sm text-slate-500">
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable
          className="mt-6 items-center rounded-2xl bg-blue-500 py-3.5"
          onPress={() => navigation.navigate('HomeTabs')}>
          <Text className="text-base font-semibold text-white">Sign Up</Text>
        </Pressable>

        <View className="mt-5 flex-row items-center justify-center">
          <Text className="text-[14px] text-slate-500">Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text className="text-[14px] font-semibold text-blue-600">Login</Text>
          </Pressable>
        </View>

        <View className="mt-6 flex-row items-center">
          <View className="flex-1 h-px bg-slate-200" />
          <Text className="mx-3 text-[12px] font-medium text-slate-400">OR</Text>
          <View className="flex-1 h-px bg-slate-200" />
        </View>

        <View className="mt-6 flex-row gap-3">
          <Pressable className="flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-3 flex-row gap-2">
            <Text className="text-base font-medium text-slate-700">Google</Text>
          </Pressable>
          <Pressable className="flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-3 flex-row gap-2">
            <Text className="text-base font-medium text-slate-700">Microsoft</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

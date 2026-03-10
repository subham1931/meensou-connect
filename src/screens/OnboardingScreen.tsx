import {Pressable, Text, View} from 'react-native';

type OnboardingScreenProps = {
  onGetStarted: () => void;
};

export default function OnboardingScreen({
  onGetStarted,
}: OnboardingScreenProps) {
  return (
    <View className="flex-1 bg-slate-50">
      <View className="absolute -right-16 top-10 h-44 w-44 rounded-full bg-blue-200/40" />
      <View className="absolute -left-20 top-36 h-56 w-56 rounded-full bg-indigo-200/30" />

      <View className="flex-1 justify-center px-6">
        <View className="rounded-[28px] bg-[#1D4ED8] p-5 shadow-lg">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-semibold text-white">
                Attendance Overview
              </Text>
              <Text className="mt-1 text-xs text-blue-100">Today at office</Text>
            </View>
            <View className="rounded-full bg-white/20 px-3 py-1">
              <Text className="text-xs font-semibold text-white">Present</Text>
            </View>
          </View>

          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-white/15 p-3">
              <Text className="text-[11px] text-blue-100">Check In</Text>
              <Text className="mt-1 text-base font-bold text-white">
                09:58 am
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-white/15 p-3">
              <Text className="text-[11px] text-blue-100">Check Out</Text>
              <Text className="mt-1 text-base font-bold text-white">
                07:06 pm
              </Text>
            </View>
          </View>

          <View className="mt-4 rounded-2xl bg-white p-4">
            <Text className="text-sm font-semibold text-slate-900">
              Working hours today
            </Text>
            <Text className="mt-1 text-2xl font-bold text-blue-600">08h 43m</Text>
            <Text className="mt-2 text-xs text-slate-500">
              Keep tracking attendance and leaves in one place.
            </Text>
          </View>
        </View>
      </View>

      <View className="rounded-t-[32px] border-t border-slate-100 bg-white px-6 pb-8 pt-6">
        <View className="mb-5 flex-row items-center justify-center gap-2">
          <View className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <View className="h-1.5 w-9 rounded-full bg-blue-500" />
          <View className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        </View>

        <Text className="text-[30px] font-bold leading-10 text-slate-900">
          Simplify your daily HR routine
        </Text>
        <Text className="mt-3 text-sm leading-6 text-slate-500">
          Check-in, check-out, leave requests and profile details. Everything in
          one modern employee app.
        </Text>

        <Pressable
          className="mt-7 items-center rounded-2xl bg-blue-500 py-4"
          onPress={onGetStarted}>
          <Text className="text-lg font-semibold text-white">Get Started</Text>
        </Pressable>
      </View>
    </View>
  );
}


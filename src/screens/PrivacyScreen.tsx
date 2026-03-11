import {Pressable, ScrollView, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

export default function PrivacyScreen({navigation}: any) {
  return (
    <View className="flex-1 bg-slate-50 pt-14">
      <View className="flex-row items-center px-5 pb-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
          <Ionicons name="arrow-back" size={18} color="#0f172a" />
        </Pressable>
        <Text className="text-[26px] font-bold text-slate-900">Privacy Policy</Text>
      </View>
      <ScrollView className="px-5 pt-3 pb-20">
        <Text className="text-base leading-7 text-slate-600">
          Last updated: January 2026{'\n\n'}
          1. Data Collection{'\n'}
          We collect personal data required for employment, including your name, role, contact details, attendance patterns, and location only when checking in/out.{'\n\n'}
          2. Usage of Data{'\n'}
          Your data is used solely for HR management purposes like tracking hours, processing payroll, and managing leave requests.{'\n\n'}
          3. Data Sharing{'\n'}
          We do not sell personal data. Information is shared only with authorized HR personnel and your management chain.{'\n\n'}
          4. Data Security{'\n'}
          We employ robust security measures to protect your digital records against unauthorized access or disclosure.{'\n\n'}
          5. Your Rights{'\n'}
          You have the right to review the information we hold about you by viewing your Profile section or contacting HR.{'\n\n'}
          6. Contact{'\n'}
          If you have questions about this privacy policy, please contact hr@company.com.
        </Text>
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}

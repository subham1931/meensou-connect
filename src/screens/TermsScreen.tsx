import {Pressable, ScrollView, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

export default function TermsScreen({navigation}: any) {
  return (
    <View className="flex-1 bg-slate-50 pt-14">
      <View className="flex-row items-center px-5 pb-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
          <Ionicons name="arrow-back" size={18} color="#0f172a" />
        </Pressable>
        <Text className="text-[26px] font-bold text-slate-900">Terms & Conditions</Text>
      </View>
      <ScrollView className="px-5 pt-3 pb-20">
        <Text className="text-base leading-7 text-slate-600">
          Last updated: January 2026{'\n\n'}
          1. Introduction{'\n'}
          Welcome to Meensou Connect. By using this application, you agree to these terms.{'\n\n'}
          2. Use License{'\n'}
          You are granted a limited, non-exclusive license to access and use the app for corporate HR purposes.{'\n\n'}
          3. Privacy{'\n'}
          Your use of the app is also governed by our Privacy Policy. We collect basic attendance and professional profile data.{'\n\n'}
          4. Restrictions{'\n'}
          You agree not to misuse the system, manipulate attendance records maliciously, or share your access credentials.{'\n\n'}
          5. Termination{'\n'}
          We reserve the right to terminate access upon finding any breach of these terms or termination of your employment.{'\n\n'}
          6. Updates{'\n'}
          We may update these terms from time to time. Your continued use indicates acceptance of the updated terms.
        </Text>
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}

import {useState} from 'react';
import {Pressable, ScrollView, Switch, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

export default function SettingsScreen({navigation}: any) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View className="flex-1 bg-slate-50 pt-14">
      <View className="flex-row items-center px-5 pb-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
          <Ionicons name="arrow-back" size={18} color="#0f172a" />
        </Pressable>
        <Text className="text-[26px] font-bold text-slate-900">Settings</Text>
      </View>

      <ScrollView className="px-5 pt-3" showsVerticalScrollIndicator={false}>
        <Text className="mb-2 text-sm font-semibold text-slate-500 uppercase">
          Notifications
        </Text>
        <View className="mb-6 rounded-2xl border border-slate-100 bg-white">
          <View className="flex-row items-center justify-between border-b border-slate-100 p-4">
            <View className="flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                <Ionicons name="notifications-outline" size={18} color="#3b82f6" />
              </View>
              <Text className="ml-3 text-[16px] font-medium text-slate-900">
                Push Notifications
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{false: '#cbd5e1', true: '#3b82f6'}}
            />
          </View>
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-sky-50">
                <Ionicons name="mail-outline" size={18} color="#0284c7" />
              </View>
              <Text className="ml-3 text-[16px] font-medium text-slate-900">
                Email Updates
              </Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{false: '#cbd5e1', true: '#3b82f6'}}
            />
          </View>
        </View>

        <Text className="mb-2 text-sm font-semibold text-slate-500 uppercase">
          Privacy & Preferences
        </Text>
        <View className="mb-6 rounded-2xl border border-slate-100 bg-white">
          <View className="flex-row items-center justify-between border-b border-slate-100 p-4">
            <View className="flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                <Ionicons name="location-outline" size={18} color="#10b981" />
              </View>
              <View className="ml-3">
                <Text className="text-[16px] font-medium text-slate-900">
                  Location Services
                </Text>
                <Text className="text-[12px] text-slate-500">
                  Required for remote check-ins
                </Text>
              </View>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{false: '#cbd5e1', true: '#3b82f6'}}
            />
          </View>
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                <Ionicons name="moon-outline" size={18} color="#475569" />
              </View>
              <Text className="ml-3 text-[16px] font-medium text-slate-900">
                Dark Mode
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{false: '#cbd5e1', true: '#3b82f6'}}
            />
          </View>
        </View>
        
        <Text className="mb-2 text-sm font-semibold text-slate-500 uppercase">
          Account
        </Text>
        <View className="mb-10 rounded-2xl border border-slate-100 bg-white">
          <Pressable className="flex-row items-center justify-between border-b border-slate-100 p-4">
            <View className="flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-violet-50">
                <Ionicons name="key-outline" size={18} color="#8b5cf6" />
              </View>
              <Text className="ml-3 text-[16px] font-medium text-slate-900">
                Change Password
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </Pressable>
          <Pressable className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-red-50">
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </View>
              <Text className="ml-3 text-[16px] font-medium text-red-600">
                Delete Account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

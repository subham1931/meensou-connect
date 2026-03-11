import {Pressable, ScrollView, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

export default function ActivityScreen({navigation}: any) {
  const activities = [
    {
      id: 1,
      type: 'Check In',
      date: 'Apr 17, 2026',
      time: '10:00 am',
      status: 'On Time',
      icon: 'log-in-outline' as const,
      color: 'blue',
    },
    {
      id: 2,
      type: 'Break In',
      date: 'Apr 17, 2026',
      time: '12:30 pm',
      status: 'On Time',
      icon: 'cafe-outline' as const,
      color: 'sky',
    },
    {
      id: 3,
      type: 'Break Out',
      date: 'Apr 17, 2026',
      time: '01:00 pm',
      status: 'On Time',
      icon: 'restaurant-outline' as const,
      color: 'amber',
    },
    {
      id: 4,
      type: 'Check Out',
      date: 'Apr 17, 2026',
      time: '07:00 pm',
      status: 'Go Home',
      icon: 'log-out-outline' as const,
      color: 'indigo',
    },
    {
      id: 5,
      type: 'Check In',
      date: 'Apr 16, 2026',
      time: '10:15 am',
      status: 'Late',
      icon: 'log-in-outline' as const,
      color: 'blue',
      isLate: true,
    },
    {
      id: 6,
      type: 'Check Out',
      date: 'Apr 16, 2026',
      time: '07:15 pm',
      status: 'Go Home',
      icon: 'log-out-outline' as const,
      color: 'indigo',
    },
  ];

  return (
    <View className="flex-1 bg-slate-50 pt-14">
      <View className="flex-row items-center px-5 pb-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
          <Ionicons name="arrow-back" size={18} color="#0f172a" />
        </Pressable>
        <View>
          <Text className="text-[26px] font-bold text-slate-900">Your Activity</Text>
        </View>
      </View>

      <ScrollView className="px-5 pt-2 pb-10" showsVerticalScrollIndicator={false}>
        {activities.map((item, index) => {
          const bgColors: any = {
            blue: 'bg-blue-100',
            sky: 'bg-sky-100',
            amber: 'bg-amber-100',
            indigo: 'bg-indigo-100',
          };
          const iconColors: any = {
            blue: '#2563eb',
            sky: '#0284c7',
            amber: '#d97706',
            indigo: '#4f46e5',
          };

          return (
            <View
              key={item.id}
              className={`rounded-2xl border border-slate-100 bg-white px-4 py-4 ${
                index !== 0 ? 'mt-2.5' : ''
              }`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View
                    className={`h-11 w-11 items-center justify-center rounded-xl flex-shrink-0 ${
                      bgColors[item.color]
                    }`}>
                    <Ionicons name={item.icon} size={20} color={iconColors[item.color]} />
                  </View>
                  <View className="ml-3 flex-shrink">
                    <Text className="text-lg font-semibold text-slate-900 truncate">
                      {item.type}
                    </Text>
                    <Text className="mt-0.5 text-sm text-slate-400">{item.date}</Text>
                  </View>
                </View>
                <View className="items-end pl-2">
                  <Text className="text-[20px] font-bold text-slate-900 truncate">{item.time}</Text>
                  <Text
                    className={`mt-0.5 text-sm font-medium ${
                      item.isLate ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}

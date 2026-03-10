import {useMemo, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Image, Pressable, ScrollView, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
type HomeTabsScreenProps = {
  onLogout: () => void;
};

function HomeTab() {
  const days = useMemo(() => {
    const result: Date[] = [];
    const today = new Date();

    for (let i = -3; i <= 10; i += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      result.push(date);
    }
    return result;
  }, []);

  const todayKey = new Date().toDateString();
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const getDayLabel = (date: Date) =>
    date.toLocaleDateString('en-US', {weekday: 'short'});

  return (
    <View className="flex-1 bg-slate-50 pt-16">
      <View className="flex-row items-center justify-between px-5">
        <View className="flex-row items-center">
          <Image
            source={{uri: 'https://i.pravatar.cc/100?img=12'}}
            className="h-14 w-14 rounded-full"
          />
          <View className="ml-3">
            <Text className="text-lg font-semibold text-slate-900">
              Michael Smith
            </Text>
            <Text className="text-sm text-slate-500">Android Developer</Text>
          </View>
        </View>

        <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white">
          <Ionicons name="notifications-outline" size={21} color="#0f172a" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        className="max-h-28"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 10,
          alignItems: 'center',
        }}>
        {days.map(date => {
          const key = date.toDateString();
          const isSelected = key === selectedDate;

          return (
            <Pressable
              key={key}
              onPress={() => setSelectedDate(key)}
              className={`mr-2 min-w-[58px] self-auto rounded-xl border px-3 py-2.5 ${
                isSelected
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-slate-200 bg-white'
              }`}>
              <Text
                className={`text-center text-lg font-semibold ${
                  isSelected ? 'text-white' : 'text-slate-900'
                }`}>
                {date.getDate()}
              </Text>
              <Text
                className={`text-center text-sm ${
                  isSelected ? 'text-blue-100' : 'text-slate-500'
                }`}>
                {getDayLabel(date)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function LeavesTab() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50">
      <Text className="text-2xl font-bold text-slate-900">Leaves</Text>
    </View>
  );
}

function HolidaysTab() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50">
      <Text className="text-2xl font-bold text-slate-900">Holidays</Text>
    </View>
  );
}

function ProfileTab({onLogout}: {onLogout: () => void}) {
  return (
    <View className="flex-1 bg-slate-50 px-5 pt-14">
      <View className="items-center rounded-3xl bg-white p-5 shadow-sm">
        <Image
          source={{uri: 'https://i.pravatar.cc/200?img=12'}}
          className="h-24 w-24 rounded-full"
        />
        <Text className="mt-4 text-2xl font-bold text-slate-900">
          Michael Smith
        </Text>
        <Text className="mt-1 text-sm text-slate-500">Android Developer</Text>

        <View className="mt-6 w-full rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <Text className="text-xs text-slate-500">Email</Text>
          <Text className="mt-1 text-base font-medium text-slate-900">
            michael.smith@meensou.com
          </Text>
        </View>

        <View className="mt-3 w-full rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <Text className="text-xs text-slate-500">Employee ID</Text>
          <Text className="mt-1 text-base font-medium text-slate-900">
            MC-1042
          </Text>
        </View>

        <Pressable
          className="mt-6 w-full flex-row items-center justify-center rounded-2xl bg-red-500 py-4"
          onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text className="ml-2 text-base font-semibold text-white">Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const getIconName = (
  route: string,
  focused: boolean,
): keyof typeof Ionicons.glyphMap => {
  if (route === 'Home') {
    return focused ? 'home' : 'home-outline';
  }
  if (route === 'Leaves') {
    return focused ? 'document-text' : 'document-text-outline';
  }
  if (route === 'Holidays') {
    return focused ? 'calendar' : 'calendar-outline';
  }
  return focused ? 'person' : 'person-outline';
};

export default function HomeTabsScreen({onLogout}: HomeTabsScreenProps) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            height: 68,
            paddingTop: 8,
            paddingBottom: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarIcon: ({color, size, focused}) => (
            <Ionicons
              name={getIconName(route.name, focused)}
              size={size}
              color={color}
            />
          ),
        })}>
        <Tab.Screen name="Home" component={HomeTab} />
        <Tab.Screen name="Leaves" component={LeavesTab} />
        <Tab.Screen name="Holidays" component={HolidaysTab} />
        <Tab.Screen name="Profile">
          {() => <ProfileTab onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}


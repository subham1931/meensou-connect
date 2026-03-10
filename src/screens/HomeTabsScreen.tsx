import {useEffect, useMemo, useRef, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
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
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const getDayLabel = (date: Date) =>
    date.toLocaleDateString('en-US', {weekday: 'short'});
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);
  const dragX = useState(new Animated.Value(0))[0];
  const maxSlide = Math.max(sliderWidth - 52, 0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          const clamped = Math.max(0, Math.min(gestureState.dx, maxSlide));
          dragX.setValue(clamped);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > maxSlide * 0.7) {
            Animated.timing(dragX, {
              toValue: maxSlide,
              duration: 100,
              useNativeDriver: true,
            }).start(() => {
              setIsCheckedIn(prev => !prev);
              Animated.spring(dragX, {
                toValue: 0,
                speed: 24,
                bounciness: 0,
                useNativeDriver: true,
              }).start();
            });
            return;
          }

          Animated.timing(dragX, {
            toValue: 0,
            duration: 140,
            useNativeDriver: true,
          }).start();
        },
      }),
    [dragX, maxSlide],
  );

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const ctaScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });
  const arrowNudge = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
  });

  const attendanceCards = [
    {
      key: 'check-in',
      title: 'Check In',
      value: '10:20 am',
      subtitle: 'On Time',
      icon: 'log-in-outline' as const,
      iconColor: '#2563eb',
      iconBg: 'bg-blue-100',
      subtitleColor: 'text-emerald-600',
    },
    {
      key: 'check-out',
      title: 'Check Out',
      value: '07:00 pm',
      subtitle: 'Go Home',
      icon: 'log-out-outline' as const,
      iconColor: '#4f46e5',
      iconBg: 'bg-indigo-100',
      subtitleColor: 'text-slate-500',
    },
    {
      key: 'break',
      title: 'Break Time',
      value: '00:30 min',
      subtitle: 'Avg 30 min',
      icon: 'cafe-outline' as const,
      iconColor: '#0284c7',
      iconBg: 'bg-sky-100',
      subtitleColor: 'text-slate-500',
    },
    {
      key: 'days',
      title: 'Total Days',
      value: '28 days',
      subtitle: 'Working Days',
      icon: 'calendar-outline' as const,
      iconColor: '#7c3aed',
      iconBg: 'bg-violet-100',
      subtitleColor: 'text-slate-500',
    },
  ];

  return (
    <View className="flex-1 bg-slate-50 pt-16 pb-20">
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

      <View className="px-5 pt-2">
        <Text className="text-xl font-bold text-slate-900">Today Attendance</Text>
        <Text className="mt-1 text-sm text-slate-500">
          Quick summary of your daily activity
        </Text>

        <View className="mt-3 flex-row flex-wrap justify-between">
          {attendanceCards.map(card => (
            <View
              key={card.key}
              className="mb-2.5 w-[48.5%] rounded-2xl border border-slate-100 bg-white p-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-medium text-slate-500">{card.title}</Text>
                <View
                  className={`h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}>
                  <Ionicons name={card.icon} size={16} color={card.iconColor} />
                </View>
              </View>

              <Text className="mt-2 text-[22px] font-bold text-slate-900">{card.value}</Text>
              <Text className={`mt-0.5 text-xs font-medium ${card.subtitleColor}`}>
                {card.subtitle}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-3">
          <View className="mb-3.5 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-slate-900">Your Activity</Text>
            <Pressable>
              <Text className="text-base font-medium text-blue-500">View All</Text>
            </Pressable>
          </View>

          <View className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <Ionicons name="log-in-outline" size={18} color="#2563eb" />
                </View>
                <View className="ml-3">
                  <Text className="text-lg font-semibold text-slate-900">
                    Check In
                  </Text>
                  <Text className="mt-0.5 text-sm text-slate-400">Apr 17, 2026</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-2xl font-bold text-slate-900">10:00 am</Text>
                <Text className="mt-0.5 text-sm font-medium text-emerald-600">
                  On Time
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-2.5 rounded-2xl border border-slate-100 bg-white px-4 py-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
                  <Ionicons name="cafe-outline" size={18} color="#0284c7" />
                </View>
                <View className="ml-3">
                  <Text className="text-lg font-semibold text-slate-900">
                    Break In
                  </Text>
                  <Text className="mt-0.5 text-sm text-slate-400">Apr 17, 2026</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-2xl font-bold text-slate-900">12:30 pm</Text>
                <Text className="mt-0.5 text-sm text-slate-500">On Time</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <Animated.View
        className={`absolute bottom-2 left-4 right-4 z-20 rounded-2xl p-2 ${
          isCheckedIn ? 'bg-red-200' : 'bg-blue-500'
        }`}
        style={{transform: [{scale: ctaScale}]}}
        onLayout={e => setSliderWidth(e.nativeEvent.layout.width - 16)}>
        <View className="pointer-events-none absolute inset-0 items-center justify-center px-16">
          <Text
            className={`text-center text-xl font-semibold ${
              isCheckedIn ? 'text-red-800' : 'text-white'
            }`}>
            {isCheckedIn ? 'Swipe to Check Out' : 'Swipe to Check In'}
          </Text>
        </View>

        <Animated.View
          {...panResponder.panHandlers}
          style={{transform: [{translateX: dragX}]}}
          className="h-11 w-11 items-center justify-center rounded-xl bg-white">
          <Animated.View style={{transform: [{translateX: arrowNudge}]}}>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={isCheckedIn ? '#991b1b' : '#3b82f6'}
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
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


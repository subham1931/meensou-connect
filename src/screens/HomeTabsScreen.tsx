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
  TextInput,
  View,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';

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
  type LeaveStatus = 'Approved' | 'Pending' | 'Canceled';
  type LeaveFilter = 'All' | LeaveStatus;
  type LeaveItem = {
    id: string;
    leaveTitle: string;
    leaveType: string;
    dateRange: string;
    reason: string;
    appliedOnDate: string;
    status: LeaveStatus;
    applyDays: string;
    leaveBalance: string;
    approvedBy: string;
  };

  const leaveStats = [
    {
      key: 'balance',
      title: 'Leave Balance',
      value: '12',
      subtitle: 'Days Available',
      icon: 'wallet-outline' as const,
      iconColor: '#2563eb',
      iconBg: 'bg-blue-100',
      subtitleColor: 'text-slate-500',
      topAccent: 'bg-blue-500',
    },
    {
      key: 'approved',
      title: 'Leave Approved',
      value: '8',
      subtitle: 'Approved',
      icon: 'checkmark-done-outline' as const,
      iconColor: '#059669',
      iconBg: 'bg-emerald-100',
      subtitleColor: 'text-emerald-600',
      topAccent: 'bg-emerald-500',
    },
    {
      key: 'pending',
      title: 'Leave Pending',
      value: '2',
      subtitle: 'Awaiting Review',
      icon: 'time-outline' as const,
      iconColor: '#d97706',
      iconBg: 'bg-amber-100',
      subtitleColor: 'text-amber-600',
      topAccent: 'bg-amber-500',
    },
    {
      key: 'canceled',
      title: 'Leave Canceled',
      value: '1',
      subtitle: 'Canceled',
      icon: 'close-circle-outline' as const,
      iconColor: '#e11d48',
      iconBg: 'bg-rose-100',
      subtitleColor: 'text-rose-600',
      topAccent: 'bg-rose-500',
    },
  ];

  const leaveHistory: LeaveItem[] = [
    {
      id: 'lv-001',
      leaveTitle: 'Family Function',
      leaveType: 'Casual Leave',
      dateRange: 'Mar 10, 2023 - Mar 12, 2023',
      reason: 'Family event out of town, so I need leave for two days.',
      appliedOnDate: 'Mar 05, 2023',
      status: 'Approved',
      applyDays: '2 Days',
      leaveBalance: '19',
      approvedBy: 'Martin Deo',
    },
    {
      id: 'lv-002',
      leaveTitle: 'Health Checkup',
      leaveType: 'Sick Leave',
      dateRange: 'Apr 02, 2023 - Apr 03, 2023',
      reason: 'Scheduled medical checkup and rest as advised by doctor.',
      appliedOnDate: 'Mar 30, 2023',
      status: 'Approved',
      applyDays: '2 Days',
      leaveBalance: '17',
      approvedBy: 'Emma Clark',
    },
    {
      id: 'lv-003',
      leaveTitle: 'Personal Work',
      leaveType: 'Casual Leave',
      dateRange: 'May 18, 2023 - May 18, 2023',
      reason: 'Need one day leave for important personal documentation work.',
      appliedOnDate: 'May 15, 2023',
      status: 'Pending',
      applyDays: '1 Day',
      leaveBalance: '16',
      approvedBy: 'Waiting',
    },
    {
      id: 'lv-004',
      leaveTitle: 'Vacation Trip',
      leaveType: 'Earned Leave',
      dateRange: 'Jun 01, 2023 - Jun 03, 2023',
      reason: 'Short vacation planned with family.',
      appliedOnDate: 'May 22, 2023',
      status: 'Approved',
      applyDays: '3 Days',
      leaveBalance: '13',
      approvedBy: 'Martin Deo',
    },
    {
      id: 'lv-005',
      leaveTitle: 'Emergency Leave',
      leaveType: 'Casual Leave',
      dateRange: 'Jul 12, 2023 - Jul 13, 2023',
      reason: 'Unexpected emergency at home.',
      appliedOnDate: 'Jul 10, 2023',
      status: 'Canceled',
      applyDays: '2 Days',
      leaveBalance: '13',
      approvedBy: 'HR Team',
    },
  ];
  const [activeFilter, setActiveFilter] = useState<LeaveFilter>('All');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveItem | null>(null);
  const [leaveTitle, setLeaveTitle] = useState('');
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [showLeaveTypeOptions, setShowLeaveTypeOptions] = useState(false);
  const filterOptions: LeaveFilter[] = ['All', 'Approved', 'Pending', 'Canceled'];
  const leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Other'];

  const filteredLeaveHistory = leaveHistory.filter(item =>
    activeFilter === 'All' ? true : item.status === activeFilter,
  );

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseInputDate = (value: string) => {
    const [day, month, year] = value.split('/').map(Number);
    if (!day || !month || !year) {
      return new Date();
    }
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const openDatePicker = (field: 'start' | 'end') => {
    const initialValue =
      field === 'start' ? parseInputDate(startDate) : parseInputDate(endDate);

    DateTimePickerAndroid.open({
      value: initialValue,
      mode: 'date',
      is24Hour: true,
      onChange: (_, selectedDate) => {
        if (!selectedDate) {
          return;
        }
        const formatted = formatDate(selectedDate);
        if (field === 'start') {
          setStartDate(formatted);
          return;
        }
        setEndDate(formatted);
      },
    });
  };

  const getStatusStyles = (status: LeaveStatus) => {
    if (status === 'Approved') {
      return {bg: 'bg-emerald-100', text: 'text-emerald-700'};
    }
    if (status === 'Pending') {
      return {bg: 'bg-amber-100', text: 'text-amber-700'};
    }
    return {bg: 'bg-rose-100', text: 'text-rose-700'};
  };

  if (selectedLeave) {
    const statusStyle = getStatusStyles(selectedLeave.status);

    return (
      <View className="flex-1 bg-slate-50 pt-14">
        <View className="flex-row items-center px-5 pb-3">
          <Pressable
            onPress={() => setSelectedLeave(null)}
            className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white">
            <Ionicons name="arrow-back" size={18} color="#0f172a" />
          </Pressable>
          <Text className="text-2xl font-bold text-slate-900">Leave Details</Text>
        </View>

        <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
          <View className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-xs font-medium text-slate-500">Leave Title</Text>
                <Text className="mt-1 text-[22px] font-bold leading-7 text-slate-900">
                  {selectedLeave.leaveTitle}
                </Text>
                <Text className="mt-2 text-sm font-medium text-slate-500">
                  {selectedLeave.dateRange}
                </Text>
              </View>
              <View className={`rounded-full px-3 py-1.5 ${statusStyle.bg}`}>
                <Text className={`text-sm font-semibold ${statusStyle.text}`}>
                  {selectedLeave.status}
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row items-center rounded-xl bg-slate-50 px-3 py-3">
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                <Ionicons name="document-text-outline" size={18} color="#2563eb" />
              </View>
              <View className="ml-3">
                <Text className="text-xs text-slate-500">Leave Type</Text>
                <Text className="text-base font-semibold text-slate-900">
                  {selectedLeave.leaveType}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-3 flex-row flex-wrap justify-between">
            <View className="mb-3 w-[48.5%] rounded-2xl border border-slate-100 bg-white p-3.5">
              <Text className="text-xs text-slate-500">Applied On</Text>
              <Text className="mt-1 text-[15px] font-semibold text-slate-900">
                {selectedLeave.appliedOnDate}
              </Text>
            </View>
            <View className="mb-3 w-[48.5%] rounded-2xl border border-slate-100 bg-white p-3.5">
              <Text className="text-xs text-slate-500">Status</Text>
              <Text className="mt-1 text-[15px] font-semibold text-slate-900">
                {selectedLeave.status}
              </Text>
            </View>
            {selectedLeave.status === 'Approved' && (
              <View className="mb-3 w-full rounded-2xl border border-slate-100 bg-white p-3.5">
                <Text className="text-xs text-slate-500">Approved By</Text>
                <Text className="mt-1 text-[15px] font-semibold text-slate-900">
                  {selectedLeave.approvedBy}
                </Text>
              </View>
            )}
          </View>

          <View className="mb-10 rounded-2xl border border-slate-100 bg-white p-4">
            <View className="flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-violet-100">
                <Ionicons name="chatbox-ellipses-outline" size={18} color="#6d28d9" />
              </View>
              <Text className="ml-2.5 text-base font-semibold text-slate-900">Reason</Text>
            </View>
            <Text className="mt-3 text-[15px] leading-7 text-slate-700">
              {selectedLeave.reason}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (showApplyModal) {
    return (
      <View className="flex-1 bg-slate-50 pt-14">
        <View className="flex-row items-center px-5 pb-3">
          <Pressable
            onPress={() => setShowApplyModal(false)}
            className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white">
            <Ionicons name="arrow-back" size={18} color="#0f172a" />
          </Pressable>
          <Text className="text-2xl font-bold text-slate-900">Apply Leave</Text>
        </View>

        <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
          <View className="mb-3">
            <Text className="mb-2 text-sm font-medium text-slate-700">Leave Title</Text>
            <TextInput
              value={leaveTitle}
              onChangeText={setLeaveTitle}
              placeholder="Enter leave title"
              placeholderTextColor="#94a3b8"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900"
            />
          </View>

          <View className="relative z-30 mb-3">
            <Text className="mb-2 text-sm font-medium text-slate-700">Leave Type</Text>
            <Pressable
              onPress={() => setShowLeaveTypeOptions(prev => !prev)}
              className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5">
              <Text className="text-base text-slate-900">{leaveType}</Text>
              <Ionicons
                name={showLeaveTypeOptions ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#64748b"
              />
            </Pressable>

            {showLeaveTypeOptions && (
              <View className="absolute left-0 right-0 top-[76px] rounded-xl border border-slate-200 bg-white py-1 shadow-sm">
                {leaveTypes.map(type => {
                  const isSelected = leaveType === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => {
                        setLeaveType(type);
                        setShowLeaveTypeOptions(false);
                      }}
                      className={`flex-row items-center justify-between px-4 py-3 ${
                        isSelected ? 'bg-blue-50' : 'bg-white'
                      }`}>
                      <Text
                        className={`text-sm font-medium ${
                          isSelected ? 'text-blue-700' : 'text-slate-700'
                        }`}>
                        {type}
                      </Text>
                      {isSelected && <Ionicons name="checkmark" size={16} color="#2563eb" />}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View className="mb-3 flex-row justify-between">
            <View className="w-[48.5%]">
              <Text className="mb-2 text-sm font-medium text-slate-700">Starting Date</Text>
              <Pressable
                onPress={() => openDatePicker('start')}
                className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5">
                <Text className={startDate ? 'text-base text-slate-900' : 'text-base text-slate-400'}>
                  {startDate || 'DD/MM/YYYY'}
                </Text>
                <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
              </Pressable>
            </View>
            <View className="w-[48.5%]">
              <Text className="mb-2 text-sm font-medium text-slate-700">Ending Date</Text>
              <Pressable
                onPress={() => openDatePicker('end')}
                className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5">
                <Text className={endDate ? 'text-base text-slate-900' : 'text-base text-slate-400'}>
                  {endDate || 'DD/MM/YYYY'}
                </Text>
                <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
              </Pressable>
            </View>
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-slate-700">Reason of Leave</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              multiline
              textAlignVertical="top"
              placeholder="Write your reason..."
              placeholderTextColor="#94a3b8"
              className="min-h-[130px] rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900"
            />
          </View>

          <Pressable
            onPress={() => setShowApplyModal(false)}
            className="mb-10 items-center rounded-xl bg-blue-500 py-3.5">
            <Text className="text-base font-semibold text-white">Submit Leave Request</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 px-5 pt-16">
      <View className="flex-row items-center justify-between">
        <Text className="text-3xl font-bold text-slate-900">All Leaves</Text>
        <Pressable
          onPress={() => setShowApplyModal(true)}
          className="flex-row items-center rounded-xl bg-blue-500 px-3.5 py-2">
          <Ionicons name="add" size={16} color="#ffffff" />
          <Text className="ml-1.5 text-xs font-semibold text-white">Apply Leave</Text>
        </Pressable>
      </View>
      <Text className="mt-1 text-sm text-slate-500">
        Overview of your leave status
      </Text>

      <View className="mt-4 flex-row flex-wrap justify-between">
        {leaveStats.map(card => (
          <View
            key={card.key}
            className="mb-3 w-[48.5%] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <View className={`h-1.5 w-full ${card.topAccent}`} />
            <View className="p-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-medium text-slate-500">{card.title}</Text>
                <View
                  className={`h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}>
                  <Ionicons name={card.icon} size={16} color={card.iconColor} />
                </View>
              </View>
              <Text className="mt-2 text-[24px] font-bold text-slate-900">{card.value}</Text>
              <Text className={`mt-0.5 text-xs font-medium ${card.subtitleColor}`}>
                {card.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View className="mt-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-slate-900">Leave History</Text>
          <Pressable
            onPress={() => setShowFilterOptions(prev => !prev)}
            className={`h-9 w-9 items-center justify-center rounded-lg border bg-white ${
              showFilterOptions || activeFilter !== 'All'
                ? 'border-blue-200'
                : 'border-slate-200'
            }`}>
            <Ionicons
              name="options-outline"
              size={18}
              color={showFilterOptions || activeFilter !== 'All' ? '#2563eb' : '#334155'}
            />
          </Pressable>
        </View>
        <Text className="mt-1 text-sm text-slate-500">
          Recently requested leaves
        </Text>

        {showFilterOptions && (
          <View className="mt-3 flex-row flex-wrap">
            {filterOptions.map(option => {
              const isActive = activeFilter === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    setActiveFilter(option);
                    setShowFilterOptions(false);
                  }}
                  className={`mr-2 mb-2 rounded-full border px-3 py-1.5 ${
                    isActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
                  }`}>
                  <Text
                    className={`text-xs font-semibold ${
                      isActive ? 'text-blue-700' : 'text-slate-600'
                    }`}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {filteredLeaveHistory.map(item => {
          const statusStyle = getStatusStyles(item.status);

          return (
            <Pressable
              key={item.id}
              onPress={() => setSelectedLeave(item)}
              className="mt-3 rounded-2xl border border-slate-100 bg-white p-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-[11px] text-slate-500">Date</Text>
                  <Text className="mt-1 text-[16px] font-bold leading-5 text-slate-900">
                    {item.dateRange}
                  </Text>
                </View>
                <View className={`rounded-lg px-2.5 py-1 ${statusStyle.bg}`}>
                  <Text className={`text-xs font-semibold ${statusStyle.text}`}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View className="my-3 h-px bg-slate-100" />

              <View className="flex-row justify-between">
                <View>
                  <Text className="text-[11px] text-slate-500">Apply Days</Text>
                  <Text className="mt-1 text-[14px] font-semibold text-slate-900">
                    {item.applyDays}
                  </Text>
                </View>
                <View>
                  <Text className="text-[11px] text-slate-500">Leave Balance</Text>
                  <Text className="mt-1 text-[14px] font-semibold text-slate-900">
                    {item.leaveBalance}
                  </Text>
                </View>
                <View>
                  <Text className="text-[11px] text-slate-500">Approved By</Text>
                  <Text className="mt-1 text-[14px] font-semibold text-slate-900">
                    {item.approvedBy}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}

        {filteredLeaveHistory.length === 0 && (
          <View className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-white py-6">
            <Text className="text-center text-sm text-slate-500">
              No leave records for this filter.
            </Text>
          </View>
        )}
      </View>
      <View className="h-24" />
    </ScrollView>
  );
}

function HolidaysTab() {
  const holidays = [
    {
      id: 'h-1',
      isoDate: '2026-01-26',
      date: 'January 26, 2026',
      day: 'Monday',
      title: 'Republic Day',
    },
    {
      id: 'h-2',
      isoDate: '2026-03-14',
      date: 'March 14, 2026',
      day: 'Saturday',
      title: 'Holi',
    },
    {
      id: 'h-3',
      isoDate: '2026-04-10',
      date: 'April 10, 2026',
      day: 'Friday',
      title: 'Good Friday',
    },
    {
      id: 'h-4',
      isoDate: '2026-08-15',
      date: 'August 15, 2026',
      day: 'Saturday',
      title: 'Independence Day',
    },
    {
      id: 'h-5',
      isoDate: '2026-10-02',
      date: 'October 02, 2026',
      day: 'Friday',
      title: 'Gandhi Jayanti',
    },
  ];

  return (
    <ScrollView className="flex-1 bg-slate-50 px-5 pt-16">
      <Text className="text-3xl font-bold text-slate-900">Holidays</Text>
      <Text className="mt-1 text-sm text-slate-500">
        Upcoming holidays and office off days
      </Text>

      <View className="mt-4">
        {holidays.map(item => {
          const today = new Date();
          const currentDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
          );
          const holidayDate = new Date(item.isoDate);
          const isUpcoming = holidayDate >= currentDate;
          const accentClass = isUpcoming ? 'bg-blue-500' : 'bg-slate-300';
          const cardClass = isUpcoming ? 'bg-blue-50' : 'bg-slate-100';
          const dateTextClass = isUpcoming ? 'text-slate-800' : 'text-slate-500';
          const dayTextClass = isUpcoming ? 'text-blue-300' : 'text-slate-400';
          const titleTextClass = isUpcoming ? 'text-slate-900' : 'text-slate-500';
          const iconColor = isUpcoming ? '#334155' : '#94a3b8';

          return (
            <View
              key={item.id}
              className={`mb-3 overflow-hidden rounded-2xl ${cardClass}`}>
              <View className="flex-row">
                <View className={`w-1.5 ${accentClass}`} />
                <View className="flex-1 px-4 py-3.5">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={15} color={iconColor} />
                      <Text className={`ml-2 text-[13px] font-semibold ${dateTextClass}`}>
                        {item.date}
                      </Text>
                    </View>
                    <Text className={`text-[13px] ${dayTextClass}`}>{item.day}</Text>
                  </View>
                  <Text className={`mt-1.5 text-[16px] font-bold leading-6 ${titleTextClass}`}>
                    {item.title}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View className="h-24" />
    </ScrollView>
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


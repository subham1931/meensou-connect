import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
// Removed NavigationContainer import
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useFocusEffect} from '@react-navigation/native';
import {
  Alert,
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
import type { EmployeeProfile } from '../services/mobileAuth';
import { formatTimeLabel, getAttendanceByDate, markCheckIn, markCheckOut } from '../services/attendance';
import { createLeaveRequest, listEmployeeLeaveRequests } from '../services/leaves';

const Tab = createBottomTabNavigator();
type HomeTabsScreenProps = {
  onLogout: () => void;
  employeeProfile?: EmployeeProfile | null;
};

const getInitials = (value: string) =>
  (value || "A")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

function HomeTab({navigation, employeeProfile}: {navigation: any, employeeProfile?: EmployeeProfile | null}) {
  const calendarScrollRef = useRef<ScrollView>(null);
  const days = useMemo(() => {
    const result: Date[] = [];
    const today = new Date();

    for (let i = -13; i <= 0; i += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      result.push(date);
    }
    return result;
  }, []);

  const todayKey = new Date().toDateString();
  const todayIso = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const getDayLabel = (date: Date) =>
    date.toLocaleDateString('en-US', {weekday: 'short'});
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isSubmittingSwipe, setIsSubmittingSwipe] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<{
    checkInAt: string | null
    checkOutAt: string | null
    status: string
    workMinutes: number
  } | null>(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const dragX = useState(new Animated.Value(0))[0];
  const maxSlide = Math.max(sliderWidth - 52, 0);
  const restingTranslateX = isCheckedIn ? maxSlide : 0;

  useEffect(() => {
    dragX.setValue(restingTranslateX);
  }, [dragX, restingTranslateX]);

  const selectedIsoDate = useMemo(() => {
    const dateObj = new Date(selectedDate);
    if (Number.isNaN(dateObj.getTime())) return todayIso;
    return `${dateObj.getFullYear()}-${`${dateObj.getMonth() + 1}`.padStart(2, '0')}-${`${dateObj.getDate()}`.padStart(2, '0')}`;
  }, [selectedDate, todayIso]);
  const selectedDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(selectedDate)),
    [selectedDate],
  );
  const isSelectedToday = selectedIsoDate === todayIso;
  const hasCheckedOutForSelectedDate = Boolean(todayAttendance?.checkOutAt);
  const isSwipeDisabled = !isSelectedToday || hasCheckedOutForSelectedDate || isSubmittingSwipe;

  useEffect(() => {
    let mounted = true;
    async function loadAttendanceForSelectedDate() {
      try {
        const code = employeeProfile?.employeeCode || '';
        if (!code) return;
        const record = await getAttendanceByDate(code, selectedIsoDate);
        if (!mounted) return;
        setTodayAttendance(record);
        const isToday = selectedIsoDate === todayIso;
        setIsCheckedIn(Boolean(isToday && record?.checkInAt && !record?.checkOutAt));
      } catch {
        if (!mounted) return;
        setTodayAttendance(null);
      }
    }
    loadAttendanceForSelectedDate();
    return () => {
      mounted = false;
    };
  }, [employeeProfile?.employeeCode, selectedIsoDate, todayIso]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          const clamped = isCheckedIn
            ? Math.max(0, Math.min(maxSlide, maxSlide + gestureState.dx))
            : Math.max(0, Math.min(gestureState.dx, maxSlide));
          dragX.setValue(clamped);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (isSwipeDisabled) {
            Animated.timing(dragX, {
              toValue: restingTranslateX,
              duration: 140,
              useNativeDriver: true,
            }).start();
            return;
          }
          const reachedCheckInThreshold = !isCheckedIn && gestureState.dx > maxSlide * 0.7;
          const reachedCheckOutThreshold = isCheckedIn && gestureState.dx < -maxSlide * 0.7;
          if (reachedCheckInThreshold || reachedCheckOutThreshold) {
            Animated.timing(dragX, {
              toValue: isCheckedIn ? 0 : maxSlide,
              duration: 100,
              useNativeDriver: true,
            }).start(async () => {
              const code = employeeProfile?.employeeCode || '';
              if (!isSelectedToday) {
                Alert.alert('Date restricted', 'Check-in and check-out are allowed only for today.');
                Animated.spring(dragX, {
                  toValue: restingTranslateX,
                  speed: 24,
                  bounciness: 0,
                  useNativeDriver: true,
                }).start();
                return;
              }
              if (hasCheckedOutForSelectedDate) {
                Alert.alert('Attendance completed', 'You already checked out for this date.');
                Animated.spring(dragX, {
                  toValue: restingTranslateX,
                  speed: 24,
                  bounciness: 0,
                  useNativeDriver: true,
                }).start();
                return;
              }
              if (!code) {
                Alert.alert('Unable to mark attendance', 'Employee profile not found.');
                Animated.spring(dragX, {
                  toValue: restingTranslateX,
                  speed: 24,
                  bounciness: 0,
                  useNativeDriver: true,
                }).start();
                return;
              }
              try {
                setIsSubmittingSwipe(true);
                const updated = isCheckedIn
                  ? await markCheckOut(code)
                  : await markCheckIn(code);
                setTodayAttendance(updated);
                const nextCheckedIn = Boolean(updated?.checkInAt && !updated?.checkOutAt);
                setIsCheckedIn(nextCheckedIn);
                Animated.spring(dragX, {
                  toValue: nextCheckedIn ? maxSlide : 0,
                  speed: 24,
                  bounciness: 0,
                  useNativeDriver: true,
                }).start();
              } catch (error: any) {
                Alert.alert('Attendance Error', error?.message || 'Unable to update attendance.');
                Animated.spring(dragX, {
                  toValue: restingTranslateX,
                  speed: 24,
                  bounciness: 0,
                  useNativeDriver: true,
                }).start();
              } finally {
                setIsSubmittingSwipe(false);
              }
            });
            return;
          }

          Animated.timing(dragX, {
            toValue: restingTranslateX,
            duration: 140,
            useNativeDriver: true,
          }).start();
        },
      }),
    [dragX, employeeProfile?.employeeCode, isCheckedIn, isSelectedToday, isSubmittingSwipe, maxSlide, restingTranslateX],
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
      value: formatTimeLabel(todayAttendance?.checkInAt || null),
      subtitle: todayAttendance?.status || 'Not Marked',
      icon: 'log-in-outline' as const,
      iconColor: '#2563eb',
      iconBg: 'bg-blue-100',
      subtitleColor: todayAttendance?.status === 'Late' ? 'text-rose-600' : 'text-emerald-600',
    },
    {
      key: 'check-out',
      title: 'Check Out',
      value: formatTimeLabel(todayAttendance?.checkOutAt || null),
      subtitle: todayAttendance?.checkOutAt ? 'Completed' : 'Pending',
      icon: 'log-out-outline' as const,
      iconColor: '#4f46e5',
      iconBg: 'bg-indigo-100',
      subtitleColor: 'text-slate-500',
    },
    {
      key: 'break',
      title: 'Break Time',
      value: '--',
      subtitle: 'No break tracking',
      icon: 'cafe-outline' as const,
      iconColor: '#0284c7',
      iconBg: 'bg-sky-100',
      subtitleColor: 'text-slate-500',
    },
    {
      key: 'days',
      title: 'Total Days',
      value: todayAttendance?.checkInAt ? '1 day' : '0 day',
      subtitle: 'This Date',
      icon: 'calendar-outline' as const,
      iconColor: '#7c3aed',
      iconBg: 'bg-violet-100',
      subtitleColor: 'text-slate-500',
    },
  ];
  const firstName = (employeeProfile?.fullName || '').trim().split(' ')[0] || 'Employee';
  const roleLabel = employeeProfile?.designation || employeeProfile?.department || 'Team Member';
  const avatarUri = (employeeProfile?.profileImageUrl || '').trim();
  const initials = getInitials(employeeProfile?.fullName || 'Employee');

  return (
    <View className="flex-1 bg-slate-50 relative pb-20">
      <View className="flex-row items-center justify-between px-6 pt-16">
        <View className="flex-row items-center">
          {avatarUri ? (
            <Image
              source={{uri: avatarUri}}
              className="h-14 w-14 rounded-full border-2 border-white shadow-sm"
            />
          ) : (
            <View className="h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-emerald-100 shadow-sm">
              <Text className="text-base font-semibold text-emerald-700">{initials || "A"}</Text>
            </View>
          )}
          <View className="ml-3.5">
            <Text className="text-[16px] font-bold tracking-tight text-slate-900">
              Hi, {firstName} 👋
            </Text>
            <Text className="text-[13px] font-medium text-slate-500">{roleLabel}</Text>
          </View>
        </View>

        <Pressable className="h-12 w-12 items-center justify-center rounded-[20px] bg-white shadow-sm shadow-slate-200/50">
          <Ionicons name="notifications-outline" size={22} color="#0f172a" />
        </Pressable>
      </View>

      <View className="mt-4">
        <ScrollView
          ref={calendarScrollRef}
          horizontal
          className="max-h-28"
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={() =>
            calendarScrollRef.current?.scrollToEnd({animated: false})
          }
          contentContainerStyle={{
            paddingHorizontal: 24,
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
                className={`mr-3 min-w-[62px] items-center justify-center rounded-2xl px-2 py-3 ${
                  isSelected
                    ? 'bg-blue-600 shadow-md shadow-blue-500/40'
                    : 'bg-white shadow-sm shadow-slate-200/50'
                }`}>
                <Text
                  className={`text-[12px] font-semibold tracking-wide uppercase ${
                    isSelected ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                  {getDayLabel(date)}
                </Text>
                <Text
                  className={`mt-1.5 text-[20px] font-extrabold ${
                    isSelected ? 'text-white' : 'text-slate-800'
                  }`}>
                  {date.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View className="px-6 pt-4">
        <Text className="text-[20px] font-extrabold tracking-tight text-slate-900">Today's Activity</Text>
        <Text className="mt-0.5 text-[14px] font-medium text-slate-500">
          Your daily summary
        </Text>

        <View className="mt-4 flex-row flex-wrap justify-between gap-y-4">
          {attendanceCards.map(card => (
            <View
              key={card.key}
              className="w-[48%] rounded-[28px] bg-white p-4 shadow-sm shadow-slate-200/40">
              <View className="flex-row items-center justify-between">
                <Text className="text-[13px] font-bold text-slate-400">{card.title}</Text>
                <View
                  className={`h-11 w-11 items-center justify-center rounded-[18px] ${card.iconBg}`}>
                  <Ionicons name={card.icon} size={20} color={card.iconColor} />
                </View>
              </View>

              <Text className="mt-3 text-[22px] font-extrabold tracking-tight text-slate-900">{card.value}</Text>
              <Text className={`mt-1.5 text-[11px] font-bold uppercase tracking-wider ${card.subtitleColor}`}>
                {card.subtitle}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[20px] font-extrabold tracking-tight text-slate-900">Recent Logs</Text>
            <Pressable onPress={() => navigation.navigate('Activity')}>
              <Text className="text-[14px] font-bold tracking-wide text-blue-600">View All</Text>
            </Pressable>
          </View>

          <View className="rounded-[24px] bg-white p-4 shadow-sm shadow-slate-200/40">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-12 w-12 items-center justify-center rounded-[20px] bg-blue-50">
                  <Ionicons name="log-in-outline" size={24} color="#2563eb" />
                </View>
                <View className="ml-3.5">
                  <Text className="text-[16px] font-extrabold text-slate-900">
                    Checked In
                  </Text>
                  <Text className="mt-0.5 text-[13px] font-medium text-slate-400">{selectedDateLabel}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-[18px] font-bold tracking-tight text-slate-900">
                  {formatTimeLabel(todayAttendance?.checkInAt || null)}
                </Text>
                <View className="mt-1.5 rounded-full bg-emerald-50 px-2 py-0.5">
                  <Text className="text-[10px] font-bold tracking-wide text-emerald-600 uppercase">
                    {todayAttendance?.status || 'Not Marked'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="mt-3 rounded-[24px] bg-white p-4 shadow-sm shadow-slate-200/40">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-12 w-12 items-center justify-center rounded-[20px] bg-sky-50">
                  <Ionicons name="cafe-outline" size={24} color="#0284c7" />
                </View>
                <View className="ml-3.5">
                  <Text className="text-[16px] font-extrabold text-slate-900">
                    Checked Out
                  </Text>
                  <Text className="mt-0.5 text-[13px] font-medium text-slate-400">{selectedDateLabel}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-[18px] font-bold tracking-tight text-slate-900">
                  {formatTimeLabel(todayAttendance?.checkOutAt || null)}
                </Text>
                <Text className="mt-1 text-[12px] font-medium text-slate-400">
                  {todayAttendance?.workMinutes ? `${todayAttendance.workMinutes}m worked` : '--'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <Animated.View
        className={`absolute bottom-4 left-6 right-6 z-20 overflow-hidden rounded-full p-2.5 shadow-lg ${
          isSwipeDisabled
            ? 'bg-slate-400 shadow-slate-400/30'
            : isCheckedIn
              ? 'bg-red-500 shadow-red-500/30'
              : 'bg-blue-600 shadow-blue-500/30'
        }`}
        style={{transform: [{scale: ctaScale}]}}
        onLayout={e => setSliderWidth(e.nativeEvent.layout.width - 20)}>
        <View className="absolute inset-0 bg-white/10" />
        <View className="pointer-events-none absolute inset-0 items-center justify-center px-16">
          <Text
            className="text-center text-[15px] font-bold tracking-wide text-white shadow-sm">
            {hasCheckedOutForSelectedDate
              ? 'Attendance completed for this date'
              : isSelectedToday
                ? (isCheckedIn ? 'Swipe to Check Out' : 'Swipe to Check In')
                : 'Select today to mark attendance'}
          </Text>
        </View>

        <Animated.View
          {...(!isSwipeDisabled ? panResponder.panHandlers : {})}
          style={{transform: [{translateX: dragX}]}}
          className={`h-14 w-14 items-center justify-center rounded-full shadow-sm ${
            isSwipeDisabled ? 'bg-slate-200' : 'bg-white'
          }`}>
          <Animated.View style={{transform: [{translateX: isCheckedIn ? Animated.multiply(arrowNudge, -1) : arrowNudge}]}}>
            <Ionicons
              name={isCheckedIn ? 'arrow-back' : 'arrow-forward'}
              size={24}
              color={isSwipeDisabled ? '#94a3b8' : isCheckedIn ? '#ef4444' : '#2563eb'}
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function LeavesTab({employeeProfile}: {employeeProfile?: EmployeeProfile | null}) {
  type LeaveStatus = 'Approved' | 'Pending' | 'Rejected' | 'Canceled';
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

  const [leaveHistory, setLeaveHistory] = useState<LeaveItem[]>([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(true);
  const [activeFilter, setActiveFilter] = useState<LeaveFilter>('All');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveItem | null>(null);
  const [leaveTitle, setLeaveTitle] = useState('');
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [showLeaveTypeOptions, setShowLeaveTypeOptions] = useState(false);
  const filterOptions: LeaveFilter[] = ['All', 'Approved', 'Pending', 'Rejected', 'Canceled'];
  const leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Other'];

  const filteredLeaveHistory = leaveHistory.filter(item =>
    activeFilter === 'All' ? true : item.status === activeFilter,
  );

  const formatIsoDate = (isoDate: string) => {
    if (!isoDate) return '--';
    const date = new Date(`${isoDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return '--';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const toInputDate = (isoDate: string) => {
    const [year, month, day] = String(isoDate || '').split('-');
    if (!year || !month || !day) return '';
    return `${day}/${month}/${year}`;
  };

  const toIsoDate = (inputDate: string) => {
    const [day, month, year] = String(inputDate || '').split('/').map(part => part.trim());
    if (!day || !month || !year) return '';
    const parsed = new Date(`${year}-${month}-${day}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return '';
    const yyyy = parsed.getFullYear();
    const mm = `${parsed.getMonth() + 1}`.padStart(2, '0');
    const dd = `${parsed.getDate()}`.padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const calculateApplyDays = (startIso: string, endIso: string, halfDay: boolean) => {
    if (halfDay) return '0.5 Day';
    const start = new Date(`${startIso}T00:00:00`);
    const end = new Date(`${endIso}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '--';
    const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const days = Math.max(1, diff + 1);
    return `${days} Day${days > 1 ? 's' : ''}`;
  };

  const mapLeaveRequestToUi = (item: any): LeaveItem => {
    const status = (item?.status || 'Pending') as LeaveStatus;
    return {
      id: item?.id || '',
      leaveTitle: item?.leaveTitle || 'Leave Request',
      leaveType: item?.leaveType || 'Casual Leave',
      dateRange: `${formatIsoDate(item?.startDate || '')} - ${formatIsoDate(item?.endDate || '')}`,
      reason: item?.reason || '',
      appliedOnDate: item?.createdAt ? formatIsoDate(String(item.createdAt).slice(0, 10)) : '--',
      status,
      applyDays: calculateApplyDays(item?.startDate || '', item?.endDate || '', Boolean(item?.isHalfDay)),
      leaveBalance: '--',
      approvedBy:
        status === 'Approved' ? 'HR Team'
          : status === 'Rejected' ? 'Rejected'
            : status === 'Canceled' ? 'Canceled'
              : 'Waiting',
    };
  };

  const loadLeaveHistory = useCallback(async (showAlertOnError = false) => {
    const employeeCode = String(employeeProfile?.employeeCode || '').trim();
    if (!employeeCode) {
      setLeaveHistory([]);
      setIsLoadingLeaves(false);
      return;
    }
    try {
      setIsLoadingLeaves(true);
      const requests = await listEmployeeLeaveRequests(employeeCode);
      setLeaveHistory((requests || []).map(mapLeaveRequestToUi));
    } catch (error: any) {
      setLeaveHistory([]);
      if (showAlertOnError) {
        Alert.alert('Leave Error', error?.message || 'Unable to load leave requests.');
      }
    } finally {
      setIsLoadingLeaves(false);
    }
  }, [employeeProfile?.employeeCode]);

  useFocusEffect(
    useCallback(() => {
      loadLeaveHistory(false);
      return undefined;
    }, [loadLeaveHistory]),
  );

  const leaveStats = useMemo(() => {
    const approved = leaveHistory.filter(item => item.status === 'Approved').length;
    const pending = leaveHistory.filter(item => item.status === 'Pending').length;
    const canceled = leaveHistory.filter(item => item.status === 'Canceled' || item.status === 'Rejected').length;
    const syntheticBalance = Math.max(0, 12 - approved);
    return [
      {
        key: 'balance',
        title: 'Leave Balance',
        value: String(syntheticBalance),
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
        value: String(approved),
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
        value: String(pending),
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
        value: String(canceled),
        subtitle: 'Canceled/Rejected',
        icon: 'close-circle-outline' as const,
        iconColor: '#e11d48',
        iconBg: 'bg-rose-100',
        subtitleColor: 'text-rose-600',
        topAccent: 'bg-rose-500',
      },
    ];
  }, [leaveHistory]);

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
    if (status === 'Canceled') {
      return {bg: 'bg-slate-200', text: 'text-slate-700'};
    }
    return {bg: 'bg-rose-100', text: 'text-rose-700'};
  };

  const resetLeaveForm = () => {
    setLeaveTitle('');
    setLeaveType('Casual Leave');
    setStartDate('');
    setEndDate('');
    setReason('');
    setIsHalfDay(false);
    setShowLeaveTypeOptions(false);
  };

  const handleSubmitLeaveRequest = async () => {
    const employeeCode = String(employeeProfile?.employeeCode || '').trim();
    if (!employeeCode) {
      Alert.alert('Profile Missing', 'Employee code is missing. Please login again.');
      return;
    }
    if (!leaveTitle.trim()) {
      Alert.alert('Validation', 'Please enter a leave title.');
      return;
    }
    const startIso = toIsoDate(startDate);
    const endIso = toIsoDate(endDate);
    if (!startIso || !endIso) {
      Alert.alert('Validation', 'Please choose valid start and end dates.');
      return;
    }
    if (new Date(`${endIso}T00:00:00`) < new Date(`${startIso}T00:00:00`)) {
      Alert.alert('Validation', 'Ending date cannot be before starting date.');
      return;
    }
    try {
      setIsSubmittingLeave(true);
      const created = await createLeaveRequest({
        employeeCode,
        leaveTitle: leaveTitle.trim(),
        leaveType,
        startDate: startIso,
        endDate: endIso,
        isHalfDay,
        reason: reason.trim(),
      });
      setLeaveHistory(prev => [mapLeaveRequestToUi(created), ...prev]);
      setShowApplyModal(false);
      resetLeaveForm();
      Alert.alert('Success', 'Leave request submitted successfully.');
    } catch (error: any) {
      Alert.alert('Apply Leave Failed', error?.message || 'Unable to submit leave request.');
    } finally {
      setIsSubmittingLeave(false);
    }
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
          <Text className="text-[30px] font-bold text-slate-900">Leave Details</Text>
        </View>

        <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
          <View className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-[13px] font-medium text-slate-500">Leave Title</Text>
                <Text className="mt-1 text-[20px] font-bold leading-7 text-slate-900">
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
                <Text className="text-[13px] font-medium text-slate-500">Leave Type</Text>
                <Text className="text-[16px] font-semibold text-slate-900">
                  {selectedLeave.leaveType}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-3 flex-row flex-wrap justify-between">
            <View className="mb-3 w-[48.5%] rounded-2xl border border-slate-100 bg-white p-3.5">
              <Text className="text-[13px] font-medium text-slate-500">Applied On</Text>
              <Text className="mt-1 text-[16px] font-semibold text-slate-900">
                {selectedLeave.appliedOnDate}
              </Text>
            </View>
            <View className="mb-3 w-[48.5%] rounded-2xl border border-slate-100 bg-white p-3.5">
              <Text className="text-[13px] font-medium text-slate-500">Status</Text>
              <Text className="mt-1 text-[16px] font-semibold text-slate-900">
                {selectedLeave.status}
              </Text>
            </View>
            {selectedLeave.status === 'Approved' && (
              <View className="mb-3 w-full rounded-2xl border border-slate-100 bg-white p-3.5">
                <Text className="text-[13px] font-medium text-slate-500">Approved By</Text>
                <Text className="mt-1 text-[16px] font-semibold text-slate-900">
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
              <Text className="ml-2.5 text-[16px] font-semibold text-slate-900">Reason</Text>
            </View>
            <Text className="mt-3 text-[16px] leading-7 text-slate-700">
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
        <View className="flex-row items-center px-6 pb-4">
          <Pressable
            onPress={() => setShowApplyModal(false)}
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm shadow-slate-200/50">
            <Ionicons name="arrow-back" size={20} color="#0f172a" />
          </Pressable>
          <Text className="text-[26px] font-extrabold tracking-tight text-slate-900">Apply Leave</Text>
        </View>

        <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
          <View className="mb-4">
            <Text className="mb-2 text-[13px] font-bold tracking-wide text-slate-500">Leave Title</Text>
            <TextInput
              value={leaveTitle}
              onChangeText={setLeaveTitle}
              placeholder="Enter leave title"
              placeholderTextColor="#94a3b8"
              className="rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 text-[15px] font-medium text-slate-900 shadow-sm shadow-slate-200/20"
            />
          </View>

          <View className="relative z-30 mb-4">
            <Text className="mb-2 text-[13px] font-bold tracking-wide text-slate-500">Leave Type</Text>
            <Pressable
              onPress={() => setShowLeaveTypeOptions(prev => !prev)}
              className="flex-row items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm shadow-slate-200/20">
              <Text className="text-[15px] font-medium text-slate-900">{leaveType}</Text>
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
                        className={`text-[15px] font-medium ${
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

          <View className="mb-4 flex-row justify-between">
            <View className="w-[48%]">
              <Text className="mb-2 text-[13px] font-bold tracking-wide text-slate-500">Starting Date</Text>
              <Pressable
                onPress={() => openDatePicker('start')}
                className="flex-row items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm shadow-slate-200/20">
                <Text
                  className={`font-medium ${
                    startDate ? 'text-[15px] text-slate-900' : 'text-[15px] text-slate-400'
                  }`}>
                  {startDate || 'DD/MM/YYYY'}
                </Text>
                <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
              </Pressable>
            </View>
            <View className="w-[48%]">
              <Text className="mb-2 text-[13px] font-bold tracking-wide text-slate-500">Ending Date</Text>
              <Pressable
                onPress={() => openDatePicker('end')}
                className="flex-row items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm shadow-slate-200/20">
                <Text
                  className={`font-medium ${
                    endDate ? 'text-[15px] text-slate-900' : 'text-[15px] text-slate-400'
                  }`}>
                  {endDate || 'DD/MM/YYYY'}
                </Text>
                <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
              </Pressable>
            </View>
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-[13px] font-bold tracking-wide text-slate-500">Duration</Text>
            <View className="flex-row rounded-xl bg-slate-200/70 p-1">
              <Pressable 
                onPress={() => setIsHalfDay(false)}
                className={`flex-1 items-center rounded-lg py-2 ${!isHalfDay ? 'bg-white shadow-sm' : ''}`}>
                <Text className={`text-[14px] font-bold ${!isHalfDay ? 'text-blue-600' : 'text-slate-500'}`}>Full Day</Text>
              </Pressable>
              <Pressable 
                onPress={() => setIsHalfDay(true)}
                className={`flex-1 items-center rounded-lg py-2 ${isHalfDay ? 'bg-white shadow-sm' : ''}`}>
                <Text className={`text-[14px] font-bold ${isHalfDay ? 'text-blue-600' : 'text-slate-500'}`}>Half Day</Text>
              </Pressable>
            </View>
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-[13px] font-bold tracking-wide text-slate-500">Reason of Leave</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              multiline
              textAlignVertical="top"
              placeholder="Write your reason..."
              placeholderTextColor="#94a3b8"
              className="min-h-[100px] rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 text-[15px] font-medium text-slate-900 shadow-sm shadow-slate-200/20"
            />
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-[13px] font-bold tracking-wide text-slate-500">Supporting Document (Optional)</Text>
            <Pressable className="flex-row items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-4 shadow-sm shadow-slate-200/20">
               <Ionicons name="cloud-upload-outline" size={20} color="#64748b" />
               <Text className="ml-2 text-[14px] font-bold text-slate-500">Upload PDF or Image</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleSubmitLeaveRequest}
            disabled={isSubmittingLeave}
            className={`mb-10 items-center rounded-xl py-3.5 shadow-sm ${
              isSubmittingLeave ? 'bg-blue-400 shadow-blue-300/30' : 'bg-blue-600 shadow-blue-500/30'
            }`}>
            <Text className="text-[15px] font-bold tracking-wide text-white">
              {isSubmittingLeave ? 'Submitting...' : 'Submit Leave Request'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 px-5 pt-16">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[26px] font-extrabold tracking-tight text-slate-900">All Leaves</Text>
          <Text className="mt-0.5 text-[14px] font-medium text-slate-500">
            Overview of your leave status
          </Text>
        </View>
        <Pressable
          onPress={() => setShowApplyModal(true)}
          className="flex-row items-center rounded-xl bg-blue-600 px-3.5 py-2.5 shadow-sm shadow-blue-500/30">
          <Ionicons name="add" size={18} color="#ffffff" />
          <Text className="ml-1 text-[13px] font-bold tracking-wide text-white">Apply Leave</Text>
        </Pressable>
      </View>

      <View className="mt-6 flex-row flex-wrap justify-between gap-y-3">
        {leaveStats.map(card => (
          <View
            key={card.key}
            className="w-[48.5%] overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm shadow-slate-200/30">
            <View className={`h-1 w-full ${card.topAccent}`} />
            <View className="p-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-[12px] font-bold tracking-wide text-slate-400">
                  {card.title}
                </Text>
                <View className={`h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}>
                  <Ionicons name={card.icon} size={16} color={card.iconColor} />
                </View>
              </View>
              <Text className="mt-2 text-[22px] font-extrabold tracking-tight text-slate-900">
                {card.value}
              </Text>
              <Text className={`mt-0.5 text-[11px] font-bold uppercase tracking-wider ${card.subtitleColor}`}>
                {card.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View className="mt-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[20px] font-extrabold tracking-tight text-slate-900">Leave History</Text>
            <Text className="mt-0.5 text-[14px] font-medium text-slate-500">
              Recently requested leaves
            </Text>
          </View>
          <Pressable
            onPress={() => setShowFilterOptions(prev => !prev)}
            className={`h-9 w-9 items-center justify-center rounded-lg border bg-white shadow-sm ${
              showFilterOptions || activeFilter !== 'All'
                ? 'border-blue-300 shadow-blue-100'
                : 'border-slate-200 shadow-slate-100'
            }`}>
            <Ionicons
              name="options-outline"
              size={18}
              color={showFilterOptions || activeFilter !== 'All' ? '#2563eb' : '#64748b'}
            />
          </Pressable>
        </View>

        {showFilterOptions && (
          <View className="mt-4 flex-row flex-wrap gap-2">
            {filterOptions.map(option => {
              const isActive = activeFilter === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    setActiveFilter(option);
                    setShowFilterOptions(false);
                  }}
                  className={`rounded-lg border px-3.5 py-1.5 ${
                    isActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
                  }`}>
                  <Text
                    className={`text-[12px] font-bold tracking-wide ${
                      isActive ? 'text-blue-700' : 'text-slate-500'
                    }`}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <View className="mt-4 gap-y-3">
          {isLoadingLeaves && (
            <View className="rounded-2xl border border-slate-200/60 bg-white py-6">
              <Text className="text-center text-sm text-slate-500">Loading leave history...</Text>
            </View>
          )}
          {filteredLeaveHistory.map(item => {
            const statusStyle = getStatusStyles(item.status);

            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedLeave(item)}
                className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm shadow-slate-200/30">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                      Date
                    </Text>
                    <Text className="mt-1 text-[15px] font-extrabold tracking-tight text-slate-900">
                      {item.dateRange}
                    </Text>
                  </View>
                  <View className={`rounded-md px-2.5 py-1 ${statusStyle.bg}`}>
                    <Text className={`text-[11px] font-bold tracking-wide uppercase ${statusStyle.text}`}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View className="my-3.5 h-px bg-slate-100" />

                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                      Apply Days
                    </Text>
                    <Text className="mt-1 text-[14px] font-bold text-slate-700">
                      {item.applyDays}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                      Leave Balance
                    </Text>
                    <Text className="mt-1 text-[14px] font-bold text-slate-700">
                      {item.leaveBalance}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                      Approved By
                    </Text>
                    <Text className="mt-1 text-[14px] font-bold text-slate-700">
                      {item.approvedBy}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {!isLoadingLeaves && filteredLeaveHistory.length === 0 && (
          <View className="mt-3 rounded-2xl py-6">
            <Text className="text-center text-sm text-slate-500">
              {leaveHistory.length === 0 ? 'No leaves yet.' : 'No leave records for this filter.'}
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
      isoDate: '2026-01-01',
      date: 'January 01, 2026',
      title: "New Year's Day",
    },
    {
      id: 'h-2',
      isoDate: '2026-01-14',
      date: 'January 14, 2026',
      title: 'Makar Sankranti',
    },
    {
      id: 'h-3',
      isoDate: '2026-01-26',
      date: 'January 26, 2026',
      title: 'Republic Day',
    },
    {
      id: 'h-4',
      isoDate: '2026-02-15',
      date: 'February 15, 2026',
      title: 'Maha Shivratri',
    },
    {
      id: 'h-5',
      isoDate: '2026-03-14',
      date: 'March 14, 2026',
      title: 'Holi',
    },
    {
      id: 'h-6',
      isoDate: '2026-04-10',
      date: 'April 10, 2026',
      title: 'Good Friday',
    },
    {
      id: 'h-7',
      isoDate: '2026-04-14',
      date: 'April 14, 2026',
      title: 'Ambedkar Jayanti',
    },
    {
      id: 'h-8',
      isoDate: '2026-05-01',
      date: 'May 01, 2026',
      title: 'Labour Day',
    },
    {
      id: 'h-9',
      isoDate: '2026-06-17',
      date: 'June 17, 2026',
      title: 'Bakrid / Eid al-Adha',
    },
    {
      id: 'h-10',
      isoDate: '2026-08-15',
      date: 'August 15, 2026',
      title: 'Independence Day',
    },
    {
      id: 'h-11',
      isoDate: '2026-09-07',
      date: 'September 07, 2026',
      title: 'Janmashtami',
    },
    {
      id: 'h-12',
      isoDate: '2026-10-02',
      date: 'October 02, 2026',
      title: 'Gandhi Jayanti',
    },
    {
      id: 'h-13',
      isoDate: '2026-10-20',
      date: 'October 20, 2026',
      title: 'Dussehra',
    },
    {
      id: 'h-14',
      isoDate: '2026-11-08',
      date: 'November 08, 2026',
      title: 'Diwali',
    },
    {
      id: 'h-15',
      isoDate: '2026-12-25',
      date: 'December 25, 2026',
      title: 'Christmas Day',
    },
  ];

  return (
    <ScrollView className="flex-1 bg-slate-50 px-6 pt-16">
      <Text className="text-[26px] font-extrabold tracking-tight text-slate-900">Holidays</Text>
      <Text className="mt-0.5 text-[14px] font-medium text-slate-500">
        Corporate holiday calendar
      </Text>

      <View className="mt-6">
        {holidays.map(item => {
          const today = new Date();
          const currentDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
          );
          const holidayDate = new Date(item.isoDate);
          const isUpcoming = holidayDate >= currentDate;
          const dayLabel = holidayDate.toLocaleDateString('en-US', {weekday: 'long'});
          const accentClass = isUpcoming ? 'bg-blue-500' : 'bg-slate-300';
          const cardClass = isUpcoming ? 'bg-blue-50' : 'bg-slate-100';
          const dateTextClass = isUpcoming ? 'text-slate-800' : 'text-slate-500';
          const dayTextClass = isUpcoming ? 'text-blue-300' : 'text-slate-400';
          const titleTextClass = isUpcoming ? 'text-slate-900' : 'text-slate-500';
          const iconColor = isUpcoming ? '#334155' : '#94a3b8';

          return (
            <View
              key={item.id}
              className={`mb-3.5 overflow-hidden rounded-xl border ${
                isUpcoming ? 'border-blue-200/50 bg-blue-50/50 shadow-sm shadow-blue-100/30' : 'border-slate-200/60 bg-white'
              }`}>
              <View className="flex-row">
                <View className={`w-1.5 ${accentClass}`} />
                <View className="flex-1 px-4 py-3.5">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={15} color={iconColor} />
                      <Text className={`ml-2 text-[12px] font-bold tracking-wide uppercase ${dateTextClass}`}>
                        {item.date}
                      </Text>
                    </View>
                    <Text className={`text-[12px] font-bold uppercase tracking-wide ${dayTextClass}`}>{dayLabel}</Text>
                  </View>
                  <Text className={`mt-2 text-[16px] font-extrabold tracking-tight ${titleTextClass}`}>
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

function ProfileTab({navigation, onLogout, employeeProfile}: {navigation: any, onLogout: () => void, employeeProfile?: EmployeeProfile | null}) {
  const profileMenu = [
    {key: 'profile', label: 'Profile', icon: 'person-outline' as const, route: 'ProfileDetails'},
    {key: 'settings', label: 'Settings', icon: 'settings-outline' as const, route: 'Settings'},
    {key: 'terms', label: 'Terms & Conditions', icon: 'document-text-outline' as const, route: 'Terms'},
    {key: 'privacy', label: 'Privacy Policy', icon: 'shield-checkmark-outline' as const, route: 'Privacy'},
  ];
  const displayName = employeeProfile?.fullName || 'Employee';
  const displayRole = employeeProfile?.designation || employeeProfile?.department || 'Team Member';
  const avatarUri = (employeeProfile?.profileImageUrl || '').trim();
  const initials = getInitials(displayName);

  return (
    <ScrollView className="flex-1 bg-slate-50 px-6 pt-16">
      <View className="items-center">
        <View className="relative">
          {avatarUri ? (
            <Image
              source={{uri: avatarUri}}
              className="h-[104px] w-[104px] rounded-full border-4 border-white shadow-sm shadow-slate-200/50"
            />
          ) : (
            <View className="h-[104px] w-[104px] items-center justify-center rounded-full border-4 border-white bg-emerald-100 shadow-sm shadow-slate-200/50">
              <Text className="text-3xl font-semibold text-emerald-700">{initials || "A"}</Text>
            </View>
          )}
        </View>

        <Text className="mt-5 text-[26px] font-extrabold tracking-tight text-slate-900">{displayName}</Text>
        <Text className="mt-1 text-[14px] font-medium text-slate-500">{displayRole}</Text>
      </View>

      <View className="mt-6 rounded-2xl border border-slate-200/60 bg-white shadow-sm shadow-slate-200/30">
        {profileMenu.map((item, index) => (
          <View key={item.key}>
            <Pressable 
              className="flex-row items-center justify-between px-5 py-4"
              onPress={() => navigation.navigate(item.route)}>
              <View className="flex-row items-center">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                  <Ionicons name={item.icon} size={18} color="#475569" />
                </View>
                <Text className="ml-4 text-[15px] font-bold text-slate-700">
                  {item.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </Pressable>
            {index !== profileMenu.length - 1 && <View className="mx-5 h-px bg-slate-100" />}
          </View>
        ))}
      </View>

      <Pressable
        className="mt-6 flex-row items-center justify-center rounded-xl border border-red-200 bg-red-50 py-3.5"
        onPress={onLogout}>
        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        <Text className="ml-2 text-[14px] font-bold tracking-wide text-red-600">Log out</Text>
      </Pressable>

      <View className="h-24" />
    </ScrollView>
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

export default function HomeTabsScreen({onLogout, employeeProfile}: HomeTabsScreenProps) {
  return (
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
        <Tab.Screen name="Home">
          {(props: any) => <HomeTab {...props} employeeProfile={employeeProfile} />}
        </Tab.Screen>
        <Tab.Screen name="Leaves">
          {() => <LeavesTab employeeProfile={employeeProfile} />}
        </Tab.Screen>
        <Tab.Screen name="Holidays" component={HolidaysTab} />
        <Tab.Screen name="Profile">
          {(props: any) => <ProfileTab {...props} onLogout={onLogout} employeeProfile={employeeProfile} />}
        </Tab.Screen>
      </Tab.Navigator>
  );
}


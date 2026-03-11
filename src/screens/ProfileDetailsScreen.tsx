import { Image, Pressable, ScrollView, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { EmployeeProfile } from "../services/mobileAuth"

type ProfileDetailsScreenProps = {
  navigation: any
  employeeProfile?: EmployeeProfile | null
}

const getInitials = (value: string) =>
  (value || "A")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-slate-100 py-3">
      <Text className="text-[13px] font-medium text-slate-500">{label}</Text>
      <Text className="max-w-[65%] text-right text-[14px] font-semibold text-slate-800">
        {value || "-"}
      </Text>
    </View>
  )
}

export default function ProfileDetailsScreen({ navigation, employeeProfile }: ProfileDetailsScreenProps) {
  const displayName = employeeProfile?.fullName || "Employee"
  const displayRole = employeeProfile?.designation || employeeProfile?.department || "Team Member"
  const avatarUri = (employeeProfile?.profileImageUrl || "").trim()
  const initials = getInitials(displayName)

  return (
    <ScrollView className="flex-1 bg-slate-50 px-6 pt-16">
      <View className="flex-row items-center">
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm shadow-slate-200/50">
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </Pressable>
        <Text className="text-[28px] font-extrabold tracking-tight text-slate-900">Profile</Text>
      </View>

      <View className="mt-6 items-center rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm shadow-slate-200/30">
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            className="h-[92px] w-[92px] rounded-full border-4 border-white"
          />
        ) : (
          <View className="h-[92px] w-[92px] items-center justify-center rounded-full border-4 border-white bg-emerald-100">
            <Text className="text-3xl font-semibold text-emerald-700">{initials || "A"}</Text>
          </View>
        )}
        <Text className="mt-4 text-[24px] font-extrabold tracking-tight text-slate-900">{displayName}</Text>
        <Text className="mt-1 text-[14px] font-medium text-slate-500">{displayRole}</Text>
      </View>

      <View className="mt-4 rounded-2xl border border-slate-200/60 bg-white px-4 shadow-sm shadow-slate-200/30">
        <DetailRow label="Employee ID" value={employeeProfile?.employeeCode || ""} />
        <DetailRow label="Office Email" value={employeeProfile?.officeEmail || ""} />
        <DetailRow label="Phone" value={employeeProfile?.mobile || ""} />
        <DetailRow label="Department" value={employeeProfile?.department || ""} />
        <View className="py-3">
          <Text className="text-[13px] font-medium text-slate-500">Designation</Text>
          <Text className="mt-1 text-[14px] font-semibold text-slate-800">{employeeProfile?.designation || "-"}</Text>
        </View>
      </View>

      <View className="h-12" />
    </ScrollView>
  )
}

import {useState} from 'react';
import {Image, Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

export default function EditProfileScreen({navigation}: any) {
  const [firstName, setFirstName] = useState('Michael');
  const [lastName, setLastName] = useState('Smith');
  const [email, setEmail] = useState('michael.smith@example.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [address, setAddress] = useState('123 Corporate Blvd, Tech City');

  const handleSave = () => {
    // Mock save
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-slate-50 pt-14">
      <View className="flex-row items-center px-6 pb-4">
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm shadow-slate-200/50">
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </Pressable>
        <Text className="text-[26px] font-extrabold tracking-tight text-slate-900">Edit Profile</Text>
      </View>

      <ScrollView className="px-5 pt-2 pb-10" showsVerticalScrollIndicator={false}>
        <View className="mb-8 items-center">
          <View className="relative">
            <Image
              source={{uri: 'https://i.pravatar.cc/200?img=12'}}
              className="h-[104px] w-[104px] rounded-full border-4 border-white shadow-sm shadow-slate-200/50"
            />
            <Pressable className="absolute -bottom-1 -right-1 h-[34px] w-[34px] items-center justify-center rounded-xl border-2 border-white bg-blue-600 shadow-sm shadow-blue-500/30">
              <Ionicons name="camera-outline" size={16} color="#ffffff" />
            </Pressable>
          </View>
        </View>

        <View className="gap-5 px-1">
          <View>
            <Text className="mb-2 text-[13px] font-bold tracking-wide text-slate-500">First Name</Text>
            <View className="flex-row items-center rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm shadow-slate-200/20">
              <Ionicons name="person-outline" size={18} color="#64748b" />
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                className="ml-3 flex-1 text-[15px] font-medium text-slate-900"
              />
            </View>
          </View>

          <View>
            <Text className="mb-2 text-[13px] font-bold tracking-wide text-slate-500">Last Name</Text>
            <View className="flex-row items-center rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm shadow-slate-200/20">
              <Ionicons name="person-outline" size={18} color="#64748b" />
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                className="ml-3 flex-1 text-[15px] font-medium text-slate-900"
              />
            </View>
          </View>

          <View>
            <Text className="mb-2 text-[13px] font-bold tracking-wide text-slate-500">Email Address</Text>
            <View className="flex-row items-center rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm shadow-slate-200/20">
              <Ionicons name="mail-outline" size={18} color="#64748b" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="ml-3 flex-1 text-[15px] font-medium text-slate-900"
              />
            </View>
          </View>

          <View>
            <Text className="mb-2 text-[13px] font-bold tracking-wide text-slate-500">Phone Number</Text>
            <View className="flex-row items-center rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm shadow-slate-200/20">
              <Ionicons name="call-outline" size={18} color="#64748b" />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                className="ml-3 flex-1 text-[15px] font-medium text-slate-900"
              />
            </View>
          </View>

          <View>
            <Text className="mb-2 text-[13px] font-bold tracking-wide text-slate-500">Address</Text>
            <View className="flex-row items-start rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm shadow-slate-200/20">
              <Ionicons name="location-outline" size={18} color="#64748b" style={{marginTop: 3}} />
              <TextInput
                value={address}
                onChangeText={setAddress}
                multiline
                className="ml-3 flex-1 text-[15px] font-medium text-slate-900"
              />
            </View>
          </View>
        </View>

        <Pressable
          onPress={handleSave}
          className="mx-1 mt-10 mb-10 items-center rounded-xl bg-blue-600 py-3.5 shadow-sm shadow-blue-500/30">
          <Text className="text-[15px] font-bold tracking-wide text-white">Save Changes</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

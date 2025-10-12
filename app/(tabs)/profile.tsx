import { useAppDispatch } from "@/hooks/use-redux";
import { logoutUser, setUser } from "@/redux/auth-slice/index";
import { useGetUserDetailsFnQuery } from "@/redux/features/user-api/user-api";
import { removeTokenFromSecureStore } from "@/utils/token";
import { formatAmount } from "@/utils/utils";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { ReactNode, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const {
    data: userDetailsResponse,
    isLoading,
    refetch,
  } = useGetUserDetailsFnQuery();

  const dispatch = useAppDispatch();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const user = userDetailsResponse?.data;

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    }
  }, [userDetailsResponse]);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await refetch();
    } catch (error) {
      console.log("Refresh Error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          try {
            await removeTokenFromSecureStore();
            dispatch(logoutUser());
            router.replace("/login");
          } catch (error: any) {
            console.error("Error during logout:", error?.message, error?.stack);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
              "Error",
              "An error occurred while logging out. Please try again."
            );
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(screens)");
  };

  const handleEditPhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(screens)");
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6566fc" />
      </View>
    );
  }

  const getInitials = () => {
    const firstName = user?.firstname || "";
    const lastName = user?.lastname || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6566fc"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient Background */}
        <View className="bg-[#6566fc] h-48 relative mb-5">
          <SafeAreaView>
            <View className="flex-row justify-between items-center px-5 pt-2">
              <Text className="text-white text-xl font-bold">Profile</Text>
              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                  opacity: pressed ? 0.8 : 1,
                })}
                className="bg-white/20 p-2.5 rounded-full"
              >
                <MaterialIcons name="logout" size={22} color="white" />
              </Pressable>
            </View>
          </SafeAreaView>
        </View>

        {/* Profile Card */}
        <View className="mx-5 -mt-20">
          <View className="bg-white rounded-3xl shadow-lg p-6">
            {/* Profile Picture */}
            <View className="items-center -mt-16 mb-4">
              <View className="relative">
                {user?.profilePic ? (
                  <Image
                    source={{ uri: user.profilePic }}
                    className="w-32 h-32 rounded-full border-4 border-white"
                    style={styles.profileImage}
                  />
                ) : (
                  <View className="w-32 h-32 rounded-full bg-[#6566fc] border-4 border-white items-center justify-center">
                    <Text className="text-white text-4xl font-bold">
                      {getInitials()}
                    </Text>
                  </View>
                )}
                <Pressable
                  onPress={handleEditPhoto}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.9 : 1 }],
                    opacity: pressed ? 0.8 : 1,
                  })}
                  className="absolute bottom-0 right-0 bg-[#6566fc] p-3 rounded-full shadow-md"
                >
                  <MaterialIcons name="camera-alt" size={20} color="white" />
                </Pressable>
              </View>
            </View>

            {/* Name & Edit Button */}
            <View className="items-center mb-6">
              <Text className="text-2xl font-bold text-gray-800 capitalize">
                {user?.firstname || "Not"} {user?.lastname || "Available"}
              </Text>
              <Pressable
                onPress={handleEditProfile}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  opacity: pressed ? 0.8 : 1,
                })}
                className="flex-row items-center gap-1 mt-3 bg-[#6566fc]/10 px-4 py-2 rounded-full"
              >
                <MaterialIcons
                  name="mode-edit-outline"
                  size={16}
                  color="#6566fc"
                />
                <Text className="text-[#6566fc] font-semibold text-sm">
                  Edit Profile
                </Text>
              </Pressable>
            </View>

            {/* Stats Cards */}
            <View className="flex-row justify-between mb-6 gap-3">
              <Pressable
                onPress={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                }
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.8 : 1,
                })}
                className="flex-1 bg-[#6566fc]/5 p-4 rounded-2xl items-center"
              >
                <MaterialIcons name="attach-money" size={24} color="#6566fc" />
                <Text className="text-gray-500 text-xs mt-1">Income</Text>
                <Text className="text-gray-800 font-bold text-base mt-1">
                  {formatAmount(user?.income || 0)}
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                }
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.8 : 1,
                })}
                className="flex-1 bg-[#6566fc]/5 p-4 rounded-2xl items-center"
              >
                <MaterialIcons
                  name="account-balance-wallet"
                  size={24}
                  color="#6566fc"
                />
                <Text className="text-gray-500 text-xs mt-1">Net Worth</Text>
                <Text className="text-gray-800 font-bold text-base mt-1">
                  {formatAmount(user?.netWorth || 0)}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Personal Information Section */}
          <View className="bg-white rounded-3xl shadow-lg p-6 mt-5">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Personal Information
            </Text>

            <InfoRow
              icon={
                <MaterialCommunityIcons
                  size={22}
                  name="email"
                  color="#6566fc"
                />
              }
              label="Email"
              value={user?.email || "Not Available"}
            />
            <InfoRow
              icon={
                <FontAwesome size={22} name="birthday-cake" color="#6566fc" />
              }
              label="Date of Birth"
              value={user?.dob ? user.dob.split("T")[0] : "Not Provided"}
            />
            <InfoRow
              icon={<Ionicons name="male-female" size={22} color="#6566fc" />}
              label="Gender"
              value={user?.gender || "Not Available"}
            />
            <InfoRow
              icon={
                <Ionicons name="location-sharp" size={22} color="#6566fc" />
              }
              label="Address"
              value={user?.address || "Not Available"}
              isLast
            />
          </View>

          {/* Documents Section */}
          <View className="bg-white rounded-3xl shadow-lg p-6 mt-5">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Documents
            </Text>

            <InfoRow
              icon={<Ionicons name="document-text" size={22} color="#6566fc" />}
              label="Aadhar Number"
              value={user?.aadharCard || "Not Available"}
            />
            <InfoRow
              icon={<Ionicons name="card" size={22} color="#6566fc" />}
              label="PAN Card"
              value={user?.panCard || "Not Available"}
              isLast
            />
          </View>

          {/* Insurances Section */}
          <View className="bg-white rounded-3xl shadow-lg p-6 mt-5">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">
                Insurances
              </Text>
              <View className="bg-[#6566fc]/10 px-3 py-1 rounded-full">
                <Text className="text-[#6566fc] font-semibold text-xs">
                  {user?.insurances?.length || 0}
                </Text>
              </View>
            </View>

            {user?.insurances?.length === 0 ? (
              <View className="py-8 items-center">
                <MaterialCommunityIcons
                  name="shield-off"
                  size={48}
                  color="#d1d5db"
                />
                <Text className="text-gray-400 mt-2">No insurances added</Text>
              </View>
            ) : (
              <View className="gap-3">
                {user?.insurances?.map((ins, index) => (
                  <Pressable
                    key={index}
                    onPress={() =>
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }
                    style={({ pressed }) => ({
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      opacity: pressed ? 0.8 : 1,
                    })}
                    className="bg-[#6566fc]/5 p-4 rounded-xl flex-row justify-between items-center"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="bg-[#6566fc] w-10 h-10 rounded-full items-center justify-center">
                        <Text className="text-white font-bold">
                          {index + 1}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-800 font-semibold text-base">
                          {ins.type}
                        </Text>
                        <Text className="text-gray-500 text-sm mt-0.5">
                          {ins.companyName}
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9ca3af"
                    />
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Investments Section */}
          <View className="bg-white rounded-3xl shadow-lg p-6 mt-5 mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">
                Investments
              </Text>
              <View className="bg-[#6566fc]/10 px-3 py-1 rounded-full">
                <Text className="text-[#6566fc] font-semibold text-xs">
                  {user?.investments?.length || 0}
                </Text>
              </View>
            </View>

            {user?.investments?.length === 0 ? (
              <View className="py-8 items-center">
                <MaterialIcons name="trending-up" size={48} color="#d1d5db" />
                <Text className="text-gray-400 mt-2">No investments added</Text>
              </View>
            ) : (
              <View className="gap-3">
                {user?.investments?.map((inv, index) => (
                  <Pressable
                    key={index}
                    onPress={() =>
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }
                    style={({ pressed }) => ({
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      opacity: pressed ? 0.8 : 1,
                    })}
                    className="bg-[#6566fc]/5 p-4 rounded-xl flex-row justify-between items-center"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="bg-[#6566fc] w-10 h-10 rounded-full items-center justify-center">
                        <Text className="text-white font-bold">
                          {index + 1}
                        </Text>
                      </View>
                      <Text className="text-gray-800 font-semibold text-base flex-1">
                        {inv.investmentType}
                      </Text>
                    </View>
                    <Text className="text-[#6566fc] font-bold text-base">
                      {formatAmount(inv.amount || 0)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Reusable Info Row Component
const InfoRow = ({
  icon,
  label,
  value,
  isLast = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
}) => (
  <Pressable
    onPress={() => Haptics.selectionAsync()}
    style={({ pressed }) => ({
      opacity: pressed ? 0.7 : 1,
    })}
    className={`flex-row items-center justify-between py-4 ${
      !isLast ? "border-b border-gray-100" : ""
    }`}
  >
    <View className="flex-row items-center gap-3 flex-1">
      <View className="w-10 h-10 bg-[#6566fc]/10 rounded-full items-center justify-center">
        {icon}
      </View>
      <Text className="text-gray-600 font-medium flex-1">{label}</Text>
    </View>
    <Text className="text-gray-800 font-semibold max-w-[180px] text-right">
      {value}
    </Text>
  </Pressable>
);

export default Profile;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  profileImage: {
    resizeMode: "cover",
  },
});

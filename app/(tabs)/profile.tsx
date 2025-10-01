import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { logoutUser } from "@/redux/auth-slice/index";
import { getUserDetails } from "@/redux/user-slice";
import { removeTokenFromSecureStore } from "@/utils/token";
import { formatAmount } from "@/utils/utils";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { isLoading, user } = useAppSelector((state) => state.user);
  const [Loading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  // console.log(user);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const controller = new AbortController();
      const signal = controller.signal;

      await dispatch(getUserDetails({ signal }));

      controller.abort(); // Cleanup (optional for refresh)
    } catch (error) {
      console.log("Refresh Error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await removeTokenFromSecureStore();

      dispatch(logoutUser());

      setIsLoading(false);
      setTimeout(() => {
        Alert.alert("Logout Successfully");
        router.replace("/login");
      }, 1000);
    } catch (error) {
      console.error("Error during logout:", error?.message, error?.stack);
      Alert.alert(
        "Error",
        "An error occurred while logging out. Please try again."
      );
      setIsLoading(false);
    }
  };
  if (isLoading || Loading)
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6566fc" />
      </View>
    );
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      className="flex-1 bg-white"
    >
      <SafeAreaView>
        <View className="mx-3 my-5">
          <View className="flex-1">
            <View className="flex flex-row justify-between items-center w-full">
              <Text className="text-2xl font-bold tracking-wide capitalize">
                {user?.userId?.firstname || "Not Available"}{" "}
                {user?.userId?.lastname || "Not Available"}
              </Text>
              <Pressable onPress={handleLogout}>
                <MaterialIcons name="logout" size={25} />
              </Pressable>
            </View>
            <View className="mt-10 mb-5 flex-1">
              <View className="flex flex-row justify-between items-center">
                <Text className="text-[16px] tracking-wide font-semibold">
                  Personal Information
                </Text>
                <Pressable
                  onPress={() => router.push("/(screens)")}
                  className="flex-row gap-0.5 items-center bg-primary shadow-md px-4 py-2 rounded-md"
                >
                  <MaterialIcons name="mode-edit-outline" color={"white"} />
                  <Text className="text-[14px] font-semibold text-white">
                    Edit
                  </Text>
                </Pressable>
              </View>
              <View className="mt-5 w-full flex-1 gap-2 py-5 px-2">
                <View className="px-3 py-4 flex-row justify-between items-center border-b border-dashed border-slate-400">
                  <View className="flex-row items-center gap-2">
                    <MaterialCommunityIcons
                      size={25}
                      name="email"
                      color={"#6566fc"}
                    />
                    <Text className="text-[16px] font-semibold">Email</Text>
                  </View>
                  <View>
                    <Text className="text-[14px] font-semibold">
                      {user?.userId?.email || "Not Available"}
                    </Text>
                  </View>
                </View>

                <View className="px-3 py-4 flex-row justify-between items-center border-b border-dashed border-slate-400">
                  <View className="flex-row items-center gap-2">
                    <FontAwesome
                      size={25}
                      name="birthday-cake"
                      color={"#6566fc"}
                    />
                    <Text className=" text-[16px] font-semibold">DOB</Text>
                  </View>
                  <View>
                    <Text className="text-[14px] font-semibold">
                      {user?.userId?.dob
                        ? user.userId.dob.split("T")[0]
                        : "Not Provided"}
                    </Text>
                  </View>
                </View>

                <View className="px-3 py-4 flex-row justify-between items-center border-b border-dashed border-slate-400">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="male-female" size={25} color={"#6566fc"} />
                    <Text className=" text-[16px] font-semibold">Gender</Text>
                  </View>
                  <View>
                    <Text className="text-[14px] font-semibold">
                      {user?.userId?.gender || "Not Available"}
                    </Text>
                  </View>
                </View>

                <View className="px-3 py-4 flex-row justify-between items-center flex-wrap border-b border-dashed border-slate-400">
                  <View className="flex-row items-center gap-2">
                    <Ionicons
                      name="location-sharp"
                      size={25}
                      color={"#6566fc"}
                    />
                    <Text className=" text-[16px] font-semibold">Address</Text>
                  </View>
                  <View>
                    <Text className="text-[14px] font-semibold text-wrap max-w-40">
                      {user?.address || "Not Available"}
                    </Text>
                  </View>
                </View>

                <View className="px-3 py-4 flex-row justify-between items-center border-b border-dashed border-slate-400">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons
                      name="attach-money"
                      size={25}
                      color={"#6566fc"}
                    />
                    <Text className=" text-[16px] font-semibold">Income</Text>
                  </View>
                  <View>
                    <Text className="text-[14px] font-semibold">
                      {formatAmount(user?.income || 0)}
                    </Text>
                  </View>
                </View>
                <View className="px-3 py-4 flex-row justify-between items-center border-b border-dashed border-slate-400">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons
                      name="attach-money"
                      size={25}
                      color={"#6566fc"}
                    />
                    <Text className=" text-[16px] font-semibold">
                      Net Worth
                    </Text>
                  </View>
                  <View>
                    <Text className="text-[14px] font-semibold">
                      {formatAmount(user?.netWorth || 0)}
                    </Text>
                  </View>
                </View>

                <View className="px-3 py-4 flex-row justify-between items-center border-b border-dashed border-slate-400">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="document" size={25} color={"#6566fc"} />
                    <Text className=" text-[16px] font-semibold">
                      Aadhar Number
                    </Text>
                  </View>
                  <View>
                    <Text className="text-[14px] font-semibold">
                      {user?.aadharCard || "Not Available"}
                    </Text>
                  </View>
                </View>

                <View className="px-3 py-4 flex-row justify-between items-center border-b border-dashed border-slate-400">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="document" size={25} color={"#6566fc"} />
                    <Text className=" text-[16px] font-semibold">Pancard</Text>
                  </View>
                  <View>
                    <Text className="text-[14px] font-semibold">
                      {user?.panCard || "Not Available"}
                    </Text>
                  </View>
                </View>
                <View className=" flex flex-col items-center mt-5">
                  {/* <Ionicons name="document" size={24} color={"#ff9f1c"} /> */}
                  <Text className=" text-[16px] font-semibold">Insurances</Text>
                </View>

                <View className="px-3 py-4 border-b flex-col gap-5 border-dashed border-slate-400">
                  {user?.insurances.length === 0 ? (
                    <View className="flex flex-row justify-between">
                      <Text className="text-[12px] text-slate-500 font-medium">
                        Not Available
                      </Text>
                    </View>
                  ) : (
                    user?.insurances.map((ins, index) => (
                      <View
                        key={index}
                        className="flex flex-row justify-between"
                      >
                        <Text className="text-[16px] font-semibold">
                          {index + 1}. {ins.type}
                        </Text>
                        <Text className="text-[16px] font-semibold">
                          {ins.companyName}
                        </Text>
                      </View>
                    ))
                  )}
                </View>

                <View className="flex items-center mt-5">
                  <Text className=" text-[16px] font-semibold">
                    Investments
                  </Text>
                </View>

                <View className="px-3 py-4  border-b border-dashed border-slate-400">
                  <View className="flex-col gap-5">
                    {user?.investments.length === 0 ? (
                      <View className="flex flex-row justify-between">
                        <Text className="text-[12px] text-slate-500 font-medium">
                          Not Available
                        </Text>
                      </View>
                    ) : (
                      user?.investments.map((inv, index) => (
                        <View
                          key={index}
                          className="flex flex-row justify-between"
                        >
                          <Text className="text-[16px] font-semibold">
                            {index + 1}. {inv.investmentType}
                          </Text>
                          <Text className="text-[16px] font-semibold">
                            {formatAmount(inv.amount || 0)}
                          </Text>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Profile;
const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

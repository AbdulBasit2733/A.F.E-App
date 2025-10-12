import { useForgotPasswordFnMutation } from "@/redux/features/user-api/user-api";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, TextInput, ToastAndroid, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, verticalScale } from "react-native-size-matters";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const [forgotPasswordFn, { isLoading }] = useForgotPasswordFnMutation();

  const handleUpdatePassword = async () => {
    if (email && email.includes("@")) {
      try {
        const data = await forgotPasswordFn({ email }).unwrap();
        if (data.success) {
          ToastAndroid.showWithGravityAndOffset(
            `${data.message}`,
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50
          );
          setTimeout(() => {
            router.push("/(auth)/login");
          }, 2000);
        } else {
          ToastAndroid.showWithGravityAndOffset(
            `${data.message}`,
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50
          );
        }
      } catch (error) {
        ToastAndroid.showWithGravityAndOffset(
          "Failed to send reset link. Please try again.",
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      }
    } else if (!email.includes("@")) {
      ToastAndroid.showWithGravityAndOffset(
        "Invalid Email",
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50
      );
    } else {
      ToastAndroid.showWithGravityAndOffset(
        "All Fields Are Required",
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50
      );
    }
  };

  return (
    <SafeAreaProvider
      style={{ padding: moderateScale(20), backgroundColor: "white" }}
    >
      <SafeAreaView
        className="shadow-md rounded-md bg-slate-100 py-10 px-5 gap-5"
        style={{
          paddingHorizontal: moderateScale(20),
          marginTop: verticalScale(40),
        }}
      >
        <Text
          className="text-center text-primary font-extrabold tracking-wider"
          style={{ fontSize: moderateScale(30) }}
        >
          Forgot Password
        </Text>

        <View className="gap-2">
          <Text className="text-xl font-semibold">Registered Email</Text>
          <TextInput
            className="border text-black border-slate-400 font-medium rounded-md px-2 py-4 w-full"
            onChangeText={setEmail}
            value={email}
            placeholder="Enter Your Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <SafeAreaView className="flex-row justify-center">
          <Link href={"/(auth)/login"}>
            <Text className="text-primary text-lg underline font-semibold">
              Go To Login
            </Text>
          </Link>
        </SafeAreaView>

        <Pressable
          onPress={handleUpdatePassword}
          disabled={isLoading}
          className={`${isLoading ? "bg-gray-400" : "bg-primary"} px-4 py-3 rounded-lg mx-24`}
        >
          <Text className="text-center text-white font-semibold text-lg">
            {isLoading ? "Sending Reset Link ... " : "Send Reset Link"}
          </Text>
        </Pressable>
      </SafeAreaView>

      <SafeAreaView className="flex-row justify-between items-center px-10 pt-10">
        <Text className="text-xl">Don't have an account?</Text>
        <Link href={"/(auth)/register"}>
          <Text className="text-primary text-xl font-bold">Register</Text>
        </Link>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ForgotPassword;

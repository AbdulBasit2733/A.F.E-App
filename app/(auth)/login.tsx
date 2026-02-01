import { useAppDispatch } from "@/hooks/use-redux";
import { loginUserFn } from "@/redux/auth-slice/index";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, verticalScale } from "react-native-size-matters";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for button
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Handle Login with loading state
  const handleLoginUser = async () => {
    setLoading(true); // Set loading to true when the button is clicked
    if (email && password) {
      const formData = { email, password };
      try {
        const result = await dispatch(loginUserFn(formData)).unwrap();
        if (result.success) {
          ToastAndroid.showWithGravityAndOffset(
            `${result.message}`,
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50
          );
          router.replace("/(tabs)"); // Replace with your authenticated route
        }
      } catch (error: any) {
        // console.log(error);

        ToastAndroid.showWithGravityAndOffset(
          error,
          ToastAndroid.LONG,
          ToastAndroid.CENTER,
          25,
          50
        );
      } finally {
        setLoading(false);
      }
    } else {
      ToastAndroid.showWithGravityAndOffset(
        "Please fill in both fields.",
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
        25,
        50
      );
      setLoading(false);
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
          Login
        </Text>

        {/* Form Fields for Login */}
        <View className="gap-2">
          <Text className="text-xl font-semibold">Email</Text>
          <TextInput
            className="border text-black dark:text-white border-slate-400 font-medium rounded-md px-2 py-4 w-full"
            onChangeText={setEmail}
            value={email}
            placeholder="Enter Your Email Address"
            keyboardType="email-address"
          />
        </View>

        <View className="gap-2">
          <Text className="text-xl font-semibold">Password</Text>
          <View className="flex-row items-center border border-slate-400 rounded-md">
            <TextInput
              className="flex-1 px-2 py-4 font-medium text-black dark:text-white"
              onChangeText={setPassword}
              value={password}
              placeholder="Enter Your Password"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}
            >
              <Text className="text-primary font-semibold">
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <SafeAreaView className="flex-row justify-end">
          <Link href={"/(auth)/forgot_password"}>
            <Text className="text-primary text-lg underline font-semibold">
              Forgot Password
            </Text>
          </Link>
        </SafeAreaView>

        {/* Interactive Login Button */}
        <Pressable
          onPress={handleLoginUser}
          className={`px-4 py-3 rounded-lg mx-24 ${loading ? "bg-gray-400" : "bg-primary"}`} // Change color on loading
          disabled={loading} // Disable the button during loading
        >
          <Text className="text-center text-white font-semibold text-lg">
            {loading ? "Logging in..." : "Login"} {/* Show loading text */}
          </Text>
        </Pressable>
      </SafeAreaView>

      <SafeAreaView className="flex-row justify-between items-center gap-2 px-10 pt-10">
        <Text className="text-xl">Don't have an account?</Text>
        <Link href={"/(auth)/register"}>
          <Text className="text-primary text-xl font-bold">Register</Text>
        </Link>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Login;

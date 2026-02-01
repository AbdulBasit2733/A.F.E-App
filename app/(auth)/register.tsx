import { useRegisterUserFnMutation } from "@/redux/features/auth-api/auth-api";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, verticalScale } from "react-native-size-matters";

export interface REGISTER_PROPS {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  dob: string;
  gender: string;
}

// Reusable InputField component
const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: import("react-native").KeyboardTypeOptions;
  secureTextEntry?: boolean;
}) => (
  <View className="gap-2">
    <Text className="text-xl font-semibold">{label}</Text>
    <TextInput
      className="border border-slate-400 text-black dark:text-white font-medium rounded-md px-2 py-4 w-full"
      onChangeText={onChangeText}
      value={value}
      placeholder={placeholder}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
    />
  </View>
);

const Register = () => {

  // console.log("Register");

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [gender, setGender] = useState("Male");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState(new Date());
  const [showModel, setShowModel] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [registerFn, { isLoading }] = useRegisterUserFnMutation();

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dob;
    setShowModel(Platform.OS === "ios"); // keep picker open on iOS, close on Android
    setDob(currentDate);
  };

  const handleRegisterUser = async () => {
    // ✅ Validation
    if (!firstname || !lastname || !email || !password) {
      const message = "Please fill in all required fields";
      if (Platform.OS === "android") {
        ToastAndroid.showWithGravityAndOffset(
          message,
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      } else {
        Alert.alert("Validation Error", message);
      }
      return;
    }

    try {
      const formData: REGISTER_PROPS = {
        firstname,
        lastname,
        email,
        password,
        dob: dob.toISOString(),
        gender,
      };

      const data = await registerFn({ formData }).unwrap();
      // console.log("Register Response", data);

      if (data.success) {
        const successMessage = "Registered Successfully, Please Verify Your Email";
        if (Platform.OS === "android") {
          ToastAndroid.showWithGravityAndOffset(
            successMessage,
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50
          );
        } else {
          Alert.alert("Success", successMessage);
        }

        setTimeout(() => {
          router.push("/(auth)/login");
        }, 2000);
      } else {
        const errorMessage = data.message || "Registration failed";
        if (Platform.OS === "android") {
          ToastAndroid.showWithGravityAndOffset(
            errorMessage,
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50
          );
        } else {
          Alert.alert("Error", errorMessage);
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error?.data?.message || "An error occurred during registration";
      if (Platform.OS === "android") {
        ToastAndroid.showWithGravityAndOffset(
          errorMessage,
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };

  // ✅ MOVED return statement to component level (not inside handleRegisterUser)
  return (
    <ScrollView style={{ padding: moderateScale(20), backgroundColor: "white" }}>
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
          Register
        </Text>

        <InputField
          label="First Name"
          value={firstname}
          onChangeText={setFirstname}
          placeholder="Enter Your First Name"
        />

        <InputField
          label="Last Name"
          value={lastname}
          onChangeText={setLastname}
          placeholder="Enter Your Last Name"
        />

        <View className="gap-2">
          <Text className="text-xl font-semibold">Gender</Text>
          <View className="border rounded-md border-slate-400">
            <RNPickerSelect
              value={gender}
              onValueChange={setGender}
              items={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
              ]}
              placeholder={{ label: "Select Gender", value: null }}
            />
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-xl font-semibold">Date of Birth</Text>
          <Pressable
            onPress={() => setShowModel(true)}
            className="border border-slate-400 font-medium rounded-md px-2 py-4 w-full bg-white"
          >
            <Text className="text-lg text-black">
              {dob.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </Pressable>
          {showModel && (
            <RNDateTimePicker
              value={dob}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "calendar"}
              onChange={onChange}
              maximumDate={new Date()} // ✅ Prevent future dates
            />
          )}
        </View>

        <InputField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter Your Email Address"
          keyboardType="email-address"
        />

        <View className="gap-2">
          <Text className="text-xl font-semibold">Password</Text>
          <View className="flex-row items-center border border-slate-400 rounded-md bg-white">
            <TextInput
              className="flex-1 px-2 py-4 font-medium text-black"
              onChangeText={setPassword}
              value={password}
              placeholder="Enter Your Password"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ paddingHorizontal: 10, paddingVertical: 8 }}
            >
              <Text className="text-primary font-semibold">
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Pressable
          onPress={handleRegisterUser}
          disabled={isLoading}
          style={({ pressed }) => ({
            opacity: pressed || isLoading ? 0.7 : 1,
          })}
          className={`px-4 py-3 rounded-lg mx-24 ${isLoading ? "bg-gray-400" : "bg-primary"
            }`}
        >
          {isLoading ? (
            <View className="flex-row items-center justify-center gap-2">
              <ActivityIndicator color="white" size="small" />
              <Text className="text-center text-white font-semibold text-lg">
                Registering...
              </Text>
            </View>
          ) : (
            <Text className="text-center text-white font-semibold text-lg">Register</Text>
          )}
        </Pressable>

        <View className="flex-row justify-center items-center py-10 gap-2">
          <Text className="text-xl">Already have an account?</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text className="text-primary text-xl font-bold">Login</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Register;

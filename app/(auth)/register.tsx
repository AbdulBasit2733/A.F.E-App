import { useRegisterUserFnMutation } from "@/redux/features/auth-api/auth-api";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
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
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: import("react-native").KeyboardTypeOptions;
}) => (
  <View className="gap-2">
    <Text className="text-xl font-semibold">{label}</Text>
    <TextInput
      className="border border-slate-400 font-medium rounded-md px-2 py-4 w-full"
      onChangeText={onChangeText}
      value={value}
      placeholder={placeholder}
      keyboardType={keyboardType}
    />
  </View>
);

const Register = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [gender, setGender] = useState("Male");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState(new Date());
  const [showModel, setShowModel] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [registerFn, { isLoading }] = useRegisterUserFnMutation();

  useEffect(() => {
    // You can clear status or add side effects here if needed
  }, []);

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dob;
    setShowModel(Platform.OS === "ios"); // keep picker open on iOS, close on Android
    setDob(currentDate);
  };

  const handleRegisterUser = async () => {
    if (firstname && lastname && gender && email && password && dob) {
      const formData: REGISTER_PROPS = {
        firstname,
        lastname,
        email,
        password,
        dob: dob.toISOString(), // send ISO string
        gender,
      };
      try {
        const data = await registerFn({ formData }).unwrap();
        if (data.success) {
          ToastAndroid.showWithGravityAndOffset(
            "Registered Successfully, Please Verify Your Email",
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
            data.message,
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50
          );
        }
      } catch {
        ToastAndroid.showWithGravityAndOffset(
          "Registration failed. Please try again.",
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      }
    } else {
      ToastAndroid.showWithGravityAndOffset(
        "All fields are required.",
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50
      );
    }
  };

  return (
    <ScrollView
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
            />
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-xl font-semibold">Date of Birth</Text>
          <Pressable
            onPress={() => setShowModel(true)}
            className="border border-slate-400 font-medium rounded-md px-2 py-4 w-full bg-transparent"
          >
            <Text className="text-lg">{dob.toLocaleDateString("en-US")}</Text>
          </Pressable>
          {showModel && (
            <RNDateTimePicker
              value={dob}
              mode="date"
              display="calendar"
              onChange={onChange}
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
          <View className="flex-row items-center border border-slate-400 rounded-md">
            <TextInput
              className="flex-1 px-2 py-4 font-medium"
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
          className={`px-4 py-3 rounded-lg mx-24 ${isLoading ? "bg-gray-400" : "bg-primary"}`}
        >
          <Text className="text-center text-white font-semibold text-lg">
            {isLoading ? "Registering..." : "Register"}
          </Text>
        </Pressable>

        <SafeAreaView className="flex-row justify-between items-center px-10 py-10 gap-2">
          <Text className="text-xl">Already have an account?</Text>
          <Link href={"/(auth)/login"}>
            <Text className="text-primary text-xl font-bold">Login</Text>
          </Link>
        </SafeAreaView>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Register;

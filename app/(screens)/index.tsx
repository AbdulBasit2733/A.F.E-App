import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  ToastAndroid,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  getUserDetails,
  updateUserDetails,
} from "@/redux/user-slice/index";
import { router } from "expo-router";

const ProfileEdit = () => {
  const { isLoading, user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Parse date properly or use fallback
  const parseDateSafely = (dateString) => {
    try {
      return dateString ? new Date(dateString) : new Date();
    } catch (error) {
      console.error("Date parsing error:", error);
      return new Date();
    }
  };

  // Initialize state with proper null checks and defaults
  const [date, setDate] = useState(new Date()); // Initialize with current date
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Male");
  const [aadhar, setAadhar] = useState("");
  const [panCard, setPanCard] = useState("");
  const [country, setCountry] = useState("");
  const [occupation, setOccupation] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [income, setIncome] = useState("0");
  const [netWorth, setNetWorth] = useState("0");

  // Fetch user details on component mount
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    dispatch(getUserDetails({ signal }));

    return () => {
      controller.abort();
    };
  }, [dispatch]);

  // Update state when user data is loaded
  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setGender(user.userId?.gender || "Male");
      setAadhar(user.aadharCard || "");
      setPanCard(user.panCard || "");
      setCountry(user.country || "");
      setOccupation(user.occupation || "");
      setCity(user.city || "");
      setAddress(user.address || "");
      setIncome(user.income?.toString() || "0");
      setNetWorth(user.netWorth?.toString() || "0");

      if (user?.userId?.dob) {
        setDate(parseDateSafely(user?.userId?.dob));
      }
    }
  }, [user]);

  // Cross-platform toast message
  const showToast = (message) => {
    if (Platform.OS === "android") {
      ToastAndroid.showWithGravityAndOffset(
        message,
        ToastAndroid.LONG,
        ToastAndroid.TOP,
        25,
        50
      );
    } else {
      Alert.alert("Notification", message);
    }
  };

  // Validate a specific field
  const validateField = (field, value) => {
    const errors = { ...validationErrors };

    switch (field) {
      case "phone":
        if (!value) {
          errors.phone = "Phone number is required";
        } else if (!/^[0-9]{10}$/.test(value)) {
          errors.phone = "Phone number must be 10 digits";
        } else {
          delete errors.phone;
        }
        break;
      case "aadhar":
        if (!value) {
          errors.aadhar = "Aadhar Card number is required";
        } else if (!/^[0-9]{12}$/.test(value)) {
          errors.aadhar = "Aadhar Card number must be 12 digits";
        } else {
          delete errors.aadhar;
        }
        break;
      case "panCard":
        if (!value) {
          errors.panCard = "Pan Card number is required";
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
          errors.panCard = "Pan Card format should be like ABCDE1234F";
        } else {
          delete errors.panCard;
        }
        break;
      case "income":
        if (!value) {
          errors.income = "Income is required";
        } else if (isNaN(value) || parseInt(value) < 0) {
          errors.income = "Income must be a valid positive number";
        } else {
          delete errors.income;
        }
        break;
      case "netWorth":
        if (!value) {
          errors.netWorth = "Net Worth is required";
        } else if (isNaN(value) || parseInt(value) < 0) {
          errors.netWorth = "Net Worth must be a valid positive number";
        } else if (income && parseInt(value) < parseInt(income)) {
          errors.netWorth = "Net Worth cannot be less than income";
        } else {
          delete errors.netWorth;
        }
        break;
      case "country":
      case "city":
      case "address":
        if (!value) {
          errors[field] = `${field.charAt(0).toUpperCase() +
            field.slice(1)} is required`;
        } else {
          delete errors[field];
        }
        break;
      default:
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate all fields
  const validateAllFields = () => {
    validateField("phone", phone);
    validateField("aadhar", aadhar);
    validateField("panCard", panCard);
    validateField("income", income);
    validateField("netWorth", netWorth);
    validateField("country", country);
    validateField("city", city);
    validateField("address", address);

    // Return true if there are no validation errors
    return Object.keys(validationErrors).length === 0;
  };

  const updateUserDetailsHandler = async () => {
    if (!validateAllFields()) {
      const errorMessages = Object.values(validationErrors).join("\n");
      Alert.alert("Validation Error", errorMessages);
      return;
    }

    try {
      setSubmitting(true);

      const updatedUser = {
        dob: date.toISOString(),
        phone,
        gender,
        aadharCard: aadhar,
        panCard,
        country,
        city,
        occupation,
        address,
        income: parseInt(income) || 0,
        netWorth: parseInt(netWorth) || 0,
      };

      const response = await dispatch(updateUserDetails(updatedUser));

      if (response.payload?.success) {
        showToast(response.payload.message || "Updated Successfully");
        const controller = new AbortController();
        const signal = controller.signal;
        dispatch(getUserDetails({ signal }));
        setTimeout(() => {
          router.push("/(tabs)/profile");
        }, 1500);
      } else {
        showToast(response.payload?.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Update failed:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Error message display component
  const ErrorMessage = ({ field }) => {
    if (!validationErrors[field]) return null;
    return (
      <Text className="text-red-500 text-sm ml-10 mt-1">
        {validationErrors[field]}
      </Text>
    );
  };

  if (isLoading && !user) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#6566fc" />
        <Text className="mt-2">Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <SafeAreaProvider>
        <SafeAreaView>
          <View className="mx-3 my-5">
            <View className="flex-1">
              <Text className="text-center mt-5 text-2xl font-bold tracking-wide uppercase">
                {user?.userId?.firstname || ""} {user?.userId?.lastname || ""}
              </Text>
              <View className="mt-10 mb-5 flex-1">
                <Text className="text-[16px] text-center tracking-wide font-semibold">
                  Edit Personal Information
                </Text>
                <View className="mt-5 w-full gap-2 py-5 px-2">
                  {/* Email */}
                  <View className="px-3 py-4 flex-row justify-between items-center border-b border-dashed border-slate-400">
                    <View className="flex-row items-center gap-2">
                      <MaterialCommunityIcons
                        size={30}
                        name="email"
                        color="#6566fc"
                      />
                      <Text className="text-[18px] font-semibold">Email</Text>
                    </View>
                    <Text className="text-lg font-semibold">
                      {user?.userId?.email || ""}
                    </Text>
                  </View>
                  {/* DOB */}
                  <View className="my-2 px-3 border-b border-dashed border-slate-400">
                    <View className="flex flex-row justify-between">
                      <View className="flex-row items-center gap-5">
                        <FontAwesome
                          size={30}
                          name="birthday-cake"
                          color="#6566fc"
                        />
                        <Text className="text-[18px] font-semibold">DOB</Text>
                      </View>
                      <Pressable onPress={() => setOpen(true)}>
                        <View className="py-4 flex flex-row items-center gap-5">
                          <Text className="text-lg font-semibold">
                            {date.toISOString().split("T")[0]}
                          </Text>
                        </View>
                      </Pressable>
                    </View>

                    {/* Show Date Picker */}
                    {open && (
                      <RNDateTimePicker
                        mode="date"
                        value={date}
                        maximumDate={new Date()}
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(event, selectedDate) => {
                          setOpen(false);
                          if (selectedDate) {
                            setDate(selectedDate);
                          }
                        }}
                      />
                    )}
                  </View>
                  {/* Phone */}
                  <View className="my-2 px-3 border-b w-full flex flex-row justify-between gap-x-5 border-dashed border-slate-400">
                    <View className="flex-row items-center gap-5">
                      <FontAwesome size={30} name="phone" color="#6566fc" />
                      <Text className="text-lg font-semibold">Phone</Text>
                    </View>
                    <TextInput
                      placeholder="Enter Your Phone Number"
                      keyboardType="numeric"
                      value={phone}
                      onChangeText={(value) => {
                        const numericValue = value.replace(/[^0-9]/g, "");
                        setPhone(numericValue);
                        validateField("phone", numericValue);
                      }}
                      maxLength={10}
                      className="py-4 text-lg"
                    />
                  </View>
                  <ErrorMessage field="phone" />
                  {/* Gender */}
                  <View className="my-2 px-3 border-b border-dashed border-slate-400">
                    <View className="flex-row items-center gap-5">
                      <FontAwesome
                        size={30}
                        name="venus-mars"
                        color="#6566fc"
                      />
                      <Text className="text-lg font-semibold">Gender</Text>
                    </View>
                    <RNPickerSelect
                      value={gender}
                      onValueChange={(value) => setGender(value || "Male")}
                      items={[
                        { label: "Male", value: "Male" },
                        { label: "Female", value: "Female" },
                        { label: "Other", value: "Other" },
                      ]}
                    />
                  </View>
                  {/* Aadhar */}
                  <View className="my-2 px-3 border-b border-dashed border-slate-400">
                    <View className="flex-row items-center gap-5">
                      <FontAwesome size={30} name="id-card" color="#6566fc" />
                      <Text className="text-lg font-semibold">
                        Aadhar Card Number
                      </Text>
                    </View>
                    <TextInput
                      placeholder="Enter Your Aadhar Number"
                      keyboardType="numeric"
                      value={aadhar}
                      onChangeText={(value) => {
                        const numericValue = value.replace(/[^0-9]/g, "");
                        setAadhar(numericValue);
                        validateField("aadhar", numericValue);
                      }}
                      maxLength={12}
                      className="py-4 text-lg"
                    />
                  </View>
                  <ErrorMessage field="aadhar" />
                  {/* Pan Card */}
                  <View className="my-2 px-3 border-b border-dashed border-slate-400">
                    <View className="flex-row items-center gap-5">
                      <FontAwesome size={30} name="id-card" color="#6566fc" />
                      <Text className="text-lg font-semibold">
                        Pan Card Number
                      </Text>
                    </View>
                    <TextInput
                      placeholder="Enter Your Pan Card Number"
                      keyboardType="default"
                      value={panCard}
                      onChangeText={(value) => {
                        const upperCaseValue = value.toUpperCase();
                        setPanCard(upperCaseValue);
                        validateField("panCard", upperCaseValue);
                      }}
                      maxLength={10}
                      autoCapitalize="characters"
                      className="py-4 text-lg"
                    />
                  </View>
                  <ErrorMessage field="panCard" />
                  {/* Occupation */}
                  <View className="my-2 px-3 border-b border-dashed border-slate-400">
                    <View className="flex-row items-center gap-5">
                      <FontAwesome size={30} name="briefcase" color="#6566fc" />
                      <Text className="text-lg font-semibold">Occupation</Text>
                    </View>
                    <TextInput
                      placeholder="Enter Your Occupation"
                      keyboardType="default"
                      value={occupation}
                      onChangeText={setOccupation}
                      className="py-4 text-lg"
                    />
                  </View>
                  {/* Country */}
                  <View className="my-2 px-3 border-b border-dashed border-slate-400">
                    <View className="flex-row items-center gap-5">
                      <FontAwesome size={30} name="globe" color="#6566fc" />
                      <Text className="text-lg font-semibold">Country</Text>
                    </View>
                    <TextInput
                      placeholder="Enter Country"
                      value={country}
                      onChangeText={(value) => {
                        setCountry(value);
                        validateField("country", value);
                      }}
                      className="py-4 text-lg"
                    />
                  </View>
                  <ErrorMessage field="country" />
                  {/* City */}
                  <View className="my-2 px-3 border-b border-dashed border-slate-400">
                    <View className="flex-row items-center gap-5">
                      <FontAwesome size={30} name="building" color="#6566fc" />
                      <Text className="text-lg font-semibold">City</Text>
                    </View>
                    <TextInput
                      placeholder="Enter City"
                      value={city}
                      onChangeText={(value) => {
                        setCity(value);
                        validateField("city", value);
                      }}
                      className="py-4 text-lg"
                    />
                  </View>
                  <ErrorMessage field="city" />
                  {/* Address */}
                  <View className="my-2 px-3 border-b border-dashed border-slate-400">
                    <View className="flex-row items-center gap-5">
                      <FontAwesome size={30} name="home" color="#6566fc" />
                      <Text className="text-lg font-semibold">Address</Text>
                    </View>
                    <TextInput
                      placeholder="Enter Address"
                      value={address}
                      onChangeText={(value) => {
                        setAddress(value);
                        validateField("address", value);
                      }}
                      className="py-4 text-lg"
                      multiline
                    />
                  </View>
                  <ErrorMessage field="address" />
                  {/* Income */}
                  <View className="my-2 px-3 border-b border-dashed border-slate-400">
                    <View className="flex-row items-center gap-5">
                      <FontAwesome size={30} name="money" color="#6566fc" />
                      <Text className="text-lg font-semibold">Income</Text>
                    </View>
                    <TextInput
                      placeholder="Enter Your Income"
                      keyboardType="numeric"
                      value={income}
                      onChangeText={(value) => {
                        const numericValue = value.replace(/[^0-9]/g, "");
                        setIncome(numericValue);
                        validateField("income", numericValue);
                        // Re-validate netWorth when income changes
                        validateField("netWorth", netWorth);
                      }}
                      className="py-4 text-lg"
                    />
                  </View>
                  <ErrorMessage field="income" />
                  {/* Net Worth */}
                  <View className="my-2 px-3 border-b border-dashed border-slate-400">
                    <View className="flex-row items-center gap-5">
                      <FontAwesome size={30} name="money" color="#6566fc" />
                      <Text className="text-lg font-semibold">Net Worth</Text>
                    </View>
                    <TextInput
                      placeholder="Enter Your Net Worth"
                      keyboardType="numeric"
                      value={netWorth}
                      onChangeText={(value) => {
                        const numericValue = value.replace(/[^0-9]/g, "");
                        setNetWorth(numericValue);
                        validateField("netWorth", numericValue);
                      }}
                      className="py-4 text-lg"
                    />
                  </View>
                  <ErrorMessage field="netWorth" />
                  <Pressable
                    disabled={submitting}
                    onPress={updateUserDetailsHandler}
                    className="mx-28"
                  >
                    <View className="mt-5 py-3 bg-primary rounded-md flex justify-center items-center">
                      {submitting ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text className="text-white font-semibold">Update</Text>
                      )}
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </ScrollView>
  );
};

export default ProfileEdit;

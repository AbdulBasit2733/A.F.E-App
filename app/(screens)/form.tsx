import { useAppDispatch } from "@/hooks/use-redux";
import { useLazyGetCouponByCodeFnQuery } from "@/redux/features/coupon-api/coupon-api";
import {
  useGetAllRegisteredSessionsFnQuery,
  useGetSessionByIdFnQuery,
  useRegisterSessionFnMutation,
} from "@/redux/features/session-api/session-api";
import { REGISTER_SESSION_PAYLOAD } from "@/redux/features/session-api/types";
import { Insurance, Investment, USER_PROPS } from "@/redux/features/user-api/types";
import { useGetUserDetailsFnQuery } from "@/redux/features/user-api/user-api";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons
} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const Form = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [coupon, setCoupon] = useState("");
  const [formData, setFormData] = useState<USER_PROPS | null>(null);
  const [selectedDate, setSelectedDate] = useState("");

  const sessionId = Array.isArray(id) ? id[0] : (id ?? "");

  const { data: sessionDataResponse, isFetching } = useGetSessionByIdFnQuery({
    id: sessionId,
  });
  

  const { data: userDataResponse } = useGetUserDetailsFnQuery();

  const {
    data: registeredSessionResponse,
    isFetching: isFetchingRegisteredSession,
  } = useGetAllRegisteredSessionsFnQuery();

  const [getCoupon, { data: couponResponse, isError: isCouponError }] =
    useLazyGetCouponByCodeFnQuery();

  const [registerSessionFn, { isLoading }] = useRegisterSessionFnMutation();

  const session = sessionDataResponse?.data ?? null;
  const userDetails = userDataResponse?.data ?? null;
  const couponData = couponResponse?.data ?? null;
  const registeredSessions = registeredSessionResponse?.data ?? [];

  // Modal states for Insurance
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [currentInsurance, setCurrentInsurance] = useState<Insurance>({
    type: "",
    companyName: "",
  });
  const [editingInsuranceIndex, setEditingInsuranceIndex] = useState<number | null>(null);

  // Modal states for Investment
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [currentInvestment, setCurrentInvestment] = useState<Investment>({
    investmentType: "",
    amount: 0,
  });
  const [editingInvestmentIndex, setEditingInvestmentIndex] = useState<number | null>(null);

  const dispatch = useAppDispatch();

  // Initialize form data with user details
  useEffect(() => {
    if (userDetails) {
      setFormData({
        ...userDetails,
        insurances: userDetails.insurances?.length > 0 ? userDetails.insurances : [],
        investments: userDetails.investments?.length > 0 ? userDetails.investments : [],
      });
    } else {
      setFormData({
        firstname: "",
        lastname: "",
        dob: "",
        gender: "",
        email: "",
        income: 0,
        netWorth: 0,
        aadharCard: "",
        panCard: "",
        insurances: [],
        investments: [],
        country: "",
        phone: "",
        occupation: "",
        city: "",
        address: "",
      });
    }
  }, [userDetails]);

  // Set initial selected date
  useEffect(() => {
    if (session?.dateTimes?.[0]) {
      setSelectedDate(session.dateTimes[0]);
    }
  }, [session]);

  // Debounced coupon validation
  useEffect(() => {
    if (!coupon || coupon.length < 3) {
      return;
    }

    const timeoutId = setTimeout(() => {
      getCoupon({ code: coupon });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [coupon, getCoupon]);

  // Handle coupon validation response
  useEffect(() => {
    if (isCouponError && coupon) {
      Toast.show({
        type: "error",
        text1: "Invalid Coupon",
        text2: "Coupon code not found or expired",
      });
    } else if (couponData && !couponData.isActive) {
      Toast.show({
        type: "error",
        text1: "Inactive Coupon",
        text2: "This coupon is no longer active",
      });
    } else if (couponData && new Date(couponData.expiryDate) < new Date()) {
      Toast.show({
        type: "error",
        text1: "Expired Coupon",
        text2: "This coupon has expired",
      });
    } else if (couponData && couponData.isActive) {
      Toast.show({
        type: "success",
        text1: "Coupon Applied!",
        text2: `${couponData.discount}% discount applied`,
      });
    }
  }, [couponData, isCouponError, coupon]);

  const price = parseFloat(session?.price || "0");

  const discountedPrice = useMemo(() => {
    if (!price) return 0;
    if (!couponData || !couponData.isActive) return price;

    const isExpired = new Date(couponData.expiryDate) < new Date();
    if (isExpired) return price;

    return parseFloat((price - (price * couponData.discount) / 100).toFixed(2));
  }, [price, couponData]);

  const isDateRegistered = (date: string | null) => {
    if (!date) return false;
    return registeredSessions.some(
      (session) => session.selectedDate === date && session.sessionId === id
    );
  };

  // Insurance Functions
  const openInsuranceModal = (insurance?: Insurance, index?: number) => {
    if (insurance && index !== undefined) {
      setCurrentInsurance(insurance);
      setEditingInsuranceIndex(index);
    } else {
      setCurrentInsurance({ type: "", companyName: "" });
      setEditingInsuranceIndex(null);
    }
    setShowInsuranceModal(true);
  };

  const saveInsurance = () => {
    if (!currentInsurance.type || !currentInsurance.companyName) {
      Alert.alert("Validation Error", "Please fill all insurance fields.");
      return;
    }

    const updatedInsurances = [...(formData?.insurances || [])];
    if (editingInsuranceIndex !== null) {
      updatedInsurances[editingInsuranceIndex] = currentInsurance;
    } else {
      updatedInsurances.push(currentInsurance);
    }

    setFormData((prev) => (prev ? { ...prev, insurances: updatedInsurances } : null));
    setShowInsuranceModal(false);
    setCurrentInsurance({ type: "", companyName: "" });
    setEditingInsuranceIndex(null);
  };

  const deleteInsurance = (index: number) => {
    Alert.alert(
      "Delete Insurance",
      "Are you sure you want to delete this insurance?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedInsurances = (formData?.insurances || []).filter((_, i) => i !== index);
            setFormData((prev) => (prev ? { ...prev, insurances: updatedInsurances } : null));
          },
        },
      ]
    );
  };

  // Investment Functions
  const openInvestmentModal = (investment?: Investment, index?: number) => {
    if (investment && index !== undefined) {
      setCurrentInvestment(investment);
      setEditingInvestmentIndex(index);
    } else {
      setCurrentInvestment({ investmentType: "", amount: 0 });
      setEditingInvestmentIndex(null);
    }
    setShowInvestmentModal(true);
  };

  const saveInvestment = () => {
    if (!currentInvestment.investmentType || (currentInvestment?.amount ?? 0) <= 0) {
      Alert.alert("Validation Error", "Please fill all investment fields with valid data.");
      return;
    }

    const updatedInvestments = [...(formData?.investments || [])];
    if (editingInvestmentIndex !== null) {
      updatedInvestments[editingInvestmentIndex] = currentInvestment;
    } else {
      updatedInvestments.push(currentInvestment);
    }

    setFormData((prev) => (prev ? { ...prev, investments: updatedInvestments } : null));
    setShowInvestmentModal(false);
    setCurrentInvestment({ investmentType: "", amount: 0 });
    setEditingInvestmentIndex(null);
  };

  const deleteInvestment = (index: number) => {
    Alert.alert(
      "Delete Investment",
      "Are you sure you want to delete this investment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedInvestments = (formData?.investments || []).filter((_, i) => i !== index);
            setFormData((prev) => (prev ? { ...prev, investments: updatedInvestments } : null));
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (formData !== null) {
      const { aadharCard, phone, income, insurances, investments, netWorth, panCard } = formData;

      let isValid = true;
      const errorMessages = [];

      if (!aadharCard || !/^[0-9]{12}$/.test(aadharCard)) {
        isValid = false;
        errorMessages.push("Aadhar Card must be 12 digits");
      }

      if (!phone || !/^[1-9][0-9]{9}$/.test(phone)) {
        isValid = false;
        errorMessages.push("Phone must be 10 digits and not start with 0");
      }

      if (!isValidNumber(income)) {
        isValid = false;
        errorMessages.push("Income must be a valid number");
      }

      if (!isValidNumber(netWorth)) {
        isValid = false;
        errorMessages.push("Net Worth must be a valid number");
      }

      if (!panCard || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panCard)) {
        isValid = false;
        errorMessages.push("Invalid PAN Card format");
      }

      if (!isValid) {
        Alert.alert("Validation Error", errorMessages.join("\n"));
        return;
      }

      const payload: REGISTER_SESSION_PAYLOAD = {
        formData: {
          income: Number(income),
          netWorth: Number(netWorth),
          aadharCard,
          panCard,
          phone,
          insurances:
            insurances?.map((ins) => ({
              type: ins.type || "",
              companyName: ins.companyName || "",
            })) || [],
          investments:
            investments?.map((inv) => ({
              investmentType: inv.investmentType || "",
              amount: Number(inv.amount) || 0,
            })) || [],
          selectedDate,
          couponId: couponData?._id,
          originalPrice: Number(price),
          discountedPrice: Number(discountedPrice),
        },
        id: sessionId,
      };

      try {
        const result = await registerSessionFn(payload).unwrap();

        if (result?.success) {
          Alert.alert("Success", result?.message || "Session registered successfully");
          setTimeout(() => {
            router.push("/(tabs)/registered");
          }, 1500);
        } else {
          Alert.alert("Error", result?.message || "Something went wrong");
        }
      } catch (error: any) {
        console.error("Error during submission:", error);
        Alert.alert("Error", error?.data?.message || error?.message || "An error occurred");
      }
    } else {
      Alert.alert("Error", "All Fields Are Required");
    }
  };

  function isValidNumber(value: any): boolean {
    return !isNaN(Number.parseFloat(value)) && isFinite(value) && Number(value) >= 0;
  }

  if (isFetching) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6566fc" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-gray-50">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="bg-white px-5 py-4 flex-row items-center border-b border-gray-100">
            <Pressable onPress={() => router.back()} className="p-2">
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </Pressable>
            <Text className="text-xl font-bold text-gray-800 ml-3">Session Registration</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Session Header */}
            {session?.thumbnail && (
              <Image
                source={{ uri: session.thumbnail }}
                className="w-full h-52"
                resizeMode="cover"
              />
            )}

            <View className="px-5 py-6">
              {/* Session Details Card */}
              <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
                <Text className="text-2xl font-bold text-gray-800 mb-2">
                  {session?.title || "Session Title"}
                </Text>
                <Text className="text-gray-600 mb-4 leading-6">
                  {session?.description || "Session Description"}
                </Text>

                <View className="flex-row gap-3 mb-3">
                  <View className="flex-1 bg-[#6566fc]/10 p-3 rounded-xl flex-row items-center gap-2">
                    <MaterialIcons name="computer" size={20} color="#6566fc" />
                    <Text className="text-gray-700 font-semibold text-sm">
                      {session?.mode || "Online"}
                    </Text>
                  </View>
                  <View className="flex-1 bg-[#6566fc]/10 p-3 rounded-xl flex-row items-center gap-2">
                    <MaterialIcons name="category" size={20} color="#6566fc" />
                    <Text className="text-gray-700 font-semibold text-sm">
                      {session?.sessionType || "Workshop"}
                    </Text>
                  </View>
                </View>

                {/* Price Section */}
                <View className="bg-[#6566fc]/5 p-4 rounded-xl">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600 font-semibold">Session Price</Text>
                    <View className="items-end">
                      {couponData && couponData.isActive ? (
                        <>
                          <Text className="text-gray-400 line-through text-sm">
                            ₹{price.toFixed(2)}
                          </Text>
                          <Text className="text-[#6566fc] font-bold text-xl">
                            ₹{discountedPrice.toFixed(2)}
                          </Text>
                          <Text className="text-green-600 text-xs font-semibold">
                            {couponData.discount}% OFF
                          </Text>
                        </>
                      ) : (
                        <Text className="text-[#6566fc] font-bold text-xl">
                          ₹{price.toFixed(2)}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              {/* Date Selection */}
              <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-3">
                  Select Session Date
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-3">
                    {session?.dateTimes?.map((date, index) => {
                      const isRegistered = isDateRegistered(date);
                      const isSelected = selectedDate === date;
                      return (
                        <Pressable
                          key={index}
                          onPress={() => !isRegistered && setSelectedDate(date)}
                          disabled={isRegistered}
                          className={`px-5 py-3 rounded-xl border-2 min-w-[140px] ${
                            isSelected
                              ? "bg-[#6566fc] border-[#6566fc]"
                              : isRegistered
                              ? "bg-gray-100 border-gray-300"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <Text
                            className={`font-semibold text-center ${
                              isSelected
                                ? "text-white"
                                : isRegistered
                                ? "text-gray-400"
                                : "text-gray-700"
                            }`}
                          >
                            {new Date(date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Text>
                          {isRegistered && (
                            <Text className="text-xs text-gray-400 text-center mt-1">
                              Registered
                            </Text>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              {/* Coupon Code */}
              <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-3">
                  Have a Coupon Code?
                </Text>
                <View className="flex-row gap-3">
                  <TextInput
                    value={coupon}
                    onChangeText={setCoupon}
                    placeholder="Enter coupon code"
                    placeholderTextColor="#9ca3af"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                    autoCapitalize="characters"
                  />
                  {couponData && couponData.isActive && (
                    <View className="bg-green-100 px-4 rounded-xl items-center justify-center">
                      <Feather name="check-circle" size={24} color="#10b981" />
                    </View>
                  )}
                </View>
              </View>

              {/* Personal Information */}
              <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
                <Text className="text-lg font-bold text-gray-800 mb-4">
                  Personal Information
                </Text>
                <View className="gap-4">
                  <InputField
                    label="Phone Number"
                    value={formData?.phone || ""}
                    onChangeText={(text) =>
                      setFormData((prev) => (prev ? { ...prev, phone: text } : null))
                    }
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    icon={<MaterialIcons name="phone" size={20} color="#6566fc" />}
                  />

                  <InputField
                    label="Aadhar Card"
                    value={formData?.aadharCard || ""}
                    onChangeText={(text) =>
                      setFormData((prev) => (prev ? { ...prev, aadharCard: text } : null))
                    }
                    placeholder="Enter 12-digit Aadhar number"
                    keyboardType="numeric"
                    maxLength={12}
                    icon={<Ionicons name="document-text" size={20} color="#6566fc" />}
                  />

                  <InputField
                    label="PAN Card"
                    value={formData?.panCard || ""}
                    onChangeText={(text) =>
                      setFormData((prev) =>
                        prev ? { ...prev, panCard: text.toUpperCase() } : null
                      )
                    }
                    placeholder="Enter PAN number"
                    maxLength={10}
                    autoCapitalize="characters"
                    icon={<Ionicons name="card" size={20} color="#6566fc" />}
                  />

                  <InputField
                    label="Annual Income"
                    value={formData?.income?.toString() || "0"}
                    onChangeText={(text) =>
                      setFormData((prev) =>
                        prev ? { ...prev, income: parseFloat(text) || 0 } : null
                      )
                    }
                    placeholder="Enter annual income"
                    keyboardType="numeric"
                    icon={<MaterialIcons name="attach-money" size={20} color="#6566fc" />}
                  />

                  <InputField
                    label="Net Worth"
                    value={formData?.netWorth?.toString() || "0"}
                    onChangeText={(text) =>
                      setFormData((prev) =>
                        prev ? { ...prev, netWorth: parseFloat(text) || 0 } : null
                      )
                    }
                    placeholder="Enter net worth"
                    keyboardType="numeric"
                    icon={
                      <MaterialIcons name="account-balance-wallet" size={20} color="#6566fc" />
                    }
                  />
                </View>
              </View>

              {/* Insurances Section */}
              <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold text-gray-800">Insurances</Text>
                  <Pressable
                    onPress={() => openInsuranceModal()}
                    className="bg-[#6566fc] px-4 py-2 rounded-full flex-row items-center gap-2"
                  >
                    <AntDesign name="plus" size={14} color="white" />
                    <Text className="text-white font-semibold text-sm">Add</Text>
                  </Pressable>
                </View>

                {(formData?.insurances || []).length === 0 ? (
                  <View className="p-6 items-center border border-dashed border-gray-300 rounded-xl">
                    <MaterialCommunityIcons name="shield-off" size={48} color="#d1d5db" />
                    <Text className="text-gray-400 mt-2">No insurances added</Text>
                  </View>
                ) : (
                  <View className="gap-3">
                    {(formData?.insurances || []).map((insurance, index) => (
                      <View
                        key={index}
                        className="bg-gray-50 rounded-xl p-4 flex-row items-center justify-between"
                      >
                        <View className="flex-1">
                          <Text className="text-gray-800 font-bold text-base">
                            {insurance.type}
                          </Text>
                          <Text className="text-gray-500 text-sm mt-1">
                            {insurance.companyName}
                          </Text>
                        </View>
                        <View className="flex-row gap-2">
                          <Pressable
                            onPress={() => openInsuranceModal(insurance, index)}
                            className="bg-[#6566fc]/10 p-2 rounded-lg"
                          >
                            <MaterialIcons name="edit" size={18} color="#6566fc" />
                          </Pressable>
                          <Pressable
                            onPress={() => deleteInsurance(index)}
                            className="bg-red-50 p-2 rounded-lg"
                          >
                            <MaterialIcons name="delete" size={18} color="#ef4444" />
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Investments Section */}
              <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold text-gray-800">Investments</Text>
                  <Pressable
                    onPress={() => openInvestmentModal()}
                    className="bg-[#6566fc] px-4 py-2 rounded-full flex-row items-center gap-2"
                  >
                    <AntDesign name="plus" size={14} color="white" />
                    <Text className="text-white font-semibold text-sm">Add</Text>
                  </Pressable>
                </View>

                {(formData?.investments || []).length === 0 ? (
                  <View className="p-6 items-center border border-dashed border-gray-300 rounded-xl">
                    <MaterialIcons name="trending-up" size={48} color="#d1d5db" />
                    <Text className="text-gray-400 mt-2">No investments added</Text>
                  </View>
                ) : (
                  <View className="gap-3">
                    {(formData?.investments || []).map((investment, index) => (
                      <View
                        key={index}
                        className="bg-gray-50 rounded-xl p-4 flex-row items-center justify-between"
                      >
                        <View className="flex-1">
                          <Text className="text-gray-800 font-bold text-base">
                            {investment.investmentType}
                          </Text>
                          <Text className="text-[#6566fc] font-semibold text-sm mt-1">
                            ₹{(investment?.amount ?? 0).toLocaleString()}
                          </Text>
                        </View>
                        <View className="flex-row gap-2">
                          <Pressable
                            onPress={() => openInvestmentModal(investment, index)}
                            className="bg-[#6566fc]/10 p-2 rounded-lg"
                          >
                            <MaterialIcons name="edit" size={18} color="#6566fc" />
                          </Pressable>
                          <Pressable
                            onPress={() => deleteInvestment(index)}
                            className="bg-red-50 p-2 rounded-lg"
                          >
                            <MaterialIcons name="delete" size={18} color="#ef4444" />
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmit}
                disabled={isLoading}
                className={`bg-[#6566fc] py-4 rounded-xl items-center shadow-lg mb-6 ${
                  isLoading ? "opacity-50" : ""
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Register for Session</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Insurance Modal */}
        <Modal
          visible={showInsuranceModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowInsuranceModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6 max-h-[70%]">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-gray-800">
                  {editingInsuranceIndex !== null ? "Edit" : "Add"} Insurance
                </Text>
                <Pressable onPress={() => setShowInsuranceModal(false)}>
                  <Ionicons name="close" size={28} color="#9ca3af" />
                </Pressable>
              </View>

              <View className="gap-4">
                <InputField
                  label="Insurance Type"
                  value={currentInsurance.type ?? ""}
                  onChangeText={(text) =>
                    setCurrentInsurance({ ...currentInsurance, type: text })
                  }
                  placeholder="e.g., Life, Health, Car"
                  icon={<MaterialCommunityIcons name="shield-check" size={20} color="#6566fc" />}
                />

                <InputField
                  label="Company Name"
                  value={currentInsurance.companyName ?? ""}
                  onChangeText={(text) =>
                    setCurrentInsurance({ ...currentInsurance, companyName: text })
                  }
                  placeholder="Enter insurance company"
                  icon={<MaterialIcons name="business" size={20} color="#6566fc" />}
                />
              </View>

              <Pressable
                onPress={saveInsurance}
                className="bg-[#6566fc] py-4 rounded-xl items-center mt-6"
              >
                <Text className="text-white font-bold text-lg">
                  {editingInsuranceIndex !== null ? "Update" : "Add"} Insurance
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Investment Modal */}
        <Modal
          visible={showInvestmentModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowInvestmentModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6 max-h-[70%]">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-gray-800">
                  {editingInvestmentIndex !== null ? "Edit" : "Add"} Investment
                </Text>
                <Pressable onPress={() => setShowInvestmentModal(false)}>
                  <Ionicons name="close" size={28} color="#9ca3af" />
                </Pressable>
              </View>

              <View className="gap-4">
                <InputField
                  label="Investment Type"
                  value={currentInvestment.investmentType ?? ""}
                  onChangeText={(text) =>
                    setCurrentInvestment({ ...currentInvestment, investmentType: text })
                  }
                  placeholder="e.g., Stocks, Mutual Funds"
                  icon={<MaterialIcons name="trending-up" size={20} color="#6566fc" />}
                />

                <InputField
                  label="Amount"
                  value={(currentInvestment?.amount ?? 0).toString()}
                  onChangeText={(text) =>
                    setCurrentInvestment({
                      ...currentInvestment,
                      amount: parseFloat(text) || 0,
                    })
                  }
                  placeholder="Enter investment amount"
                  keyboardType="numeric"
                  icon={<MaterialIcons name="attach-money" size={20} color="#6566fc" />}
                />
              </View>

              <Pressable
                onPress={saveInvestment}
                className="bg-[#6566fc] py-4 rounded-xl items-center mt-6"
              >
                <Text className="text-white font-bold text-lg">
                  {editingInvestmentIndex !== null ? "Update" : "Add"} Investment
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

// Reusable Input Field Component
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: any;
  maxLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  icon: React.ReactNode;
}

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  maxLength,
  autoCapitalize = "sentences",
  icon,
}: InputFieldProps) => (
  <View>
    <Text className="text-gray-700 font-semibold mb-2">{label}</Text>
    <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center">
      {icon}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        className="flex-1 ml-3 text-gray-800 text-base"
      />
    </View>
  </View>
);

export default Form;

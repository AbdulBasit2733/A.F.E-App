import { useAppDispatch } from "@/hooks/use-redux";
import { useLazyGetCouponByCodeFnQuery } from "@/redux/features/coupon-api/coupon-api";
import {
  useGetAllRegisteredSessionsFnQuery,
  useGetSessionByIdFnQuery,
  useRegisterSessionFnMutation,
} from "@/redux/features/session-api/session-api";
import { REGISTER_SESSION_PAYLOAD } from "@/redux/features/session-api/types";
import {
  Insurance,
  Investment,
  USER_PROPS,
} from "@/redux/features/user-api/types";
import { useGetUserDetailsFnQuery } from "@/redux/features/user-api/user-api";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
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
  const dispatch = useAppDispatch();

  // ✅ Memoize sessionId
  const sessionId = useMemo(
    () => (Array.isArray(id) ? id[0] : (id ?? "")),
    [id]
  );

  // States
  const [coupon, setCoupon] = useState("");
  const [formData, setFormData] = useState<USER_PROPS | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [currentInsurance, setCurrentInsurance] = useState<Insurance>({
    type: "",
    companyName: "",
  });
  const [editingInsuranceIndex, setEditingInsuranceIndex] = useState<
    number | null
  >(null);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [currentInvestment, setCurrentInvestment] = useState<Investment>({
    investmentType: "",
    amount: 0,
  });
  const [editingInvestmentIndex, setEditingInvestmentIndex] = useState<
    number | null
  >(null);

  // Refs for tracking initialization and ongoing requests
  const hasInitializedForm = useRef(false);
  const lastUserDataKey = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // API Queries
  const { data: sessionDataResponse, isFetching } = useGetSessionByIdFnQuery({
    id: sessionId,
  });
  const { data: userDataResponse } = useGetUserDetailsFnQuery();
  const { data: registeredSessionResponse } =
    useGetAllRegisteredSessionsFnQuery();
  const [getCoupon, { data: couponResponse, isError: isCouponError }] =
    useLazyGetCouponByCodeFnQuery();
  const [
    registerSessionFn,
    { isLoading: isRegistering, reset: resetRegisterMutation },
  ] = useRegisterSessionFnMutation();

  // ✅ Memoize extracted data
  const session = useMemo(
    () => sessionDataResponse?.data ?? null,
    [sessionDataResponse]
  );
  const userDetails = useMemo(
    () => userDataResponse?.data ?? null,
    [userDataResponse]
  );
  const couponData = useMemo(
    () => couponResponse?.data ?? null,
    [couponResponse]
  );
  const registeredSessions = useMemo(
    () => registeredSessionResponse?.data ?? [],
    [registeredSessionResponse]
  );

  // ✅ Check if user already registered for this session
  const existingRegistration = useMemo(
    () => registeredSessions.find((reg) => reg.sessionId === sessionId),
    [registeredSessions, sessionId]
  );

  const isSameDate = useMemo(() => {
    if (!isReschedule || !selectedDate || !existingRegistration) return false;
    return selectedDate === existingRegistration.selectedDate;
  }, [selectedDate, existingRegistration]);
  const isReschedule = !!existingRegistration;
  const isLoading = isRegistering;

  // ✅ Cleanup on unmount or navigation away
  useEffect(() => {
    return () => {
      // Cancel ongoing mutation if user navigates away
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      // Reset mutation state to prevent stale data
      resetRegisterMutation();
    };
  }, [resetRegisterMutation]);

  // ✅ Initialize form data with stable tracking
  useEffect(() => {
    if (userDetails) {
      const userKey = `${userDetails._id}-${userDetails.email}`;
      if (lastUserDataKey.current !== userKey) {
        setFormData({
          ...userDetails,
          insurances:
            userDetails.insurances?.length > 0 ? userDetails.insurances : [],
          investments:
            userDetails.investments?.length > 0 ? userDetails.investments : [],
        });
        lastUserDataKey.current = userKey;
        hasInitializedForm.current = true;
      }
    } else if (!hasInitializedForm.current) {
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
      hasInitializedForm.current = true;
    }
  }, [userDetails]);

  // ✅ Set initial selected date
  useEffect(() => {
    if (existingRegistration?.selectedDate) {
      setSelectedDate(existingRegistration.selectedDate);
    } else if (session?.dateTimes?.[0] && !selectedDate) {
      setSelectedDate(session.dateTimes[0]);
    }
  }, [session, selectedDate, existingRegistration]);

  // ✅ Debounced coupon validation
  useEffect(() => {
    if (!coupon || coupon.length < 3) return;
    const timeoutId = setTimeout(() => getCoupon({ code: coupon }), 500);
    return () => clearTimeout(timeoutId);
  }, [coupon, getCoupon]);

  // ✅ Handle coupon validation response
  useEffect(() => {
    if (!coupon) return;
    if (isCouponError) {
      Toast.show({
        type: "error",
        text1: "Invalid Coupon",
        text2: "Coupon code not found or expired",
      });
    } else if (couponData) {
      if (!couponData.isActive) {
        Toast.show({
          type: "error",
          text1: "Inactive Coupon",
          text2: "This coupon is no longer active",
        });
      } else if (new Date(couponData.expiryDate) < new Date()) {
        Toast.show({
          type: "error",
          text1: "Expired Coupon",
          text2: "This coupon has expired",
        });
      } else {
        Toast.show({
          type: "success",
          text1: "Coupon Applied!",
          text2: `${couponData.discount}% discount applied`,
        });
      }
    }
  }, [couponData, isCouponError, coupon]);

  // ✅ Memoize price calculations
  const price = useMemo(
    () => parseFloat(session?.price || "0"),
    [session?.price]
  );

  const discountedPrice = useMemo(() => {
    if (!price || !couponData?.isActive) return price;
    if (new Date(couponData.expiryDate) < new Date()) return price;
    return parseFloat((price - (price * couponData.discount) / 100).toFixed(2));
  }, [price, couponData]);

  // ✅ Check if a date is already registered
  const isDateRegistered = useCallback(
    (date: string | null) => {
      if (!date) return false;
      return registeredSessions.some(
        (reg) =>
          reg.selectedDate === date &&
          reg.sessionId === sessionId &&
          (!isReschedule || reg._id !== existingRegistration?._id)
      );
    },
    [registeredSessions, sessionId, isReschedule, existingRegistration]
  );

  // ✅ Memoized validation helper
  const isValidNumber = useCallback((value: any): boolean => {
    return (
      !isNaN(Number.parseFloat(value)) && isFinite(value) && Number(value) >= 0
    );
  }, []);

  // ✅ Insurance handlers
  const openInsuranceModal = useCallback(
    (insurance?: Insurance, index?: number) => {
      if (insurance && index !== undefined) {
        setCurrentInsurance(insurance);
        setEditingInsuranceIndex(index);
      } else {
        setCurrentInsurance({ type: "", companyName: "" });
        setEditingInsuranceIndex(null);
      }
      setShowInsuranceModal(true);
    },
    []
  );

  const saveInsurance = useCallback(() => {
    if (!currentInsurance.type || !currentInsurance.companyName) {
      Alert.alert("Validation Error", "Please fill all insurance fields.");
      return;
    }
    setFormData((prev) => {
      if (!prev) return null;
      const updatedInsurances = [...prev.insurances];
      if (editingInsuranceIndex !== null) {
        updatedInsurances[editingInsuranceIndex] = currentInsurance;
      } else {
        updatedInsurances.push(currentInsurance);
      }
      return { ...prev, insurances: updatedInsurances };
    });
    setShowInsuranceModal(false);
    setCurrentInsurance({ type: "", companyName: "" });
    setEditingInsuranceIndex(null);
  }, [currentInsurance, editingInsuranceIndex]);

  const deleteInsurance = useCallback((index: number) => {
    Alert.alert(
      "Delete Insurance",
      "Are you sure you want to delete this insurance?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setFormData((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                insurances: prev.insurances.filter((_, i) => i !== index),
              };
            });
          },
        },
      ]
    );
  }, []);

  // ✅ Investment handlers
  const openInvestmentModal = useCallback(
    (investment?: Investment, index?: number) => {
      if (investment && index !== undefined) {
        setCurrentInvestment(investment);
        setEditingInvestmentIndex(index);
      } else {
        setCurrentInvestment({ investmentType: "", amount: 0 });
        setEditingInvestmentIndex(null);
      }
      setShowInvestmentModal(true);
    },
    []
  );

  const saveInvestment = useCallback(() => {
    if (
      !currentInvestment.investmentType ||
      (currentInvestment?.amount ?? 0) <= 0
    ) {
      Alert.alert(
        "Validation Error",
        "Please fill all investment fields with valid data."
      );
      return;
    }
    setFormData((prev) => {
      if (!prev) return null;
      const updatedInvestments = [...prev.investments];
      if (editingInvestmentIndex !== null) {
        updatedInvestments[editingInvestmentIndex] = currentInvestment;
      } else {
        updatedInvestments.push(currentInvestment);
      }
      return { ...prev, investments: updatedInvestments };
    });
    setShowInvestmentModal(false);
    setCurrentInvestment({ investmentType: "", amount: 0 });
    setEditingInvestmentIndex(null);
  }, [currentInvestment, editingInvestmentIndex]);

  const deleteInvestment = useCallback((index: number) => {
    Alert.alert(
      "Delete Investment",
      "Are you sure you want to delete this investment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setFormData((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                investments: prev.investments.filter((_, i) => i !== index),
              };
            });
          },
        },
      ]
    );
  }, []);

  // ✅ Submit handler with abort support
  const handleSubmit = useCallback(async () => {
    if (!formData) {
      Alert.alert("Error", "All Fields Are Required");
      return;
    }

    const {
      aadharCard,
      phone,
      income,
      insurances,
      investments,
      netWorth,
      panCard,
    } = formData;

    // Validation
    const errorMessages: string[] = [];
    if (!aadharCard || !/^[0-9]{12}$/.test(aadharCard)) {
      errorMessages.push("Aadhar Card must be 12 digits");
    }
    if (!phone || !/^[1-9][0-9]{9}$/.test(phone)) {
      errorMessages.push("Phone must be 10 digits and not start with 0");
    }
    if (!isValidNumber(income)) {
      errorMessages.push("Income must be a valid number");
    }
    if (!isValidNumber(netWorth)) {
      errorMessages.push("Net Worth must be a valid number");
    }
    if (!panCard || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panCard)) {
      errorMessages.push("Invalid PAN Card format");
    }
    if (!selectedDate) {
      errorMessages.push("Please select a session date");
    }

    if (errorMessages.length > 0) {
      Alert.alert("Validation Error", errorMessages[0]);
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
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      const result = await registerSessionFn(payload).unwrap();

      // Clear abort controller on success
      abortControllerRef.current = null;

      if (result?.success) {
        Alert.alert(
          "Success",
          result?.message ||
            `Session ${isReschedule ? "rescheduled" : "registered"} successfully`,
          [{ text: "OK", onPress: () => router.push("/(tabs)/registered") }]
        );
      } else {
        console.log(result);
        
        Alert.alert(result?.message || "Something went wrong");
      }
    } catch (error: any) {
      // Don't show error if request was aborted
      if (error.name === "AbortError" || error.message?.includes("abort")) {
        console.log("Registration request was cancelled");
        return;
      }

      console.error("Error during submission:", error);
      Alert.alert(
        "Error",
        error?.data?.message || error?.message || "An error occurred"
      );
    }
  }, [
    formData,
    selectedDate,
    couponData,
    price,
    discountedPrice,
    sessionId,
    isReschedule,
    registerSessionFn,
    isValidNumber,
  ]);

  // ✅ Enhanced back handler with cancellation
  const handleBack = useCallback(() => {
    if (isRegistering) {
      Alert.alert(
        "Cancel Registration?",
        "Registration is in progress. Do you want to cancel and go back?",
        [
          { text: "Continue", style: "cancel" },
          {
            text: "Cancel & Go Back",
            style: "destructive",
            onPress: () => {
              // Abort ongoing request
              if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
              }
              resetRegisterMutation();
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  }, [isRegistering, resetRegisterMutation]);

  // Loading state
  if (isFetching && !session) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6566fc" />
        <Text className="text-gray-500 mt-4">Loading session details...</Text>
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
          <Header
            onBack={handleBack}
            title={isReschedule ? "Reschedule Session" : "Session Registration"}
            isLoading={isRegistering}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Session Header Image */}
            {session?.thumbnail && (
              <SessionImage thumbnail={session.thumbnail} />
            )}

            <View className="px-5 py-6">
              {/* Session Details Card */}
              <SessionDetailsCard
                session={session}
                price={price}
                discountedPrice={discountedPrice}
                couponData={couponData}
              />

              {/* Reschedule Banner */}
              {isReschedule && (
                <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5 flex-row items-center gap-3">
                  <MaterialCommunityIcons
                    name="calendar-refresh"
                    size={24}
                    color="#3b82f6"
                  />
                  <View className="flex-1">
                    <Text className="text-blue-800 font-bold text-sm">
                      Rescheduling Session
                    </Text>
                    <Text className="text-blue-600 text-xs mt-0.5">
                      Current date:{" "}
                      {new Date(
                        existingRegistration?.selectedDate || ""
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
              )}

              {/* Date Selection */}
              <DateSelection
                dateTimes={session?.dateTimes ?? []}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                isDateRegistered={isDateRegistered}
              />

              {/* Coupon Code (only for new registrations) */}
              {!isReschedule && (
                <CouponSection
                  coupon={coupon}
                  onCouponChange={setCoupon}
                  couponData={couponData}
                />
              )}

              {/* Personal Information */}
              <PersonalInformationSection
                formData={formData}
                setFormData={setFormData}
              />

              {/* Insurances Section */}
              <InsurancesSection
                insurances={formData?.insurances ?? []}
                onAdd={() => openInsuranceModal()}
                onEdit={openInsuranceModal}
                onDelete={deleteInsurance}
              />

              {/* Investments Section */}
              <InvestmentsSection
                investments={formData?.investments ?? []}
                onAdd={() => openInvestmentModal()}
                onEdit={openInvestmentModal}
                onDelete={deleteInvestment}
              />

              {/* Submit Button */}
              <SubmitButton
                onSubmit={handleSubmit}
                isLoading={isLoading}
                isReschedule={isReschedule}
                isSameDate={isSameDate}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Insurance Modal */}
        <InsuranceModal
          visible={showInsuranceModal}
          onClose={() => setShowInsuranceModal(false)}
          currentInsurance={currentInsurance}
          setCurrentInsurance={setCurrentInsurance}
          onSave={saveInsurance}
          isEditing={editingInsuranceIndex !== null}
        />

        {/* Investment Modal */}
        <InvestmentModal
          visible={showInvestmentModal}
          onClose={() => setShowInvestmentModal(false)}
          currentInvestment={currentInvestment}
          setCurrentInvestment={setCurrentInvestment}
          onSave={saveInvestment}
          isEditing={editingInvestmentIndex !== null}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

// ✅ Enhanced Header with loading indicator
const Header = memo(
  ({
    onBack,
    title,
    isLoading,
  }: {
    onBack: () => void;
    title: string;
    isLoading?: boolean;
  }) => (
    <View className="bg-white px-5 py-4 flex-row items-center justify-between border-b border-gray-100">
      <View className="flex-row items-center flex-1">
        <Pressable
          onPress={onBack}
          className="p-2"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-800 ml-3">{title}</Text>
      </View>
      {isLoading && (
        <View className="flex-row items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text className="text-blue-600 text-xs font-semibold">
            Processing...
          </Text>
        </View>
      )}
    </View>
  )
);
Header.displayName = "Header";

// ... Rest of the memoized components remain the same ...
const SessionImage = memo(({ thumbnail }: { thumbnail: string }) => (
  <Image
    source={{ uri: thumbnail }}
    className="w-full h-52"
    resizeMode="cover"
  />
));
SessionImage.displayName = "SessionImage";

const SessionDetailsCard = memo(
  ({
    session,
    price,
    discountedPrice,
    couponData,
  }: {
    session: any;
    price: number;
    discountedPrice: number;
    couponData: any;
  }) => (
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
  )
);
SessionDetailsCard.displayName = "SessionDetailsCard";

const DateSelection = memo(
  ({
    dateTimes,
    selectedDate,
    onSelectDate,
    isDateRegistered,
  }: {
    dateTimes: string[];
    selectedDate: string;
    onSelectDate: (date: string) => void;
    isDateRegistered: (date: string) => boolean;
  }) => (
    <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
      <Text className="text-lg font-bold text-gray-800 mb-3">
        Select Session Date
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          {dateTimes.map((date, index) => (
            <DateItem
              key={`date-${index}`}
              date={date}
              isSelected={selectedDate === date}
              isRegistered={isDateRegistered(date)}
              onSelect={onSelectDate}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  )
);
DateSelection.displayName = "DateSelection";

// ✅ Enhanced DateItem with clear visual states
const DateItem = memo(
  ({
    date,
    isSelected,
    isRegistered,
    onSelect,
  }: {
    date: string;
    isSelected: boolean;
    isRegistered: boolean;
    onSelect: (date: string) => void;
  }) => {
    const handlePress = useCallback(() => {
      if (!isRegistered) onSelect(date);
    }, [date, isRegistered, onSelect]);

    const formattedDate = useMemo(
      () =>
        new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      [date]
    );

    return (
      <Pressable
        onPress={handlePress}
        disabled={isRegistered}
        style={({ pressed }) => ({
          opacity: isRegistered ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !isRegistered ? 0.95 : 1 }],
          // ✅ Add elevation for selected state
          shadowColor: isSelected ? "#6566fc" : "#000",
          shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
          shadowOpacity: isSelected ? 0.3 : 0.1,
          shadowRadius: isSelected ? 8 : 4,
          elevation: isSelected ? 8 : 2,
        })}
        className={`px-5 py-3 rounded-xl border-2 min-w-[140px] ${
          isSelected
            ? "bg-[#6566fc] border-[#6566fc]" // ✅ Selected: Purple with purple border
            : isRegistered
              ? "bg-gray-200 border-gray-300" // ✅ Registered: Gray
              : "bg-white border-gray-300" // ✅ Default: White with gray border
        }`}
      >
        <View className="items-center">
          {/* ✅ Icon indicator for selected */}
          {isSelected && (
            <View className="absolute -top-1 -right-1 bg-white rounded-full p-1">
              <MaterialCommunityIcons name="check-circle" size={16} color="#6566fc" />
            </View>
          )}
          
          <Text
            className={`font-bold text-center text-base ${
              isSelected
                ? "text-white" // ✅ Selected: White text
                : isRegistered
                  ? "text-gray-400" // ✅ Registered: Light gray text
                  : "text-gray-800" // ✅ Default: Dark text
            }`}
          >
            {formattedDate}
          </Text>
          
          {isRegistered && (
            <View className="mt-1 bg-gray-400 px-2 py-0.5 rounded-full">
              <Text className="text-white text-[10px] font-semibold">Registered</Text>
            </View>
          )}
          
          {/* ✅ "Current" badge for same date in reschedule */}
          {isSelected && !isRegistered && (
            <View className="mt-1 bg-white/20 px-2 py-0.5 rounded-full">
              <Text className="text-white text-[10px] font-bold">Selected</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  }
);
DateItem.displayName = "DateItem";

const CouponSection = memo(
  ({
    coupon,
    onCouponChange,
    couponData,
  }: {
    coupon: string;
    onCouponChange: (text: string) => void;
    couponData: any;
  }) => (
    <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
      <Text className="text-lg font-bold text-gray-800 mb-3">
        Have a Coupon Code?
      </Text>
      <View className="flex-row gap-3">
        <TextInput
          value={coupon}
          onChangeText={onCouponChange}
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
  )
);
CouponSection.displayName = "CouponSection";

const PersonalInformationSection = memo(
  ({
    formData,
    setFormData,
  }: {
    formData: USER_PROPS | null;
    setFormData: React.Dispatch<React.SetStateAction<USER_PROPS | null>>;
  }) => {
    const handleFieldChange = useCallback(
      (field: keyof USER_PROPS) => (text: string) => {
        setFormData((prev) => (prev ? { ...prev, [field]: text } : null));
      },
      [setFormData]
    );

    const handleNumericChange = useCallback(
      (field: keyof USER_PROPS) => (text: string) => {
        setFormData((prev) =>
          prev ? { ...prev, [field]: parseFloat(text) || 0 } : null
        );
      },
      [setFormData]
    );

    const handlePanChange = useCallback(
      (text: string) => {
        setFormData((prev) =>
          prev ? { ...prev, panCard: text.toUpperCase() } : null
        );
      },
      [setFormData]
    );

    return (
      <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
        <Text className="text-lg font-bold text-gray-800 mb-4">
          Personal Information
        </Text>
        <View className="gap-4">
          <InputField
            label="Phone Number"
            value={formData?.phone || ""}
            onChangeText={handleFieldChange("phone")}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            maxLength={10}
            icon={<MaterialIcons name="phone" size={20} color="#6566fc" />}
          />

          <InputField
            label="Aadhar Card"
            value={formData?.aadharCard || ""}
            onChangeText={handleFieldChange("aadharCard")}
            placeholder="Enter 12-digit Aadhar number"
            keyboardType="numeric"
            maxLength={12}
            icon={<Ionicons name="document-text" size={20} color="#6566fc" />}
          />

          <InputField
            label="PAN Card"
            value={formData?.panCard || ""}
            onChangeText={handlePanChange}
            placeholder="Enter PAN number"
            maxLength={10}
            autoCapitalize="characters"
            icon={<Ionicons name="card" size={20} color="#6566fc" />}
          />

          <InputField
            label="Annual Income"
            value={formData?.income?.toString() || "0"}
            onChangeText={handleNumericChange("income")}
            placeholder="Enter annual income"
            keyboardType="numeric"
            icon={
              <MaterialIcons name="attach-money" size={20} color="#6566fc" />
            }
          />

          <InputField
            label="Net Worth"
            value={formData?.netWorth?.toString() || "0"}
            onChangeText={handleNumericChange("netWorth")}
            placeholder="Enter net worth"
            keyboardType="numeric"
            icon={
              <MaterialIcons
                name="account-balance-wallet"
                size={20}
                color="#6566fc"
              />
            }
          />
        </View>
      </View>
    );
  }
);
PersonalInformationSection.displayName = "PersonalInformationSection";

const InsurancesSection = memo(
  ({
    insurances,
    onAdd,
    onEdit,
    onDelete,
  }: {
    insurances: Insurance[];
    onAdd: () => void;
    onEdit: (insurance: Insurance, index: number) => void;
    onDelete: (index: number) => void;
  }) => (
    <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold text-gray-800">Insurances</Text>
        <Pressable
          onPress={onAdd}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          className="bg-[#6566fc] px-4 py-2 rounded-full flex-row items-center gap-2"
        >
          <AntDesign name="plus" size={14} color="white" />
          <Text className="text-white font-semibold text-sm">Add</Text>
        </Pressable>
      </View>

      {insurances.length === 0 ? (
        <View className="p-6 items-center border border-dashed border-gray-300 rounded-xl">
          <MaterialCommunityIcons name="shield-off" size={48} color="#d1d5db" />
          <Text className="text-gray-400 mt-2">No insurances added</Text>
        </View>
      ) : (
        <View className="gap-3">
          {insurances.map((insurance, index) => (
            <InsuranceItem
              key={`insurance-${index}`}
              insurance={insurance}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </View>
      )}
    </View>
  )
);
InsurancesSection.displayName = "InsurancesSection";

const InsuranceItem = memo(
  ({
    insurance,
    index,
    onEdit,
    onDelete,
  }: {
    insurance: Insurance;
    index: number;
    onEdit: (insurance: Insurance, index: number) => void;
    onDelete: (index: number) => void;
  }) => {
    const handleEdit = useCallback(
      () => onEdit(insurance, index),
      [insurance, index, onEdit]
    );
    const handleDelete = useCallback(() => onDelete(index), [index, onDelete]);

    return (
      <View className="bg-gray-50 rounded-xl p-4 flex-row items-center justify-between">
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
            onPress={handleEdit}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            className="bg-[#6566fc]/10 p-2 rounded-lg"
          >
            <MaterialIcons name="edit" size={18} color="#6566fc" />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            className="bg-red-50 p-2 rounded-lg"
          >
            <MaterialIcons name="delete" size={18} color="#ef4444" />
          </Pressable>
        </View>
      </View>
    );
  }
);
InsuranceItem.displayName = "InsuranceItem";

const InvestmentsSection = memo(
  ({
    investments,
    onAdd,
    onEdit,
    onDelete,
  }: {
    investments: Investment[];
    onAdd: () => void;
    onEdit: (investment: Investment, index: number) => void;
    onDelete: (index: number) => void;
  }) => (
    <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold text-gray-800">Investments</Text>
        <Pressable
          onPress={onAdd}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          className="bg-[#6566fc] px-4 py-2 rounded-full flex-row items-center gap-2"
        >
          <AntDesign name="plus" size={14} color="white" />
          <Text className="text-white font-semibold text-sm">Add</Text>
        </Pressable>
      </View>

      {investments.length === 0 ? (
        <View className="p-6 items-center border border-dashed border-gray-300 rounded-xl">
          <MaterialIcons name="trending-up" size={48} color="#d1d5db" />
          <Text className="text-gray-400 mt-2">No investments added</Text>
        </View>
      ) : (
        <View className="gap-3">
          {investments.map((investment, index) => (
            <InvestmentItem
              key={`investment-${index}`}
              investment={investment}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </View>
      )}
    </View>
  )
);
InvestmentsSection.displayName = "InvestmentsSection";

const InvestmentItem = memo(
  ({
    investment,
    index,
    onEdit,
    onDelete,
  }: {
    investment: Investment;
    index: number;
    onEdit: (investment: Investment, index: number) => void;
    onDelete: (index: number) => void;
  }) => {
    const handleEdit = useCallback(
      () => onEdit(investment, index),
      [investment, index, onEdit]
    );
    const handleDelete = useCallback(() => onDelete(index), [index, onDelete]);

    return (
      <View className="bg-gray-50 rounded-xl p-4 flex-row items-center justify-between">
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
            onPress={handleEdit}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            className="bg-[#6566fc]/10 p-2 rounded-lg"
          >
            <MaterialIcons name="edit" size={18} color="#6566fc" />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            className="bg-red-50 p-2 rounded-lg"
          >
            <MaterialIcons name="delete" size={18} color="#ef4444" />
          </Pressable>
        </View>
      </View>
    );
  }
);
InvestmentItem.displayName = "InvestmentItem";

// ✅ Enhanced SubmitButton with clear color states
const SubmitButton = memo(
  ({
    onSubmit,
    isLoading,
    isReschedule,
    isSameDate,
  }: {
    onSubmit: () => void;
    isLoading: boolean;
    isReschedule: boolean;
    isSameDate: boolean;
  }) => {
    const isDisabled = isLoading || isSameDate;

    const getButtonText = () => {
      if (isLoading) return "Processing...";
      if (isSameDate) return "Already Registered for This Date";
      if (isReschedule) return "Reschedule to Selected Date";
      return "Register for Session";
    };

    const getIcon = () => {
      if (isSameDate) {
        return <MaterialCommunityIcons name="calendar-alert" size={20} color="white" />;
      }
      if (isReschedule) {
        return <MaterialCommunityIcons name="calendar-refresh" size={20} color="white" />;
      }
      return <MaterialCommunityIcons name="clipboard-check" size={20} color="white" />;
    };

    return (
      <View className="mb-6">
        {/* ✅ Warning message when same date is selected */}
        {isSameDate && (
          <View className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4 flex-row items-start gap-3">
            <View className="bg-amber-100 rounded-full p-2">
              <MaterialCommunityIcons name="alert-circle" size={24} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-amber-900 font-bold text-base mb-1">Same Date Selected</Text>
              <Text className="text-amber-700 text-sm leading-5">
                You're already registered for this date. Please select a different date above to
                reschedule your session.
              </Text>
            </View>
          </View>
        )}

        <Pressable
          onPress={onSubmit}
          disabled={isDisabled}
          style={({ pressed }) => ({
            opacity: isDisabled ? 0.7 : pressed ? 0.9 : 1,
            transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
            // ✅ Shadow for non-disabled state
            shadowColor: isDisabled ? "#9ca3af" : "#6566fc",
            shadowOffset: { width: 0, height: isDisabled ? 2 : 4 },
            shadowOpacity: isDisabled ? 0.2 : 0.3,
            shadowRadius: isDisabled ? 4 : 8,
            elevation: isDisabled ? 2 : 6,
          })}
          className={`py-4 rounded-2xl items-center ${
            isSameDate
              ? "bg-gray-400 border-2 border-gray-500" // ✅ Same date: Gray/disabled
              : isLoading
                ? "bg-blue-400" // ✅ Loading: Light blue
                : "bg-[#6566fc]" // ✅ Active: Purple
          }`}
        >
          {isLoading ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="white" size="small" />
              <Text className="text-white font-bold text-base">Processing...</Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              {getIcon()}
              <Text className="text-white font-bold text-base">{getButtonText()}</Text>
            </View>
          )}
        </Pressable>

        {/* ✅ Helper text */}
        <Text className={`text-xs text-center mt-3 ${isSameDate ? "text-amber-600 font-semibold" : "text-gray-500"}`}>
          {isSameDate
            ? "⚠️ Select a different date to enable rescheduling"
            : isReschedule
              ? "Your registration will be updated to the new selected date"
              : "You will receive an email after registration"}
        </Text>
      </View>
    );
  }
);
SubmitButton.displayName = "SubmitButton";

const InsuranceModal = memo(
  ({
    visible,
    onClose,
    currentInsurance,
    setCurrentInsurance,
    onSave,
    isEditing,
  }: {
    visible: boolean;
    onClose: () => void;
    currentInsurance: Insurance;
    setCurrentInsurance: React.Dispatch<React.SetStateAction<Insurance>>;
    onSave: () => void;
    isEditing: boolean;
  }) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6 max-h-[70%]">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-gray-800">
              {isEditing ? "Edit" : "Add"} Insurance
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
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
              icon={
                <MaterialCommunityIcons
                  name="shield-check"
                  size={20}
                  color="#6566fc"
                />
              }
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
            onPress={onSave}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            className="bg-[#6566fc] py-4 rounded-xl items-center mt-6"
          >
            <Text className="text-white font-bold text-lg">
              {isEditing ? "Update" : "Add"} Insurance
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
);
InsuranceModal.displayName = "InsuranceModal";

const InvestmentModal = memo(
  ({
    visible,
    onClose,
    currentInvestment,
    setCurrentInvestment,
    onSave,
    isEditing,
  }: {
    visible: boolean;
    onClose: () => void;
    currentInvestment: Investment;
    setCurrentInvestment: React.Dispatch<React.SetStateAction<Investment>>;
    onSave: () => void;
    isEditing: boolean;
  }) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6 max-h-[70%]">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-gray-800">
              {isEditing ? "Edit" : "Add"} Investment
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Ionicons name="close" size={28} color="#9ca3af" />
            </Pressable>
          </View>

          <View className="gap-4">
            <InputField
              label="Investment Type"
              value={currentInvestment.investmentType ?? ""}
              onChangeText={(text) =>
                setCurrentInvestment({
                  ...currentInvestment,
                  investmentType: text,
                })
              }
              placeholder="e.g., Stocks, Mutual Funds"
              icon={
                <MaterialIcons name="trending-up" size={20} color="#6566fc" />
              }
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
              icon={
                <MaterialIcons name="attach-money" size={20} color="#6566fc" />
              }
            />
          </View>

          <Pressable
            onPress={onSave}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            className="bg-[#6566fc] py-4 rounded-xl items-center mt-6"
          >
            <Text className="text-white font-bold text-lg">
              {isEditing ? "Update" : "Add"} Investment
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
);
InvestmentModal.displayName = "InvestmentModal";

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

const InputField = memo(
  ({
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
  )
);
InputField.displayName = "InputField";

export default Form;

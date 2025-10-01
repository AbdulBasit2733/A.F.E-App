import React, { useEffect, useMemo, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  getAllRegisteredSessions,
  registerSession,
} from "@/redux/session-slice";
import { getUserDetails } from "@/redux/user-slice";
import Toast from "react-native-toast-message";
import { useGetUserDetailsQuery } from "@/redux/features/user-api/user-api";
import {
  useGetAllRegisteredSessionsFnQuery,
  useGetSessionByIdFnQuery,
  useRegisterSessionFnMutation,
} from "@/redux/features/session-api/session-api";
// Import sub-components
import SessionHeader from "@/components/form/session-header";
import SessionDetailsCard from "@/components/form/session-details-card";
import DateSelection from "@/components/form/date-selection";
import PersonalInformation from "@/components/form/personal-information";
import InsuranceSection from "@/components/form/insurance-section";
import InvestmentSection from "@/components/form/investment-section";
import SubmitButton from "@/components/form/submit-button";
import { USER_PROPS } from "@/redux/features/user-api/types";
import { useLazyGetCouponByCodeFnQuery } from "@/redux/features/coupon-api/coupon-api";
import { REGISTER_SESSION_PAYLOAD } from "@/redux/features/session-api/types";

const Form = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [coupon, setCoupon] = useState("");
  const [formData, setFormData] = useState<USER_PROPS | null>(null);
  const [loading, setLoading] = useState(false);

  const sessionId = Array.isArray(id) ? id[0] : (id ?? "");
  const { data: sessionDataResponse } = useGetSessionByIdFnQuery({
    id: sessionId,
  });

  // console.log("Session:", sessionDataResponse?.data);
  
  const { data: userDataResponse, isFetching } = useGetUserDetailsQuery();

  const {
    data: registeredSessionResponse,
    isFetching: isFetchingRegisteredSession,
  } = useGetAllRegisteredSessionsFnQuery();

  // Use lazy query for coupon validation with debouncing
  const [getCoupon, { data: couponResponse, isError: isCouponError }] =
    useLazyGetCouponByCodeFnQuery();

  const [registerSessionFn, { isLoading }] = useRegisterSessionFnMutation();

  const session = sessionDataResponse?.data ?? null;
  const userDetails = userDataResponse?.data ?? null;
  const couponData = couponResponse?.data ?? null;
  console.log("CouponData", couponData);
  
  const registeredSessions = registeredSessionResponse?.data ?? [];

  const [selectedDate, setSelectedDate] = useState(
    session?.dateTimes?.[0] || ""
  );

  const dispatch = useAppDispatch();

  // Initialize form data with user details or defaults
  useEffect(() => {
    if (userDetails) {
      setFormData({
        ...userDetails,
        insurances:
          userDetails.insurances?.length > 0 ? userDetails.insurances : [],
        investments:
          userDetails.investments?.length > 0 ? userDetails.investments : [],
      });
    } else {
      // Set default empty values
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

  // Debounced coupon validation using RTK Query
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

  const handleInputChange = (key: keyof USER_PROPS, value: any) => {
    let processedValue = value;
    if (key === "income" || key === "netWorth") {
      processedValue = isValidNumber(value) ? Number(value) : 0;
    }
    setFormData((prev) => (prev ? { ...prev, [key]: processedValue } : null));
  };

  function isValidNumber(value: any): boolean {
    return (
      !isNaN(Number.parseFloat(value)) && isFinite(value) && Number(value) >= 0
    );
  }

  const handleNestedInputChange = (
    key: "insurances" | "investments",
    index: number,
    nestedKey: string,
    value: any
  ) => {
    setFormData((prev) => {
      if (!prev) return null;
      const updatedArray = [...(prev[key] || [])];
      updatedArray[index] = { ...updatedArray[index], [nestedKey]: value };
      return { ...prev, [key]: updatedArray };
    });
  };

  const addField = (field: "insurances" | "investments") => {
    setFormData((prev) => {
      if (!prev) return null;
      const updatedData = { ...prev };
      if (field === "insurances") {
        updatedData.insurances = [
          ...(updatedData.insurances || []),
          { type: "", companyName: "" },
        ];
      } else if (field === "investments") {
        updatedData.investments = [
          ...(updatedData.investments || []),
          { investmentType: "", amount: 0 },
        ];
      }
      return updatedData;
    });
  };

  const removeField = (field: "insurances" | "investments", index: number) => {
    setFormData((prev) => {
      if (!prev) return null;
      const updatedData = { ...prev };
      if (field === "insurances") {
        updatedData.insurances = [
          ...(updatedData.insurances || []).slice(0, index),
          ...(updatedData.insurances || []).slice(index + 1),
        ];
      } else if (field === "investments") {
        updatedData.investments = [
          ...(updatedData.investments || []).slice(0, index),
          ...(updatedData.investments || []).slice(index + 1),
        ];
      }
      return updatedData;
    });
  };

  const handleSubmit = async () => {
    if (formData !== null) {
      const {
        aadharCard,
        phone,
        income,
        insurances,
        investments,
        netWorth,
        panCard,
      } = formData;

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

      if (insurances && insurances.length > 0) {
        insurances.forEach((insurance, index) => {
          if (!insurance.type || !insurance.companyName) {
            isValid = false;
            errorMessages.push(
              `Insurance ${index + 1}: Type and Company Name are required`
            );
          }
        });
      }

      if (investments && investments.length > 0) {
        investments.forEach((investment, index) => {
          if (!investment.investmentType || !isValidNumber(investment.amount)) {
            isValid = false;
            errorMessages.push(
              `Investment ${index + 1}: Type and valid Amount are required`
            );
          }
        });
      }

      if (!isValid) {
        Alert.alert("Validation Error", errorMessages.join("\n"));
        return;
      }

      // Prepare payload matching backend expectations
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
        id: sessionId, // Use sessionId (already converted from array to string)
      };

      try {
        setLoading(true);
        // Correct usage: pass payload directly, not wrapped again
        const result = await registerSessionFn(payload).unwrap();

        if (result?.success) {
          const successMessage =
            result?.message || "Session registered successfully";
          Alert.alert("Success", successMessage);

          setTimeout(() => {
            router.push("/(tabs)/registered_sessions");
          }, 1500);
        } else {
          const errorMessage = result?.message || "Something went wrong";
          Alert.alert("Error", errorMessage);
        }
      } catch (error: any) {
        console.error("Error during submission:", error);

        // Better error handling for RTK Query errors
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "An error occurred while submitting";

        Alert.alert("Error", errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert("Error", "All Fields Are Required");
    }
  };

  if (isFetching) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#6566fc" />
      </View>
    );
  }

  return (
    <ScrollView className="bg-gray-50">
      <SafeAreaProvider>
        <SafeAreaView className="min-h-screen">
          <SessionHeader
            image={session?.thumbnail ?? ""}
            title={session?.title ?? ""}
            description={session?.description ?? ""}
          />

          <View className="p-6 bg-white rounded-t-3xl -mt-6 shadow-lg">
            <SessionDetailsCard
              mode={session?.mode ?? ""}
              sessionType={session?.sessionType ?? ""}
              dateTimes={session?.dateTimes || []}
            />

            <DateSelection
              dateTimes={session?.dateTimes || []}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              isDateRegistered={isDateRegistered}
            />

            <PersonalInformation
              formData={formData}
              loading={loading}
              handleInputChange={handleInputChange}
              price={price}
              coupon={coupon}
              setCoupon={setCoupon}
              discountedPrice={discountedPrice}
            />

            <InsuranceSection
              insurances={formData?.insurances || []}
              loading={loading}
              handleNestedInputChange={handleNestedInputChange}
              addField={addField}
              removeField={removeField}
            />

            <InvestmentSection
              investments={formData?.investments || []}
              loading={loading}
              handleNestedInputChange={handleNestedInputChange}
              addField={addField}
              removeField={removeField}
            />

            <SubmitButton loading={loading} onSubmit={handleSubmit} />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </ScrollView>
  );
};

export default Form;

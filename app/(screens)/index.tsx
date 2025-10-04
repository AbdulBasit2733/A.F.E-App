import { useUpdateUserDetailsFnMutation } from "@/redux/features/user-api/user-api";
import { Insurance, Investment, USER_PROPS } from "@/redux/features/user-api/types";
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { getInitials } from "@/utils/common-helpers";
import { setUser } from "@/redux/auth-slice";

const EditProfile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [updateUserDetails, { isLoading, isSuccess, isError, error }] =
    useUpdateUserDetailsFnMutation();

  // Form State
  const [formData, setFormData] = useState<USER_PROPS>({
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dob: user?.dob || "",
    gender: user?.gender || "",
    address: user?.address || "",
    city: user?.city || "",
    country: user?.country || "",
    occupation: user?.occupation || "",
    income: user?.income || 0,
    netWorth: user?.netWorth || 0,
    aadharCard: user?.aadharCard || "",
    panCard: user?.panCard || "",
    insurances: user?.insurances || [],
    investments: user?.investments || [],
    profilePic: user?.profilePic || "",
  });

  const [profileImage, setProfileImage] = useState<string | null>(
    user?.profilePic || null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    user?.dob ? new Date(user.dob) : new Date()
  );

  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [currentInsurance, setCurrentInsurance] = useState<Insurance>({
    type: "",
    companyName: "",
  });
  const [editingInsuranceIndex, setEditingInsuranceIndex] = useState<number | null>(null);

  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [currentInvestment, setCurrentInvestment] = useState<Investment>({
    investmentType: "",
    amount: 0,
  });
  const [editingInvestmentIndex, setEditingInvestmentIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload profile pictures."
        );
      }
    })();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    }
    if (isError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Error",
        error?.data?.message || "Failed to update profile. Please try again."
      );
    }
  }, [isSuccess, isError]);

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setProfileImage(result.assets[0].uri);
        setFormData({ ...formData, profilePic: result.assets[0].uri });
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert("Permission Required", "Camera permission is required.");
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setProfileImage(result.assets[0].uri);
        setFormData({ ...formData, profilePic: result.assets[0].uri });
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const showImageOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Profile Picture", "Choose an option", [
      {
        text: "Take Photo",
        onPress: takePhoto,
      },
      {
        text: "Choose from Gallery",
        onPress: pickImage,
      },
      {
        text: "Remove Photo",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setProfileImage(null);
          setFormData({ ...formData, profilePic: "" });
        },
        style: "destructive",
      },
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
      },
    ]);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedDate(selectedDate);
      setFormData({
        ...formData,
        dob: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  const openInsuranceModal = (insurance?: Insurance, index?: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Validation Error", "Please fill all insurance fields.");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const updatedInsurances = [...formData.insurances];
    if (editingInsuranceIndex !== null) {
      updatedInsurances[editingInsuranceIndex] = currentInsurance;
    } else {
      updatedInsurances.push(currentInsurance);
    }

    setFormData({ ...formData, insurances: updatedInsurances });
    setShowInsuranceModal(false);
    setCurrentInsurance({ type: "", companyName: "" });
    setEditingInsuranceIndex(null);
  };

  const deleteInsurance = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Insurance",
      "Are you sure you want to delete this insurance?",
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const updatedInsurances = formData.insurances.filter((_, i) => i !== index);
            setFormData({ ...formData, insurances: updatedInsurances });
          },
        },
      ]
    );
  };

  const openInvestmentModal = (investment?: Investment, index?: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    if (!currentInvestment.investmentType || (currentInvestment?.amount ?? 0) < 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Validation Error", "Please fill all investment fields with valid data.");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const updatedInvestments = [...formData.investments];
    if (editingInvestmentIndex !== null) {
      updatedInvestments[editingInvestmentIndex] = currentInvestment;
    } else {
      updatedInvestments.push(currentInvestment);
    }

    setFormData({ ...formData, investments: updatedInvestments });
    setShowInvestmentModal(false);
    setCurrentInvestment({ investmentType: "", amount: 0 });
    setEditingInvestmentIndex(null);
  };

  const deleteInvestment = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Investment",
      "Are you sure you want to delete this investment?",
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const updatedInvestments = formData.investments.filter((_, i) => i !== index);
            setFormData({ ...formData, investments: updatedInvestments });
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!formData.firstname || !formData.lastname) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Validation Error", "First name and last name are required.");
      return;
    }

    if (!formData.email) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Validation Error", "Email is required.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await updateUserDetails({ formData }).unwrap();
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-white px-5 py-4 flex-row items-center justify-between border-b border-gray-100">
          <Pressable 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.9 : 1 }],
              opacity: pressed ? 0.7 : 1,
            })}
            className="p-2"
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-800">Edit Profile</Text>
          <View className="w-10" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Profile Picture Section */}
          <View className="bg-white py-8 items-center border-b border-gray-100">
            <Pressable 
              onPress={showImageOptions}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.95 : 1 }],
                opacity: pressed ? 0.8 : 1,
              })}
              className="relative"
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  className="w-32 h-32 rounded-full"
                  style={styles.profileImage}
                />
              ) : (
                <View className="w-32 h-32 rounded-full bg-[#6566fc] items-center justify-center">
                  <Text className="text-white text-4xl font-bold">
                    {getInitials({
                      firstname: formData?.firstname,
                      lastname: formData?.lastname,
                    })}
                  </Text>
                </View>
              )}
              <View className="absolute bottom-0 right-0 bg-[#6566fc] p-3 rounded-full border-4 border-white">
                <MaterialIcons name="camera-alt" size={20} color="white" />
              </View>
            </Pressable>
            <Text className="text-gray-500 text-sm mt-3">
              Tap to change profile picture
            </Text>
          </View>

          <View className="px-5 py-6">
            {/* Personal Information */}
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Personal Information
            </Text>

            <View className="gap-4">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <InputField
                  isEditable={true}
                    label="First Name"
                    value={formData.firstname}
                    onChangeText={(text) =>
                      setFormData({ ...formData, firstname: text })
                    }
                    placeholder="Enter first name"
                    icon={
                      <MaterialIcons name="person" size={20} color="#6566fc" />
                    }
                  />
                </View>
                <View className="flex-1">
                  <InputField
                  isEditable={true}
                    label="Last Name"
                    value={formData.lastname}
                    onChangeText={(text) =>
                      setFormData({ ...formData, lastname: text })
                    }
                    placeholder="Enter last name"
                    icon={
                      <MaterialIcons name="person" size={20} color="#6566fc" />
                    }
                  />
                </View>
              </View>

              <InputField
              isEditable={false}
                label="Email"
                value={formData.email}
                
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                placeholder="Enter email"
                keyboardType="email-address"
                icon={
                  <MaterialCommunityIcons
                    name="email"
                    size={20}
                    color="#6566fc"
                  />
                }
              />

              <InputField
              isEditable={true}
                label="Phone"
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                icon={<MaterialIcons name="phone" size={20} color="#6566fc" />}
              />

              {/* Date of Birth */}
              <View>
                <Text className="text-gray-700 font-semibold mb-2">
                  Date of Birth
                </Text>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowDatePicker(true);
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-4 flex-row items-center"
                >
                  <FontAwesome name="birthday-cake" size={20} color="#6566fc" />
                  <Text className="flex-1 ml-3 text-gray-800">
                    {formData.dob
                      ? new Date(formData.dob).toLocaleDateString()
                      : "Select date of birth"}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#9ca3af" />
                </Pressable>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}

              {/* Gender Selection */}
              <View>
                <Text className="text-gray-700 font-semibold mb-2">Gender</Text>
                <View className="flex-row gap-3">
                  {["Male", "Female", "Other"].map((gender) => (
                    <Pressable
                      key={gender}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setFormData({ ...formData, gender });
                      }}
                      style={({ pressed }) => ({
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                        opacity: pressed ? 0.8 : 1,
                      })}
                      className={`flex-1 py-3 rounded-xl border-2 items-center ${
                        formData.gender === gender
                          ? "bg-[#6566fc]/10 border-[#6566fc]"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`font-semibold ${
                          formData.gender === gender
                            ? "text-[#6566fc]"
                            : "text-gray-600"
                        }`}
                      >
                        {gender}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <InputField
              isEditable={true}
                label="Occupation"
                value={formData.occupation}
                onChangeText={(text) =>
                  setFormData({ ...formData, occupation: text })
                }
                placeholder="Enter occupation"
                icon={<MaterialIcons name="work" size={20} color="#6566fc" />}
              />
            </View>

            {/* Address Information */}
            <Text className="text-lg font-bold text-gray-800 mt-8 mb-4">
              Address Information
            </Text>

            <View className="gap-4">
              <InputField
              isEditable={true}
                label="Address"
                value={formData.address}
                onChangeText={(text) =>
                  setFormData({ ...formData, address: text })
                }
                placeholder="Enter full address"
                multiline
                numberOfLines={3}
                icon={
                  <Ionicons name="location-sharp" size={20} color="#6566fc" />
                }
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <InputField
                  isEditable={true}
                    label="City"
                    value={formData.city}
                    onChangeText={(text) =>
                      setFormData({ ...formData, city: text })
                    }
                    placeholder="Enter city"
                    icon={
                      <MaterialIcons
                        name="location-city"
                        size={20}
                        color="#6566fc"
                      />
                    }
                  />
                </View>
                <View className="flex-1">
                  <InputField
                  isEditable={true}
                    label="Country"
                    value={formData.country}
                    onChangeText={(text) =>
                      setFormData({ ...formData, country: text })
                    }
                    placeholder="Enter country"
                    icon={<FontAwesome name="flag" size={18} color="#6566fc" />}
                  />
                </View>
              </View>
            </View>

            {/* Financial Information */}
            <Text className="text-lg font-bold text-gray-800 mt-8 mb-4">
              Financial Information
            </Text>

            <View className="gap-4">
              <InputField
              isEditable={true}
                label="Income"
                value={formData.income.toString()}
                onChangeText={(text) =>
                  setFormData({ ...formData, income: parseFloat(text) || 0 })
                }
                placeholder="Enter annual income"
                keyboardType="numeric"
                icon={
                  <MaterialIcons
                    name="attach-money"
                    size={20}
                    color="#6566fc"
                  />
                }
              />

              <InputField
              isEditable={true}
                label="Net Worth"
                value={formData.netWorth.toString()}
                onChangeText={(text) =>
                  setFormData({ ...formData, netWorth: parseFloat(text) || 0 })
                }
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

            {/* Document Information */}
            <Text className="text-lg font-bold text-gray-800 mt-8 mb-4">
              Document Information
            </Text>

            <View className="gap-4 mb-6">
              <InputField
              isEditable={true}
                label="Aadhar Card"
                value={formData.aadharCard}
                onChangeText={(text) =>
                  setFormData({ ...formData, aadharCard: text })
                }
                placeholder="Enter Aadhar number"
                keyboardType="numeric"
                maxLength={12}
                icon={
                  <Ionicons name="document-text" size={20} color="#6566fc" />
                }
              />

              <InputField
              isEditable={true}
                label="PAN Card"
                value={formData.panCard}
                onChangeText={(text) =>
                  setFormData({ ...formData, panCard: text.toUpperCase() })
                }
                placeholder="Enter PAN number"
                maxLength={10}
                autoCapitalize="characters"
                icon={<Ionicons name="card" size={20} color="#6566fc" />}
              />
            </View>

            {/* Insurances Section */}
            <View className="mt-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-gray-800">Insurances</Text>
                <Pressable
                  onPress={() => openInsuranceModal()}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                    opacity: pressed ? 0.8 : 1,
                  })}
                  className="bg-[#6566fc] px-4 py-2 rounded-full flex-row items-center gap-2"
                >
                  <AntDesign name="plus" size={16} color="white" />
                  <Text className="text-white font-semibold">Add</Text>
                </Pressable>
              </View>

              {formData.insurances.length === 0 ? (
                <View className="bg-white rounded-xl p-6 items-center border border-dashed border-gray-300">
                  <MaterialCommunityIcons name="shield-off" size={48} color="#d1d5db" />
                  <Text className="text-gray-400 mt-2">No insurances added</Text>
                </View>
              ) : (
                <View className="gap-3">
                  {formData.insurances.map((insurance, index) => (
                    <View
                      key={index}
                      className="bg-white rounded-xl p-4 flex-row items-center justify-between shadow-sm"
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
                          style={({ pressed }) => ({
                            transform: [{ scale: pressed ? 0.9 : 1 }],
                            opacity: pressed ? 0.7 : 1,
                          })}
                          className="bg-[#6566fc]/10 p-2 rounded-lg"
                        >
                          <MaterialIcons name="edit" size={20} color="#6566fc" />
                        </Pressable>
                        <Pressable
                          onPress={() => deleteInsurance(index)}
                          style={({ pressed }) => ({
                            transform: [{ scale: pressed ? 0.9 : 1 }],
                            opacity: pressed ? 0.7 : 1,
                          })}
                          className="bg-red-50 p-2 rounded-lg"
                        >
                          <MaterialIcons name="delete" size={20} color="#ef4444" />
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Investments Section */}
            <View className="mt-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-gray-800">Investments</Text>
                <Pressable
                  onPress={() => openInvestmentModal()}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                    opacity: pressed ? 0.8 : 1,
                  })}
                  className="bg-[#6566fc] px-4 py-2 rounded-full flex-row items-center gap-2"
                >
                  <AntDesign name="plus" size={16} color="white" />
                  <Text className="text-white font-semibold">Add</Text>
                </Pressable>
              </View>

              {formData.investments.length === 0 ? (
                <View className="bg-white rounded-xl p-6 items-center border border-dashed border-gray-300">
                  <MaterialIcons name="trending-up" size={48} color="#d1d5db" />
                  <Text className="text-gray-400 mt-2">No investments added</Text>
                </View>
              ) : (
                <View className="gap-3">
                  {formData?.investments.map((investment, index) => (
                    <View
                      key={index}
                      className="bg-white rounded-xl p-4 flex-row items-center justify-between shadow-sm"
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
                          style={({ pressed }) => ({
                            transform: [{ scale: pressed ? 0.9 : 1 }],
                            opacity: pressed ? 0.7 : 1,
                          })}
                          className="bg-[#6566fc]/10 p-2 rounded-lg"
                        >
                          <MaterialIcons name="edit" size={20} color="#6566fc" />
                        </Pressable>
                        <Pressable
                          onPress={() => deleteInvestment(index)}
                          style={({ pressed }) => ({
                            transform: [{ scale: pressed ? 0.9 : 1 }],
                            opacity: pressed ? 0.7 : 1,
                          })}
                          className="bg-red-50 p-2 rounded-lg"
                        >
                          <MaterialIcons name="delete" size={20} color="#ef4444" />
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
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.98 : 1 }],
                opacity: pressed || isLoading ? 0.8 : 1,
              })}
              className="bg-[#6566fc] py-4 rounded-xl items-center shadow-lg mb-8 mt-8"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Save Changes
                </Text>
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
        onRequestClose={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowInsuranceModal(false);
        }}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-800">
                {editingInsuranceIndex !== null ? "Edit" : "Add"} Insurance
              </Text>
              <Pressable 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowInsuranceModal(false);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Ionicons name="close" size={28} color="#9ca3af" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <InputField
                isEditable={true}
                  label="Insurance Type"
                  value={currentInsurance.type ?? ""}
                  onChangeText={(text) =>
                    setCurrentInsurance({ ...currentInsurance, type: text })
                  }
                  placeholder="e.g., Life, Health, Car"
                  icon={<MaterialCommunityIcons name="shield-check" size={20} color="#6566fc" />}
                />

                <InputField
                isEditable={true}
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
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                })}
                className="bg-[#6566fc] py-4 rounded-xl items-center mt-6"
              >
                <Text className="text-white font-bold text-lg">
                  {editingInsuranceIndex !== null ? "Update" : "Add"} Insurance
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Investment Modal */}
      <Modal
        visible={showInvestmentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowInvestmentModal(false);
        }}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-800">
                {editingInvestmentIndex !== null ? "Edit" : "Add"} Investment
              </Text>
              <Pressable 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowInvestmentModal(false);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Ionicons name="close" size={28} color="#9ca3af" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <InputField
                  label="Investment Type"
                  value={currentInvestment.investmentType ?? ""}
                  onChangeText={(text) =>
                    setCurrentInvestment({ ...currentInvestment, investmentType: text })
                  }
                  isEditable={true}
                  placeholder="e.g., Stocks, Mutual Funds, Real Estate"
                  icon={<MaterialIcons name="trending-up" size={20} color="#6566fc" />}
                />

                <InputField
                isEditable={true}
                  label="Amount"
                  value={(currentInvestment.amount ?? 0).toString()}
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
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                })}
                className="bg-[#6566fc] py-4 rounded-xl items-center mt-6"
              >
                <Text className="text-white font-bold text-lg">
                  {editingInvestmentIndex !== null ? "Update" : "Add"} Investment
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  multiline?: boolean;
  numberOfLines?: number;
  isEditable:boolean;
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
  multiline = false,
  isEditable = true,
  numberOfLines = 1,
  icon,
}: InputFieldProps) => (
  <View>
    <Text className="text-gray-700 font-semibold mb-2">{label}</Text>
    <View className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center">
      {icon}
      <TextInput
        value={value}
        onChangeText={(text) => {
          Haptics.selectionAsync();
          onChangeText(text);
        }}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={isEditable}
        selectTextOnFocus = {isEditable}
        className="flex-1 ml-3 text-gray-800 text-base"
        style={multiline ? { textAlignVertical: "top", minHeight: 80 } : {}}
      />
    </View>
  </View>
);

export default EditProfile;

const styles = StyleSheet.create({
  profileImage: {
    resizeMode: "cover",
  },
});

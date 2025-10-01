// components/form/PersonalInformation.tsx
import React from "react";
import { View, Text } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import Input from "@/components/Input";
import { USER_PROPS } from "@/redux/features/user-api/types";

interface PersonalInformationProps {
  formData: USER_PROPS | null;
  loading: boolean;
  handleInputChange: (key: keyof USER_PROPS, value: any) => void;
  price: number;
  coupon: string;
  setCoupon: (value: string) => void;
  discountedPrice: number;
}

const PersonalInformation: React.FC<PersonalInformationProps> = ({
  formData,
  loading,
  handleInputChange,
  price,
  coupon,
  setCoupon,
  discountedPrice,
}) => {
  const fields = [
    { label: "Aadhar Card", key: "aadharCard", Icon: Feather, name: "file-text" },
    { label: "Income", key: "income", Icon: Feather, name: "dollar-sign" },
    { label: "Salary Package", key: "netWorth", Icon: Feather, name: "credit-card" },
    { label: "Pan Card", key: "panCard", Icon: Feather, name: "file-text" },
    { label: "Occupation", key: "occupation", Icon: Ionicons, name: "briefcase-outline" },
    { label: "Phone", key: "phone", Icon: Feather, name: "phone" },
    { label: "Address", key: "address", Icon: Feather, name: "map-pin" },
    { label: "City", key: "city", Icon: MaterialCommunityIcons, name: "office-building" },
    { label: "Country", key: "country", Icon: Feather, name: "map-pin" },
  ];

  return (
    <View className="space-y-4">
      {fields.map((item, index) => (
        <View key={index} className="mb-3">
          <View className="flex-row items-center mb-2">
            <item.Icon name={item.name as any} size={18} color="#6566fc" />
            <Text className="text-gray-700 font-medium ml-2">{item.label}</Text>
          </View>
          <Input
            variant="secondary"
            placeholder={`Enter ${item.label.toLowerCase()}`}
            defaultValue={formData?.[item.key as keyof USER_PROPS]?.toString() || ""}
            editable={!loading}
            onChange={(value) => handleInputChange(item.key as keyof USER_PROPS, value)}
          />
        </View>
      ))}

      <View className="mb-3">
        <View className="flex-row items-center mb-2">
          <FontAwesome name="rupee" size={18} color="#6566fc" />
          <Text className="text-gray-700 font-medium ml-2">Price</Text>
        </View>
        <Input variant="secondary" defaultValue={price.toString()} editable={false} />
      </View>

      <View className="mb-3">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="discount" size={18} color="#6566fc" />
          <Text className="text-gray-700 font-medium ml-2">Coupon</Text>
        </View>
        <Input
          variant="secondary"
          value={coupon}
          editable={!loading}
          onChange={(val) => setCoupon(val)}
        />
      </View>

      <View className="mb-3">
        <View className="flex-row items-center mb-2">
          <FontAwesome name="rupee" size={18} color="#6566fc" />
          <Text className="text-gray-700 font-medium ml-2">Discounted Price</Text>
        </View>
        <Input variant="secondary" value={discountedPrice.toString()} editable={false} />
      </View>
    </View>
  );
};

export default PersonalInformation;

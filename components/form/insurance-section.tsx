// components/form/InsuranceSection.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import Input from "@/components/Input";
import { Insurance } from "@/redux/features/user-api/types";

interface InsuranceSectionProps {
  insurances: Insurance[];
  loading: boolean;
  handleNestedInputChange: (key: "insurances", index: number, nestedKey: string, value: any) => void;
  addField: (field: "insurances") => void;
  removeField: (field: "insurances", index: number) => void;
}

const InsuranceSection: React.FC<InsuranceSectionProps> = ({
  insurances,
  loading,
  handleNestedInputChange,
  addField,
  removeField,
}) => {
  return (
    <View className="mt-8">
      {insurances.length > 0 && (
        <>
          <Text className="text-xl font-semibold text-gray-800 mb-4">Insurance Details</Text>
          {insurances.map((insurance, index) => (
            <View key={index} className="bg-gray-50 p-4 rounded-xl mb-4">
              <Text className="text-primary font-medium mb-3">Insurance {index + 1}</Text>
              <View className="flex gap-4">
                <Input
                  variant="secondary"
                  placeholder="Insurance type"
                  defaultValue={insurance.type || ""}
                  editable={!loading}
                  onChange={(value) => handleNestedInputChange("insurances", index, "type", value)}
                />
                <Input
                  variant="secondary"
                  placeholder="Company name"
                  defaultValue={insurance.companyName || ""}
                  editable={!loading}
                  onChange={(value) => handleNestedInputChange("insurances", index, "companyName", value)}
                />
                <Pressable
                  onPress={() => removeField("insurances", index)}
                  disabled={loading}
                  className="bg-red-50 py-2 rounded-lg mt-2"
                >
                  <Text className="text-red-500 text-center font-medium">Remove Insurance</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </>
      )}

      <Pressable
        onPress={() => addField("insurances")}
        disabled={loading}
        className="bg-primary/10 py-3 rounded-lg mt-2"
      >
        <Text className="text-primary text-center font-medium">+ Add Insurance</Text>
      </Pressable>
    </View>
  );
};

export default InsuranceSection;

// components/form/InvestmentSection.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import Input from "@/components/Input";
import { Investment } from "@/redux/features/user-api/types";

interface InvestmentSectionProps {
  investments: Investment[];
  loading: boolean;
  handleNestedInputChange: (key: "investments", index: number, nestedKey: string, value: any) => void;
  addField: (field: "investments") => void;
  removeField: (field: "investments", index: number) => void;
}

const InvestmentSection: React.FC<InvestmentSectionProps> = ({
  investments,
  loading,
  handleNestedInputChange,
  addField,
  removeField,
}) => {
  return (
    <View className="mt-8">
      {investments.length > 0 && (
        <>
          <Text className="text-xl font-semibold text-gray-800 mb-4">Investment Details</Text>
          {investments.map((investment, index) => (
            <View key={index} className="bg-gray-50 p-4 rounded-xl mb-4">
              <Text className="text-primary font-medium mb-3">Investment {index + 1}</Text>
              <View className="flex gap-4">
                <Input
                  variant="secondary"
                  placeholder="Investment type"
                  defaultValue={investment.investmentType || ""}
                  editable={!loading}
                  onChange={(value) => handleNestedInputChange("investments", index, "investmentType", value)}
                />
                <Input
                  variant="secondary"
                  placeholder="Investment amount"
                  defaultValue={investment.amount?.toString() || ""}
                  editable={!loading}
                  onChange={(value) => handleNestedInputChange("investments", index, "amount", Number(value))}
                />
                <Pressable
                  onPress={() => removeField("investments", index)}
                  disabled={loading}
                  className="bg-red-50 py-2 rounded-lg mt-2"
                >
                  <Text className="text-red-500 text-center font-medium">Remove Investment</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </>
      )}

      <Pressable
        onPress={() => addField("investments")}
        disabled={loading}
        className="bg-primary/10 py-3 rounded-lg mt-2"
      >
        <Text className="text-primary text-center font-medium">+ Add Investment</Text>
      </Pressable>
    </View>
  );
};

export default InvestmentSection;

// components/form/DateSelection.tsx
import React from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { convertTo12HourFormat } from "@/utils/utils";

interface DateSelectionProps {
  dateTimes: string[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isDateRegistered: (date: string) => boolean;
}

const DateSelection: React.FC<DateSelectionProps> = ({
  dateTimes,
  selectedDate,
  setSelectedDate,
  isDateRegistered,
}) => {
  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold mb-3 text-gray-800">Select Preferred Date</Text>
      <View className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <Picker selectedValue={selectedDate} onValueChange={setSelectedDate} style={{ height: 50 }}>
          {dateTimes
            .filter((date) => !!date)
            .map((date, index) => {
              const registered = isDateRegistered(date);
              const time = convertTo12HourFormat(date);
              return (
                <Picker.Item
                  key={index}
                  label={`${date.split("T")[0]} at ${time}${registered ? " (Registered)" : ""}`}
                  value={date}
                  color={registered ? "#4CAF50" : "#000"}
                />
              );
            })}
        </Picker>
      </View>
    </View>
  );
};

export default DateSelection;

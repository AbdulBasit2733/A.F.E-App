// components/form/SessionDetailsCard.tsx
import React from "react";
import { View, Text } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { convertTo12HourFormat } from "@/utils/utils";

interface SessionDetailsCardProps {
  mode: string;
  sessionType: string;
  dateTimes: string[];
}

const SessionDetailsCard: React.FC<SessionDetailsCardProps> = ({ mode, sessionType, dateTimes }) => {
  const slots = dateTimes.map((date, index) => ({
    date,
    time: convertTo12HourFormat(date),
    label: ["First", "Second", "Third"][index],
  }));

  return (
    <View className="bg-primary/10 p-4 rounded-xl mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={24} color="#6566fc" />
          <Text className="text-primary font-semibold ml-2">{mode}</Text>
        </View>
        <Text className="font-semibold text-primary">{sessionType}</Text>
      </View>

      <View className="space-y-3">
        {slots.map(
          (slot, index) =>
            slot.date && (
              <View key={index} className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Feather name="clock" size={20} color="#6566fc" />
                  <Text className="ml-2 text-gray-700">
                    {slot.label} Date: {slot.date.split("T")[0]}
                  </Text>
                </View>
                <Text className="text-primary">{slot.time}</Text>
              </View>
            )
        )}
      </View>
    </View>
  );
};

export default SessionDetailsCard;

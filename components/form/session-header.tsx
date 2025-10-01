// components/form/SessionHeader.tsx
import React from "react";
import { View, Text, Image } from "react-native";

interface SessionHeaderProps {
  image: string;
  title: string;
  description: string;
}

const SessionHeader: React.FC<SessionHeaderProps> = ({ image, title, description }) => {
  return (
    <View className="w-full h-[200px] relative">
      <Image source={{ uri: image }} className="w-full h-full" style={{ resizeMode: "cover" }} />
      <View className="absolute inset-0 bg-black/40 flex justify-end p-6">
        <Text className="text-3xl font-bold text-white capitalize">{title ?? "Session Form"}</Text>
        <Text className="text-white/90 mt-2 text-base">
          {description && description.slice(0, 150)}...
        </Text>
      </View>
    </View>
  );
};

export default SessionHeader;

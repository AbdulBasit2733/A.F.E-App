// components/form/SubmitButton.tsx
import React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";

interface SubmitButtonProps {
  loading: boolean;
  onSubmit: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ loading, onSubmit }) => {
  return (
    <Pressable
      onPress={onSubmit}
      disabled={loading}
      className={`flex-row justify-center items-center py-4 rounded-xl mt-8 mb-6 ${
        loading ? "bg-gray-400" : "bg-primary"
      }`}
    >
      {loading ? (
        <>
          <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
          <Text className="text-white font-bold text-lg">Registering...</Text>
        </>
      ) : (
        <Text className="text-white font-bold text-lg">Register Session</Text>
      )}
    </Pressable>
  );
};

export default SubmitButton;

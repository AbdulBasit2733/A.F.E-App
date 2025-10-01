import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const ScreensLayout = () => {
  return (
    <GestureHandlerRootView className="flex-1">
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackVisible: true,
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Profile Edit", headerBackVisible: true }}
        />
        <Stack.Screen
          name="form"
          options={{ title: "Register Session", headerBackVisible: true }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
};

export default ScreensLayout;

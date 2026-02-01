import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const ScreensLayout = () => {
  return (
    <GestureHandlerRootView className="flex-1">
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: {
            backgroundColor: "#ffffff",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Edit Profile",
            headerShown: false,
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="form"
          options={{
            title: "Register Session",
            headerShown: false,
            presentation: "card",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
};

export default ScreensLayout;

import React from "react";
import { Stack } from "expo-router";

const AuthStack = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* <Stack.Screen name="terms_agree" /> */}
      <Stack.Screen name="login" />
    </Stack>
  );
};

export default AuthStack;

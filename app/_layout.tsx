import "../global.css";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";
import { Slot, SplashScreen } from "expo-router";
import * as Contacts from "expo-contacts";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

import StoreProvider from "@/components/StoreProvider";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useInternetToast } from "@/hooks/useInternet";
import { checkAuth } from "@/redux/auth-slice";
import { useSaveUserContactsFnMutation } from "@/redux/features/user-api/user-api";
import { registerContactsBackgroundTask } from "@/utils/background-tasks";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
  });
  const dispatch = useAppDispatch();
  const [saveContactsFn] = useSaveUserContactsFnMutation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [appReady, setAppReady] = useState(false);

  useInternetToast();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        if (token) {
          await dispatch(checkAuth()).unwrap();
        }
      } catch (error) {
        // Handle auth errors silently or with a toast
        console.error("Auth initialization failed:", error);
        await SecureStore.deleteItemAsync("userToken");
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, [dispatch]);

  useEffect(() => {
    const handleContacts = async () => {
      if (isAuthenticated) {
        // Register the background task for all authenticated users
        await registerContactsBackgroundTask();

        // Perform the initial, one-time contact upload
        const alreadyUploaded =
          await SecureStore.getItemAsync("contactsUploaded");
        if (alreadyUploaded !== "true") {
          const { status } = await Contacts.requestPermissionsAsync();
          if (status === "granted") {
            await fetchAndUploadContacts();
          } else {
            // Store that permission was denied to avoid asking again
            await SecureStore.setItemAsync("contactsPermissionDenied", "true");
          }
        }
      }
    };

    handleContacts();
  }, [isAuthenticated]);

  useEffect(() => {
    if (fontError) {
      // You can handle the font loading error here, for example by logging it
      console.error("Font loading error:", fontError);
    }

    if (appReady && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync();
    }
  }, [appReady, fontsLoaded, fontError]);

  const fetchAndUploadContacts = async () => {
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      });

      const formattedContacts = data
        .map((contact) => ({
          contactName: contact.name || "",
          phoneNumbers: (contact.phoneNumbers || [])
            .filter((phone) => phone.number)
            .map((phone) => ({
              label: phone.label || "mobile",
              number: phone.number || "",
            })),
          emails: (contact.emails || [])
            .filter((email) => email.email)
            .map((email) => ({
              label: email.label || "personal",
              email: email.email || "",
            })),
        }))
        .filter((contact) => contact.phoneNumbers.length > 0);

      if (formattedContacts.length > 0) {
        await saveContactsFn({ contacts: formattedContacts }).unwrap();
        await SecureStore.setItemAsync("contactsUploaded", "true");
      }
    } catch (error) {
      console.error("Failed to upload contacts:", error);
    }
  };

  if (!appReady) {
    return null; // Render nothing while the splash screen is visible
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Slot />
        <Toast />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const Root = () => (
  <StoreProvider>
    <RootLayout />
  </StoreProvider>
);

export default Root;

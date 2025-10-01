import StoreProvider from "@/components/StoreProvider";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import * as Contacts from "expo-contacts";
import { Slot } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import "../global.css";
import { useInternetToast } from "../hooks/useInternet";
import { checkAuth } from "../redux/auth-slice";
import { saveUserContacts } from "../redux/user-slice";

// 🛡️ Import SafeAreaProvider and SafeAreaView
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const RootLayout = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading: authLoading } = useAppSelector(
    (state) => state.auth
  );
  const [appReady, setAppReady] = useState(false);
  const [contactsUploaded, setContactsUploaded] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useInternetToast();

  useEffect(() => {
    const fetchAndUploadContacts = async () => {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status !== "granted") {
          console.warn("Contacts permission not granted");
          await SecureStore.setItemAsync("contactsPermissionDenied", "true");
          setPermissionDenied(true);
          return;
        }

        await SecureStore.deleteItemAsync("contactsPermissionDenied");
        setPermissionDenied(false);

        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
        });

        if (!data || data.length === 0) {
          console.warn("No contacts found");
          return;
        }

        const formattedContacts = data
          .map((contact) => ({
            contactName: contact.name || "",
            phoneNumbers: (contact.phoneNumbers || [])
              .filter((phone) => phone.number)
              .map((phone) => ({
                label: phone.label || "mobile",
                number: phone.number,
              })),
            emails: (contact.emails || [])
              .filter((email) => email.email)
              .map((email) => ({
                label: email.label || "personal",
                email: email.email,
              })),
          }))
          .filter((contact) => contact.phoneNumbers.length > 0);

        if (formattedContacts.length === 0) {
          console.warn("No valid contacts to upload");
          return;
        }

        const token = await SecureStore.getItemAsync("userToken");
        if (!token) {
          console.warn("No token found, skipping contacts upload");
          return;
        }

        dispatch(saveUserContacts(formattedContacts)).unwrap();
        setContactsUploaded(true);
      } catch (error: any) {
        console.error(
          "Error fetching/uploading contacts:",
          error?.message || error
        );
      }
    };

    if (isAuthenticated && !contactsUploaded && !permissionDenied) {
      fetchAndUploadContacts();
    }
  }, [isAuthenticated, dispatch, contactsUploaded, permissionDenied]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        if (token) {
          const result = await dispatch(checkAuth()).unwrap();
          if (result.success) {
            Toast.show({
              type: "success",
              text1: "Authentication Successful!",
              text2: "Welcome back 👋",
              visibilityTime: 3000,
            });
          } else {
            await SecureStore.deleteItemAsync("userToken");
            Toast.show({
              type: "error",
              text1: "Session Expired",
              text2: "Please log in again",
              visibilityTime: 4000,
            });
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        Toast.show({
          type: "error",
          text1: "Initialization Error",
          text2: "Please restart the app",
          visibilityTime: 4000,
        });
      } finally {
        setAppReady(true);
      }
    };
    initializeAuth();
  }, [dispatch]);

  useEffect(() => {
    const checkPermissionStatus = async () => {
      const denied = await SecureStore.getItemAsync("contactsPermissionDenied");
      if (denied === "true") {
        setPermissionDenied(true);
      }
    };
    checkPermissionStatus();
  }, []);

  if (!appReady || authLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6566fc" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Slot initialRouteName={isAuthenticated ? "(tabs)" : "(auth)"} />
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

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Root;

import * as Contacts from "expo-contacts";
import { useFonts } from "expo-font";
import { Slot, SplashScreen, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "../global.css";

import StoreProvider from "@/components/StoreProvider";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useInternetToast } from "@/hooks/useInternet";
import { checkAuth } from "@/redux/auth-slice";
import { useSaveUserContactsFnMutation } from "@/redux/features/user-api/user-api";
import {
  getTokenFromSecureStore,
  removeTokenFromSecureStore,
} from "@/utils/token";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Consent Dialog Component
const ContactsConsentDialog = ({ visible, onAgree, onDecline }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDecline}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Contacts Access</Text>

          <Text style={styles.modalDescription}>
            To help you connect with friends and family, we need access to your
            contacts.
          </Text>

          <Text style={styles.modalBulletPoint}>
            • <Text style={styles.boldText}>What we collect:</Text> Contact
            names, phone numbers, and email addresses
          </Text>
          <Text style={styles.modalBulletPoint}>
            • <Text style={styles.boldText}>Why we need it:</Text> To help you
            find and connect with people you know
          </Text>
          <Text style={styles.modalBulletPoint}>
            • <Text style={styles.boldText}>Your privacy:</Text> Your contacts
            are encrypted and never shared with third parties
          </Text>
          <Text style={styles.modalBulletPoint}>
            • <Text style={styles.boldText}>Your control:</Text> You can disable
            this feature anytime in Settings
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.agreeButton]}
              onPress={onAgree}
            >
              <Text style={styles.agreeButtonText}>Agree</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={onDecline}
            >
              <Text style={styles.declineButtonText}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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

  const router = useRouter(); // Add router
  const segments = useSegments(); // Add segments

  const [appReady, setAppReady] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);

  useInternetToast();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = await getTokenFromSecureStore();
        if (token) {
          await dispatch(checkAuth()).unwrap();
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        await removeTokenFromSecureStore();
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, [dispatch]);

  useEffect(() => {
    if (!appReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to authenticated screens if logged in
      router.replace("/(tabs)"); // Replace with your authenticated route
    }
  }, [isAuthenticated, segments, appReady]);

  // Function to request contacts (call this from a settings screen or feature UI)
  const requestContactsAccess = async () => {
    const alreadyAsked = await SecureStore.getItemAsync("contactsConsentAsked");
    const permissionDenied = await SecureStore.getItemAsync(
      "contactsPermissionDenied"
    );

    // Don't show if user already denied multiple times
    if (permissionDenied === "true") {
      Alert.alert(
        "Permission Previously Denied",
        "You previously declined contacts access. You can enable it in your device Settings > Apps > A.F.E > Permissions.",
        [{ text: "OK" }]
      );
      return;
    }

    setShowConsentDialog(true);
  };

  const handleAgreeToContactsAccess = async () => {
    setShowConsentDialog(false);
    await SecureStore.setItemAsync("contactsConsentAsked", "true");

    // NOW request the system permission after user agreed to disclosure
    const { status } = await Contacts.requestPermissionsAsync();

    if (status === "granted") {
      await fetchAndUploadContacts();
      Toast.show({
        type: "success",
        text1: "Contacts synced successfully",
        position: "bottom",
      });
    } else {
      await SecureStore.setItemAsync("contactsPermissionDenied", "true");
      Toast.show({
        type: "info",
        text1: "Contacts access denied",
        text2: "You can enable this later in Settings",
        position: "bottom",
      });
    }
  };

  const handleDeclineContactsAccess = async () => {
    setShowConsentDialog(false);
    await SecureStore.setItemAsync("contactsConsentAsked", "true");

    Toast.show({
      type: "info",
      text1: "You can enable contacts access anytime in Settings",
      position: "bottom",
    });
  };

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
      Toast.show({
        type: "error",
        text1: "Failed to sync contacts",
        position: "bottom",
      });
    }
  };

  useEffect(() => {
    if (fontError) {
      console.error("Font loading error:", fontError);
    }

    if (appReady && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync();
    }
  }, [appReady, fontsLoaded, fontError]);

  if (!appReady) {
    return null;
  }

  return (
    <SafeAreaProvider>

      <Slot />
      <Toast />
      <ContactsConsentDialog
        visible={showConsentDialog}
        onAgree={handleAgreeToContactsAccess}
        onDecline={handleDeclineContactsAccess}
      />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#1a1a1a",
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4a4a4a",
    marginBottom: 20,
    textAlign: "center",
  },
  modalBulletPoint: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4a4a4a",
    marginBottom: 12,
  },
  boldText: {
    fontWeight: "600",
    color: "#1a1a1a",
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  agreeButton: {
    backgroundColor: "#007AFF",
  },
  agreeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  declineButton: {
    backgroundColor: "#f5f5f5",
  },
  declineButtonText: {
    color: "#4a4a4a",
    fontSize: 16,
    fontWeight: "500",
  },
});

const Root = () => (
  <StoreProvider>
    <RootLayout />
  </StoreProvider>
);

export default Root;

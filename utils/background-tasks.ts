import * as Contacts from "expo-contacts";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import store  from "@/redux/store";
import { userApi } from "@/redux/features/user-api/user-api"; // Import your user API slice

const CONTACTS_TASK = "background-contact-upload";

TaskManager.defineTask(CONTACTS_TASK, async () => {
  try {
    const token = await SecureStore.getItemAsync("userToken");
    if (!token) {
      console.log("Background task: No token, skipping.");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const { status } = await Contacts.getPermissionsAsync();
    if (status !== "granted") {
      console.log("Background task: No contacts permission, skipping.");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
    });

    const formattedContacts = (data || [])
      .map((contact) => ({
        contactName: contact.name || "",
        phoneNumbers: (contact.phoneNumbers || [])
          .filter((p) => p.number)
          .map((p) => ({
            label: p.label || "mobile",
            number: p.number || "",
          })),
        emails: (contact.emails || [])
          .filter((e) => e.email)
          .map((e) => ({
            label: e.label || "personal",
            email: e.email || "",
          })),
      }))
      .filter((c) => c.phoneNumbers.length > 0);

    if (!formattedContacts.length) {
      console.log("Background task: No new contacts to upload.");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Dispatch the mutation directly using the store
    await store.dispatch(
      userApi.endpoints.saveUserContactsFn.initiate({
        contacts: formattedContacts,
      })
    );

    console.log("Background task: Contacts uploaded successfully.");
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Background task failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerContactsBackgroundTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(CONTACTS_TASK);
    if (isRegistered) {
      console.log("Background contacts task already registered.");
      return;
    }

    await BackgroundFetch.registerTaskAsync(CONTACTS_TASK, {
      minimumInterval: 60 * 60 * 24, // 24 hours
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log("Background contacts task registered successfully.");
  } catch (error) {
    console.error("Failed to register background task:", error);
  }
}

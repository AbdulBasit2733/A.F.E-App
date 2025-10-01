import * as SecureStore from "expo-secure-store";
export const getTokenFromSecureStore = async () => {
  try {
    const token = await SecureStore.getItemAsync("userToken");
    return token;
  } catch (error) {
    console.error("Error reading token from Secure Store", error);
    return null;
  }
};

export const saveTokenToSecureStore = async (token: string) => {
  try {
    await SecureStore.setItemAsync("userToken", token);
  } catch (error) {
    console.error("Error saving token to Secure Store", error);
  }
};

export const removeTokenFromSecureStore = async () => {
  try {
    await SecureStore.deleteItemAsync("userToken");
  } catch (error) {
    console.error("Error removing token from Secure Store", error);
  }
};
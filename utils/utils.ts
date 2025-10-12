// export const BACKEND_URL = "http://10.0.2.2:3000";
// export const BACKEND_URL = "http://192.168.0.201:3000/api/v1";
// export const BACKEND_URL = "http://192.168.0.201:3000/api/v1";
export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL
  ? `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1`
  : "http://192.168.0.201:3000/api/v1";

export function convertTo12HourFormat(isoString?: string): string {
  if (!isoString) {
    return "";
  }

  try {
    const date = new Date(isoString); // Parse ISO string as Date (automatic UTC)
    const localHours = date.getHours(); // Get local hours
    const minutes = date.getMinutes(); // Get local minutes

    const hours12 = localHours % 12 || 12; // 0 -> 12
    const amPm = localHours >= 12 ? "PM" : "AM";

    // Format minutes to always have 2 digits (e.g., 05 instead of 5)
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${hours12}:${formattedMinutes} ${amPm}`;
  } catch (error) {
    console.error("Invalid ISO string:", isoString, error);
    return "Invalid time";
  }
}

export const formatAmount = (amount: number) => {
  if (amount >= 1_00_00_000) {
    return `${(amount / 1_00_00_000).toFixed(2)} Cr`;
  } else if (amount >= 1_00_000) {
    return `${(amount / 1_00_000).toFixed(2)} L`;
  } else if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(2)} K`;
  } else {
    return amount.toString();
  }
};

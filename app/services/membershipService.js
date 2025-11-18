import AsyncStorage from "@react-native-async-storage/async-storage";

const MEMBERSHIP_KEY = "user_membership_status";

// Toggle between PRO and FREE
export const toggleMembership = async () => {
    try {
        const currentStatus = await AsyncStorage.getItem(MEMBERSHIP_KEY);
        const newStatus = currentStatus === "PRO" ? "FREE" : "PRO";

        await AsyncStorage.setItem(MEMBERSHIP_KEY, newStatus);

        return newStatus;
    } catch (error) {
        console.error("Error toggling membership:", error);
    }
};

// Check if user is PRO (returns boolean)
export const isUserPro = async () => {
    try {
        const status = await AsyncStorage.getItem(MEMBERSHIP_KEY);
        return status === "PRO";
    } catch (error) {
        return false; // Default to free if error
    }
};

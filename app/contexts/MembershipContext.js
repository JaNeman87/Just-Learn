import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const MembershipContext = createContext();

export const MembershipProvider = ({ children }) => {
    const [isPro, setIsPro] = useState(false);

    // Load initial status on app start
    useEffect(() => {
        const loadStatus = async () => {
            try {
                const status = await AsyncStorage.getItem("user_membership_status");
                setIsPro(status === "PRO");
            } catch (error) {
                console.error("Failed to load membership status", error);
            }
        };
        loadStatus();
    }, []);

    // Toggle handler
    const toggleMembership = async () => {
        try {
            const newStatus = !isPro;
            setIsPro(newStatus); // Update State immediately (UI updates)
            await AsyncStorage.setItem("user_membership_status", newStatus ? "PRO" : "FREE"); // Save to storage
        } catch (error) {
            console.error("Failed to save membership status", error);
        }
    };

    return <MembershipContext.Provider value={{ isPro, toggleMembership }}>{children}</MembershipContext.Provider>;
};

// Custom hook for easy access
export const useMembership = () => useContext(MembershipContext);

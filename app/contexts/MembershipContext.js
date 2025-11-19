import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../lib/supabase"; // Ensure this path matches your file structure
import { useAuth } from "./AuthContext";

const MembershipContext = createContext();

export const MembershipProvider = ({ children }) => {
    const { user, isGuest } = useAuth(); // Get current user status
    const [isPro, setIsPro] = useState(false);

    // 1. SYNC: Load status from Supabase when User changes (Login/App Start)
    useEffect(() => {
        const loadStatus = async () => {
            try {
                // A. Always load local status first (Instant UI load)
                const localStatus = await AsyncStorage.getItem("user_membership_status");
                let currentStatus = localStatus === "PRO";

                // B. If User is Logged In (Not Guest), check the Database
                if (user && !isGuest) {
                    const { data, error } = await supabase
                        .from("profiles")
                        .select("is_pro")
                        .eq("id", user.id)
                        .maybeSingle(); // Use maybeSingle to avoid errors if row is missing

                    if (data) {
                        currentStatus = data.is_pro;
                        // Update local storage to match the Database truth
                        await AsyncStorage.setItem("user_membership_status", currentStatus ? "PRO" : "FREE");
                    }
                }

                setIsPro(currentStatus);
            } catch (error) {
                console.error("Failed to load membership status", error);
            }
        };

        loadStatus();
    }, [user, isGuest]); // Re-run this when user logs in/out

    // 2. TOGGLE: Restricted to Signed In Users
    const toggleMembership = async () => {
        // CHECK: Block Guests
        if (isGuest) {
            Alert.alert("Dev Access Denied", "You must be signed in to toggle the Pro status.");
            return; // Stop execution here
        }

        try {
            const newStatus = !isPro;

            // A. Update State & Local Storage immediately
            setIsPro(newStatus);
            await AsyncStorage.setItem("user_membership_status", newStatus ? "PRO" : "FREE");

            // B. Save to Supabase
            if (user) {
                const { error } = await supabase.from("profiles").upsert({
                    id: user.id,
                    is_pro: newStatus,
                    updated_at: new Date(),
                });

                if (error) {
                    console.error("Supabase sync failed:", error);
                    Alert.alert("Sync Error", "Could not save status to the database.");
                }
            }
        } catch (error) {
            console.error("Failed to save membership status", error);
        }
    };

    return <MembershipContext.Provider value={{ isPro, toggleMembership }}>{children}</MembershipContext.Provider>;
};

export const useMembership = () => useContext(MembershipContext);

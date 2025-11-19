import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { useAuth } from "./AuthContext";

const MembershipContext = createContext();

export const MembershipProvider = ({ children }) => {
    const { user, isGuest } = useAuth();
    const [isPro, setIsPro] = useState(false);

    // 1. SYNC: Load status
    useEffect(() => {
        const loadStatus = async () => {
            try {
                // --- FIX: IF GUEST, FORCE FREE ---
                // This ensures that logging out (becoming a guest) instantly locks content.
                if (isGuest) {
                    setIsPro(false);
                    await AsyncStorage.setItem("user_membership_status", "FREE");
                    return; // Stop here
                }

                // --- LOGGED IN LOGIC ---

                // A. Load from Local Storage first (Optimistic UI)
                const localStatus = await AsyncStorage.getItem("user_membership_status");
                let currentStatus = localStatus === "PRO";

                // B. Check the Database for the "Truth"
                if (user) {
                    const { data, error } = await supabase
                        .from("profiles")
                        .select("is_pro")
                        .eq("id", user.id)
                        .maybeSingle();

                    if (data) {
                        currentStatus = data.is_pro;
                        // Sync local storage to match the Database truth
                        await AsyncStorage.setItem("user_membership_status", currentStatus ? "PRO" : "FREE");
                    }
                }

                setIsPro(currentStatus);
            } catch (error) {
                console.error("Failed to load membership status", error);
            }
        };

        loadStatus();
    }, [user, isGuest]); // Re-runs when user changes (e.g. Logout)

    // 2. TOGGLE: Restricted to Signed In Users
    const toggleMembership = async () => {
        if (isGuest) {
            Alert.alert("Dev Access Denied", "You must be signed in to toggle the Pro status.");
            return;
        }

        try {
            const newStatus = !isPro;

            setIsPro(newStatus);
            await AsyncStorage.setItem("user_membership_status", newStatus ? "PRO" : "FREE");

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

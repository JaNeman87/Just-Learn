import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { clearAllOfflineContent } from "../services/contentService";
import { useAuth } from "./AuthContext";

const MembershipContext = createContext();

export const MembershipProvider = ({ children }) => {
    const { user, isGuest } = useAuth();
    const [isPro, setIsPro] = useState(false);
    
    // --- NEW: Gamification State ---
    const [streak, setStreak] = useState(0);
    const [totalXP, setTotalXP] = useState(0);

    // 1. SYNC: Load status & Gamification Data
    useEffect(() => {
        const loadStatus = async () => {
            try {
                // GUEST LOGIC
                if (isGuest) {
                    setIsPro(false);
                    // Guests store streak locally
                    const localStreak = await AsyncStorage.getItem("guest_streak");
                    setStreak(localStreak ? parseInt(localStreak) : 0);
                    await AsyncStorage.setItem("user_membership_status", "FREE");
                    await clearAllOfflineContent();
                    return;
                }

                // LOGGED IN LOGIC
                const localStatus = await AsyncStorage.getItem("user_membership_status");
                let currentStatus = localStatus === "PRO";
                
                if (user) {
                    // Fetch Profile (Pro Status + Streak + XP)
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('is_pro, current_streak, total_xp')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (data) {
                        currentStatus = data.is_pro;
                        setStreak(data.current_streak || 0);
                        setTotalXP(data.total_xp || 0);
                        
                        await AsyncStorage.setItem("user_membership_status", currentStatus ? "PRO" : "FREE");
                    }
                }
                
                setIsPro(currentStatus);

                if (!currentStatus) {
                    await clearAllOfflineContent();
                }

            } catch (error) {
                console.error("Failed to load membership status", error);
            }
        };

        loadStatus();
    }, [user, isGuest]);

    // 2. NEW: Function to Update Progress (Call this when test finishes)
    const updateProgress = async (xpGained) => {
        if (isGuest) {
            // Simple local logic for guests (simplified)
            const newStreak = streak + 1; 
            setStreak(newStreak);
            await AsyncStorage.setItem("guest_streak", newStreak.toString());
            return;
        }

        try {
            // Call the Smart SQL Function
            const { error } = await supabase.rpc('update_learning_progress', { 
                xp_gained: xpGained 
            });

            if (!error) {
                // Refetch to get the updated streak from server calculation
                const { data } = await supabase
                    .from('profiles')
                    .select('current_streak, total_xp')
                    .eq('id', user.id)
                    .single();
                
                if (data) {
                    setStreak(data.current_streak);
                    setTotalXP(data.total_xp);
                }
            }
        } catch (e) {
            console.error("Failed to update progress:", e);
        }
    };

    // 3. TOGGLE (Dev Only)
    const toggleMembership = async () => {
        if (isGuest) {
            Alert.alert("Dev Access Denied", "You must be signed in to toggle the Pro status.");
            return; 
        }
        try {
            const newStatus = !isPro;
            setIsPro(newStatus);
            await AsyncStorage.setItem("user_membership_status", newStatus ? "PRO" : "FREE");
            if (!newStatus) await clearAllOfflineContent();

            if (user) {
                await supabase.from('profiles').upsert({ 
                    id: user.id, 
                    is_pro: newStatus,
                    updated_at: new Date()
                });
            }
        } catch (error) {
            console.error("Failed to save membership status", error);
        }
    };

    return (
        <MembershipContext.Provider value={{ isPro, streak, totalXP, toggleMembership, updateProgress }}>
            {children}
        </MembershipContext.Provider>
    );
};

export const useMembership = () => useContext(MembershipContext);
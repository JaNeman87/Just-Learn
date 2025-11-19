// import { createContext, useContext, useEffect, useState } from "react";
// import { Alert } from "react-native";
// import { supabase } from "../../lib/supabase";

// const AuthContext = createContext({});

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [session, setSession] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         // 1. Check for existing session
//         const initializeAuth = async () => {
//             try {
//                 const {
//                     data: { session },
//                 } = await supabase.auth.getSession();

//                 if (session) {
//                     setSession(session);
//                     setUser(session.user);
//                 } else {
//                     // 2. If no session, create an Anonymous (Guest) user immediately
//                     await signInAsGuest();
//                 }
//             } catch (error) {
//                 console.error("Auth Init Error:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         initializeAuth();

//         // 3. Listen for auth changes (Sign in, Sign out, Auto-refresh)
//         const {
//             data: { subscription },
//         } = supabase.auth.onAuthStateChange((_event, session) => {
//             setSession(session);
//             setUser(session?.user ?? null);
//         });

//         return () => subscription.unsubscribe();
//     }, []);

//     // --- Actions ---

//     const signInAsGuest = async () => {
//         const { data, error } = await supabase.auth.signInAnonymously();
//         if (error) console.error("Guest Login Failed:", error.message);
//         return { data, error };
//     };

//     // Login (for existing users on new devices)
//     const login = async (email, password) => {
//         const { data, error } = await supabase.auth.signInWithPassword({
//             email,
//             password,
//         });
//         if (error) throw error;
//         return data;
//     };

//     // Convert Guest -> Registered User (Preserves Data!)
//     const convertGuestToUser = async (email, password) => {
//         // We use updateUser to add email/password to the CURRENT anonymous user
//         const { data, error } = await supabase.auth.updateUser({
//             email: email,
//             password: password,
//         });

//         if (error) throw error;
//         return data;
//     };

//     const logout = async () => {
//         const { error } = await supabase.auth.signOut();
//         if (error) Alert.alert("Error", error.message);
//         // Optional: After logout, immediately sign in as a new guest?
//         await signInAsGuest();
//     };

//     return (
//         <AuthContext.Provider
//             value={{
//                 user,
//                 session,
//                 isGuest: user?.is_anonymous, // Supabase flag for anon users
//                 loading,
//                 login,
//                 convertGuestToUser,
//                 logout,
//             }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
// Removed Alert import

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                if (session) {
                    setSession(session);
                    setUser(session.user);
                } else {
                    await signInAsGuest();
                }
            } catch (error) {
                console.error("Auth Init Error:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInAsGuest = async () => {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) console.error("Guest Login Failed:", error.message);
        return { data, error };
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    const convertGuestToUser = async (email, password) => {
        const { data, error } = await supabase.auth.updateUser({ email, password });
        if (error) throw error;
        return data;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();

        // FIX: If error, we just log it. The UI handles the feedback.
        if (error) console.error("Logout Error:", error.message);

        await signInAsGuest();
        return { error }; // Return error so component can see it
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isGuest: !user || user.is_anonymous,
                loading,
                login,
                convertGuestToUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

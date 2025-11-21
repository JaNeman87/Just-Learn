import { Ionicons } from "@expo/vector-icons";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CustomDrawerContent from "../components/customDrawerContent";

import { AuthProvider } from "./contexts/AuthContext";
import { MembershipProvider, useMembership } from "./contexts/MembershipContext";

// --- COMPONENTS ---

const StreakBadge = () => {
    const { streak } = useMembership();

    return (
        <View style={styles.streakContainer}>
            <Ionicons name="flame" size={22} color={streak > 0 ? "#81B64C" : "#555"} />
            <Text style={[styles.streakText, streak > 0 && styles.streakTextActive]}>
                {streak}
            </Text>
        </View>
    );
};

const GoProButton = () => {
    const router = useRouter();
    const { isPro } = useMembership(); 

    const handlePress = () => {
        router.push("/membership");
    };

    return (
        <TouchableOpacity style={[styles.container]} onPress={handlePress}>
            <Ionicons name={isPro ? "checkmark-circle" : "rocket-outline"} size={16} color="#FFFFFF" />
            <Text style={styles.text}>{isPro ? "PRO" : "GO PRO"}</Text>
        </TouchableOpacity>
    );
};

const HeaderLeftActions = () => {
   const router = useRouter();

    const handlePress = () => {
        router.push("/Home/profile");
    };

    return (
        <View style={styles.headerLeftContainer}>
            <TouchableOpacity onPress={handlePress}>
                <Ionicons name={"person-circle-outline"} size={40} color="#81B64C" />
            </TouchableOpacity>
            <StreakBadge />
        </View>
    );
};
const HeaderRightActions = () => {
     const { toggleMembership } = useMembership(); 
    return (
       <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                                         {/* Dev Toggle */}
            <TouchableOpacity style={{ marginRight: 15 }} onPress={toggleMembership}>
                <Ionicons name="diamond-sharp" size={24} color="#81B64C" />
            </TouchableOpacity>
                                        <GoProButton />
                                    </View>
    );
};  
const LogoTitle = () => (
    <Image style={{ width: 120, height: 50, resizeMode: "contain" }} source={require("../assets/images/logo.png")} />
);

const MyDarkTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: "#2C2B29",
        card: "#2C2B29",
        text: "#FFFFFF",
    },
};

// --- MAIN LAYOUT ---

export default function Layout() {
    
    return (
        <AuthProvider>
            <MembershipProvider>
                <ThemeProvider value={MyDarkTheme}>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <StatusBar backgroundColor="#2C2B29" barStyle="light-content" translucent={false} />
                        <Drawer
                            drawerContent={CustomDrawerContent}
                            screenOptions={{
                                drawerHideStatusBarOnOpen: true,
                                drawerActiveBackgroundColor: "#81B64C",
                                drawerLabelStyle: { color: "#fff", fontSize: 16, fontWeight: "500" },
                                drawerActiveTintColor: "#fff",
                                drawerInactiveTintColor: "#fff",
                                headerStyle: {
                                    backgroundColor: "#2C2B29",
                                },
                                headerLeft: () => <HeaderLeftActions />,
                                headerTintColor: "#81B64C",
                                headerTitle: () => <LogoTitle />,
                                headerTitleAlign: "center",
                                // Updated Header Right: Streak + Go Pro
                                headerRight: () => <HeaderRightActions />,
                            }}
                        >
                            <Drawer.Screen
                                name="Home"
                                options={{
                                    drawerLabel: "Home",
                                    title: "Home Page",
                                    drawerIcon: ({ size, color }) => (
                                        <Ionicons name="home-outline" size={size} color={color} />
                                    ),
                                }}
                            />
                            <Drawer.Screen
                                name="Bookmarks"
                                options={{
                                    drawerLabel: "Bookmarks",
                                    title: "Bookmarks Page",
                                    drawerIcon: ({ size, color }) => (
                                        <Ionicons name="bookmark-outline" size={size} color={color} />
                                    ),
                                }}
                            />
                            <Drawer.Screen
                                name="membership"
                                options={{
                                    drawerLabel: "membership",
                                    title: "membership Page",
                                    drawerIcon: ({ size, color }) => (
                                        <Ionicons name="card-outline" size={size} color={color} />
                                    ),
                                }}
                            />
                            <Drawer.Screen
                                name="Statistics"
                                options={{
                                    drawerLabel: "Statistics",
                                    title: "Statistics Page",
                                    drawerIcon: ({ size, color }) => (
                                        <Ionicons name="stats-chart-outline" size={size} color={color} />
                                    ),
                                }}
                            />
                            <Drawer.Screen
                                name="Settings"
                                options={{
                                    drawerLabel: "Settings",
                                    title: "Settings Page",
                                    drawerIcon: ({ size, color }) => (
                                        <Ionicons name="settings-outline" size={size} color={color} />
                                    ),
                                }}
                            />
                        </Drawer>
                    </GestureHandlerRootView>
                </ThemeProvider>
            </MembershipProvider>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    headerLeftContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 10,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    // Streak Styles
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 15,
    },
    streakText: {
        color: '#777',
        fontWeight: 'bold',
        marginLeft: 4,
        fontSize: 16,
    },
    streakTextActive: {
        color: '#81B64C', // Gold/Orange when active
    },
    // Button Styles
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#81B64C",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginRight: 5,
    },
    text: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
        marginLeft: 5,
    },
});
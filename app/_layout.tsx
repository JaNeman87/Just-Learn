import { Ionicons } from "@expo/vector-icons";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CustomDrawerContent from "../components/customDrawerContent";

// Import the new Context Provider and Hook
import { AuthProvider } from "./contexts/AuthContext";
import { MembershipProvider, useMembership } from "./contexts/MembershipContext";

// --- Components utilizing the Context ---

const GoProButton = () => {
    const router = useRouter();
    const { isPro } = useMembership(); // <--- Listen to status

    const handlePress = () => {
        // If already PRO, maybe show settings or do nothing.
        // For now, we only navigate if they are NOT pro, or let them manage sub.
        router.push("/membership");
    };

    return (
        <TouchableOpacity style={[styles.container]} onPress={handlePress}>
            {/* Change Icon based on status */}
            <Ionicons name={isPro ? "checkmark-circle" : "rocket-outline"} size={16} color="#FFFFFF" />
            {/* Change Text based on status */}
            <Text style={styles.text}>{isPro ? "PRO" : "GO PRO"}</Text>
        </TouchableOpacity>
    );
};

const HeaderLeftActions = () => {
    const { toggleMembership } = useMembership(); // <--- Access toggle function

    return (
        <View style={styles.headerLeftContainer}>
            {/* Avatar */}
            <TouchableOpacity onPress={() => {}}>
                <Image style={styles.avatar} source={require("../assets/images/deutschland.png")} />
            </TouchableOpacity>

            {/* Diamond Toggle Button */}
            <TouchableOpacity style={{ marginLeft: 15 }} onPress={toggleMembership}>
                <Ionicons name="diamond-sharp" size={24} color="#81B64C" />
            </TouchableOpacity>
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

// --- Main Layout ---

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
                                // Use the component that consumes the context
                                headerLeft: () => <HeaderLeftActions />,
                                headerTintColor: "#81B64C",
                                headerTitle: () => <LogoTitle />,
                                headerTitleAlign: "center",
                                // Use the component that consumes the context
                                headerRight: () => <GoProButton />,
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
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#81B64C",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginRight: 15,
    },
    containerPro: {
        backgroundColor: "#2C2B29", // Optional: Different style when PRO (e.g. blend in)
        borderWidth: 1,
        borderColor: "#81B64C",
    },
    text: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
        marginLeft: 5,
    },
});

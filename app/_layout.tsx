import { Ionicons } from "@expo/vector-icons";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CustomDrawerContent from "../components/customDrawerContent";

import React from "react";

const GoProButton = () => {
    const router = useRouter();
    const handlePress = () => {
        // This navigates to the 'membership' screen.
        // You will need to define this route in your layout.
        router.push("/membership");
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <Ionicons name="rocket-outline" size={16} color="#FFFFFF" />
            <Text style={styles.text}>GO PRO</Text>
        </TouchableOpacity>
    );
};

function LogoTitle() {
    return (
        <Image
            style={{ width: 120, height: 50, resizeMode: "contain" }}
            source={require("../assets/images/logo.png")} // <-- Your logo
        />
    );
}

const MyDarkTheme = {
    ...DarkTheme, // Start with the default dark theme values
    colors: {
        ...DarkTheme.colors,
        // This is the crucial part that fixes the flash:
        background: "#2C2B29", // <-- Your app's dark background
        // You can also set card (header) and text colors here
        card: "#2C2B29", // Sets header background
        text: "#FFFFFF", // Sets header text color
    },
};

export default function Layout() {
    return (
        <ThemeProvider value={MyDarkTheme}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <StatusBar
                    backgroundColor="#2C2B29" // Your desired background color
                    barStyle="light-content" // "light-content" for light text/icons
                    translucent={false} // <-- This is the most important part
                />
                <Drawer
                    drawerContent={CustomDrawerContent}
                    screenOptions={{
                        drawerHideStatusBarOnOpen: true,
                        drawerActiveBackgroundColor: "#81B64C",
                        drawerLabelStyle: { color: "#fff", fontSize: 16, fontWeight: "500" },
                        drawerActiveTintColor: "#fff",
                        drawerInactiveTintColor: "#fff",
                        headerStyle: {
                            backgroundColor: "#2C2B29", // Your desired header color
                        },
                        headerLeft: () => (
                            <View style={styles.headerLeftContainer}>
                                {/* Avatar */}
                                <TouchableOpacity onPress={() => {}}>
                                    <Image
                                        style={styles.avatar}
                                        source={require("../assets/images/deutschland.png")} // <-- Your avatar
                                    />
                                </TouchableOpacity>

                                {/* Action Button */}
                                <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => alert("Search pressed!")}>
                                    <Ionicons name="diamond-sharp" size={24} color="#81B64C" />
                                </TouchableOpacity>
                            </View>
                        ),
                        headerTintColor: "#81B64C", // Tints the title and back button
                        headerTitle: () => <LogoTitle />,
                        headerTitleAlign: "center",
                        headerRight: () => <GoProButton />,
                    }}
                >
                    <Drawer.Screen
                        name="Home" // This is the name of the page and must match the url from root
                        options={{
                            drawerLabel: "Home",
                            title: "Home Page",
                            drawerIcon: ({ size, color }) => <Ionicons name="home-outline" size={size} color={color} />,
                        }}
                    />
                    <Drawer.Screen
                        name="Bookmarks" // This is the name of the page and must match the url from root
                        options={{
                            drawerLabel: "Bookmarks",
                            title: "Bookmarks Page",
                            drawerIcon: ({ size, color }) => (
                                <Ionicons name="bookmark-outline" size={size} color={color} />
                            ),
                        }}
                    />
                    <Drawer.Screen
                        name="membership" // This is the name of the page and must match the url from root
                        options={{
                            drawerLabel: "membership",
                            title: "membership Page",
                            drawerIcon: ({ size, color }) => (
                                <Ionicons name="bookmark-outline" size={size} color={color} />
                            ),
                        }}
                    />
                    <Drawer.Screen
                        name="Statistics" // This is the name of the page and must match the url from root
                        options={{
                            drawerLabel: "Statistics",
                            title: "Statistics Page",
                            drawerIcon: ({ size, color }) => (
                                <Ionicons name="stats-chart-outline" size={size} color={color} />
                            ),
                        }}
                    />
                    <Drawer.Screen
                        name="Settings" // This is the name of the page and must match the url from root
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
    );
}
const styles = StyleSheet.create({
    headerLeftContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 10, // Add some padding
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    icon: {
        marginLeft: 15,
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#81B64C", // Your app's green
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginRight: 15,
    },
    text: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
        marginLeft: 5,
    },
});

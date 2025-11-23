import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PROGRESS_KEY = "@JustLearnProgress";
const LEVEL_KEY = "@JustLearn:selectedLevel";

export default function Settings() {
    const router = useRouter();

    const handleResetProgress = () => {
        Alert.alert(
            "Reset Progress",
            "Are you sure? This will erase all your test results and streak. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // 1. Remove the progress key
                            await AsyncStorage.removeItem(PROGRESS_KEY);

                            // Optional: Remove selected level if you want to full reset
                            // await AsyncStorage.removeItem(LEVEL_KEY);

                            Alert.alert("Success", "Your progress has been reset.");

                            // 2. Navigate back to force a refresh usually,
                            // or just let the user go back manually
                            router.dismiss();
                        } catch (e) {
                            console.error("Failed to reset progress", e);
                            Alert.alert("Error", "Could not reset progress.");
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* GENERAL SECTION */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General</Text>

                    <TouchableOpacity style={styles.row}>
                        <View style={styles.rowIcon}>
                            <Ionicons name="notifications-outline" size={22} color="#FFF" />
                        </View>
                        <Text style={styles.rowText}>Notifications</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row}>
                        <View style={styles.rowIcon}>
                            <Ionicons name="volume-medium-outline" size={22} color="#FFF" />
                        </View>
                        <Text style={styles.rowText}>Sound Effects</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* DANGER ZONE */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: "#FF4444" }]}>Danger Zone</Text>

                    <TouchableOpacity style={styles.row} onPress={handleResetProgress}>
                        <View style={[styles.rowIcon, { backgroundColor: "rgba(255, 68, 68, 0.1)" }]}>
                            <Ionicons name="trash-outline" size={22} color="#FF4444" />
                        </View>
                        <Text style={[styles.rowText, { color: "#FF4444" }]}>Reset Test Progress</Text>
                    </TouchableOpacity>
                </View>

                {/* CLOSE BUTTON (Since it's a modal) */}
                <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                    <Text style={styles.closeButtonText}>Close Settings</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2B29",
    },
    header: {
        paddingTop: 20,
        paddingBottom: 20,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.05)",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 12,
        overflow: "hidden",
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#888",
        marginLeft: 15,
        marginTop: 15,
        marginBottom: 10,
        textTransform: "uppercase",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.05)",
    },
    rowIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 15,
    },
    rowText: {
        flex: 1,
        fontSize: 16,
        color: "#FFF",
        fontWeight: "500",
    },
    closeButton: {
        marginTop: 20,
        alignItems: "center",
        padding: 15,
    },
    closeButtonText: {
        color: "#81B64C",
        fontSize: 16,
        fontWeight: "bold",
    },
});

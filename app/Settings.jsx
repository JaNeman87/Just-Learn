// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";
// import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// const PROGRESS_KEY = "@JustLearnProgress";
// const LEVEL_KEY = "@JustLearn:selectedLevel";

// export default function Settings() {
//     const router = useRouter();

//     const handleResetProgress = () => {
//         Alert.alert(
//             "Reset Progress",
//             "Are you sure? This will erase all your test results and streak. This action cannot be undone.",
//             [
//                 { text: "Cancel", style: "cancel" },
//                 {
//                     text: "Reset",
//                     style: "destructive",
//                     onPress: async () => {
//                         try {
//                             // 1. Remove the progress key
//                             await AsyncStorage.removeItem(PROGRESS_KEY);

//                             // Optional: Remove selected level if you want to full reset
//                             // await AsyncStorage.removeItem(LEVEL_KEY);

//                             Alert.alert("Success", "Your progress has been reset.");

//                             // 2. Navigate back to force a refresh usually,
//                             // or just let the user go back manually
//                             router.dismiss();
//                         } catch (e) {
//                             console.error("Failed to reset progress", e);
//                             Alert.alert("Error", "Could not reset progress.");
//                         }
//                     },
//                 },
//             ]
//         );
//     };

//     return (
//         <View style={styles.container}>
//             <View style={styles.header}>
//                 <Text style={styles.headerTitle}>Settings</Text>
//             </View>

//             <ScrollView contentContainerStyle={styles.content}>
//                 {/* GENERAL SECTION */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionTitle}>General</Text>

//                     <TouchableOpacity style={styles.row}>
//                         <View style={styles.rowIcon}>
//                             <Ionicons name="notifications-outline" size={22} color="#FFF" />
//                         </View>
//                         <Text style={styles.rowText}>Notifications</Text>
//                         <Ionicons name="chevron-forward" size={20} color="#666" />
//                     </TouchableOpacity>

//                     <TouchableOpacity style={styles.row}>
//                         <View style={styles.rowIcon}>
//                             <Ionicons name="volume-medium-outline" size={22} color="#FFF" />
//                         </View>
//                         <Text style={styles.rowText}>Sound Effects</Text>
//                         <Ionicons name="chevron-forward" size={20} color="#666" />
//                     </TouchableOpacity>
//                 </View>

//                 {/* DANGER ZONE */}
//                 <View style={styles.section}>
//                     <Text style={[styles.sectionTitle, { color: "#FF4444" }]}>Danger Zone</Text>

//                     <TouchableOpacity style={styles.row} onPress={handleResetProgress}>
//                         <View style={[styles.rowIcon, { backgroundColor: "rgba(255, 68, 68, 0.1)" }]}>
//                             <Ionicons name="trash-outline" size={22} color="#FF4444" />
//                         </View>
//                         <Text style={[styles.rowText, { color: "#FF4444" }]}>Reset Test Progress</Text>
//                     </TouchableOpacity>
//                 </View>

//                 {/* CLOSE BUTTON (Since it's a modal) */}
//                 <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
//                     <Text style={styles.closeButtonText}>Close Settings</Text>
//                 </TouchableOpacity>
//             </ScrollView>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#2C2B29",
//     },
//     header: {
//         paddingTop: 20,
//         paddingBottom: 20,
//         alignItems: "center",
//         borderBottomWidth: 1,
//         borderBottomColor: "rgba(255,255,255,0.05)",
//     },
//     headerTitle: {
//         fontSize: 18,
//         fontWeight: "bold",
//         color: "#FFF",
//     },
//     content: {
//         padding: 20,
//     },
//     section: {
//         marginBottom: 30,
//         backgroundColor: "rgba(255,255,255,0.05)",
//         borderRadius: 12,
//         overflow: "hidden",
//     },
//     sectionTitle: {
//         fontSize: 14,
//         fontWeight: "600",
//         color: "#888",
//         marginLeft: 15,
//         marginTop: 15,
//         marginBottom: 10,
//         textTransform: "uppercase",
//     },
//     row: {
//         flexDirection: "row",
//         alignItems: "center",
//         paddingVertical: 15,
//         paddingHorizontal: 15,
//         borderTopWidth: 1,
//         borderTopColor: "rgba(255,255,255,0.05)",
//     },
//     rowIcon: {
//         width: 32,
//         height: 32,
//         borderRadius: 8,
//         backgroundColor: "rgba(255,255,255,0.1)",
//         alignItems: "center",
//         justifyContent: "center",
//         marginRight: 15,
//     },
//     rowText: {
//         flex: 1,
//         fontSize: 16,
//         color: "#FFF",
//         fontWeight: "500",
//     },
//     closeButton: {
//         marginTop: 20,
//         alignItems: "center",
//         padding: 15,
//     },
//     closeButtonText: {
//         color: "#81B64C",
//         fontSize: 16,
//         fontWeight: "bold",
//     },
// });

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fetchLevelData } from "./services/contentService";

const PROGRESS_KEY = "@JustLearnProgress";
const LEVEL_KEY = "@JustLearn:selectedLevel";
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function Settings() {
    const router = useRouter();
    const [levelModalVisible, setLevelModalVisible] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleResetAllProgress = () => {
        Alert.alert(
            "Reset All Progress",
            "Are you sure? This will erase ALL your test results and streak. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset All",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem(PROGRESS_KEY);
                            Alert.alert("Success", "All progress has been reset.");
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

    const confirmResetLevel = levelId => {
        Alert.alert(
            `Reset ${levelId} Progress`,
            `This will remove checks and scores for all tests in Level ${levelId}.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: () => performLevelReset(levelId),
                },
            ]
        );
    };

    const performLevelReset = async levelId => {
        setProcessing(true);
        try {
            // 1. Fetch level data to identify which tests belong to this level
            // We use fetchLevelData which handles offline/online automatically
            const levelData = await fetchLevelData(levelId);

            if (!levelData || !levelData.tests || levelData.tests.length === 0) {
                Alert.alert("Info", `No content found for Level ${levelId}, so no progress to reset.`);
                setProcessing(false);
                return;
            }

            const levelTestIds = levelData.tests.map(t => t.id);

            // 2. Get current progress
            const progressJson = await AsyncStorage.getItem(PROGRESS_KEY);
            if (!progressJson) {
                Alert.alert("Info", "No progress data found.");
                setProcessing(false);
                return;
            }

            const progress = JSON.parse(progressJson);
            let removedCount = 0;

            // 3. Filter out the keys that belong to this level
            levelTestIds.forEach(testId => {
                if (progress[testId]) {
                    delete progress[testId];
                    removedCount++;
                }
            });

            // 4. Save back
            await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

            setLevelModalVisible(false);

            // Give a small delay so the modal closes smoothly before the alert
            setTimeout(() => {
                Alert.alert("Success", `Reset progress for ${removedCount} tests in ${levelId}.`);
            }, 300);
        } catch (e) {
            console.error(`Failed to reset level ${levelId}`, e);
            Alert.alert(
                "Error",
                "Failed to reset level progress. Please check your connection if the content wasn't downloaded."
            );
        } finally {
            setProcessing(false);
        }
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

                    <TouchableOpacity style={styles.row} onPress={() => setLevelModalVisible(true)}>
                        <View style={[styles.rowIcon, { backgroundColor: "rgba(255, 68, 68, 0.1)" }]}>
                            <Ionicons name="layers-outline" size={22} color="#FF4444" />
                        </View>
                        <Text style={[styles.rowText, { color: "#FF4444" }]}>Reset Specific Level...</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row} onPress={handleResetAllProgress}>
                        <View style={[styles.rowIcon, { backgroundColor: "rgba(255, 68, 68, 0.1)" }]}>
                            <Ionicons name="trash-outline" size={22} color="#FF4444" />
                        </View>
                        <Text style={[styles.rowText, { color: "#FF4444" }]}>Reset ALL Progress</Text>
                    </TouchableOpacity>
                </View>

                {/* CLOSE BUTTON */}
                <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                    <Text style={styles.closeButtonText}>Close Settings</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* LEVEL SELECTION MODAL */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={levelModalVisible}
                onRequestClose={() => setLevelModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose Level to Reset</Text>
                            <TouchableOpacity onPress={() => setLevelModalVisible(false)} disabled={processing}>
                                <Ionicons name="close" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.levelGrid}>
                            {LEVELS.map(level => (
                                <TouchableOpacity
                                    key={level}
                                    style={styles.levelButton}
                                    onPress={() => confirmResetLevel(level)}
                                    disabled={processing}
                                >
                                    <Text style={styles.levelButtonText}>{level}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {processing && <Text style={styles.processingText}>Processing...</Text>}
                    </View>
                </View>
            </Modal>
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#383633",
        borderRadius: 16,
        padding: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    levelGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 10,
    },
    levelButton: {
        width: "47%",
        backgroundColor: "#rgba(255, 68, 68, 0.15)", // Reddish tint
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#FF4444",
        marginBottom: 10,
    },
    levelButtonText: {
        color: "#FF4444",
        fontSize: 18,
        fontWeight: "bold",
    },
    processingText: {
        color: "#888",
        textAlign: "center",
        marginTop: 10,
    },
});

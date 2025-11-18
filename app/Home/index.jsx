import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 1. Import Context and Modal
import ProModal from "../../components/ProModal";
import { useMembership } from "../contexts/MembershipContext";

export default function Home() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    // 2. Get Membership Status
    const { isPro } = useMembership();
    const [modalVisible, setModalVisible] = useState(false);

    const openDrawer = () => {
        navigation.toggleDrawer();
    };

    // 3. Updated Navigation Handler
    const handleNavigation = (page, isLocked) => {
        if (isLocked) {
            setModalVisible(true);
        } else {
            navigation.navigate(page);
        }
    };

    // Handler for the Modal's "Go Pro" button
    const handleGoPro = () => {
        setModalVisible(false);
        navigation.navigate("membership");
    };

    return (
        <>
            <View style={styles.container}>
                {/* Row 1 */}
                <View style={styles.pagesContainer}>
                    <TouchableOpacity style={styles.card} onPress={() => handleNavigation("tests", false)}>
                        <MaterialCommunityIcons name="lightbulb-question" size={80} color="#81B64C" />
                        <Text style={styles.cardText}>Tests</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={() => handleNavigation("learn", false)}>
                        <Ionicons name="book" size={80} color="#81B64C" />
                        <Text style={styles.cardText}>Learn</Text>
                    </TouchableOpacity>
                </View>

                {/* Row 2 */}
                <View style={styles.pagesContainer}>
                    {/* --- BOOKMARKS TILE (Locked logic applied here) --- */}
                    <TouchableOpacity
                        style={[styles.card, !isPro && styles.cardLocked]}
                        onPress={() => handleNavigation("Bookmarks", !isPro)}
                        activeOpacity={0.7}
                    >
                        {!isPro ? (
                            // Locked State Visuals
                            <View style={styles.lockedContent}>
                                <View style={styles.lockCircle}>
                                    <Ionicons name="lock-closed" size={40} color="#888" />
                                </View>
                                <Text style={styles.lockedLabel}>PRO</Text>
                            </View>
                        ) : (
                            // Unlocked State Visuals
                            <Ionicons name="bookmarks" size={80} color="#81B64C" />
                        )}
                        <Text style={[styles.cardText, !isPro && styles.textLocked]}>Bookmarks</Text>
                    </TouchableOpacity>
                    {/* -------------------------------------------------- */}

                    <TouchableOpacity style={styles.card} onPress={() => handleNavigation("options", false)}>
                        <Ionicons name="options" size={80} color="#81B64C" />
                        <Text style={styles.cardText}>Options</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 4. Add Pro Modal */}
            <ProModal visible={modalVisible} onClose={() => setModalVisible(false)} onGoPro={handleGoPro} />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#2C2B29",
    },
    pagesContainer: {
        height: "45%",
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    card: {
        backgroundColor: "#2C2B29",
        borderRadius: 25,
        height: "80%",
        width: "45%",
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#81B64C",
        borderWidth: 1,
        borderColor: "#81B64C",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 25,
    },
    // --- New Locked Styles ---
    cardLocked: {
        borderColor: "#555", // Grey border instead of green
        backgroundColor: "#2a2927",
        shadowColor: "#000", // Remove green glow
        shadowOpacity: 0.1,
    },
    lockedContent: {
        alignItems: "center",
        justifyContent: "center",
        height: 80, // Matches the icon size to keep layout stable
    },
    lockCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: "#555",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 5,
    },
    lockedLabel: {
        color: "#888",
        fontSize: 10,
        fontWeight: "bold",
        letterSpacing: 1,
    },
    textLocked: {
        color: "#888", // Dim text
    },
    // -------------------------
    cardText: {
        marginTop: 15,
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
});

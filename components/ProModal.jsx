import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";

const ProModal = ({ visible, onClose, onGoPro }) => {
    if (!visible) return null;

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Animatable.View animation="zoomIn" duration={300} style={styles.modalContainer}>
                    {/* Header Icon */}
                    <View style={styles.iconContainer}>
                        <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
                            <Ionicons name="rocket" size={50} color="#FFFFFF" />
                        </Animatable.View>
                    </View>

                    {/* Content */}
                    <Text style={styles.title}>Unlock Full Access</Text>
                    <Text style={styles.description}>
                        This content is locked. Upgrade to <Text style={styles.proText}>PRO</Text> to unlock all tests,
                        flashcards, and advanced statistics.
                    </Text>

                    {/* Buttons */}
                    <TouchableOpacity style={styles.goProButton} onPress={onGoPro}>
                        <Text style={styles.goProText}>Upgrade Now</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 5 }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Maybe Later</Text>
                    </TouchableOpacity>
                </Animatable.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.75)", // Dark dimming background
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "85%",
        backgroundColor: "#2C2B29",
        borderRadius: 20,
        padding: 25,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#444",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: "#81B64C", // Green Circle
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        marginTop: -50, // Pulls the icon up slightly out of the box
        borderWidth: 4,
        borderColor: "#2C2B29", // Matches modal bg to create a "cutout" effect
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 10,
        textAlign: "center",
    },
    description: {
        fontSize: 16,
        color: "#AAAAAA",
        textAlign: "center",
        marginBottom: 25,
        lineHeight: 22,
    },
    proText: {
        color: "#81B64C",
        fontWeight: "bold",
    },
    goProButton: {
        backgroundColor: "#81B64C",
        width: "100%",
        paddingVertical: 15,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
        shadowColor: "#81B64C",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    goProText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    cancelButton: {
        paddingVertical: 10,
    },
    cancelText: {
        color: "#888",
        fontSize: 14,
        fontWeight: "500",
    },
});

export default ProModal;

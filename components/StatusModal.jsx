import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";

const StatusModal = ({
    visible,
    type = "info", // success, error, question
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "OK",
    cancelText = "Cancel",
}) => {
    if (!visible) return null;

    // Dynamic Icon Logic
    const getIconData = () => {
        switch (type) {
            case "success":
                return { name: "checkmark", color: "#81B64C" };
            case "error":
                return { name: "close", color: "#FF4D4D" };
            case "question":
                return { name: "help", color: "#81B64C" };
            default:
                return { name: "information", color: "#81B64C" };
        }
    };
    const { name, color } = getIconData();

    const ModalContent = () => (
        <Animatable.View animation="zoomIn" duration={300} useNativeDriver={true} style={styles.modalCard}>
            {/* Header Icon */}
            <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: color }]}>
                    <Ionicons name={name} size={40} color="#FFFFFF" />
                </View>
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                {onCancel && (
                    <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                        <Text style={styles.cancelText}>{cancelText}</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        { backgroundColor: color, flex: onCancel ? 1 : 0, minWidth: onCancel ? 0 : 120 },
                    ]}
                    onPress={onConfirm}
                >
                    <Text style={styles.confirmText}>{confirmText}</Text>
                </TouchableOpacity>
            </View>
        </Animatable.View>
    );

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel || onConfirm}
            statusBarTranslucent={true}
        >
            {Platform.OS === "ios" ? (
                <BlurView intensity={25} tint="systemThickMaterialDark" style={styles.overlayContainer}>
                    <ModalContent />
                </BlurView>
            ) : (
                <View style={styles.androidOverlay}>
                    <ModalContent />
                </View>
            )}
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlayContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    androidOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
    },
    modalCard: {
        width: "85%",
        backgroundColor: "#2C2B29",
        borderRadius: 20,
        padding: 25,
        paddingTop: 45, // Room for icon
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
        position: "absolute",
        top: -40,
        justifyContent: "center",
        alignItems: "center",
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: "#2C2B29", // Matches modal bg for "cutout" effect
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 10,
        textAlign: "center",
    },
    message: {
        fontSize: 16,
        color: "#AAAAAA",
        textAlign: "center",
        marginBottom: 25,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "center",
        gap: 15,
    },
    confirmButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    confirmText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#555",
        flex: 1,
        alignItems: "center",
    },
    cancelText: {
        color: "#AAAAAA",
        fontSize: 16,
        fontWeight: "500",
    },
});

export default StatusModal;

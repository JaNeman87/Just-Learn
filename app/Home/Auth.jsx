


import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StatusModal from "../../components/StatusModal"; // 1. Import Modal
import { useAuth } from "../contexts/AuthContext";

export default function AuthScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { login, convertGuestToUser } = useAuth();

    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // 2. Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({ type: "info", title: "", message: "" });

    const showModal = (type, title, message, onConfirm) => {
        setModalConfig({ type, title, message, onConfirm });
        setModalVisible(true);
    };

    const handleAuth = async () => {
        if (!email || !password) {
            showModal("error", "Missing Info", "Please enter both email and password.");
            return;
        }

        setLoading(true);

        try {
            if (isRegistering) {
                await convertGuestToUser(email, password);
                showModal("success", "Account Saved", "Your progress has been linked! Please check your email.", () => {
                    setModalVisible(false);
                    router.back();
                });
            } else {
                await login(email, password);
                showModal("success", "Welcome Back", "You are successfully logged in.", () => {
                    setModalVisible(false);
                    router.back();
                });
            }
        } catch (error) {
            showModal("error", "Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.container, { paddingTop: insets.top }]}
        >
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.contentContainer}>
                {/* Header */}
                <Animatable.View animation="fadeInDown" duration={600} style={styles.header}>
                    <Ionicons name="person-circle-outline" size={80} color="#81B64C" />
                    <Text style={styles.title}>{isRegistering ? "Create Account" : "Welcome Back"}</Text>
                    <Text style={styles.subtitle}>
                        {isRegistering
                            ? "Sign up to sync your progress across devices."
                            : "Log in to access your Pro features and stats."}
                    </Text>
                </Animatable.View>

                {/* Form */}
                <Animatable.View animation="fadeInUp" delay={300} duration={600} style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            placeholderTextColor="#666"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#666"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity style={styles.authButton} onPress={handleAuth} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.authButtonText}>{isRegistering ? "Sign Up" : "Log In"}</Text>
                        )}
                    </TouchableOpacity>
                </Animatable.View>

                {/* Footer */}
                <Animatable.View animation="fadeInUp" delay={600} duration={600} style={styles.footer}>
                    <Text style={styles.footerText}>
                        {isRegistering ? "Already have an account?" : "Don't have an account?"}
                    </Text>
                    <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
                        <Text style={styles.footerLink}>{isRegistering ? " Log In" : " Sign Up"}</Text>
                    </TouchableOpacity>
                </Animatable.View>
            </View>

            {/* 3. Render Status Modal */}
            <StatusModal
                visible={modalVisible}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={() => {
                    if (modalConfig.onConfirm) modalConfig.onConfirm();
                    else setModalVisible(false);
                }}
                // Only show cancel if specifically asked (not needed for simple success/error)
                confirmText="OK"
            />
        </KeyboardAvoidingView>
    );
}
// styles remain the same as before ...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2B29",
    },
    closeButton: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 30,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginTop: 10,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#AAAAAA",
        textAlign: "center",
        paddingHorizontal: 20,
    },
    form: {
        width: "100%",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#383633",
        borderRadius: 12,
        marginBottom: 15,
        paddingHorizontal: 15,
        height: 55,
        borderWidth: 1,
        borderColor: "#444",
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 16,
        height: "100%",
    },
    authButton: {
        backgroundColor: "#81B64C",
        borderRadius: 12,
        height: 55,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#81B64C",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    authButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    forgotButton: {
        alignItems: "center",
        marginTop: 15,
    },
    forgotText: {
        color: "#888",
        fontSize: 14,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 40,
    },
    footerText: {
        color: "#AAAAAA",
        fontSize: 14,
    },
    footerLink: {
        color: "#81B64C",
        fontWeight: "bold",
        fontSize: 14,
    },
});

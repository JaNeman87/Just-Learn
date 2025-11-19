import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import { useAuth } from "../contexts/AuthContext";

export default function AuthScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { login, convertGuestToUser } = useAuth(); // Get actions

    // State
    const [isRegistering, setIsRegistering] = useState(false); // Toggle between Login/Signup
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // --- Action Handlers ---

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert("Missing Info", "Please enter both email and password.");
            return;
        }

        setLoading(true);

        try {
            if (isRegistering) {
                // KEY MOMENT: Convert the current Guest to a real User
                // This keeps their bookmarks/progress!
                await convertGuestToUser(email, password);

                Alert.alert(
                    "Account Saved",
                    "Your guest progress has been linked to this account! Please check your email to confirm.",
                    [{ text: "OK", onPress: () => router.back() }]
                );
            } else {
                // Standard Login (swaps the user on this device)
                await login(email, password);

                Alert.alert("Welcome Back", "You are successfully logged in.", [
                    { text: "OK", onPress: () => router.back() },
                ]);
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.container, { paddingTop: insets.top }]}
        >
            {/* Close Button */}
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
                    {/* Email Input */}
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

                    {/* Password Input */}
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

                    {/* Submit Button */}
                    <TouchableOpacity style={styles.authButton} onPress={handleAuth} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.authButtonText}>{isRegistering ? "Sign Up" : "Log In"}</Text>
                        )}
                    </TouchableOpacity>

                    {/* Forgot Password (Login only) */}
                    {!isRegistering && (
                        <TouchableOpacity
                            style={styles.forgotButton}
                            onPress={() => Alert.alert("Reset", "Magic Link Sent!")}
                        >
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    )}
                </Animatable.View>

                {/* Footer Toggle */}
                <Animatable.View animation="fadeInUp" delay={600} duration={600} style={styles.footer}>
                    <Text style={styles.footerText}>
                        {isRegistering ? "Already have an account?" : "Don't have an account?"}
                    </Text>
                    <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
                        <Text style={styles.footerLink}>{isRegistering ? " Log In" : " Sign Up"}</Text>
                    </TouchableOpacity>
                </Animatable.View>
            </View>
        </KeyboardAvoidingView>
    );
}

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

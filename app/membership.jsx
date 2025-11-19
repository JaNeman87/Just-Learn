// import { Ionicons } from "@expo/vector-icons";
// import { useNavigation } from "expo-router";
// import { useEffect } from "react";
// import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import * as Animatable from "react-native-animatable";

// // This is the array of features your "Pro" version unlocks
// const proFeatures = [
//     { icon: "key-outline", text: "Unlock all topics for A1, A2, B1, and B2" },
//     { icon: "albums-outline", text: "Access all Flashcard study decks" },
//     { icon: "bookmark-outline", text: "Save unlimited questions with Bookmarks" },
//     { icon: "stats-chart-outline", text: "Track your progress with advanced Statistics" },
//     { icon: "cloud-download-outline", text: "Offline mode for learning anywhere" },
// ];

// const MembershipScreen = () => {
//     const navigation = useNavigation();

//     // This function closes the modal
//     const handleClose = () => {
//         navigation.goBack();
//     };

//     // This is where you would trigger your in-app purchase logic
//     const handlePurchase = plan => {
//         console.log("User wants to buy:", plan);
//         // --- Add your RevenueCat or Expo IAP logic here ---
//     };

//     useEffect(() => {
//         console.log("nele");
//     }, []);

//     return (
//         <SafeAreaView style={styles.container}>
//             {/* --- 1. Close Button --- */}
//             <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
//                 <Ionicons name="close-circle" size={32} color="#555" />
//             </TouchableOpacity>

//             {/* --- 2. Scrollable Content --- */}
//             <ScrollView contentContainerStyle={styles.scrollContent}>
//                 <Animatable.View animation="pulse" iterationCount="infinite">
//                     <Ionicons name="rocket-outline" size={80} color="#81B64C" style={styles.heroIcon} />
//                 </Animatable.View>

//                 <Text style={styles.title}>Unlock Just Learn PRO</Text>
//                 <Text style={styles.subtitle}>Supercharge your learning and pass your exams with full access.</Text>

//                 <View style={styles.featuresList}>
//                     {proFeatures.map((feature, index) => (
//                         <Animatable.View
//                             key={index}
//                             animation="fadeInUp"
//                             duration={500}
//                             delay={300 + index * 100} // Staggered animation
//                             style={styles.featureRow}
//                         >
//                             <Ionicons name={feature.icon} size={24} color="#81B64C" />
//                             <Text style={styles.featureText}>{feature.text}</Text>
//                         </Animatable.View>
//                     ))}
//                 </View>
//             </ScrollView>

//             {/* --- 3. Bottom CTA (Call to Action) Buttons --- */}
//             <View style={styles.bottomContainer}>
//                 {/* Annual Plan (Best Value) */}
//                 <TouchableOpacity
//                     style={[styles.ctaButton, styles.ctaBestValue]}
//                     onPress={() => handlePurchase("annual")}
//                 >
//                     <View style={styles.bestValueBadge}>
//                         <Text style={styles.bestValueText}>BEST VALUE</Text>
//                     </View>
//                     <View style={styles.priceContainer}>
//                         <Text style={styles.ctaText}>Annual Subscription</Text>
//                         <Text style={styles.priceText}>$49.99 / year (Save 58%)</Text>
//                     </View>
//                 </TouchableOpacity>

//                 {/* Monthly Plan */}
//                 <TouchableOpacity
//                     style={[styles.ctaButton, styles.ctaMonthly]}
//                     onPress={() => handlePurchase("monthly")}
//                 >
//                     <View style={styles.priceContainer}>
//                         <Text style={styles.ctaText}>Monthly Subscription</Text>
//                         <Text style={styles.priceText}>$9.99 / month</Text>
//                     </View>
//                 </TouchableOpacity>

//                 <TouchableOpacity>
//                     <Text style={styles.restoreText}>Restore Purchase</Text>
//                 </TouchableOpacity>
//             </View>
//         </SafeAreaView>
//     );
// };

// // --- Styles ---
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#2C2B29",
//         justifyContent: "space-between",
//     },
//     scrollContent: {
//         paddingHorizontal: 30,
//         paddingTop: 80, // Make room for close button
//         alignItems: "center",
//     },
//     closeButton: {
//         position: "absolute",
//         top: 60, // Respects safe area
//         right: 20,
//         zIndex: 10,
//     },
//     heroIcon: {
//         marginBottom: 15,
//     },
//     title: {
//         fontSize: 28,
//         fontWeight: "bold",
//         color: "#FFFFFF",
//         textAlign: "center",
//         marginBottom: 10,
//     },
//     subtitle: {
//         fontSize: 18,
//         color: "#AAAAAA",
//         textAlign: "center",
//         marginBottom: 40,
//     },
//     // Feature List
//     featuresList: {
//         width: "100%",
//     },
//     featureRow: {
//         flexDirection: "row",
//         alignItems: "center",
//         backgroundColor: "#383633", // Your card color
//         padding: 15,
//         borderRadius: 10,
//         marginBottom: 10,
//     },
//     featureText: {
//         color: "#FFFFFF",
//         fontSize: 16,
//         marginLeft: 15,
//         flexShrink: 1, // Allow text to wrap
//     },
//     // Bottom Action Area
//     bottomContainer: {
//         padding: 20,
//         paddingTop: 10,
//         borderTopWidth: 1,
//         borderTopColor: "#383633",
//     },
//     ctaButton: {
//         width: "100%",
//         borderRadius: 15,
//         padding: 15,
//         marginBottom: 15,
//         alignItems: "center",
//     },
//     ctaBestValue: {
//         backgroundColor: "#81B64C", // Your green
//         position: "relative",
//         overflow: "visible", // Allow badge to pop out
//     },
//     priceContainer: {
//         alignItems: "center",
//     },
//     ctaText: {
//         color: "white",
//         fontSize: 18,
//         fontWeight: "bold",
//     },
//     priceText: {
//         color: "white",
//         fontSize: 14,
//         marginTop: 2,
//     },
//     bestValueBadge: {
//         position: "absolute",
//         top: -12,
//         alignSelf: "center",
//         backgroundColor: "#383633",
//         paddingHorizontal: 10,
//         paddingVertical: 3,
//         borderRadius: 5,
//         borderWidth: 1,
//         borderColor: "#81B64C",
//     },
//     bestValueText: {
//         color: "#81B64C",
//         fontSize: 12,
//         fontWeight: "bold",
//     },
//     ctaMonthly: {
//         backgroundColor: "#555", // Grey
//     },
//     restoreText: {
//         color: "#AAAAAA",
//         fontSize: 14,
//         textAlign: "center",
//         textDecorationLine: "underline",
//     },
// });

// export default MembershipScreen;

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";

// Import Auth Hook (Ensure you have this set up as discussed)
import { useAuth } from "./contexts/AuthContext";

const proFeatures = [
    { icon: "key-outline", text: "Unlock all topics for A1, A2, B1, and B2" },
    { icon: "albums-outline", text: "Access all Flashcard study decks" },
    { icon: "bookmark-outline", text: "Save unlimited questions with Bookmarks" },
    { icon: "stats-chart-outline", text: "Track your progress with advanced Statistics" },
    { icon: "cloud-download-outline", text: "Offline mode for learning anywhere" },
];

const MembershipScreen = () => {
    const router = useRouter();
    const { isGuest } = useAuth(); // Check if user is Guest

    const handleClose = () => {
        router.back();
    };

    // --- UPDATED: STRICT PURCHASE HANDLER ---
    const handlePurchase = plan => {
        if (isGuest) {
            Alert.alert(
                "Account Required",
                "To ensure your subscription is safe and can be restored on any device, you must create an account before purchasing.",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                    {
                        text: "Create Account",
                        onPress: () => router.push("/Home/Auth"),
                    },
                ]
            );
            return; // Stop here. Do not process purchase.
        }

        // If we are here, the user is Logged In. Safe to buy.
        performPurchase(plan);
    };

    const performPurchase = plan => {
        console.log(`Processing payment for ${plan}...`);
        // Add your RevenueCat / IAP logic here
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close-circle" size={32} color="#555" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Animatable.View animation="pulse" iterationCount="infinite">
                    <Ionicons name="rocket-outline" size={80} color="#81B64C" style={styles.heroIcon} />
                </Animatable.View>

                <Text style={styles.title}>Unlock Just Learn PRO</Text>
                <Text style={styles.subtitle}>Supercharge your learning and pass your exams with full access.</Text>

                <View style={styles.featuresList}>
                    {proFeatures.map((feature, index) => (
                        <Animatable.View
                            key={index}
                            animation="fadeInUp"
                            duration={500}
                            delay={300 + index * 100}
                            style={styles.featureRow}
                        >
                            <Ionicons name={feature.icon} size={24} color="#81B64C" />
                            <Text style={styles.featureText}>{feature.text}</Text>
                        </Animatable.View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.bottomContainer}>
                {/* Updated Warning Banner */}
                {isGuest && (
                    <TouchableOpacity style={styles.guestBanner} onPress={() => router.push("/Home/Auth")}>
                        <Ionicons name="lock-closed" size={16} color="#FFD700" />
                        <Text style={styles.guestBannerText}>Account required to purchase. Tap to Sign Up.</Text>
                        <Ionicons name="chevron-forward" size={16} color="#FFD700" />
                    </TouchableOpacity>
                )}

                {/* Annual Plan */}
                <TouchableOpacity
                    style={[styles.ctaButton, styles.ctaBestValue, isGuest && styles.ctaDisabled]}
                    onPress={() => handlePurchase("annual")}
                >
                    <View style={styles.bestValueBadge}>
                        <Text style={styles.bestValueText}>BEST VALUE</Text>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={styles.ctaText}>Annual Subscription</Text>
                        <Text style={styles.priceText}>$49.99 / year (Save 58%)</Text>
                    </View>
                </TouchableOpacity>

                {/* Monthly Plan */}
                <TouchableOpacity
                    style={[styles.ctaButton, styles.ctaMonthly, isGuest && styles.ctaDisabled]}
                    onPress={() => handlePurchase("monthly")}
                >
                    <View style={styles.priceContainer}>
                        <Text style={styles.ctaText}>Monthly Subscription</Text>
                        <Text style={styles.priceText}>$9.99 / month</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity>
                    <Text style={styles.restoreText}>Restore Purchase</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2B29",
        justifyContent: "space-between",
    },
    scrollContent: {
        paddingHorizontal: 30,
        paddingTop: 80,
        alignItems: "center",
    },
    closeButton: {
        position: "absolute",
        top: 60,
        right: 20,
        zIndex: 10,
    },
    heroIcon: {
        marginBottom: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: "#AAAAAA",
        textAlign: "center",
        marginBottom: 40,
    },
    featuresList: {
        width: "100%",
    },
    featureRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#383633",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    featureText: {
        color: "#FFFFFF",
        fontSize: 16,
        marginLeft: 15,
        flexShrink: 1,
    },
    bottomContainer: {
        padding: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#383633",
    },
    // Banner Styles
    guestBanner: {
        flexDirection: "row",
        backgroundColor: "rgba(255, 215, 0, 0.15)",
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "rgba(255, 215, 0, 0.3)",
    },
    guestBannerText: {
        color: "#FFD700",
        fontSize: 13,
        fontWeight: "600",
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
    },
    ctaButton: {
        width: "100%",
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        alignItems: "center",
    },
    // Optional: Visually dim buttons if guest (logic inside handlePurchase still protects them)
    ctaDisabled: {
        opacity: 0.8,
    },
    ctaBestValue: {
        backgroundColor: "#81B64C",
        position: "relative",
        overflow: "visible",
    },
    priceContainer: {
        alignItems: "center",
    },
    ctaText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    priceText: {
        color: "white",
        fontSize: 14,
        marginTop: 2,
    },
    bestValueBadge: {
        position: "absolute",
        top: -12,
        alignSelf: "center",
        backgroundColor: "#383633",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#81B64C",
    },
    bestValueText: {
        color: "#81B64C",
        fontSize: 12,
        fontWeight: "bold",
    },
    ctaMonthly: {
        backgroundColor: "#555",
    },
    restoreText: {
        color: "#AAAAAA",
        fontSize: 14,
        textAlign: "center",
        textDecorationLine: "underline",
    },
});

export default MembershipScreen;

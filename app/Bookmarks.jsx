// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// // 1. Import useFocusEffect from @react-navigation/native
// import { useFocusEffect } from "@react-navigation/native";
// // 2. Import useRouter from expo-router
// import { useRouter } from "expo-router";
// import React, { useState } from "react";
// import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// // 1. Adjust this import path to point to your questions file
// import { LANGUAGE_LEVELS } from "./services/mockData";

// const BOOKMARKS_KEY = "@JustLearnBookmarks";

// // --- Helper Function ---
// // Creates a "lookup map" (e.g., {"A1-T1-Q1": {...}, "A1-T1-Q2": {...}})
// // This is much faster than searching the deep array every time.
// // --- Helper Function ---
// // Creates a "lookup map" (e.g., {"A1-T1-Q1": {...}, "A1-T1-Q2": {...}})
// // This is much faster than searching the deep array every time.
// let allQuestionsMap = null;
// const getAllQuestionsMap = () => {
//     if (allQuestionsMap) return allQuestionsMap; // Don't rebuild if it exists

//     const map = {};
//     for (const level of Object.values(LANGUAGE_LEVELS)) {
//         // --- THIS IS THE FIX ---
//         // Check if level and level.tests actually exist before looping
//         if (level && level.tests) {
//             for (const test of level.tests) {
//                 // Add another safety check for questions
//                 if (test && test.questions) {
//                     for (const question of test.questions) {
//                         map[question.id] = question;
//                     }
//                 }
//             }
//         }
//         // --- END FIX ---
//     }
//     allQuestionsMap = map;
//     return allQuestionsMap;
// };
// // --- End Helper ---

// const Bookmarks = () => {
//     const router = useRouter();
//     const [loading, setLoading] = useState(true);
//     const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);

//     // useFocusEffect runs every time the user visits this screen
//     useFocusEffect(
//         React.useCallback(() => {
//             loadBookmarks();
//         }, [])
//     );

//     const loadBookmarks = async () => {
//         setLoading(true);
//         try {
//             const statsJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
//             const bookmarkIds = statsJson ? JSON.parse(statsJson) : [];

//             if (bookmarkIds.length === 0) {
//                 setBookmarkedQuestions([]);
//                 setLoading(false);
//                 return;
//             }

//             // Get the full question objects from the IDs
//             const questionMap = getAllQuestionsMap();
//             const questions = bookmarkIds.map(id => questionMap[id]).filter(Boolean); // Filter out any undefined/deleted questions

//             setBookmarkedQuestions(questions);
//         } catch (e) {
//             console.error("Failed to load bookmarks", e);
//         }
//         setLoading(false);
//     };

//     // Navigate to the test screen with a single question
//     const handleQuestionPress = question => {
//         // Create a temporary test object just for this one question
//         const singleQuestionTest = {
//             id: "bookmark-practice",
//             title: "Bookmarked Question",
//             questions: [question], // An array with just this one question
//         };

//         // 3. Use router.push with the full path
//         //    (Assuming your test screen is at app/(drawer)/Home/test.js)
//         router.push({
//             pathname: "/Home/test",
//             // Stringify the test object
//             params: { test: JSON.stringify(singleQuestionTest) },
//         });
//     };

//     // Clear all bookmarks
//     const handleClearBookmarks = () => {
//         Alert.alert("Clear All Bookmarks", "Are you sure you want to remove all saved questions?", [
//             { text: "Cancel", style: "cancel" },
//             {
//                 text: "Clear All",
//                 style: "destructive",
//                 onPress: async () => {
//                     await AsyncStorage.removeItem(BOOKMARKS_KEY);
//                     setBookmarkedQuestions([]);
//                 },
//             },
//         ]);
//     };

//     // --- Render Logic ---

//     if (loading) {
//         return (
//             <View style={styles.container}>
//                 <ActivityIndicator size="large" color="#81B64C" />
//             </View>
//         );
//     }

//     return (
//         <View style={styles.container}>
//             {bookmarkedQuestions.length === 0 ? (
//                 // --- Empty State ---
//                 <View style={styles.emptyContainer}>
//                     <Ionicons name="bookmark-outline" size={80} color="#555" />
//                     <Text style={styles.emptyText}>No Bookmarks Yet</Text>
//                     <Text style={styles.emptySubtext}>
//                         Tap the bookmark icon on a question to save it here for review.
//                     </Text>
//                 </View>
//             ) : (
//                 // --- Bookmarks List ---
//                 <>
//                     <ScrollView style={{ width: "100%" }}>
//                         {bookmarkedQuestions.map(question => (
//                             <TouchableOpacity
//                                 key={question.id}
//                                 style={styles.bookmarkItem}
//                                 onPress={() => handleQuestionPress(question)}
//                             >
//                                 <Text style={styles.bookmarkText}>{question.questionText}</Text>
//                                 <Ionicons name="chevron-forward" size={20} color="#81B64C" />
//                             </TouchableOpacity>
//                         ))}
//                     </ScrollView>

//                     {/* --- Clear Button --- */}
//                     <TouchableOpacity style={styles.clearButton} onPress={handleClearBookmarks}>
//                         <Text style={styles.clearButtonText}>Clear All Bookmarks</Text>
//                     </TouchableOpacity>
//                 </>
//             )}
//         </View>
//     );
// };

// export default Bookmarks;

// // --- Styles ---
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#2C2B29",
//         alignItems: "center",
//         justifyContent: "center",
//     },
//     // --- List Styles ---
//     bookmarkItem: {
//         backgroundColor: "#383633",
//         padding: 20,
//         borderRadius: 8,
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         width: "90%",
//         alignSelf: "center",
//         marginTop: 15,
//     },
//     bookmarkText: {
//         color: "#FFFFFF",
//         fontSize: 16,
//         fontWeight: "500",
//         flex: 1, // Ensures text wraps and doesn't push the icon off-screen
//         marginRight: 10,
//     },
//     clearButton: {
//         backgroundColor: "#D93025",
//         padding: 20,
//         borderRadius: 8,
//         width: "90%",
//         alignItems: "center",
//         marginVertical: 20,
//     },
//     clearButtonText: {
//         color: "#FFFFFF",
//         fontSize: 18,
//         fontWeight: "bold",
//     },
//     // --- Empty State Styles ---
//     emptyContainer: {
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//         paddingHorizontal: 40,
//     },
//     emptyText: {
//         fontSize: 22,
//         fontWeight: "bold",
//         color: "#FFF",
//         marginTop: 10,
//     },
//     emptySubtext: {
//         fontSize: 16,
//         color: "#AAAAAA",
//         textAlign: "center",
//         marginTop: 10,
//     },
// });

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // 1. Import SafeAreaView

// 1. Adjust this import path to point to your questions file
import { LANGUAGE_LEVELS } from "./services/mockData";

const BOOKMARKS_KEY = "@JustLearnBookmarks";

// --- Helper Functions ---
const shuffle = array => [...array].sort(() => Math.random() - 0.5);

let allQuestionsMap = null;
const getAllQuestionsMap = () => {
    if (allQuestionsMap) return allQuestionsMap;

    const map = {};
    for (const level of Object.values(LANGUAGE_LEVELS)) {
        if (level && level.tests) {
            for (const test of level.tests) {
                if (test && test.questions) {
                    for (const question of test.questions) {
                        map[question.id] = question;
                    }
                }
            }
        }
    }
    allQuestionsMap = map;
    return allQuestionsMap;
};

const Bookmarks = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
    const hasBookmarks = bookmarkedQuestions.length > 0;

    useFocusEffect(
        React.useCallback(() => {
            loadBookmarks();
        }, [])
    );

    const loadBookmarks = async () => {
        setLoading(true);
        try {
            const statsJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
            const bookmarkIds = statsJson ? JSON.parse(statsJson) : [];

            if (bookmarkIds.length === 0) {
                setBookmarkedQuestions([]);
                setLoading(false);
                return;
            }

            const questionMap = getAllQuestionsMap();
            const questions = bookmarkIds.map(id => questionMap[id]).filter(Boolean);

            setBookmarkedQuestions(questions);
        } catch (e) {
            console.error("Failed to load bookmarks", e);
        }
        setLoading(false);
    };

    const handleQuestionPress = question => {
        const singleQuestionTest = {
            id: "bookmark-practice-single",
            title: "Bookmarked Question",
            questions: [question],
        };
        router.push({
            pathname: "/Home/test",
            params: { test: JSON.stringify(singleQuestionTest), origin: "Bookmarks" },
        });
    };

    const handleStartPracticeSession = () => {
        if (!hasBookmarks) return;
        const practiceTest = {
            id: "bookmark-practice-all",
            title: "Bookmarks Practice",
            questions: shuffle(bookmarkedQuestions),
        };
        router.push({
            pathname: "/Home/test",
            params: { test: JSON.stringify(practiceTest), origin: "Bookmarks" },
        });
    };

    const handleClearBookmarks = () => {
        Alert.alert("Clear All Bookmarks", "Are you sure you want to remove all saved questions?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Clear All",
                style: "destructive",
                onPress: async () => {
                    await AsyncStorage.removeItem(BOOKMARKS_KEY);
                    setBookmarkedQuestions([]);
                },
            },
        ]);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#81B64C" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {bookmarkedQuestions.length === 0 ? (
                // --- Empty State ---
                <View style={styles.emptyContainer}>
                    <Ionicons name="bookmark-outline" size={80} color="#555" />
                    <Text style={styles.emptyText}>No Bookmarks Yet</Text>
                    <Text style={styles.emptySubtext}>
                        Tap the bookmark icon on a question to save it here for review.
                    </Text>
                </View>
            ) : (
                // --- Bookmarks List ---
                <>
                    {/* --- 2. This ScrollView contains the list --- */}
                    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
                        {bookmarkedQuestions.map(question => (
                            <TouchableOpacity
                                key={question.id}
                                style={styles.bookmarkItem}
                                onPress={() => handleQuestionPress(question)}
                            >
                                <Text style={styles.bookmarkText}>{question.questionText}</Text>
                                <Ionicons name="chevron-forward" size={20} color="#81B64C" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* --- 3. This View contains the buttons at the bottom --- */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.startPracticeButton} onPress={handleStartPracticeSession}>
                            <Ionicons name="play" size={20} color="white" />
                            <Text style={styles.startPracticeButtonText}>
                                Start Practice ({bookmarkedQuestions.length})
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.clearButton} onPress={handleClearBookmarks}>
                            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
};

export default Bookmarks;

// --- 4. UPDATED STYLES ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2B29",
        justifyContent: "space-between", // This is the key
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#2C2B29",
        alignItems: "center",
        justifyContent: "center",
    },
    // --- ScrollView Styles ---
    scrollContainer: {
        flex: 1, // Takes up the available space
    },
    scrollContent: {
        padding: 20, // Padding for the list items
    },
    // --- Action Button Styles ---
    actionsContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20, // Padding for the bottom bar
        borderTopWidth: 1,
        borderTopColor: "#383633",
    },
    startPracticeButton: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#81B64C",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    startPracticeButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
    clearButton: {
        backgroundColor: "#D93025",
        padding: 15, // Make it a square-ish button
        borderRadius: 8,
        alignItems: "center",
    },
    clearButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    // --- List Styles ---
    bookmarkItem: {
        backgroundColor: "#383633",
        padding: 20,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%", // Takes full width of ScrollView padding
        alignSelf: "center",
        marginBottom: 15,
    },
    bookmarkText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "500",
        flex: 1,
        marginRight: 10,
    },
    // --- Empty State Styles ---
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFF",
        marginTop: 10,
    },
    emptySubtext: {
        fontSize: 16,
        color: "#AAAAAA",
        textAlign: "center",
        marginTop: 10,
    },
});

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 2. Import the new service
import { fetchQuestionsByIds } from "../services/contentService";

const BOOKMARKS_KEY = "@JustLearnBookmarks";

// Helper to shuffle practice questions
const shuffle = array => [...array].sort(() => Math.random() - 0.5);

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
            // 1. Get IDs from Local Storage
            const statsJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
            const bookmarkIds = statsJson ? JSON.parse(statsJson) : [];

            if (bookmarkIds.length === 0) {
                setBookmarkedQuestions([]);
                setLoading(false);
                return;
            }

            // 2. Fetch only these questions from Supabase
            const questions = await fetchQuestionsByIds(bookmarkIds);
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
                <View style={styles.emptyContainer}>
                    <Ionicons name="bookmark-outline" size={80} color="#555" />
                    <Text style={styles.emptyText}>No Bookmarks Yet</Text>
                    <Text style={styles.emptySubtext}>
                        Tap the bookmark icon on a question to save it here for review.
                    </Text>
                </View>
            ) : (
                <>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2B29",
        justifyContent: "space-between",
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#2C2B29",
        alignItems: "center",
        justifyContent: "center",
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    actionsContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
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
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    bookmarkItem: {
        backgroundColor: "#383633",
        padding: 20,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
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

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { useMembership } from "../contexts/MembershipContext";

// Helper to shuffle array
const shuffle = array => [...array].sort(() => Math.random() - 0.5);
const BOOKMARKS_KEY = "@JustLearnBookmarks";

const FlashcardScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { questions } = route.params;
    const { isPro } = useMembership();

    const [studyDeck, setStudyDeck] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [flipAnim] = useState(new Animated.Value(0));

    const buttonsRef = useRef(null);

    const currentCard = studyDeck.length > 0 && currentIndex < studyDeck.length ? studyDeck[currentIndex] : null;

    // Helper to Speak
    const speak = (text, language = 'de') => {
        Speech.stop();
        Speech.speak(text, {
            language: language,
            pitch: 1.0,
            rate: 0.9, 
        });
    };

    useEffect(() => {
        if (!questions) {
            navigation.goBack();
            return;
        }
        const filtered = questions.filter(q => q.type === "standard" || q.type === "sentence" || !q.type);
        const shuffledDeck = shuffle(filtered);
        setStudyDeck(shuffledDeck);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsAnimating(false);
    }, [questions]);

    useEffect(() => {
        const timer = setTimeout(() => setIsAnimating(false), 300);
        return () => clearTimeout(timer);
    }, [currentIndex]);

    useEffect(() => {
        if (!currentCard) return;
        const loadBookmarkStatus = async () => {
            try {
                const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
                const bookmarks = bookmarksJson ? JSON.parse(bookmarksJson) : [];
                setIsBookmarked(bookmarks.includes(currentCard.id));
            } catch (e) {
                console.error("Failed to load bookmarks", e);
            }
        };
        loadBookmarkStatus();
    }, [currentCard]);

    const handleBookmarkToggle = async () => {
        if (!currentCard) return;
        const newBookmarkState = !isBookmarked;
        setIsBookmarked(newBookmarkState);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
            let bookmarks = bookmarksJson ? JSON.parse(bookmarksJson) : [];
            if (newBookmarkState) {
                if (!bookmarks.includes(currentCard.id)) {
                    bookmarks.push(currentCard.id);
                }
            } else {
                bookmarks = bookmarks.filter(id => id !== currentCard.id);
            }
            await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
        } catch (e) {
            console.error("Failed to save bookmarks", e);
            setIsBookmarked(!newBookmarkState);
        }
    };

    const flipCard = () => {
        if (isFlipped) {
            // Flip Back to Front
            Animated.spring(flipAnim, {
                toValue: 0,
                friction: 8,
                tension: 10,
                useNativeDriver: true,
            }).start();
        } else {
            // Flip Front to Back
            Animated.spring(flipAnim, {
                toValue: 180,
                friction: 8,
                tension: 10,
                useNativeDriver: true,
            }).start();
            
            // --- AUTO-SPEAK REMOVED (As requested) ---
            // It will only speak when you press the button now.
        }
        setIsFlipped(!isFlipped);
    };

    // --- NEW: Smart Speak Handler ---
    const handleSpeakBack = (e) => {
        e.stopPropagation(); 
        
        if (currentCard.type === 'sentence') {
            const germanSentence = currentCard.correctSentence.join(" ");
            speak(germanSentence);
        } else {
            // Standard Card
            const correctAnswer = currentCard.options[currentCard.correctAnswerIndex];
            let textToSpeak = currentCard.questionText;

            // FIX: Replace underscores with the actual answer so it speaks a full sentence
            if (textToSpeak.includes("___")) {
                textToSpeak = textToSpeak.replace(/_+/g, correctAnswer);
            }
            
            speak(textToSpeak);
        }
    };

    const handleAnswer = knewIt => {
        if (isAnimating) return;
        setIsAnimating(true);
        const currentCard = studyDeck[currentIndex];
        if (buttonsRef.current) {
            buttonsRef.current.fadeOutDown(200).then(() => {
                setIsFlipped(false);
                flipAnim.setValue(0);
                
                if (!knewIt) {
                    setStudyDeck(prev => [...prev, currentCard]);
                }
                setCurrentIndex(prev => prev + 1);
            });
        } else {
             setIsFlipped(false);
             flipAnim.setValue(0);
             if (!knewIt) setStudyDeck(prev => [...prev, currentCard]);
             setCurrentIndex(prev => prev + 1);
        }
    };

    const frontInterpolate = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ["0deg", "180deg"],
    });
    const backInterpolate = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ["180deg", "360deg"],
    });
    const frontOpacity = flipAnim.interpolate({
        inputRange: [89, 90],
        outputRange: [1, 0],
    });
    const backOpacity = flipAnim.interpolate({
        inputRange: [89, 90],
        outputRange: [0, 1],
    });

    if (!currentCard || currentIndex >= studyDeck.length) {
        return (
            <View style={styles.container}>
                <View style={styles.completeContainer}>
                    <Animatable.Text animation="pulse" iterationCount="infinite" style={styles.completeIcon}>
                        🎉
                    </Animatable.Text>
                    <Text style={styles.completeTitle}>Session Complete!</Text>
                    <Text style={styles.completeSubtitle}>You've reviewed all the cards in this topic.</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Back to Topics</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    let correctAnswerText = "";
    let questionText = currentCard.questionText || "";
    const isFillInTheBlank = questionText.includes("___");

    if (currentCard.type === "sentence") {
        correctAnswerText = currentCard.correctSentence.join(" ");
    } else if (currentCard.type === "standard" || !currentCard.type) {
        correctAnswerText = currentCard.options[currentCard.correctAnswerIndex];
    }

    let questionPart1, questionPart2;
    if (isFillInTheBlank) {
        const questionParts = currentCard.questionText.split("___");
        questionPart1 = questionParts[0];
        questionPart2 = questionParts[1] || "";
    }

    const totalCards = studyDeck.length;
    const currentCardNumber = currentIndex + 1;
    const progressPercent = (currentCardNumber / totalCards) * 100;

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.bookmarkContainer}>
                    <TouchableOpacity onPress={handleBookmarkToggle} style={styles.bookmarkButton}>
                        <Ionicons
                            name={isBookmarked ? "bookmark" : "bookmark-outline"}
                            size={28}
                            color={isBookmarked ? "#81B64C" : "#FFFFFF"}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                        Card {currentCardNumber} / {totalCards}
                    </Text>
                    <View style={styles.progressBarTrack}>
                        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                    </View>
                </View>

                <View style={{ width: "100%", minHeight: 400 }}>
                    <TouchableOpacity activeOpacity={1} onPress={flipCard} style={styles.touchableArea}>
                        {/* --- FRONT SIDE --- */}
                        <Animated.View
                            style={[
                                styles.card,
                                styles.cardFront,
                                { transform: [{ rotateY: frontInterpolate }], opacity: frontOpacity },
                            ]}
                        >
                            {currentCard.type === "sentence" ? (
                                <View style={styles.questionContainer}>
                                    <Text style={styles.questionText}>(Translate this sentence)</Text>
                                    <Text style={styles.englishSentence}>"{currentCard.englishText}"</Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.questionContainer}>
                                        <Text style={styles.questionText}>{currentCard.questionText}</Text>
                                    </View>
                                    {/* Front Speaker REMOVED */}

                                    <View style={styles.optionsContainer}>
                                        {currentCard.options && currentCard.options.map((option, index) => (
                                            <View key={index} style={styles.optionButton}>
                                                <Text style={styles.optionText}>{option}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </>
                            )}
                            <Text style={styles.cardHint}>(Tap to flip)</Text>
                        </Animated.View>

                        {/* --- BACK SIDE --- */}
                        <Animated.View
                            style={[
                                styles.card,
                                styles.cardBack,
                                { transform: [{ rotateY: backInterpolate }], opacity: backOpacity },
                            ]}
                        >
                            {currentCard.type === "sentence" ? (
                                <View style={styles.questionContainer}>
                                    <Text style={styles.cardTextBack}>{correctAnswerText}</Text>
                                    {/* Speaker for Sentence Back */}
                                    <TouchableOpacity 
                                        style={styles.speakerButton} 
                                        onPress={handleSpeakBack}
                                    >
                                        <Ionicons name="volume-high" size={24} color="#81B64C" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.questionContainer}>
                                        {isFillInTheBlank ? (
                                            <Text style={styles.questionText}>
                                                {questionPart1}
                                                <Text style={styles.filledCorrectText}>{correctAnswerText}</Text>
                                                {questionPart2}
                                            </Text>
                                        ) : (
                                            <Text style={styles.questionText}>{currentCard.questionText}</Text>
                                        )}
                                    </View>
                                    {/* Speaker for Standard Back with Smart Replacement */}
                                    <TouchableOpacity 
                                        style={styles.speakerButton} 
                                        onPress={handleSpeakBack}
                                    >
                                        <Ionicons name="volume-high" size={24} color="#81B64C" />
                                    </TouchableOpacity>

                                    <View style={styles.optionsContainer}>
                                        {currentCard.options && currentCard.options.map((option, index) => (
                                            <View
                                                key={index}
                                                style={
                                                    index === currentCard.correctAnswerIndex
                                                        ? styles.correctOption
                                                        : styles.disabledOption
                                                }
                                            >
                                                <Text style={styles.optionText}>{option}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </>
                            )}
                            <Text style={styles.cardHint}>(Tap to flip)</Text>
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {isFlipped && (
                <Animatable.View ref={buttonsRef} animation="fadeInUp" duration={300} style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.unknownButton]}
                        onPress={() => handleAnswer(false)}
                        disabled={isAnimating}
                    >
                        <Ionicons name="close" size={32} color="white" />
                        <Text style={styles.buttonText}>I didn't know</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.knownButton]}
                        onPress={() => handleAnswer(true)}
                        disabled={isAnimating}
                    >
                        <Ionicons name="checkmark" size={32} color="white" />
                        <Text style={styles.buttonText}>I knew it</Text>
                    </TouchableOpacity>
                </Animatable.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2B29",
        justifyContent: "space-between",
        paddingTop: 60,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    bookmarkContainer: {
        width: "100%",
        alignItems: "flex-end",
        marginBottom: 10,
    },
    bookmarkButton: {
        padding: 5,
    },
    progressContainer: {
        width: "100%",
        marginBottom: 20,
    },
    progressText: {
        color: "#AAAAAA",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 5,
    },
    progressBarTrack: {
        height: 10,
        width: "100%",
        backgroundColor: "#383633",
        borderRadius: 5,
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#81B64C",
        borderRadius: 5,
    },
    touchableArea: {
        width: '100%',
        minHeight: 400,
    },
    card: {
        width: "100%",
        minHeight: 400,
        backgroundColor: "#383633",
        borderRadius: 20,
        justifyContent: "flex-start",
        alignItems: "center",
        backfaceVisibility: "hidden",
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardFront: {
        position: 'absolute',
        top: 0,
    },
    cardBack: {
        position: 'absolute',
        top: 0,
    },
    cardHint: {
        color: "#AAAAAA",
        fontSize: 14,
        fontStyle: "italic",
        marginTop: 20,
    },
    speakerButton: {
        marginVertical: 15,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 50,
    },
    questionContainer: {
        width: "100%",
        paddingVertical: 20,
        paddingHorizontal: 15,
        marginTop: 20,
        backgroundColor: "transparent",
        borderRadius: 10,
        alignItems: "center",
    },
    questionText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
    },
    englishSentence: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 10,
    },
    filledCorrectText: {
        color: "#81B64C",
        fontWeight: "bold",
        textDecorationLine: "underline",
    },
    optionsContainer: {
        width: "100%",
        marginTop: 10,
    },
    optionButton: {
        backgroundColor: "transparent",
        padding: 15,
        borderRadius: 8,
        width: "100%",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#555",
    },
    correctOption: {
        backgroundColor: "#81B64C",
        padding: 15,
        borderRadius: 8,
        width: "100%",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#81B64C",
    },
    disabledOption: {
        backgroundColor: "transparent",
        padding: 15,
        borderRadius: 8,
        width: "100%",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#555",
        opacity: 0.5,
    },
    optionText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "500",
        textAlign: "center",
    },
    cardTextBack: {
        color: "#81B64C",
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        padding: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 15,
    },
    knownButton: {
        backgroundColor: "#81B64C",
    },
    unknownButton: {
        backgroundColor: "#D93025",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10,
    },
    completeContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    completeIcon: {
        fontSize: 100,
    },
    completeTitle: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#81B64C",
        marginTop: 20,
    },
    completeSubtitle: {
        fontSize: 18,
        color: "#AAAAAA",
        marginTop: 10,
        textAlign: "center",
        paddingHorizontal: 20,
    },
    backButton: {
        backgroundColor: "#383633",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginTop: 40,
    },
    backButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default FlashcardScreen;
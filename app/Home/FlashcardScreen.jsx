

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Audio } from 'expo-av'; // 1. Audio
import * as Haptics from "expo-haptics";
import * as Speech from 'expo-speech'; // 2. Speech
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";

import StatusModal from "../../components/StatusModal"; // 4. Status Modal
import { useMembership } from "../contexts/MembershipContext";
import { transcribeAudio } from "../services/aiService"; // 3. AI Service

// Helper to shuffle array
const shuffle = array => [...array].sort(() => Math.random() - 0.5);
const { width } = Dimensions.get("window");

const BOOKMARKS_KEY = "@JustLearnBookmarks";

const FlashcardScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { questions } = route.params;
    const { isPro, updateProgress } = useMembership();

    const [studyDeck, setStudyDeck] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // --- RECORDING STATE ---
    const [isRecording, setIsRecording] = useState(false);
    const [processingSpeech, setProcessingSpeech] = useState(false);
    const [speechResult, setSpeechResult] = useState(null); 
    
    // Status Modal
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [statusConfig, setStatusConfig] = useState({ 
        type: "info", title: "", message: "", confirmText: "OK" 
    });

    const recordingRef = useRef(null);
    const buttonsRef = useRef(null);

    const currentCard = studyDeck.length > 0 && currentIndex < studyDeck.length ? studyDeck[currentIndex] : null;

    // --- SPEECH HELPER ---
    const speak = (text, language = 'de') => {
        Speech.stop();
        Speech.speak(text, {
            language: language,
            pitch: 1.0,
            rate: 0.9, 
        });
    };

    // --- PERMISSIONS ---
    useEffect(() => {
        (async () => {
            const { status } = await Audio.requestPermissionsAsync();
            if (status === 'granted') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
            }
        })();
    }, []);

    // --- UPDATES ---
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
        if (studyDeck.length > 0 && currentIndex >= studyDeck.length) {
            updateProgress(20);
        }
    }, [currentIndex, studyDeck.length]);

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
        setSpeechResult(null); // Reset speech result on new card
    }, [currentCard]);

    // --- RECORDING LOGIC ---
    const toggleRecording = async () => {
        if (isRecording) {
            await stopRecording();
        } else {
            await startRecording();
        }
    };

    const startRecording = async () => {
        if (!isPro) {
            Alert.alert("Pro Feature", "Pronunciation practice is available for Pro members.");
            return;
        }
        setSpeechResult(null); 
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsRecording(true); 

        try {
            if (recordingRef.current) {
                try { await recordingRef.current.stopAndUnloadAsync(); } catch (e) {}
                recordingRef.current = null;
            }
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            recordingRef.current = recording;
        } catch (err) {
            console.error('Failed to start recording', err);
            setIsRecording(false);
        }
    };

    const stopRecording = async () => {
        setIsRecording(false); 
        const activeRecording = recordingRef.current;
        if (!activeRecording) return;

        setProcessingSpeech(true);
        recordingRef.current = null; 

        try {
            await activeRecording.stopAndUnloadAsync();
            const uri = activeRecording.getURI(); 
            const spokenText = await transcribeAudio(uri);
            
            if (spokenText) {
                const cleanSpoken = spokenText.toLowerCase().replace(/[.,!?]/g, "").trim();
                
                let targetText = currentCard.type === 'sentence' 
                    ? currentCard.correctSentence.join(" ") 
                    : currentCard.questionText;
                
                if (targetText.includes("___")) {
                     const answer = currentCard.options[currentCard.correctAnswerIndex];
                     targetText = targetText.replace(/_+/g, answer);
                }
                const cleanTarget = targetText.toLowerCase().replace(/[.,!?]/g, "").trim();

                if (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken)) {
                    setSpeechResult('correct');
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } else {
                    setSpeechResult('incorrect');
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    setStatusConfig({ type: 'error', title: 'Try Again', message: `You said: "${spokenText}"`, confirmText: 'OK' });
                    setStatusModalVisible(true);
                }
            }
        } catch (error) {
             if (!error.message?.includes("no valid audio data")) {
                console.error("Stop Recording Error:", error);
                setStatusConfig({ type: 'error', title: 'Error', message: 'Could not process audio.', confirmText: 'OK' });
                setStatusModalVisible(true);
            }
        }
        setProcessingSpeech(false);
    };

    const handleBookmarkToggle = async () => {
        if (!currentCard) return;
        const newBookmarkState = !isBookmarked;
        setIsBookmarked(newBookmarkState);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
            let bookmarks = bookmarksJson ? JSON.parse(bookmarksJson) : [];
            if (newBookmarkState) {
                if (!bookmarks.includes(currentCard.id)) bookmarks.push(currentCard.id);
            } else {
                bookmarks = bookmarks.filter(id => id !== currentCard.id);
            }
            await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
        } catch (e) {
            console.error("Failed to save bookmarks", e);
            setIsBookmarked(!newBookmarkState);
        }
    };

    const handleFlip = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        if (isFlipped && buttonsRef.current) {
            buttonsRef.current.fadeOutDown(200);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsFlipped(!isFlipped);
        setTimeout(() => setIsAnimating(false), 300);
    };

    // --- NEW: Handle Speaker Click ---
    const handleSpeakBack = (e) => {
        e.stopPropagation(); // Prevent card flip
        if (currentCard.type === 'sentence') {
            speak(currentCard.correctSentence.join(" "));
        } else {
            let textToSpeak = currentCard.questionText;
            const correctAnswer = currentCard.options[currentCard.correctAnswerIndex];
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
        
        const next = () => {
            setIsFlipped(false);
            if (!knewIt) {
                setStudyDeck(prev => [...prev, currentCard]);
            }
            setCurrentIndex(prev => prev + 1);
        };

        if (buttonsRef.current) {
            buttonsRef.current.fadeOutDown(200).then(next);
        } else {
            next();
        }
    };

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

                <Animatable.View
                    style={{ width: "100%" }}
                    key={currentIndex}
                    animation="fadeIn"
                    duration={300}
                    useNativeDriver={true}
                >
                    <TouchableOpacity style={styles.card} activeOpacity={1} onPress={handleFlip} disabled={isAnimating}>
                        {!isFlipped ? (
                            // --- CARD FRONT ---
                            <Animatable.View key="front" animation="flipInY" duration={300} style={styles.cardFace}>
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
                                        {/* No Audio Button Here */}
                                        <View style={styles.optionsContainer}>
                                            {currentCard.options.map((option, index) => (
                                                <View key={index} style={styles.optionButton}>
                                                    <Text style={styles.optionText}>{option}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </>
                                )}
                                <Text style={styles.cardHint}>(Tap to flip)</Text>
                            </Animatable.View>
                        ) : (
                            // --- CARD BACK ---
                            <Animatable.View key="back" animation="flipInY" duration={300} style={styles.cardFace}>
                                {currentCard.type === "sentence" ? (
                                    <View style={styles.questionContainer}>
                                        <Text style={styles.cardTextBack}>{correctAnswerText}</Text>
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
                                        
                                        <View style={styles.optionsContainer}>
                                            {currentCard.options.map((option, index) => (
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
                                
                                {/* --- AUDIO CONTROLS (Speaker + Mic) --- */}
                                <View style={styles.audioRow}>
                                    <TouchableOpacity style={styles.speakerButton} onPress={handleSpeakBack}>
                                        <Ionicons name="volume-high" size={24} color="#81B64C" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.micButton, 
                                            isRecording && styles.micButtonActive,
                                            speechResult === 'correct' && styles.micButtonCorrect,
                                            speechResult === 'incorrect' && styles.micButtonIncorrect
                                        ]}
                                        onPress={toggleRecording}
                                        activeOpacity={0.7}
                                    >
                                        {processingSpeech ? (
                                            <ActivityIndicator size="small" color="#FFF" />
                                        ) : (
                                            <Ionicons 
                                                name={speechResult === 'correct' ? "checkmark" : speechResult === 'incorrect' ? "close" : isRecording ? "stop" : "mic"} 
                                                size={28} 
                                                color="#FFF" 
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.cardHint}>(Tap to flip)</Text>
                            </Animatable.View>
                        )}
                    </TouchableOpacity>
                </Animatable.View>
            </ScrollView>

            {/* Action Buttons */}
            {isFlipped && (
                <Animatable.View ref={buttonsRef} animation="fadeInUp" duration={500} style={styles.buttonContainer}>
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

            {/* Status Modal */}
            <StatusModal 
                visible={statusModalVisible}
                type={statusConfig.type}
                title={statusConfig.title}
                message={statusConfig.message}
                confirmText={statusConfig.confirmText}
                onConfirm={() => setStatusModalVisible(false)}
            />
        </View>
    );
};

// --- Styles ---
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
    cardFace: {
        width: "100%",
        backfaceVisibility: "hidden",
        alignItems: "center",
    },
    cardHint: {
        color: "#AAAAAA",
        fontSize: 14,
        fontStyle: "italic",
        marginTop: 20,
    },
    questionContainer: {
        width: "100%",
        paddingVertical: 20,
        paddingHorizontal: 15,
        marginTop: 20,
        backgroundColor: "transparent",
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 40,
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
    },
    optionButton: {
        backgroundColor: "transparent",
        padding: 20,
        borderRadius: 8,
        width: "100%",
        marginBottom: 15,
        borderWidth: 2,
        borderColor: "#555",
    },
    correctOption: {
        backgroundColor: "#81B64C",
        padding: 20,
        borderRadius: 8,
        width: "100%",
        marginBottom: 15,
        borderWidth: 2,
        borderColor: "#81B64C",
    },
    disabledOption: {
        backgroundColor: "transparent",
        padding: 20,
        borderRadius: 8,
        width: "100%",
        marginBottom: 15,
        borderWidth: 2,
        borderColor: "#555",
        opacity: 0.6,
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
        padding: 20,
    },
    // Audio Styles
    audioRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        marginBottom: 10,
    },
    speakerButton: {
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 50,
    },
    micButton: {
        padding: 15,
        backgroundColor: '#7B61FF',
        borderRadius: 50,
        shadowColor: "#7B61FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 6,
    },
    micButtonActive: { backgroundColor: '#D93025', transform: [{ scale: 1.1 }] },
    micButtonCorrect: { backgroundColor: '#81B64C' },
    micButtonIncorrect: { backgroundColor: '#D93025' },
    
    // Button styles
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
    // Complete Screen
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
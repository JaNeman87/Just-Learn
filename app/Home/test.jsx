

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Audio } from 'expo-av';
import * as Haptics from "expo-haptics";
import * as Speech from 'expo-speech';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import MatchingQuestion from "../../components/MatchingQuestion";
import MultipleChoiceQuestion from "../../components/MultipleChoiceQuestion"; // NEW IMPORT
import SentenceBuilder from "../../components/SentenceBuilder";

import DownloadButton from "../../components/DownloadButton";
import ProModal from "../../components/ProModal";
import StatusModal from "../../components/StatusModal";
import { useMembership } from "../contexts/MembershipContext";
import { getGrammarExplanation, transcribeAudio } from "../services/aiService";

const STATS_KEY = "@JustLearnStats";
const BOOKMARKS_KEY = "@JustLearnBookmarks";
const PROGRESS_KEY = "@JustLearnProgress";
const LEVEL_KEY = "@JustLearn:selectedLevel";

const Test = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { isPro, updateProgress } = useMembership();

    const parsedTest = useMemo(() => {
        let rawData = route.params.test;
        if (typeof rawData === "string") {
            try {
                return JSON.parse(rawData);
            } catch (e) {
                console.error("Failed to parse test data:", e);
                return null;
            }
        }
        return rawData;
    }, [route.params.test]);

    const { origin } = route.params;

    useEffect(() => {
        if (!parsedTest) navigation.goBack();
    }, [parsedTest, navigation]);

    if (!parsedTest) return null;

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);
    const [isInteractiveComplete, setIsInteractiveComplete] = useState(false);
    const [isTestComplete, setIsTestComplete] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [incorrectAnswers, setIncorrectAnswers] = useState(0);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [completionButtonText, setCompletionButtonText] = useState("Go to Tests");

    const [isLoadingProgress, setIsLoadingProgress] = useState(true);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [savedProgress, setSavedProgress] = useState(null);
    const [interactiveMistakeMade, setInteractiveMistakeMade] = useState(false);

    // AI & Recording State
    const [aiContext, setAiContext] = useState(null);
    const [coachLoading, setCoachLoading] = useState(false);
    const [proModalVisible, setProModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [statusConfig, setStatusConfig] = useState({});

    const [isRecording, setIsRecording] = useState(false);
    const [processingSpeech, setProcessingSpeech] = useState(false);
    const [speechResult, setSpeechResult] = useState(null);
    const recordingRef = useRef(null);
    const isRecordingDesired = useRef(false);

    const [currentLevelId, setCurrentLevelId] = useState(null);

    const optionRefs = useRef([]);
    const bottomSheetRef = useRef(null);

    const currentQuestion = !isTestComplete ? parsedTest.questions[currentQuestionIndex] : null;

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

    useEffect(() => {
        const loadLevelId = async () => {
            const savedLevel = await AsyncStorage.getItem(LEVEL_KEY) || "A1";
            setCurrentLevelId(savedLevel);
        };
        loadLevelId();
    }, []);

    // --- SPEECH FUNCTIONS ---
    const speak = (text) => {
        Speech.stop();
        Speech.speak(text, { language: 'de', pitch: 1.0, rate: 0.9 });
    };

    const handleSpeakQuestion = () => {
        let textToSpeak = currentQuestion.questionText;
        if (textToSpeak.includes("___") && showResult) {
            const answer = currentQuestion.options[currentQuestion.correctAnswerIndex];
            textToSpeak = textToSpeak.replace(/_+/g, answer);
        } else if (textToSpeak.includes("___")) {
            textToSpeak = textToSpeak.replace(/_+/g, " ... ");
        }
        speak(textToSpeak);
    };

    const toggleRecording = async () => {
        if (isRecording) await stopRecording();
        else await startRecording();
    };

    const startRecording = async () => {
        if (!isPro) {
            setProModalVisible(true);
            return;
        }
        isRecordingDesired.current = true;
        setIsRecording(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSpeechResult(null);

        try {
            if (recordingRef.current) {
                try { await recordingRef.current.stopAndUnloadAsync(); } catch (e) {}
                recordingRef.current = null;
            }
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            if (!isRecordingDesired.current) {
                try { await recording.stopAndUnloadAsync(); } catch (e) {}
                setIsRecording(false);
                return;
            }
            recordingRef.current = recording;
        } catch (err) {
            console.error('Failed to start recording', err);
            setIsRecording(false);
        }
    };

    const stopRecording = async () => {
        isRecordingDesired.current = false;
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
                
                let targetText = currentQuestion.questionText;
                if (targetText.includes("___")) {
                    const answer = currentQuestion.options[currentQuestion.correctAnswerIndex];
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
            }
        }
        setProcessingSpeech(false);
    };

    const handleInteractiveMistake = () => {
        if (!interactiveMistakeMade) {
            setIncorrectAnswers(prev => prev + 1);
            setInteractiveMistakeMade(true);
            updateQuestionStats(currentQuestion.id, false);
        }
    };

    const handleInteractiveDone = () => {
        if (!interactiveMistakeMade) {
            setCorrectAnswers(prev => prev + 1);
            updateQuestionStats(currentQuestion.id, true);
        }
        setIsInteractiveComplete(true);
    };

    const saveProgress = async (nextIndex, correct, incorrect) => {
        if (parsedTest.id === "bookmark-practice-single") return;
        try {
            const progressJson = await AsyncStorage.getItem(PROGRESS_KEY);
            const allProgress = progressJson ? JSON.parse(progressJson) : {};
            allProgress[parsedTest.id] = {
                index: nextIndex,
                correct: correct,
                incorrect: incorrect,
            };
            await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    };

    const clearProgress = async () => {
        try {
            const progressJson = await AsyncStorage.getItem(PROGRESS_KEY);
            if (progressJson) {
                const allProgress = JSON.parse(progressJson);
                delete allProgress[parsedTest.id];
                await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
            }
        } catch (e) {
            console.error("Failed to clear progress", e);
        }
    };

    useEffect(() => {
        const checkProgress = async () => {
            if (parsedTest.id === "bookmark-practice-single") {
                setIsLoadingProgress(false);
                return;
            }
            try {
                const progressJson = await AsyncStorage.getItem(PROGRESS_KEY);
                const allProgress = progressJson ? JSON.parse(progressJson) : {};
                const savedState = allProgress[parsedTest.id];

                if (savedState && savedState.index > 0 && savedState.index < parsedTest.questions.length) {
                    setSavedProgress(savedState);
                    setShowResumeModal(true);
                    setIsLoadingProgress(false);
                } else {
                    setIsLoadingProgress(false);
                }
            } catch (e) {
                console.error("Error checking progress", e);
                setIsLoadingProgress(false);
            }
        };
        checkProgress();
    }, [parsedTest.id]);

    const handleStartOver = () => {
        clearProgress();
        setShowResumeModal(false);
        setIsLoadingProgress(false);
    };

    const handleContinue = () => {
        if (savedProgress) {
            setCurrentQuestionIndex(savedProgress.index);
            setCorrectAnswers(savedProgress.correct);
            setIncorrectAnswers(savedProgress.incorrect);
        }
        setShowResumeModal(false);
        setIsLoadingProgress(false);
    };

    useEffect(() => {
        if (!currentQuestion) return;
        const loadBookmarkStatus = async () => {
            try {
                const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
                const bookmarks = bookmarksJson ? JSON.parse(bookmarksJson) : [];
                setIsBookmarked(bookmarks.includes(currentQuestion.id));
            } catch (e) {
                console.error("Failed to load bookmarks", e);
            }
        };
        loadBookmarkStatus();
    }, [currentQuestion]);

    useEffect(() => {
        if (origin === "Bookmarks") {
            setCompletionButtonText("Go to Bookmarks");
        } else {
            setCompletionButtonText("Go to Tests");
        }
    }, [origin]);

    const handleBookmarkToggle = async () => {
        if (!currentQuestion) return;
        const newBookmarkState = !isBookmarked;
        setIsBookmarked(newBookmarkState);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
            let bookmarks = bookmarksJson ? JSON.parse(bookmarksJson) : [];
            if (newBookmarkState) {
                if (!bookmarks.includes(currentQuestion.id)) {
                    bookmarks.push(currentQuestion.id);
                }
            } else {
                bookmarks = bookmarks.filter(id => id !== currentQuestion.id);
            }
            await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
        } catch (e) {
            console.error("Failed to save bookmarks", e);
            setIsBookmarked(!newBookmarkState);
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {currentLevelId && (
                        <View style={{ marginRight: 5 }}>
                            <DownloadButton levelId={currentLevelId} />
                        </View>
                    )}
                </View>
            ),
        });
    }, [navigation, currentLevelId]);

    const updateQuestionStats = async (questionId, isCorrect) => {};
    const updateTestStats = async (testId, score) => {};

    const handleOptionPress = index => {
        if (showResult) return;
        setSelectedAnswerIndex(index);
        setIsCorrect(null);
    };

    const handleCheckPress = () => {
        if (selectedAnswerIndex === null) return;
        const correct = selectedAnswerIndex === currentQuestion.correctAnswerIndex;
        setIsCorrect(correct);
        setShowResult(true);
        
        if (correct) {
            setCorrectAnswers(prev => prev + 1);
            setAiContext(null);
        } else {
            setIncorrectAnswers(prev => prev + 1);
            setAiContext({
                question: currentQuestion.questionText,
                userAnswer: currentQuestion.options[selectedAnswerIndex],
                correctAnswer: currentQuestion.options[currentQuestion.correctAnswerIndex],
                fullSentence: currentQuestion.questionText
            });
        }
        
        updateQuestionStats(currentQuestion.id, correct);
        const selectedRef = optionRefs.current[selectedAnswerIndex];
        if (selectedRef) {
            if (correct) {
                Vibration.vibrate(50);
                selectedRef.shake(800);
            } else {
                Vibration.vibrate(400);
                selectedRef.tada(800);
            }
        }
    };

    const handleAiExplain = async () => {
        if (!isPro) {
            setProModalVisible(true);
            return;
        }

        setCoachLoading(true);
        const explanation = await getGrammarExplanation(
            "", 
            aiContext.userAnswer,
            aiContext.correctAnswer,
            aiContext.fullSentence
        );
        setCoachLoading(false);

        setStatusConfig({
            type: "info",
            title: "AI Grammar Coach",
            message: explanation,
            confirmText: "Got it!",
        });
        setStatusModalVisible(true);
    };

    const handleGoProNav = () => {
        setProModalVisible(false);
        navigation.navigate("membership");
    };

    const handleNextPress = () => {
        if (bottomSheetRef.current && showResult) {
            bottomSheetRef.current.slideOutDown(300).then(() => {
                goToNextQuestion();
            });
        } else {
            goToNextQuestion();
        }
    };

    const goToNextQuestion = () => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < parsedTest.questions.length) {
            saveProgress(nextQuestionIndex, correctAnswers, incorrectAnswers);

            setCurrentQuestionIndex(nextQuestionIndex);
            setSelectedAnswerIndex(null);
            setShowResult(false);
            setIsCorrect(null);
            setIsInteractiveComplete(false);
            setInteractiveMistakeMade(false);
            setAiContext(null);
            setSpeechResult(null);
            optionRefs.current = [];
        } else {
            setIsTestComplete(false);
            setShowStatsModal(true);
        }
    };

    const handleCloseStatsModal = () => {
        // --- NEW: Calculate XP ---
        const COMPLETION_BONUS = 20;
        const ACCURACY_BONUS = 5;
        
        // Example: 20 points + (5 * 8 correct) = 60 XP
        const xpEarned = COMPLETION_BONUS + (correctAnswers * ACCURACY_BONUS);

        // Send to Context (Updates Supabase & Local State)
        updateProgress(xpEarned);
        // -------------------------
        updateTestStats(parsedTest.id, correctAnswers);
        saveProgress(parsedTest.questions.length, correctAnswers, incorrectAnswers);
        setShowStatsModal(false);
        setIsTestComplete(true);
    };

    if (isTestComplete) {
        return (
            <SafeAreaView style={[styles.container, { padding: 20, justifyContent: "space-between" }]}>
                <View style={styles.congratsContainer}>
                    <Text style={styles.congratsTitle}>Congratulations!</Text>
                    <Text style={styles.congratsSubtitle}>You have finished:</Text>
                    <Text style={styles.congratsTestTitle}>{parsedTest.title}</Text>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.bottomButtonText}>{completionButtonText}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (isLoadingProgress || !currentQuestion) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#81B64C" />
            </SafeAreaView>
        );
    }

    const totalQuestions = parsedTest.questions.length;
    const currentQuestionNumber = currentQuestionIndex + 1;
    const progressPercent = (currentQuestionNumber / totalQuestions) * 100;

    return (
        <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
            <Modal animationType="fade" transparent={true} visible={showResumeModal} onRequestClose={handleStartOver}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalStatsContent}>
                            <Text style={styles.modalTitle}>Resume Test?</Text>
                            <Text style={styles.modalSubText}>You left off on question {savedProgress?.index + 1}.</Text>
                        </View>
                        <View style={styles.modalButtonContainerRow}>
                            <TouchableOpacity style={[styles.bottomButton, styles.modalButton, styles.buttonStartOver]} onPress={handleStartOver}>
                                <Text style={[styles.bottomButtonText, styles.buttonStartOverText]}>Start Over</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.bottomButton, styles.modalButton]} onPress={handleContinue}>
                                <Text style={styles.bottomButtonText}>Continue</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal animationType="slide" transparent={true} visible={showStatsModal} onRequestClose={handleCloseStatsModal}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalStatsContent}>
                            <Text style={styles.modalTitle}>Test Statistics</Text>
                            <View style={styles.modalStatRow}><Text style={styles.modalStatLabel}>Correct:</Text><Text style={[styles.modalStatValue, { color: "#81B64C" }]}>{correctAnswers}</Text></View>
                            <View style={styles.modalStatRow}><Text style={styles.modalStatLabel}>Incorrect:</Text><Text style={[styles.modalStatValue, { color: "#D93025" }]}>{incorrectAnswers}</Text></View>
                            <View style={styles.modalStatRow}><Text style={styles.modalStatLabel}>Total:</Text><Text style={styles.modalStatValue}>{totalQuestions}</Text></View>
                            <View style={styles.modalStatRow}>
    <Text style={styles.modalStatLabel}>XP Earned:</Text>
    <Text style={[styles.modalStatValue, { color: "#FFD700" }]}>
        +{20 + (correctAnswers * 5)} XP
    </Text>
</View>
                        </View>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity style={styles.bottomButton} onPress={handleCloseStatsModal}><Text style={styles.bottomButtonText}>Continue</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
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
                    <Text style={styles.progressText}>Question {currentQuestionNumber} / {totalQuestions}</Text>
                    <View style={styles.progressBarTrack}>
                        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                    </View>
                </View>
                
                {/* AI COACH BUTTON */}
                {showResult && !isCorrect && aiContext && (
                    <Animatable.View animation="bounceIn" style={styles.coachContainer}>
                        <TouchableOpacity 
                            style={styles.coachButton} 
                            onPress={handleAiExplain}
                            disabled={coachLoading}
                        >
                            {coachLoading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name={isPro ? "bulb" : "lock-closed"} size={20} color="#FFF" style={{ marginRight: 5 }} />
                                    <Text style={styles.coachText}>Why is this wrong?</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </Animatable.View>
                )}

                {/* --- QUESTION RENDERING LOGIC --- */}
                {currentQuestion.type === "matching" ? (
                    <MatchingQuestion 
                        question={currentQuestion} 
                        onComplete={handleInteractiveDone} 
                        onMistake={handleInteractiveMistake} 
                    />
                ) : currentQuestion.type === "sentence" ? (
                    <SentenceBuilder 
                        question={currentQuestion} 
                        onComplete={handleInteractiveDone} 
                        onMistake={handleInteractiveMistake} 
                    />
                ) : (
                    // Used new MultipleChoiceQuestion component here
                    <MultipleChoiceQuestion 
                        question={currentQuestion}
                        selectedAnswerIndex={selectedAnswerIndex}
                        onOptionPress={handleOptionPress}
                        showResult={showResult}
                        isCorrect={isCorrect}
                        optionRefs={optionRefs}
                        onSpeak={handleSpeakQuestion}
                        onToggleRecording={toggleRecording}
                        isRecording={isRecording}
                        processingSpeech={processingSpeech}
                        speechResult={speechResult}
                    />
                )}
            </ScrollView>

            <View style={styles.bottomContainer}>
                {currentQuestion.type === "matching" || currentQuestion.type === "sentence" ? (
                    isInteractiveComplete && (
                        <Animatable.View key={`interactive-${currentQuestionIndex}`} animation="slideInUp" duration={300}>
                            <TouchableOpacity style={styles.bottomButton} onPress={handleNextPress}>
                                <Text style={styles.bottomButtonText}>Next Question</Text>
                            </TouchableOpacity>
                        </Animatable.View>
                    )
                ) : !showResult ? (
                    <Animatable.View key={`check-${currentQuestionIndex}`} animation="slideInUp" duration={300}>
                        <TouchableOpacity
                            style={[styles.bottomButton, selectedAnswerIndex === null && styles.disabledButton]}
                            onPress={handleCheckPress}
                            disabled={selectedAnswerIndex === null}
                        >
                            <Text style={styles.bottomButtonText}>Check Answer</Text>
                        </TouchableOpacity>
                    </Animatable.View>
                ) : (
                    <Animatable.View
                        ref={bottomSheetRef}
                        animation="slideInUp"
                        duration={300}
                    >
                        <TouchableOpacity
                            style={styles.bottomButton}
                            onPress={handleNextPress}
                        >
                            <Text style={styles.bottomButtonText}>Next Question</Text>
                        </TouchableOpacity>
                    </Animatable.View>
                )}
            </View>

            <ProModal 
                visible={proModalVisible} 
                onClose={() => setProModalVisible(false)} 
                onGoPro={handleGoProNav} 
                featureTitle="AI Features"
                featureDescription="Unlock Grammar Coach and Pronunciation Practice with Pro."
            />
            <StatusModal 
                visible={statusModalVisible}
                type={statusConfig.type}
                title={statusConfig.title}
                message={statusConfig.message}
                confirmText="Got it!"
                onConfirm={() => setStatusModalVisible(false)}
            />
        </SafeAreaView>
    );
};

export default Test;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#2C2B29", justifyContent: "space-between" },
    scrollContent: { padding: 20, paddingTop: 0, paddingBottom: 40 },
    
    bookmarkContainer: { width: "100%", alignItems: "flex-end", paddingTop: 10, paddingBottom: 5 },
    bookmarkButton: { padding: 5 },
    
    progressContainer: { width: "100%", paddingVertical: 10, marginBottom: 10 },
    progressText: { color: "#AAAAAA", fontSize: 14, fontWeight: "bold", textAlign: "right", marginBottom: 5 },
    progressBarTrack: { height: 10, width: "100%", backgroundColor: "#383633", borderRadius: 5 },
    progressBarFill: { height: "100%", backgroundColor: "#81B64C", borderRadius: 5 },
    congratsContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    congratsTitle: { fontSize: 32, fontWeight: "bold", color: "#81B64C", marginBottom: 20 },
    congratsSubtitle: { fontSize: 18, color: "#AAAAAA", marginBottom: 10 },
    congratsTestTitle: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF", textAlign: "center" },
    
    coachContainer: { alignItems: 'center', marginBottom: 15 },
    coachButton: { flexDirection: 'row', backgroundColor: "#7B61FF", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignItems: 'center', shadowColor: "#7B61FF", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 5 },
    coachText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },

    bottomContainer: { width: "100%", paddingHorizontal: 20, paddingBottom: 20 },
    
    bottomButton: { backgroundColor: "#81B64C", padding: 20, borderRadius: 8, width: "100%", alignItems: "center" },
    
    bottomButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
    disabledButton: { backgroundColor: "#555", opacity: 0.5 },
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.7)", padding: 20 },
    modalContent: { width: "100%", backgroundColor: "#383633", borderRadius: 10, justifyContent: "space-between" },
    modalStatsContent: { padding: 20 },
    modalButtonContainer: { width: "100%", padding: 20 },
    modalSubText: { fontSize: 18, color: "#AAAAAA", textAlign: "center", marginBottom: 20, lineHeight: 25 },
    modalButtonContainerRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", padding: 20, borderTopWidth: 1, borderColor: "#555" },
    modalButton: { width: "48%" },
    buttonStartOver: { backgroundColor: "#383633", borderWidth: 1, borderColor: "#888" },
    buttonStartOverText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
    modalTitle: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF", marginBottom: 20, textAlign: "center" },
    modalStatRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#555" },
    modalStatLabel: { fontSize: 18, color: "#AAAAAA" },
    modalStatValue: { fontSize: 18, color: "#FFFFFF", fontWeight: "bold" },
});
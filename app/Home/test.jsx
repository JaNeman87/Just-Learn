
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import MatchingQuestion from "../../components/MatchingQuestion";
import SentenceBuilder from "../../components/SentenceBuilder";

// 1. NEW IMPORTS
import ProModal from "../../components/ProModal";
import StatusModal from "../../components/StatusModal";
import { useMembership } from "../contexts/MembershipContext";
import { getGrammarExplanation } from "../services/aiService";

// Download Button Imports
import DownloadButton from "../../components/DownloadButton";

const STATS_KEY = "@JustLearnStats";
const BOOKMARKS_KEY = "@JustLearnBookmarks";
const PROGRESS_KEY = "@JustLearnProgress";
const LEVEL_KEY = "@JustLearn:selectedLevel";

const Test = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { isPro } = useMembership(); // Get Pro Status

    let testData = route.params.test;
    if (typeof testData === "string") {
        try {
            testData = JSON.parse(testData);
        } catch (e) {
            console.error("Failed to parse test data:", e);
            navigation.goBack();
            return null;
        }
    }
    const { test, origin } = route.params;
    const { test: parsedTest } = { test: testData };

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

    // --- 2. AI STATE ---
    const [aiContext, setAiContext] = useState(null);
    const [coachLoading, setCoachLoading] = useState(false);
    const [proModalVisible, setProModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [statusConfig, setStatusConfig] = useState({});

    // Download State
    const [currentLevelId, setCurrentLevelId] = useState(null);

    const optionRefs = useRef([]);
    const bottomSheetRef = useRef(null);

    const currentQuestion = !isTestComplete ? parsedTest.questions[currentQuestionIndex] : null;

    useEffect(() => {
        const loadLevelId = async () => {
            const savedLevel = await AsyncStorage.getItem(LEVEL_KEY) || "A1";
            setCurrentLevelId(savedLevel);
        };
        loadLevelId();
    }, []);

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
                    {currentQuestion && (
                        <TouchableOpacity onPress={handleBookmarkToggle} style={{ padding: 10 }}>
                            <Ionicons
                                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                                size={24}
                                color={isBookmarked ? "#81B64C" : "#FFFFFF"}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            ),
        });
    }, [navigation, isBookmarked, currentQuestion, currentLevelId]);

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
            setAiContext(null); // Clear AI context on success
        } else {
            setIncorrectAnswers(prev => prev + 1);
            
            // --- 3. CAPTURE MISTAKE FOR AI ---
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

    // --- 4. AI BUTTON HANDLER ---
    const handleAiExplain = async () => {
        if (!isPro) {
            setProModalVisible(true);
            return;
        }

        setCoachLoading(true);
        // For standard questions, 'context' is empty since the question itself is the context
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
            setAiContext(null); // Reset AI
            optionRefs.current = [];
        } else {
            setIsTestComplete(false);
            setShowStatsModal(true);
        }
    };

    const handleCloseStatsModal = () => {
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

    const correctAnswerText = currentQuestion.options && currentQuestion.options[currentQuestion.correctAnswerIndex];
    const isFillInTheBlank = currentQuestion.questionText && currentQuestion.questionText.includes("___");
    let questionPart1, questionPart2;
    if (isFillInTheBlank) {
        const questionParts = currentQuestion.questionText.split("___");
        questionPart1 = questionParts[0];
        questionPart2 = questionParts[1] || "";
    }

    const getOptionStyle = index => {
        if (!showResult) {
            if (index === selectedAnswerIndex) return styles.selectedOption;
            return styles.optionButton;
        }
        if (index === currentQuestion.correctAnswerIndex) return styles.correctOption;
        if (index === selectedAnswerIndex && !isCorrect) return styles.incorrectOption;
        return styles.disabledOption;
    };

    const totalQuestions = parsedTest.questions.length;
    const currentQuestionNumber = currentQuestionIndex + 1;
    const progressPercent = (currentQuestionNumber / totalQuestions) * 100;

    return (
        <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
            {/* ... Modals (Resume, Stats) ... */}
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
                
                {/* --- 5. AI COACH BUTTON (Inserted above question) --- */}
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
                    <>
                        <View style={styles.questionContainer}>
                            {!showResult ? (
                                <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
                            ) : isFillInTheBlank ? (
                                <Text style={styles.questionText}>
                                    {questionPart1}
                                    <Text style={isCorrect ? styles.filledCorrectText : styles.filledIncorrectText}>
                                        {correctAnswerText}
                                    </Text>
                                    {questionPart2}
                                </Text>
                            ) : (
                                <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
                            )}
                        </View>
                        <View style={styles.optionsContainer}>
                            {currentQuestion.options.map((option, index) => (
                                <Animatable.View key={option} ref={el => (optionRefs.current[index] = el)}>
                                    <TouchableOpacity
                                        style={getOptionStyle(index)}
                                        onPress={() => handleOptionPress(index)}
                                        disabled={showResult}
                                    >
                                        <Text style={styles.optionText}>{option}</Text>
                                    </TouchableOpacity>
                                </Animatable.View>
                            ))}
                        </View>
                    </>
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
                        style={[isCorrect ? styles.bannerCorrect : styles.bannerIncorrect, { borderRadius: 8 }]}
                    >
                        <TouchableOpacity
                            style={[styles.bottomButton, isCorrect ? styles.buttonCorrect : styles.buttonIncorrect]}
                            onPress={handleNextPress}
                        >
                            <Text style={styles.bottomButtonText}>Next Question</Text>
                        </TouchableOpacity>
                    </Animatable.View>
                )}
            </View>

            {/* --- 6. New Modals --- */}
            <ProModal 
                visible={proModalVisible} 
                onClose={() => setProModalVisible(false)} 
                onGoPro={handleGoProNav} 
                featureTitle="AI Grammar Coach"
                featureDescription="Get instant explanations for your mistakes."
            />
            <StatusModal 
                visible={statusModalVisible}
                type="info"
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
    // ... (Existing styles) ...
    container: { flex: 1, backgroundColor: "#2C2B29", justifyContent: "space-between" },
    scrollContainer: {},
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
    
    // --- 7. COPIED STYLES from SentenceBuilder (Purple Pill) ---
    coachContainer: { alignItems: 'center', marginBottom: 15 },
    coachButton: {
        flexDirection: 'row',
        backgroundColor: "#7B61FF", // Purple
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: "#7B61FF",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 5,
    },
    coachText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
    // -----------------------------------------------------------

    questionContainer: { paddingVertical: 20, backgroundColor: "#383633", borderRadius: 10, alignItems: "center", marginBottom: 40 },
    questionText: { fontSize: 22, fontWeight: "bold", color: "#FFFFFF", textAlign: "center", paddingHorizontal: 15 },
    filledCorrectText: { color: "#81B64C", fontWeight: "bold", textDecorationLine: "underline" },
    filledIncorrectText: { color: "#D93025", fontWeight: "bold", textDecorationLine: "underline" },
    optionsContainer: { width: "100%" },
    optionButton: { backgroundColor: "#383633", padding: 20, borderRadius: 8, width: "100%", marginBottom: 15, borderWidth: 2, borderColor: "transparent" },
    selectedOption: { backgroundColor: "#383633", padding: 20, borderRadius: 8, width: "100%", marginBottom: 15, borderWidth: 2, borderColor: "#81B64C" },
    correctOption: { backgroundColor: "#81B64C", padding: 20, borderRadius: 8, width: "100%", marginBottom: 15, borderWidth: 2, borderColor: "#81B64C" },
    incorrectOption: { backgroundColor: "#D93025", padding: 20, borderRadius: 8, width: "100%", marginBottom: 15, borderWidth: 2, borderColor: "#D93025" },
    disabledOption: { backgroundColor: "#383633", padding: 20, borderRadius: 8, width: "100%", marginBottom: 15, borderWidth: 2, borderColor: "transparent", opacity: 0.6 },
    optionText: { color: "#FFFFFF", fontSize: 18, fontWeight: "500", textAlign: "center" },
    bottomContainer: { width: "100%", paddingHorizontal: 20, paddingBottom: 20 },
    bannerCorrect: { backgroundColor: "#81B64C" },
    bannerIncorrect: { backgroundColor: "#D93025" },
    bottomButton: { backgroundColor: "#81B64C", padding: 20, borderRadius: 8, width: "100%", alignItems: "center" },
    buttonCorrect: { backgroundColor: "#81B64C" },
    buttonIncorrect: { backgroundColor: "#81B64C" },
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
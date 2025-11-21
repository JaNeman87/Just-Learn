

import { Ionicons } from "@expo/vector-icons";
import { Audio } from 'expo-av';
import * as Haptics from "expo-haptics";
import * as Speech from 'expo-speech';
import { MotiView } from "moti";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { Layout } from "react-native-reanimated";

import { useMembership } from "../app/contexts/MembershipContext";
import { getGrammarExplanation, transcribeAudio } from "../app/services/aiService";
import ProModal from "./ProModal";
import StatusModal from "./StatusModal";

const shuffle = array => [...array].sort(() => Math.random() - 0.5);

const SentenceBuilder = ({ question, onComplete, onMistake }) => {
    const { isPro } = useMembership();

    const [initialWords, setInitialWords] = useState([]);
    const [availableWordIds, setAvailableWordIds] = useState([]);
    const [placedWords, setPlacedWords] = useState({});
    const [wrongWordId, setWrongWordId] = useState(null);
    const [isSentenceComplete, setIsSentenceComplete] = useState(false);

    const [showCoachButton, setShowCoachButton] = useState(false);
    const [lastErrorContext, setLastErrorContext] = useState(null);
    const [coachLoading, setCoachLoading] = useState(false);

    const [isRecording, setIsRecording] = useState(false);
    const [processingSpeech, setProcessingSpeech] = useState(false);
    const [speechResult, setSpeechResult] = useState(null);
    
    const recordingRef = useRef(null);
    const isRecordingDesired = useRef(false);

    const [proModalVisible, setProModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [statusConfig, setStatusConfig] = useState({});

    const wordRefs = useRef({});
    const wordMap = useRef(new Map());

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
        const initialWordObjects = question.options.map((word, index) => ({
            id: `${word}-${index}`,
            text: word,
        }));
        wordMap.current.clear();
        initialWordObjects.forEach(word => wordMap.current.set(word.id, word));

        const shuffled = shuffle(initialWordObjects);
        setInitialWords(shuffled);
        setAvailableWordIds(shuffled.map(w => w.id));
        setPlacedWords({});
        setWrongWordId(null);
        setShowCoachButton(false);
        setIsSentenceComplete(false);
        setSpeechResult(null);
    }, [question]);

    const handleWordPress = wordId => {
        const wordObj = wordMap.current.get(wordId);
        const nextWordIndex = Object.keys(placedWords).length;
        const expectedWord = question.correctSentence[nextWordIndex];

        if (wordObj.text === expectedWord) {
            Vibration.vibrate(50);
            setAvailableWordIds(prev => prev.filter(id => id !== wordId));
            setPlacedWords(prev => ({ ...prev, [nextWordIndex]: wordObj }));
            setWrongWordId(null);
            setShowCoachButton(false);

            if (nextWordIndex + 1 === question.correctSentence.length) {
                setIsSentenceComplete(true);
                setTimeout(() => onComplete(true), 500);
            }
        } else {
            Vibration.vibrate(400);
            if (onMistake) onMistake();
            const currentSentence = Object.values(placedWords).map(w => w.text).join(" ");
            setLastErrorContext({
                context: currentSentence,
                wrongWord: wordObj.text,
                correctWord: expectedWord,
                fullSentence: question.correctSentence.join(" ")
            });
            setShowCoachButton(true);
            setWrongWordId(wordObj.id);
            wordRefs.current[wordObj.id]?.shake(500);
            setTimeout(() => setWrongWordId(null), 800);
        }
    };

    const handleSpeakSentence = () => {
        const fullSentence = question.correctSentence.join(" ");
        Speech.stop();
        Speech.speak(fullSentence, { language: 'de', rate: 0.9 });
    };

    const toggleRecording = async () => {
        if (isRecording) {
            await stopRecording();
        } else {
            await startRecording();
        }
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
                const cleanTarget = question.correctSentence.join(" ").toLowerCase().replace(/[.,!?]/g, "").trim();

                if (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken)) {
                    setSpeechResult('correct');
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } else {
                    setSpeechResult('incorrect');
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    
                    // 1. Replaced Alert with StatusModal
                    setStatusConfig({
                        type: 'error',
                        title: 'Try Again',
                        message: `You said: "${spokenText}"`,
                        confirmText: 'OK'
                    });
                    setStatusModalVisible(true);
                }
            }
        } catch (error) {
             if (error.message && error.message.includes("no valid audio data")) {
                console.log("Recording too short.");
            } else {
                console.error("Stop Recording Error:", error);
                // Optional: Show error modal
                setStatusConfig({ type: 'error', title: 'Error', message: 'Processing failed.', confirmText: 'OK' });
                setStatusModalVisible(true);
            }
        }
        
        setProcessingSpeech(false);
    };

    const handleCoachPress = async () => {
        if (!isPro) {
            setProModalVisible(true);
            return;
        }
        setCoachLoading(true);
        const explanation = await getGrammarExplanation(
            lastErrorContext.context,
            lastErrorContext.wrongWord,
            lastErrorContext.correctWord,
            lastErrorContext.fullSentence
        );
        setCoachLoading(false);
        setStatusConfig({
            type: "info",
            title: "AI Grammar Coach",
            message: explanation,
            confirmText: "Got it!"
        });
        setStatusModalVisible(true);
    };

    const resetSentence = () => {
        setPlacedWords({});
        setAvailableWordIds(shuffle(initialWords).map(w => w.id));
        setShowCoachButton(false);
        setIsSentenceComplete(false);
    };

    return (
        <View style={styles.container}>
            {showCoachButton && (
                <Animatable.View animation="bounceIn" style={styles.coachContainer}>
                    <TouchableOpacity 
                        style={styles.coachButton} 
                        onPress={handleCoachPress}
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

            <Text style={styles.instruction}>{question.questionText}</Text>
            <Text style={styles.englishSentence}>"{question.englishText}"</Text>

            <TouchableOpacity onPress={resetSentence} style={styles.sentenceArea} activeOpacity={1}>
                {question.correctSentence.map((word, index) => {
                    const placedWord = placedWords[index];
                    return (
                        <View key={index} style={styles.slotContainer}>
                            {placedWord ? (
                                <MotiView
                                    key={placedWord.id}
                                    from={{ opacity: 0, scale: 0.5, translateY: 10 }}
                                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                                    style={{ alignSelf: 'center' }}
                                >
                                    <View style={styles.wordChipPlaced}>
                                        <Text style={styles.wordText} selectable={false}>{placedWord.text}</Text>
                                    </View>
                                </MotiView>
                            ) : (
                                <View style={styles.wordSlotEmpty} />
                            )}
                            <View style={[styles.blankLine, { width: word.length * 12 + 20 }]} />
                        </View>
                    );
                })}
            </TouchableOpacity>

            <View style={styles.poolArea}>
                {initialWords.map(word => {
                    if (!availableWordIds.includes(word.id)) {
                        return null;
                    }
                    return (
                        <MotiView 
                            key={word.id} 
                            layout={Layout.springify()} 
                            style={{ margin: 6, alignSelf: 'center' }}
                        >
                            <Animatable.View ref={el => (wordRefs.current[word.id] = el)}>
                                <TouchableOpacity
                                    style={[styles.wordChip, word.id === wrongWordId && styles.wordChipError]}
                                    onPress={() => handleWordPress(word.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.wordText} selectable={false}>{word.text}</Text>
                                </TouchableOpacity>
                            </Animatable.View>
                        </MotiView>
                    );
                })}
            </View>

            {isSentenceComplete && (
                <Animatable.View animation="fadeInUp" style={styles.audioButtonContainer}>
                    <View style={styles.audioRow}>
                        <TouchableOpacity onPress={handleSpeakSentence} style={styles.speakerButton}>
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
                </Animatable.View>
            )}

            <ProModal 
                visible={proModalVisible} 
                onClose={() => setProModalVisible(false)} 
                onGoPro={() => setProModalVisible(false)} 
                featureTitle="AI Grammar Coach"
                featureDescription="Get instant explanations for your mistakes. Understand the 'Why' behind the grammar."
            />
            
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

const styles = StyleSheet.create({
    container: { width: "100%", alignItems: "center" },
    
    coachContainer: { marginBottom: 15 },
    coachButton: {
        flexDirection: 'row',
        backgroundColor: "#7B61FF",
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

    audioButtonContainer: {
        marginTop: 20,
        marginBottom: 10,
        alignItems: 'center',
    },
    audioRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
    },
    speakerButton: {
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 50,
    },
    micButton: {
        padding: 15,
        backgroundColor: '#7B61FF', // Purple
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

    instruction: { color: "#fff", fontSize: 16, marginBottom: 5, opacity: 0.8 },
    englishSentence: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },

    sentenceArea: {
        width: "100%",
        minHeight: 100,
        marginBottom: 10,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: 'flex-end',
    },
    slotContainer: { alignItems: "center", marginHorizontal: 4, marginBottom: 12 },
    wordSlotEmpty: { height: 46, width: 60 },
    
    wordChipPlaced: {
        backgroundColor: "#81B64C",
        paddingVertical: 11, 
        paddingHorizontal: 16,
        borderRadius: 10,
        alignSelf: 'flex-start',
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    blankLine: { height: 2, backgroundColor: "#555", marginTop: 6 },

    poolArea: { 
        flexDirection: "row", 
        flexWrap: "wrap", 
        justifyContent: "center", 
        alignItems: "center", 
        width: "100%" 
    },
    wordChip: {
        backgroundColor: "#383633",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#555",
        alignSelf: 'flex-start',
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    wordChipError: { borderColor: "#D93025" },
    wordText: { 
        color: "#fff", 
        fontSize: 18, 
        fontWeight: "600", 
        textAlign: "center", 
        lineHeight: 24, 
        paddingHorizontal: 2 
    },
});

export default SentenceBuilder;
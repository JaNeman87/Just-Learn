

import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { Layout } from "react-native-reanimated";

// Imports for AI & Membership
import { useMembership } from "../app/contexts/MembershipContext";
import { getGrammarExplanation } from "../app/services/aiService";
import ProModal from "./ProModal";
import StatusModal from "./StatusModal";

const shuffle = array => [...array].sort(() => Math.random() - 0.5);

const SentenceBuilder = ({ question, onComplete, onMistake }) => {
    const { isPro } = useMembership();

    // --- STATE ---
    const [initialWords, setInitialWords] = useState([]);
    const [availableWordIds, setAvailableWordIds] = useState([]);
    const [placedWords, setPlacedWords] = useState({});
    const [wrongWordId, setWrongWordId] = useState(null);

    // AI Coach State
    const [showCoachButton, setShowCoachButton] = useState(false);
    const [lastErrorContext, setLastErrorContext] = useState(null);
    const [coachLoading, setCoachLoading] = useState(false);

    // Modals
    const [proModalVisible, setProModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [statusConfig, setStatusConfig] = useState({});

    const wordRefs = useRef({});
    const wordMap = useRef(new Map());

    // --- LOGIC ---
    useEffect(() => {
        const initialWordObjects = question.options.map((word, index) => ({
            id: `${word}-${index}`,
            text: word,
        }));

        wordMap.current.clear();
        initialWordObjects.forEach(word => {
            wordMap.current.set(word.id, word);
        });

        const shuffled = shuffle(initialWordObjects);

        setInitialWords(shuffled);
        setAvailableWordIds(shuffled.map(w => w.id));
        setPlacedWords({});
        setWrongWordId(null);
        setShowCoachButton(false);
    }, [question]);

    const handleWordPress = wordId => {
        const wordObj = wordMap.current.get(wordId);
        const nextWordIndex = Object.keys(placedWords).length;
        const expectedWord = question.correctSentence[nextWordIndex];

        if (wordObj.text === expectedWord) {
            // Correct
            Vibration.vibrate(50);
            setAvailableWordIds(prev => prev.filter(id => id !== wordId));
            setPlacedWords(prev => ({ ...prev, [nextWordIndex]: wordObj }));
            setWrongWordId(null);
            setShowCoachButton(false);

            if (nextWordIndex + 1 === question.correctSentence.length) {
                setTimeout(() => onComplete(true), 500);
            }
        } else {
            // Wrong
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
    };

    return (
        <View style={styles.container}>
            {/* --- AI COACH BUTTON --- */}
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

            {/* --- TOP AREA --- */}
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

            {/* --- BOTTOM AREA --- */}
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

            {/* --- MODALS --- */}
            <ProModal 
                visible={proModalVisible} 
                onClose={() => setProModalVisible(false)} 
                onGoPro={() => setProModalVisible(false)} 
                featureTitle="AI Grammar Coach"
                featureDescription="Get instant explanations for your mistakes. Understand the 'Why' behind the grammar."
            />
            
            <StatusModal 
                visible={statusModalVisible}
                type="info"
                title={statusConfig.title}
                message={statusConfig.message}
                confirmText="Got it!"
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

    instruction: { color: "#fff", fontSize: 16, marginBottom: 5, opacity: 0.8 },
    englishSentence: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },

    sentenceArea: {
        width: "100%",
        minHeight: 100,
        marginBottom: 30,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        // --- FIX 1: Align everything to the bottom of the line ---
        alignItems: 'flex-end', 
    },
    slotContainer: { alignItems: "center", marginHorizontal: 4, marginBottom: 12 },
    
    wordSlotEmpty: { 
        // --- FIX 2: Fixed height (46px) ---
        height: 46, 
        width: 60, 
        // Transparent as requested
    },
    
    wordChipPlaced: {
        backgroundColor: "#81B64C",
        // --- FIX 3: Padding adjusted to match 46px height ---
        // Text(24) + Pad(11+11) = 46px
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
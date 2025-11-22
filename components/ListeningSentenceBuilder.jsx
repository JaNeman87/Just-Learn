import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { MotiView } from "moti";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import * as Animatable from "react-native-animatable"; // Ensure this is installed
import { Layout } from "react-native-reanimated";

const shuffle = array => [...array].sort(() => Math.random() - 0.5);

const ListeningSentenceBuilder = ({ question, onComplete, onMistake }) => {
    const [initialWords, setInitialWords] = useState([]);
    const [availableWordIds, setAvailableWordIds] = useState([]);
    const [placedWords, setPlacedWords] = useState({});
    const [wrongWordId, setWrongWordId] = useState(null);
    const [isSentenceComplete, setIsSentenceComplete] = useState(false);

    const wordRefs = useRef({});
    const wordMap = useRef(new Map());

    useEffect(() => {
        // Guard clause to prevent crash if question is undefined
        if (!question || !question.options) return;

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
        setIsSentenceComplete(false);

        // REMOVED: Auto-play logic here
    }, [question]);

    const playAudio = (rate = 0.9) => {
        if (!question) return;
        const sentence = question.correctSentence.join(" ");
        Speech.stop();
        Speech.speak(sentence, { language: "de", rate: rate });
    };

    const handleWordPress = wordId => {
        const wordObj = wordMap.current.get(wordId);
        const nextWordIndex = Object.keys(placedWords).length;
        const expectedWord = question.correctSentence[nextWordIndex];

        if (wordObj.text === expectedWord) {
            Vibration.vibrate(50);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            setAvailableWordIds(prev => prev.filter(id => id !== wordId));
            setPlacedWords(prev => ({ ...prev, [nextWordIndex]: wordObj }));
            setWrongWordId(null);

            if (nextWordIndex + 1 === question.correctSentence.length) {
                setIsSentenceComplete(true);
                setTimeout(() => onComplete(true), 500);
            }
        } else {
            Vibration.vibrate(400);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            if (onMistake) onMistake();

            setWrongWordId(wordObj.id);
            wordRefs.current[wordObj.id]?.shake(500);
            setTimeout(() => setWrongWordId(null), 800);
        }
    };

    if (!question) return null;

    return (
        <Animatable.View animation="slideInUp" duration={600} style={styles.container} useNativeDriver={true}>
            <Text style={styles.instruction}>Tap the speaker to listen</Text>

            {/* Audio Controls */}
            <View style={styles.audioContainer}>
                <TouchableOpacity style={styles.speakerButtonBig} onPress={() => playAudio(0.9)}>
                    <Ionicons name="volume-high" size={40} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.turtleButton} onPress={() => playAudio(0.5)}>
                    <Ionicons name="tortoise" size={24} color="#81B64C" />
                </TouchableOpacity>
            </View>

            {/* Sentence Area */}
            <View style={styles.sentenceArea}>
                {question.correctSentence.map((word, index) => {
                    const placedWord = placedWords[index];
                    return (
                        <View key={index} style={styles.slotContainer}>
                            {placedWord ? (
                                <MotiView
                                    key={placedWord.id}
                                    from={{ opacity: 0, scale: 0.5, translateY: 10 }}
                                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                                >
                                    <View style={styles.wordChipPlaced}>
                                        <Text style={styles.wordText}>{placedWord.text}</Text>
                                    </View>
                                </MotiView>
                            ) : (
                                // FIXED: Transparent background removes "boxes"
                                <View style={styles.wordSlotEmpty} />
                            )}
                            <View style={[styles.blankLine, { width: word.length * 12 + 20 }]} />
                        </View>
                    );
                })}
            </View>

            {/* Word Bank */}
            <View style={styles.poolArea}>
                {initialWords.map((word, index) => {
                    if (!availableWordIds.includes(word.id)) return null;
                    return (
                        <MotiView
                            key={word.id}
                            layout={Layout.springify()}
                            from={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            delay={index * 50} // Staggered entrance
                            style={{ margin: 6 }}
                        >
                            <Animatable.View ref={el => (wordRefs.current[word.id] = el)}>
                                <TouchableOpacity
                                    style={[styles.wordChip, word.id === wrongWordId && styles.wordChipError]}
                                    onPress={() => handleWordPress(word.id)}
                                >
                                    <Text style={styles.wordText}>{word.text}</Text>
                                </TouchableOpacity>
                            </Animatable.View>
                        </MotiView>
                    );
                })}
            </View>
        </Animatable.View>
    );
};

const styles = StyleSheet.create({
    container: { width: "100%", alignItems: "center" },
    instruction: { color: "#AAAAAA", fontSize: 16, marginBottom: 20 },

    audioContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 30,
        gap: 20,
    },
    speakerButtonBig: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#81B64C",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#81B64C",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    turtleButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#383633",
        borderWidth: 1,
        borderColor: "#555",
        justifyContent: "center",
        alignItems: "center",
    },

    sentenceArea: {
        width: "100%",
        minHeight: 100,
        marginBottom: 20,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "flex-end",
    },
    slotContainer: { alignItems: "center", marginHorizontal: 4, marginBottom: 12 },

    // FIXED: Transparent background
    wordSlotEmpty: {
        height: 46,
        width: 40,
        backgroundColor: "transparent",
        borderRadius: 8,
    },
    blankLine: { height: 2, backgroundColor: "#555", marginTop: 6 },

    wordChipPlaced: {
        backgroundColor: "#81B64C",
        paddingVertical: 11,
        paddingHorizontal: 16,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },

    poolArea: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        width: "100%",
    },
    wordChip: {
        backgroundColor: "#383633",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#555",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    wordChipError: { borderColor: "#D93025", backgroundColor: "#D93025" },
    wordText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});

export default ListeningSentenceBuilder;

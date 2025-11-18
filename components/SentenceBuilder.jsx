import { MotiView } from "moti";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { Layout } from "react-native-reanimated";

// Helper to shuffle arrays
const shuffle = array => [...array].sort(() => Math.random() - 0.5);

const SentenceBuilder = ({ question, onComplete }) => {
    // --- STATE ---
    // We now store the original shuffled options
    const [initialWords, setInitialWords] = useState([]);
    // availableWords is now just a list of IDs.
    const [availableWordIds, setAvailableWordIds] = useState([]);
    // placedWords is now a "sparse array" or map: { 0: wordObj, 2: wordObj }
    const [placedWords, setPlacedWords] = useState({}); // <-- This is an OBJECT {}

    const [wrongWordId, setWrongWordId] = useState(null);
    const wordRefs = useRef({});

    // Map to quickly find word data by ID
    const wordMap = useRef(new Map());

    // --- LOGIC ---

    // Initialize state
    useEffect(() => {
        const initialWordObjects = question.options.map((word, index) => ({
            id: `${word}-${index}`,
            text: word,
        }));

        // Store all words in the map
        wordMap.current.clear();
        initialWordObjects.forEach(word => {
            wordMap.current.set(word.id, word);
        });

        const shuffled = shuffle(initialWordObjects);

        setInitialWords(shuffled); // Store the full objects
        setAvailableWordIds(shuffled.map(w => w.id)); // Store just the IDs
        setPlacedWords({});
        setWrongWordId(null);
    }, [question]);

    const handleWordPress = wordId => {
        const wordObj = wordMap.current.get(wordId);
        const nextWordIndex = Object.keys(placedWords).length; // Get length from object keys
        const expectedWord = question.correctSentence[nextWordIndex];

        if (wordObj.text === expectedWord) {
            // --- CORRECT ---
            Vibration.vibrate(50);
            setAvailableWordIds(prev => prev.filter(id => id !== wordId));
            // Add to placed map by index
            setPlacedWords(prev => ({ ...prev, [nextWordIndex]: wordObj }));
            setWrongWordId(null);

            if (nextWordIndex + 1 === question.correctSentence.length) {
                setTimeout(() => onComplete(true), 500);
            }
        } else {
            // --- WRONG ---
            Vibration.vibrate(400);
            setWrongWordId(wordObj.id);
            wordRefs.current[wordObj.id]?.shake(500);
            setTimeout(() => setWrongWordId(null), 800);
        }
    };

    // Reset function
    const resetSentence = () => {
        setPlacedWords({}); // Clear the object
        setAvailableWordIds(shuffle(initialWords).map(w => w.id));
    };

    // --- RENDER ---
    return (
        <View style={styles.container}>
            <Text style={styles.instruction}>{question.questionText}</Text>
            <Text style={styles.englishSentence}>"{question.englishText}"</Text>

            {/* --- TOP AREA: The Sentence being built --- */}
            <TouchableOpacity onPress={resetSentence} style={styles.sentenceArea} activeOpacity={0.8}>
                {/* --- THIS IS THE FIX --- */}
                {/* We loop over the correctSentence (Array) not placedWords (Object) */}
                {question.correctSentence.map((word, index) => {
                    const placedWord = placedWords[index]; // Get the word for this slot, if it exists

                    return (
                        <View key={index} style={styles.slotContainer}>
                            {/* A. The Placed Word (if it exists) */}
                            {placedWord ? (
                                <MotiView
                                    key={placedWord.id} // Use the word's unique ID for Moti
                                    from={{ opacity: 0, scale: 0.5, translateY: 10 }}
                                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                                >
                                    <View style={styles.wordChipPlaced}>
                                        <Text style={styles.wordText}>{placedWord.text}</Text>
                                    </View>
                                </MotiView>
                            ) : (
                                // B. The Empty Slot (if no word placed yet)
                                <View style={styles.wordSlotEmpty} />
                            )}

                            {/* C. The Blank Line (always shown) */}
                            <View style={[styles.blankLine, { width: word.length * 9 + 15 }]} />
                        </View>
                    );
                })}
            </TouchableOpacity>

            {/* --- BOTTOM AREA: The Word Pool --- */}
            <View style={styles.poolArea}>
                {/* We map over the stable initialWords array */}
                {initialWords.map(word => {
                    // Only render if it's still in the available list
                    if (!availableWordIds.includes(word.id)) {
                        return null; // The word has been used
                    }

                    return (
                        <MotiView key={word.id} layout={Layout.springify()} style={{ margin: 5 }}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: { width: "100%", alignItems: "center" },
    instruction: { color: "#fff", fontSize: 16, marginBottom: 5, opacity: 0.8 },
    englishSentence: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },

    // Top Section
    sentenceArea: {
        width: "100%",
        minHeight: 100,
        marginBottom: 30,
        flexDirection: "row", // Make slots go left-to-right
        flexWrap: "wrap", // Allow wrapping to multiple lines
        justifyContent: "center", // Center the lines
    },
    slotContainer: {
        alignItems: "center",
        marginHorizontal: 4,
        marginBottom: 10, // Space between rows
    },
    wordSlotEmpty: {
        // This is the empty box that holds the place for a word
        height: 44, // Match wordChipPlaced height
        width: 60, // Minimum width
    },
    wordChipPlaced: {
        backgroundColor: "#81B64C",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        height: 44, // Fixed height
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    blankLine: {
        height: 2,
        backgroundColor: "#555",
        marginTop: 8, // Increased space
    },

    // Bottom Section
    poolArea: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        width: "100%",
        minHeight: 120,
    },
    wordChip: {
        backgroundColor: "#383633",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#555",
        minHeight: 48, // Use minHeight to prevent cutoff
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    wordChipError: {
        borderColor: "#D93025",
    },
    wordText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});

export default SentenceBuilder;

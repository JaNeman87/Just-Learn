// import { MotiView } from "moti";
// import { useEffect, useRef, useState } from "react";
// import { StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
// import * as Animatable from "react-native-animatable";
// import { Layout } from "react-native-reanimated";

// // Helper to shuffle arrays
// const shuffle = array => [...array].sort(() => Math.random() - 0.5);

// const SentenceBuilder = ({ question, onComplete }) => {
//     // --- STATE ---
//     // We now store the original shuffled options
//     const [initialWords, setInitialWords] = useState([]);
//     // availableWords is now just a list of IDs.
//     const [availableWordIds, setAvailableWordIds] = useState([]);
//     // placedWords is now a "sparse array" or map: { 0: wordObj, 2: wordObj }
//     const [placedWords, setPlacedWords] = useState({}); // <-- This is an OBJECT {}

//     const [wrongWordId, setWrongWordId] = useState(null);
//     const wordRefs = useRef({});

//     // Map to quickly find word data by ID
//     const wordMap = useRef(new Map());

//     // --- LOGIC ---

//     // Initialize state
//     useEffect(() => {
//         const initialWordObjects = question.options.map((word, index) => ({
//             id: `${word}-${index}`,
//             text: word,
//         }));

//         // Store all words in the map
//         wordMap.current.clear();
//         initialWordObjects.forEach(word => {
//             wordMap.current.set(word.id, word);
//         });

//         const shuffled = shuffle(initialWordObjects);

//         setInitialWords(shuffled); // Store the full objects
//         setAvailableWordIds(shuffled.map(w => w.id)); // Store just the IDs
//         setPlacedWords({});
//         setWrongWordId(null);
//     }, [question]);

//     const handleWordPress = wordId => {
//         const wordObj = wordMap.current.get(wordId);
//         const nextWordIndex = Object.keys(placedWords).length; // Get length from object keys
//         const expectedWord = question.correctSentence[nextWordIndex];

//         if (wordObj.text === expectedWord) {
//             // --- CORRECT ---
//             Vibration.vibrate(50);
//             setAvailableWordIds(prev => prev.filter(id => id !== wordId));
//             // Add to placed map by index
//             setPlacedWords(prev => ({ ...prev, [nextWordIndex]: wordObj }));
//             setWrongWordId(null);

//             if (nextWordIndex + 1 === question.correctSentence.length) {
//                 setTimeout(() => onComplete(true), 500);
//             }
//         } else {
//             // --- WRONG ---
//             Vibration.vibrate(400);
//             setWrongWordId(wordObj.id);
//             wordRefs.current[wordObj.id]?.shake(500);
//             setTimeout(() => setWrongWordId(null), 800);
//         }
//     };

//     // Reset function
//     const resetSentence = () => {
//         setPlacedWords({}); // Clear the object
//         setAvailableWordIds(shuffle(initialWords).map(w => w.id));
//     };

//     // --- RENDER ---
//     return (
//         <View style={styles.container}>
//             <Text style={styles.instruction}>{question.questionText}</Text>
//             <Text style={styles.englishSentence}>"{question.englishText}"</Text>

//             {/* --- TOP AREA: The Sentence being built --- */}
//             <TouchableOpacity onPress={resetSentence} style={styles.sentenceArea} activeOpacity={0.8}>
//                 {/* --- THIS IS THE FIX --- */}
//                 {/* We loop over the correctSentence (Array) not placedWords (Object) */}
//                 {question.correctSentence.map((word, index) => {
//                     const placedWord = placedWords[index]; // Get the word for this slot, if it exists

//                     return (
//                         <View key={index} style={styles.slotContainer}>
//                             {/* A. The Placed Word (if it exists) */}
//                             {placedWord ? (
//                                 <MotiView
//                                     key={placedWord.id} // Use the word's unique ID for Moti
//                                     from={{ opacity: 0, scale: 0.5, translateY: 10 }}
//                                     animate={{ opacity: 1, scale: 1, translateY: 0 }}
//                                 >
//                                     <View style={styles.wordChipPlaced}>
//                                         <Text style={styles.wordText}>{placedWord.text}</Text>
//                                     </View>
//                                 </MotiView>
//                             ) : (
//                                 // B. The Empty Slot (if no word placed yet)
//                                 <View style={styles.wordSlotEmpty} />
//                             )}

//                             {/* C. The Blank Line (always shown) */}
//                             <View style={[styles.blankLine, { width: word.length * 9 + 15 }]} />
//                         </View>
//                     );
//                 })}
//             </TouchableOpacity>

//             {/* --- BOTTOM AREA: The Word Pool --- */}
//             <View style={styles.poolArea}>
//                 {/* We map over the stable initialWords array */}
//                 {initialWords.map(word => {
//                     // Only render if it's still in the available list
//                     if (!availableWordIds.includes(word.id)) {
//                         return null; // The word has been used
//                     }

//                     return (
//                         <MotiView key={word.id} layout={Layout.springify()} style={{ margin: 5 }}>
//                             <Animatable.View ref={el => (wordRefs.current[word.id] = el)}>
//                                 <TouchableOpacity
//                                     style={[styles.wordChip, word.id === wrongWordId && styles.wordChipError]}
//                                     onPress={() => handleWordPress(word.id)}
//                                 >
//                                     <Text style={styles.wordText}>{word.text}</Text>
//                                 </TouchableOpacity>
//                             </Animatable.View>
//                         </MotiView>
//                     );
//                 })}
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: { width: "100%", alignItems: "center" },
//     instruction: { color: "#fff", fontSize: 16, marginBottom: 5, opacity: 0.8 },
//     englishSentence: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },

//     // Top Section
//     sentenceArea: {
//         width: "100%",
//         minHeight: 100,
//         marginBottom: 30,
//         flexDirection: "row", // Make slots go left-to-right
//         flexWrap: "wrap", // Allow wrapping to multiple lines
//         justifyContent: "center", // Center the lines
//     },
//     slotContainer: {
//         alignItems: "center",
//         marginHorizontal: 4,
//         marginBottom: 10, // Space between rows
//     },
//     wordSlotEmpty: {
//         // This is the empty box that holds the place for a word
//         height: 44, // Match wordChipPlaced height
//         width: 60, // Minimum width
//     },
//     wordChipPlaced: {
//         backgroundColor: "#81B64C",
//         paddingVertical: 10,
//         paddingHorizontal: 15,
//         borderRadius: 10,
//         height: 44, // Fixed height
//         alignItems: "center",
//         justifyContent: "center",
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.2,
//         shadowRadius: 1,
//         elevation: 2,
//     },
//     blankLine: {
//         height: 2,
//         backgroundColor: "#555",
//         marginTop: 8, // Increased space
//     },

//     // Bottom Section
//     poolArea: {
//         flexDirection: "row",
//         flexWrap: "wrap",
//         justifyContent: "center",
//         width: "100%",
//         minHeight: 120,
//     },
//     wordChip: {
//         backgroundColor: "#383633",
//         paddingVertical: 12,
//         paddingHorizontal: 18,
//         borderRadius: 12,
//         borderWidth: 2,
//         borderColor: "#555",
//         minHeight: 48, // Use minHeight to prevent cutoff
//         alignItems: "center",
//         justifyContent: "center",
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.3,
//         shadowRadius: 2,
//         elevation: 3,
//     },
//     wordChipError: {
//         borderColor: "#D93025",
//     },
//     wordText: {
//         color: "#fff",
//         fontSize: 18,
//         fontWeight: "600",
//     },
// });

// export default SentenceBuilder;


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
                                // --- REVERTED: Transparent empty slot ---
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
        alignItems: 'flex-start',
    },
    slotContainer: { alignItems: "center", marginHorizontal: 4, marginBottom: 12 },
    
    // --- REVERTED STYLE ---
    wordSlotEmpty: { 
        height: 46, 
        width: 60, 
        // No background color, no border radius - just invisible space holder
    },
    
    wordChipPlaced: {
        backgroundColor: "#81B64C",
        paddingVertical: 8,
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
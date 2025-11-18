import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import * as Animatable from "react-native-animatable";

// Helper to shuffle arrays
const shuffle = array => [...array].sort(() => Math.random() - 0.5);

const MatchingQuestion = ({ question, onComplete }) => {
    const [leftColumn, setLeftColumn] = useState([]);
    const [rightColumn, setRightColumn] = useState([]);

    const [selectedLeft, setSelectedLeft] = useState(null);
    const [selectedRight, setSelectedRight] = useState(null);
    const [matchedIds, setMatchedIds] = useState([]);
    const [isError, setIsError] = useState(false);

    const leftRefs = useRef({});
    const rightRefs = useRef({});

    // Initialize (Unchanged)
    useEffect(() => {
        const leftItems = question.pairs.map(p => ({ id: p.id, text: p.de }));
        const rightItems = question.pairs.map(p => ({ id: p.id, text: p.en }));

        setLeftColumn(shuffle(leftItems));
        setRightColumn(shuffle(rightItems));
        setMatchedIds([]);
        setIsError(false);
        setSelectedLeft(null);
        setSelectedRight(null);
    }, [question]);

    // Check match logic (Unchanged)
    useEffect(() => {
        if (selectedLeft && selectedRight) {
            handleMatchAttempt(selectedLeft, selectedRight);
        }
    }, [selectedLeft, selectedRight]);

    // Handle match attempt (Unchanged)
    const handleMatchAttempt = (leftId, rightId) => {
        if (leftId === rightId) {
            // --- MATCH! ---
            Vibration.vibrate(50);
            leftRefs.current[leftId]?.pulse(500);
            rightRefs.current[rightId]?.pulse(500);
            const newMatched = [...matchedIds, leftId];
            setMatchedIds(newMatched);
            setSelectedLeft(null);
            setSelectedRight(null);
            setIsError(false);
            if (newMatched.length === question.pairs.length) {
                setTimeout(() => onComplete(true), 500);
            }
        } else {
            // --- WRONG! ---
            Vibration.vibrate(400);
            setIsError(true);
            leftRefs.current[leftId]?.shake(500);
            rightRefs.current[rightId]?.shake(500);
            setTimeout(() => {
                setSelectedLeft(null);
                setSelectedRight(null);
                setIsError(false);
            }, 800);
        }
    };

    // Style Logic (Unchanged)
    const getCardStyle = (itemId, side) => {
        if (matchedIds.includes(itemId)) return styles.cardMatched;
        const isSelected = (side === "left" ? selectedLeft : selectedRight) === itemId;
        if (isSelected) {
            if (isError) return styles.cardError;
            return styles.cardSelected;
        }
        return styles.card;
    };

    // --- DELETED renderColumn FUNCTION ---

    return (
        <View style={styles.container}>
            <Text style={styles.instruction}>{question.questionText}</Text>

            {/* --- 1. RENDER AS ROWS, NOT COLUMNS --- */}
            <View style={styles.pairsContainer}>
                {leftColumn.map((leftItem, index) => {
                    const rightItem = rightColumn[index];

                    // This check is just a safeguard
                    if (!rightItem) return null;

                    return (
                        <View key={leftItem.id} style={styles.rowContainer}>
                            {/* --- Left Card --- */}
                            <Animatable.View
                                style={{ flex: 1 }} // Make animatable view flexible
                                ref={el => (leftRefs.current[leftItem.id] = el)}
                            >
                                <TouchableOpacity
                                    style={[styles.cardBase, getCardStyle(leftItem.id, "left")]}
                                    onPress={() => {
                                        if (isError) return;
                                        setSelectedLeft(leftItem.id);
                                    }}
                                    disabled={matchedIds.includes(leftItem.id)}
                                >
                                    <Text style={styles.cardText}>{leftItem.text}</Text>
                                </TouchableOpacity>
                            </Animatable.View>

                            {/* --- Spacer --- */}
                            <View style={{ width: 10 }} />

                            {/* --- Right Card --- */}
                            <Animatable.View
                                style={{ flex: 1 }} // Make animatable view flexible
                                ref={el => (rightRefs.current[rightItem.id] = el)}
                            >
                                <TouchableOpacity
                                    style={[styles.cardBase, getCardStyle(rightItem.id, "right")]}
                                    onPress={() => {
                                        if (isError) return;
                                        setSelectedRight(rightItem.id);
                                    }}
                                    disabled={matchedIds.includes(rightItem.id)}
                                >
                                    <Text style={styles.cardText}>{rightItem.text}</Text>
                                </TouchableOpacity>
                            </Animatable.View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { width: "100%", alignItems: "center" },
    instruction: { color: "#fff", fontSize: 18, marginBottom: 20, fontWeight: "bold" },

    // --- 2. UPDATED STYLES ---
    pairsContainer: {
        width: "100%",
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 10, // This was on cardBase before
    },
    cardBase: {
        flex: 1, // This makes the card fill its half of the row
        padding: 15,
        borderRadius: 8,
        // alignItems: "center",
        justifyContent: "center", // This centers the text vertically
        borderWidth: 2,
        minHeight: 60,
    },
    // --- End Updated Styles ---

    card: {
        backgroundColor: "#383633",
        borderColor: "transparent",
    },
    cardSelected: {
        backgroundColor: "#454545",
        borderColor: "#FFFFFF", // Normal selection
    },
    cardMatched: {
        backgroundColor: "#81B64C",
        borderColor: "#81B64C",
        opacity: 0.8,
    },
    cardError: {
        backgroundColor: "#383633",
        borderColor: "#D93025", // Only applied if isSelected && isError
    },

    cardText: { color: "#fff", fontWeight: "500", fontSize: 16, textAlign: "center" },
});

export default MatchingQuestion;

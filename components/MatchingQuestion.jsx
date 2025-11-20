

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
    
    // --- CHANGED: Track matched IDs separately for left and right columns ---
    // This allows matching Left ID '1' with Right ID '2' if they have the same text.
    const [matchedLeftIds, setMatchedLeftIds] = useState([]);
    const [matchedRightIds, setMatchedRightIds] = useState([]);
    
    const [isError, setIsError] = useState(false);

    const leftRefs = useRef({});
    const rightRefs = useRef({});

    // Initialize
    useEffect(() => {
        const leftItems = question.pairs.map(p => ({ id: p.id, text: p.de }));
        const rightItems = question.pairs.map(p => ({ id: p.id, text: p.en }));

        setLeftColumn(shuffle(leftItems));
        setRightColumn(shuffle(rightItems));
        
        // Reset state
        setMatchedLeftIds([]);
        setMatchedRightIds([]);
        setIsError(false);
        setSelectedLeft(null);
        setSelectedRight(null);
    }, [question]);

    // Check match logic
    useEffect(() => {
        if (selectedLeft && selectedRight) {
            handleMatchAttempt(selectedLeft, selectedRight);
        }
    }, [selectedLeft, selectedRight]);

    const handleMatchAttempt = (leftId, rightId) => {
        // 1. Get the actual text of the selected cards
        const leftItem = leftColumn.find(i => i.id === leftId);
        const rightItem = rightColumn.find(i => i.id === rightId);

        if (!leftItem || !rightItem) return;

        // 2. Check if this text combination exists in the allowed pairs
        // This fixes the "duplicate text" issue. We don't care about ID equality anymore, 
        // we care if the text forms a valid pair.
        const isValidMatch = question.pairs.some(pair => 
            pair.de === leftItem.text && pair.en === rightItem.text
        );

        if (isValidMatch) {
            // --- MATCH! ---
            Vibration.vibrate(50);
            leftRefs.current[leftId]?.pulse(500);
            rightRefs.current[rightId]?.pulse(500);

            // Add specific IDs to their respective matched lists
            const newLeftMatches = [...matchedLeftIds, leftId];
            const newRightMatches = [...matchedRightIds, rightId];

            setMatchedLeftIds(newLeftMatches);
            setMatchedRightIds(newRightMatches);
            
            setSelectedLeft(null);
            setSelectedRight(null);
            setIsError(false);

            if (newLeftMatches.length === question.pairs.length) {
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

    const getCardStyle = (itemId, side) => {
        // Check the correct array based on side
        const isMatched = side === "left" 
            ? matchedLeftIds.includes(itemId) 
            : matchedRightIds.includes(itemId);

        if (isMatched) return styles.cardMatched;

        const isSelected = (side === "left" ? selectedLeft : selectedRight) === itemId;
        if (isSelected) {
            if (isError) return styles.cardError;
            return styles.cardSelected;
        }
        return styles.card;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.instruction}>{question.questionText}</Text>

            <View style={styles.pairsContainer}>
                {leftColumn.map((leftItem, index) => {
                    const rightItem = rightColumn[index];

                    // Safety check
                    if (!rightItem) return null;

                    return (
                        <View key={leftItem.id} style={styles.rowContainer}>
                            {/* --- Left Card --- */}
                            <Animatable.View
                                style={{ flex: 1 }}
                                ref={el => (leftRefs.current[leftItem.id] = el)}
                            >
                                <TouchableOpacity
                                    style={[styles.cardBase, getCardStyle(leftItem.id, "left")]}
                                    onPress={() => {
                                        if (isError) return;
                                        setSelectedLeft(leftItem.id);
                                    }}
                                    disabled={matchedLeftIds.includes(leftItem.id)}
                                >
                                    <Text style={styles.cardText}>{leftItem.text}</Text>
                                </TouchableOpacity>
                            </Animatable.View>

                            {/* --- Spacer --- */}
                            <View style={{ width: 10 }} />

                            {/* --- Right Card --- */}
                            <Animatable.View
                                style={{ flex: 1 }}
                                ref={el => (rightRefs.current[rightItem.id] = el)}
                            >
                                <TouchableOpacity
                                    style={[styles.cardBase, getCardStyle(rightItem.id, "right")]}
                                    onPress={() => {
                                        if (isError) return;
                                        setSelectedRight(rightItem.id);
                                    }}
                                    disabled={matchedRightIds.includes(rightItem.id)}
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

    pairsContainer: {
        width: "100%",
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 10,
    },
    cardBase: {
        flex: 1, 
        padding: 15,
        borderRadius: 8,
        justifyContent: "center",
        borderWidth: 2,
        minHeight: 60,
    },

    card: {
        backgroundColor: "#383633",
        borderColor: "transparent",
    },
    cardSelected: {
        backgroundColor: "#454545",
        borderColor: "#FFFFFF",
    },
    cardMatched: {
        backgroundColor: "#81B64C",
        borderColor: "#81B64C",
        opacity: 0.8,
    },
    cardError: {
        backgroundColor: "#383633",
        borderColor: "#D93025",
    },

    cardText: { color: "#fff", fontWeight: "500", fontSize: 16, textAlign: "center" },
});

export default MatchingQuestion;

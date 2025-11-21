import * as Speech from 'expo-speech'; // 1. Import Speech
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import * as Animatable from "react-native-animatable";

const shuffle = array => [...array].sort(() => Math.random() - 0.5);

const MatchingQuestion = ({ question, onComplete, onMistake }) => {
    const [leftColumn, setLeftColumn] = useState([]);
    const [rightColumn, setRightColumn] = useState([]);

    const [selectedLeft, setSelectedLeft] = useState(null);
    const [selectedRight, setSelectedRight] = useState(null);
    
    const [matchedLeftIds, setMatchedLeftIds] = useState([]);
    const [matchedRightIds, setMatchedRightIds] = useState([]);
    
    const [isError, setIsError] = useState(false);

    const leftRefs = useRef({});
    const rightRefs = useRef({});

    useEffect(() => {
        const leftItems = question.pairs.map(p => ({ id: p.id, text: p.de }));
        const rightItems = question.pairs.map(p => ({ id: p.id, text: p.en }));

        setLeftColumn(shuffle(leftItems));
        setRightColumn(shuffle(rightItems));
        
        setMatchedLeftIds([]);
        setMatchedRightIds([]);
        setIsError(false);
        setSelectedLeft(null);
        setSelectedRight(null);
    }, [question]);

    useEffect(() => {
        if (selectedLeft && selectedRight) {
            handleMatchAttempt(selectedLeft, selectedRight);
        }
    }, [selectedLeft, selectedRight]);

    const handleMatchAttempt = (leftId, rightId) => {
        const leftItem = leftColumn.find(i => i.id === leftId);
        const rightItem = rightColumn.find(i => i.id === rightId);

        if (!leftItem || !rightItem) return;

        // Check by text content to handle duplicates
        const isValidMatch = question.pairs.some(pair => 
            pair.de === leftItem.text && pair.en === rightItem.text
        );

        if (isValidMatch) {
            // --- MATCH! ---
            Vibration.vibrate(50);
            
            // 2. Speak the German word
            Speech.speak(leftItem.text, { language: 'de', rate: 0.9 });

            leftRefs.current[leftId]?.pulse(500);
            rightRefs.current[rightId]?.pulse(500);

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
            
            // 3. Call onMistake
            if (onMistake) onMistake();

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
                    if (!rightItem) return null;

                    return (
                        <View key={leftItem.id} style={styles.rowContainer}>
                            <Animatable.View style={{ flex: 1 }} ref={el => (leftRefs.current[leftItem.id] = el)}>
                                <TouchableOpacity
                                    style={[styles.cardBase, getCardStyle(leftItem.id, "left")]}
                                    onPress={() => { if (!isError) setSelectedLeft(leftItem.id); }}
                                    disabled={matchedLeftIds.includes(leftItem.id)}
                                >
                                    <Text style={styles.cardText}>{leftItem.text}</Text>
                                </TouchableOpacity>
                            </Animatable.View>

                            <View style={{ width: 10 }} />

                            <Animatable.View style={{ flex: 1 }} ref={el => (rightRefs.current[rightItem.id] = el)}>
                                <TouchableOpacity
                                    style={[styles.cardBase, getCardStyle(rightItem.id, "right")]}
                                    onPress={() => { if (!isError) setSelectedRight(rightItem.id); }}
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
    pairsContainer: { width: "100%" },
    rowContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 10 },
    cardBase: { flex: 1, padding: 15, borderRadius: 8, justifyContent: "center", borderWidth: 2, minHeight: 60 },
    card: { backgroundColor: "#383633", borderColor: "transparent" },
    cardSelected: { backgroundColor: "#454545", borderColor: "#FFFFFF" },
    cardMatched: { backgroundColor: "#81B64C", borderColor: "#81B64C", opacity: 0.8 },
    cardError: { backgroundColor: "#383633", borderColor: "#D93025" },
    cardText: { color: "#fff", fontWeight: "500", fontSize: 16, textAlign: "center" },
});

export default MatchingQuestion;
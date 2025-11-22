import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";

const ChatCompletion = ({ question, onOptionSelected, showResult, isCorrect, selectedOptionIndex }) => {
    const [selectedLocalIndex, setSelectedLocalIndex] = useState(null);

    const handlePress = index => {
        if (showResult) return;
        setSelectedLocalIndex(index);
        onOptionSelected(index);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.instruction}>Complete the conversation</Text>

            {/* Chat History */}
            <ScrollView style={styles.chatContainer} contentContainerStyle={styles.chatContent}>
                {question.dialogue.map((msg, index) => {
                    const isUser = msg.speaker === "me";
                    const isTarget = msg.isTarget;

                    let bubbleText = msg.text;
                    if (isTarget) {
                        // Logic to show answer inside bubble
                        if (showResult && selectedLocalIndex !== null) {
                            const answer = question.options[selectedLocalIndex];
                            bubbleText = msg.text.replace("___", answer);
                        } else if (selectedLocalIndex !== null) {
                            const answer = question.options[selectedLocalIndex];
                            bubbleText = msg.text.replace("___", answer);
                        }
                    }

                    return (
                        <Animatable.View
                            key={index}
                            animation={isUser ? "fadeInRight" : "fadeInLeft"}
                            delay={index * 300}
                            style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleFriend]}
                        >
                            <Text
                                style={[
                                    styles.bubbleText,
                                    isUser ? styles.bubbleTextUser : styles.bubbleTextFriend,
                                    isTarget && !showResult && styles.targetTextPlaceholder,
                                ]}
                            >
                                {bubbleText}
                            </Text>
                            {isTarget && showResult && (
                                <View style={styles.iconContainer}>
                                    <Ionicons
                                        name={isCorrect ? "checkmark-circle" : "close-circle"}
                                        size={20}
                                        color={isCorrect ? "#FFF" : "#FFD700"}
                                    />
                                </View>
                            )}
                        </Animatable.View>
                    );
                })}
            </ScrollView>

            {/* Options Area */}
            <View style={styles.optionsContainer}>
                {question.options.map((option, index) => {
                    const isSelected = selectedLocalIndex === index;

                    // 1. FIXED: Use an array to merge styles instead of replacing them
                    let dynamicStyle = {};

                    if (showResult) {
                        if (index === question.correctAnswerIndex) {
                            dynamicStyle = styles.optionCorrect;
                        } else if (isSelected && !isCorrect) {
                            dynamicStyle = styles.optionWrong;
                        } else {
                            dynamicStyle = styles.optionDisabled;
                        }
                    } else if (isSelected) {
                        dynamicStyle = styles.optionSelected;
                    }

                    return (
                        <TouchableOpacity
                            key={index}
                            // 2. APPLY BASE STYLE + DYNAMIC STYLE
                            style={[styles.optionButton, dynamicStyle]}
                            onPress={() => handlePress(index)}
                            disabled={showResult}
                        >
                            <Text style={styles.optionText}>{option}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { width: "100%", flex: 1 },
    instruction: { color: "#AAAAAA", fontSize: 16, marginBottom: 15, textAlign: "center" },

    chatContainer: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 20,
        marginBottom: 20,
        maxHeight: 300,
    },
    chatContent: { padding: 20 },

    bubble: {
        maxWidth: "80%",
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    bubbleFriend: {
        alignSelf: "flex-start",
        backgroundColor: "#383633",
        borderBottomLeftRadius: 4,
    },
    bubbleUser: {
        alignSelf: "flex-end",
        backgroundColor: "#81B64C",
        borderBottomRightRadius: 4,
    },
    bubbleText: { fontSize: 16, lineHeight: 22 },
    bubbleTextFriend: { color: "#FFF" },
    bubbleTextUser: { color: "#FFF", fontWeight: "600" },
    targetTextPlaceholder: { color: "#FFD700" },

    iconContainer: { position: "absolute", right: -6, top: -6 },

    optionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 10,
    },
    // Base style (shape)
    optionButton: {
        backgroundColor: "#383633",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#555",
        minWidth: "40%",
        alignItems: "center",
    },
    // Color overrides only
    optionSelected: {
        backgroundColor: "#81B64C",
        borderColor: "#81B64C",
    },
    optionCorrect: {
        backgroundColor: "#81B64C",
        borderColor: "#81B64C",
    },
    optionWrong: {
        backgroundColor: "#D93025",
        borderColor: "#D93025",
    },
    optionDisabled: {
        opacity: 0.5,
    },
    optionText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});

export default ChatCompletion;

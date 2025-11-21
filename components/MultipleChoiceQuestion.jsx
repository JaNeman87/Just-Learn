import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";

const MultipleChoiceQuestion = ({
    question,
    selectedAnswerIndex,
    onOptionPress,
    showResult,
    isCorrect,
    optionRefs,
    onSpeak,
    onToggleRecording,
    isRecording,
    processingSpeech,
    speechResult
}) => {
    
    const correctAnswerText = question.options && question.options[question.correctAnswerIndex];
    const isFillInTheBlank = question.questionText && question.questionText.includes("___");
    
    let questionPart1, questionPart2;
    if (isFillInTheBlank) {
        const questionParts = question.questionText.split("___");
        questionPart1 = questionParts[0];
        questionPart2 = questionParts[1] || "";
    }

    const getOptionStyle = (index) => {
        if (!showResult) {
            if (index === selectedAnswerIndex) return styles.selectedOption;
            return styles.optionButton;
        }
        if (index === question.correctAnswerIndex) return styles.correctOption;
        if (index === selectedAnswerIndex && !isCorrect) return styles.incorrectOption;
        return styles.disabledOption;
    };

    return (
        <View style={styles.container}>
            {/* Question Text Area */}
            <View style={styles.questionContainer}>
                {!showResult ? (
                    <Text style={styles.questionText}>{question.questionText}</Text>
                ) : isFillInTheBlank ? (
                    <Text style={styles.questionText}>
                        {questionPart1}
                        <Text style={isCorrect ? styles.filledCorrectText : styles.filledIncorrectText}>
                            {correctAnswerText}
                        </Text>
                        {questionPart2}
                    </Text>
                ) : (
                    <Text style={styles.questionText}>{question.questionText}</Text>
                )}
            </View>

            {/* Options List */}
            <View style={styles.optionsContainer}>
                {question.options.map((option, index) => (
                    <Animatable.View key={`${question.id}-opt-${index}`} ref={el => {
                        if (optionRefs && optionRefs.current) {
                            optionRefs.current[index] = el;
                        }
                    }}>
                        <TouchableOpacity
                            style={getOptionStyle(index)}
                            onPress={() => onOptionPress(index)}
                            disabled={showResult}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.optionText}>{option}</Text>
                        </TouchableOpacity>
                    </Animatable.View>
                ))}
            </View>

            {/* Audio & Recording Controls (Visible after answering) */}
            {showResult && (
                <View style={styles.audioRow}>
                    <TouchableOpacity style={styles.speakerButton} onPress={onSpeak}>
                        <Ionicons name="volume-high" size={24} color="#81B64C" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.micButton,
                            isRecording && styles.micButtonActive,
                            speechResult === 'correct' && styles.micButtonCorrect,
                            speechResult === 'incorrect' && styles.micButtonIncorrect
                        ]}
                        onPress={onToggleRecording}
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
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        alignItems: "center",
    },
    questionContainer: {
        paddingVertical: 20,
        backgroundColor: "#383633",
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 30,
        width: "100%",
    },
    questionText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
        paddingHorizontal: 15,
    },
    filledCorrectText: {
        color: "#81B64C",
        fontWeight: "bold",
        textDecorationLine: "underline",
    },
    filledIncorrectText: {
        color: "#D93025",
        fontWeight: "bold",
        textDecorationLine: "underline",
    },
    optionsContainer: {
        width: "100%",
    },
    optionButton: {
        backgroundColor: "#383633",
        padding: 20,
        borderRadius: 8,
        width: "100%",
        marginBottom: 15,
        borderWidth: 2,
        borderColor: "transparent",
    },
    selectedOption: {
        backgroundColor: "#383633",
        padding: 20,
        borderRadius: 8,
        width: "100%",
        marginBottom: 15,
        borderWidth: 2,
        borderColor: "#81B64C",
    },
    correctOption: {
        backgroundColor: "#81B64C",
        padding: 20,
        borderRadius: 8,
        width: "100%",
        marginBottom: 15,
        borderWidth: 2,
        borderColor: "#81B64C",
    },
    incorrectOption: {
        backgroundColor: "#D93025",
        padding: 20,
        borderRadius: 8,
        width: "100%",
        marginBottom: 15,
        borderWidth: 2,
        borderColor: "#D93025",
    },
    disabledOption: {
        backgroundColor: "#383633",
        padding: 20,
        borderRadius: 8,
        width: "100%",
        marginBottom: 15,
        borderWidth: 2,
        borderColor: "transparent",
        opacity: 0.6,
    },
    optionText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "500",
        textAlign: "center",
    },
    // Audio Styles
    audioRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        marginTop: 10,
        marginBottom: 20,
    },
    speakerButton: {
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 50,
    },
    micButton: {
        padding: 15,
        backgroundColor: '#7B61FF',
        borderRadius: 50,
        shadowColor: "#7B61FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 6,
    },
    micButtonActive: {
        backgroundColor: '#D93025',
        transform: [{ scale: 1.1 }]
    },
    micButtonCorrect: { backgroundColor: '#81B64C' },
    micButtonIncorrect: { backgroundColor: '#D93025' }
});

export default MultipleChoiceQuestion;
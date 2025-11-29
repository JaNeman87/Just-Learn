import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const LearnTopicItem = React.memo(({ item, onPress, isLocked }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={false} style={styles.touchable}>
                <LinearGradient
                    colors={isLocked ? ["#2f2e2c", "#242321"] : ["#42403d", "#2C2B29"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.card, isLocked && styles.cardLocked]}
                >
                    <View style={styles.content}>
                        <Text style={[styles.title, isLocked && styles.titleLocked]}>{item.title}</Text>
                        <Text style={styles.subtitle}>{isLocked ? "Locked Level" : "Tap to Start"}</Text>
                    </View>

                    <Ionicons
                        name={isLocked ? "lock-closed" : "play-circle"}
                        size={28}
                        color={isLocked ? "#555" : "#81B64C"}
                    />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 20,
    },
    touchable: {
        flex: 1,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#444",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    cardLocked: {
        borderColor: "#333",
        opacity: 0.8,
    },
    content: {
        flex: 1,
        marginRight: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 4,
    },
    titleLocked: {
        color: "#888",
    },
    subtitle: {
        fontSize: 12,
        color: "#999",
        fontWeight: "600",
        textTransform: "uppercase",
    },
});

export default LearnTopicItem;

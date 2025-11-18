// app/(drawer)/Statistics.js (or wherever you want it)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

const STATS_KEY = "@JustLearnStats";

const Statistics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // useFocusEffect runs every time the user visits this screen
    useFocusEffect(
        React.useCallback(() => {
            const loadStats = async () => {
                setLoading(true);
                const statsJson = await AsyncStorage.getItem(STATS_KEY);
                const loadedStats = statsJson ? JSON.parse(statsJson) : { questionStats: {}, testStats: {} };
                setStats(loadedStats);
                setLoading(false);
            };
            loadStats();
        }, [])
    );

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" />;
    }

    if (!stats || !stats.testStats) {
        return <Text style={styles.title}>No statistics yet. Go take a test!</Text>;
    }

    // --- Calculate some overall stats ---
    let totalCompleted = 0;
    for (const testId in stats.testStats) {
        totalCompleted += stats.testStats[testId].completed;
    }

    // This would be a great place to find the "hardest" question
    // (e.g., sort by stats.questionStats...incorrect)

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Your Statistics</Text>

            {/* Overall Stats Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Overall</Text>
                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Total Tests Completed:</Text>
                    <Text style={styles.statValue}>{totalCompleted}</Text>
                </View>
                {/* You could add total correct/incorrect from questionStats here */}
            </View>

            {/* Per-Test Stats */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Test Results</Text>
                {Object.keys(stats.testStats).map(testId => {
                    const test = stats.testStats[testId];
                    const bestScore = Math.max(...test.highScores, 0);
                    return (
                        <View key={testId} style={styles.statRow}>
                            <Text style={styles.statLabel}>{testId}</Text>
                            <Text style={styles.statValue}>
                                {test.completed} attempts / Best: {bestScore}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Here you would add charts */}
            {/* <Text style={styles.title}>Charts</Text> */}
            {/* <PieChart style={{ height: 200 }} data={...} /> */}
        </ScrollView>
    );
};

// Add some styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2B29",
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#383633",
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: "600",
        color: "white",
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#555",
        paddingBottom: 5,
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 5,
    },
    statLabel: {
        fontSize: 16,
        color: "#AAAAAA",
    },
    statValue: {
        fontSize: 16,
        color: "white",
        fontWeight: "bold",
    },
});

export default Statistics;

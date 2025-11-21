import { Ionicons } from "@expo/vector-icons";
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

export default function RankingModal({ visible, onClose, currentXP, ranks }) {
    // 1. Calculate current progress
    const currentRankIndex = ranks.findIndex((r, i) => {
        const nextRank = ranks[i + 1];
        return currentXP >= r.minXP && (!nextRank || currentXP < nextRank.minXP);
    });
    
    const currentRank = ranks[currentRankIndex] || ranks[0];
    const nextRank = ranks[currentRankIndex + 1];

    // 2. Progress Bar Math
    let progressPercent = 0;
    let xpNeeded = 0;

    if (nextRank) {
        const xpInLevel = currentXP - currentRank.minXP;
        const levelSpan = nextRank.minXP - currentRank.minXP;
        progressPercent = (xpInLevel / levelSpan) * 100;
        xpNeeded = nextRank.minXP - currentXP;
    } else {
        progressPercent = 100; // Max level reached
    }

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    
                    {/* Header: Current Rank Icon */}
                    <View style={styles.header}>
                        <View style={[styles.iconCircle, { borderColor: currentRank.color }]}>
                            <Ionicons name="trophy" size={40} color={currentRank.color} />
                        </View>
                        <Text style={[styles.rankTitle, { color: currentRank.color }]}>
                            {currentRank.name}
                        </Text>
                        <Text style={styles.totalXP}>{currentXP} XP Total</Text>
                    </View>

                    {/* Progress Bar Section */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressBarBg}>
                            <View 
                                style={[
                                    styles.progressBarFill, 
                                    { width: `${progressPercent}%`, backgroundColor: currentRank.color }
                                ]} 
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {nextRank 
                                ? `${xpNeeded} XP to ${nextRank.name}` 
                                : "Max Level Reached!"}
                        </Text>
                    </View>

                    {/* Rank List */}
                    <Text style={styles.listHeader}>Rank System</Text>
                    <ScrollView style={styles.rankList} showsVerticalScrollIndicator={false}>
                        {ranks.map((rank, index) => {
                            const isUnlocked = currentXP >= rank.minXP;
                            const isCurrent = index === currentRankIndex;

                            return (
                                <View key={rank.name} style={[styles.rankItem, isCurrent && styles.activeRankItem]}>
                                    <View style={styles.rankLeft}>
                                        <Ionicons 
                                            name={isUnlocked ? "checkmark-circle" : "lock-closed"} 
                                            size={20} 
                                            color={isUnlocked ? rank.color : "#555"} 
                                        />
                                        <Text style={[
                                            styles.rankName, 
                                            { color: isUnlocked ? "#FFF" : "#777" }
                                        ]}>
                                            {rank.name}
                                        </Text>
                                    </View>
                                    <Text style={styles.rankXP}>{rank.minXP} XP</Text>
                                </View>
                            );
                        })}
                    </ScrollView>

                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)", // Dark dim
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: width * 0.85,
        backgroundColor: "#2C2B29",
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: "#444",
        maxHeight: "80%",
    },
    header: {
        alignItems: "center",
        marginBottom: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        backgroundColor: "rgba(255,255,255,0.05)"
    },
    rankTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4,
    },
    totalXP: {
        color: "#AAA",
        fontSize: 14,
    },
    progressSection: {
        marginBottom: 24,
    },
    progressBarBg: {
        height: 10,
        backgroundColor: "#444",
        borderRadius: 5,
        overflow: "hidden",
        marginBottom: 8,
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 5,
    },
    progressText: {
        color: "#DDD",
        fontSize: 12,
        textAlign: "center",
        fontWeight: "600",
    },
    listHeader: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    rankList: {
        marginBottom: 20,
    },
    rankItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    activeRankItem: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 8,
        paddingHorizontal: 8,
        marginHorizontal: -8,
    },
    rankLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    rankName: {
        fontSize: 14,
        marginLeft: 10,
        fontWeight: "500",
    },
    rankXP: {
        color: "#666",
        fontSize: 12,
    },
    closeButton: {
        backgroundColor: "#333",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    closeButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16,
    },
});
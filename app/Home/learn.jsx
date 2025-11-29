import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import LearnTopicItem from "../../components/LearnTopicItem";
import ProModal from "../../components/ProModal";
import { useMembership } from "../contexts/MembershipContext";

import CartoonCharacter from "../../components/CartoonCharacter";
import DownloadButton from "../../components/DownloadButton";
import { fetchLevelData } from "../services/contentService";

const LEVEL_KEY = "@JustLearn:selectedLevel";
const { width } = Dimensions.get("window");

const Learn = () => {
    const navigation = useNavigation();
    const { isPro } = useMembership();

    const [loading, setLoading] = useState(true);
    const [topicsToDisplay, setTopicsToDisplay] = useState([]);
    const [currentLevelTitle, setCurrentLevelTitle] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [currentLevelId, setCurrentLevelId] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                setLoading(true);
                try {
                    const savedLevel = (await AsyncStorage.getItem(LEVEL_KEY)) || "A1";
                    setCurrentLevelId(savedLevel);
                    const levelData = await fetchLevelData(savedLevel);

                    if (levelData) {
                        setTopicsToDisplay(levelData.tests || []);
                        setCurrentLevelTitle(levelData.title || savedLevel);
                    } else {
                        setTopicsToDisplay([]);
                        setCurrentLevelTitle("No content found");
                    }
                } catch (e) {
                    console.error("Failed to load topics", e);
                    setTopicsToDisplay([]);
                }
                setLoading(false);
            };
            loadData();
        }, [])
    );

    const goToFlashcards = (testTopic, isLocked) => {
        if (isLocked) {
            setModalVisible(true);
            return;
        }
        navigation.navigate(`FlashcardScreen`, { questions: testTopic.questions });
    };

    const handleGoProNav = () => {
        setModalVisible(false);
        navigation.navigate("membership");
    };

    const renderTimelineItem = useCallback(
        ({ item, index }) => {
            const isLocked = !isPro && index >= 5;
            const isLast = index === topicsToDisplay.length - 1;

            return (
                <View style={styles.timelineRow}>
                    {/* --- LEFT: The Timeline Rail --- */}
                    <View style={styles.railContainer}>
                        {/* Vertical Line */}
                        {!isLast && <View style={[styles.railLine, isLocked && styles.railLineLocked]} />}

                        {/* The Node (Circle) */}
                        <View style={[styles.railNode, isLocked && styles.railNodeLocked]}>
                            <Text style={[styles.nodeText, isLocked && styles.nodeTextLocked]}>{index + 1}</Text>
                        </View>
                    </View>

                    {/* --- RIGHT: The Card Content --- */}
                    <View style={styles.cardContainer}>
                        <LearnTopicItem
                            item={item}
                            index={index}
                            onPress={() => goToFlashcards(item, isLocked)}
                            isLocked={isLocked}
                        />
                    </View>
                </View>
            );
        },
        [isPro, topicsToDisplay.length]
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#81B64C" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Background Decoration */}
            <View style={styles.bgDecoration}>
                <CartoonCharacter width={width * 0.9} height={width * 0.9} color="#81B64C" />
            </View>

            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.subHeader}>CURRENT PATH</Text>
                    <Text style={styles.titleText}>{currentLevelTitle}</Text>
                </View>
                <DownloadButton levelId={currentLevelId} />
            </View>

            {topicsToDisplay.length > 0 ? (
                <FlatList
                    data={topicsToDisplay}
                    renderItem={renderTimelineItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    // Optional: Add a footer space
                    ListFooterComponent={<View style={{ height: 100 }} />}
                />
            ) : (
                <Text style={styles.noTopicsText}>No topics found. Check internet connection.</Text>
            )}

            <ProModal visible={modalVisible} onClose={() => setModalVisible(false)} onGoPro={handleGoProNav} />
        </View>
    );
};

export default Learn;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1917", // Slightly darker for contrast with cards
    },
    bgDecoration: {
        position: "absolute",
        bottom: -50,
        right: -100,
        opacity: 0.06,
        transform: [{ rotate: "-10deg" }],
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 50,
        paddingBottom: 10,
        paddingHorizontal: 24,
        backgroundColor: "#1a1917",
        zIndex: 10,
    },
    subHeader: {
        fontSize: 12,
        color: "#81B64C",
        fontWeight: "700",
        letterSpacing: 1.5,
        marginBottom: 2,
    },
    titleText: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "800",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    noTopicsText: {
        flex: 1,
        fontSize: 18,
        color: "#AAAAAA",
        textAlign: "center",
        marginTop: 50,
    },
    // --- Timeline Styles ---
    timelineRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    railContainer: {
        width: 50,
        alignItems: "center",
        marginRight: 10,
    },
    railLine: {
        position: "absolute",
        top: 40, // Start below the node
        bottom: -20, // Extend to next item
        width: 2,
        backgroundColor: "#81B64C",
        zIndex: -1,
        opacity: 0.5,
    },
    railLineLocked: {
        backgroundColor: "#444",
    },
    railNode: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#81B64C",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#1a1917", // Creates a "gap" effect
        shadowColor: "#81B64C",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 2,
    },
    railNodeLocked: {
        backgroundColor: "#333",
        shadowOpacity: 0,
        borderColor: "#1a1917",
    },
    nodeText: {
        color: "#1a1917",
        fontSize: 14,
        fontWeight: "bold",
    },
    nodeTextLocked: {
        color: "#666",
    },
    cardContainer: {
        flex: 1,
        paddingTop: 0, // Aligns card with the node
    },
});

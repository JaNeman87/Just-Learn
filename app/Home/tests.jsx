import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, View } from "react-native";
import DownloadButton from "../../components/DownloadButton";
import ProModal from "../../components/ProModal";
import TestListItem from "../../components/TestListItem";
import { useMembership } from "../contexts/MembershipContext";
import { fetchLevelData } from "../services/contentService";

const LEVEL_KEY = "@JustLearn:selectedLevel";
const PROGRESS_KEY = "@JustLearnProgress";

// --- LAYOUT CONSTANTS ---
const { width } = Dimensions.get("window");
const ITEM_SIZE = 110;
// Calculate Amplitude: (Screen Half) - (Half Item Size) - Padding
const X_AMPLITUDE = width / 2 - ITEM_SIZE / 2 - 15;

// Image Dimensions
const IMG_SIZE = 340;

const Tests = () => {
    const navigation = useNavigation();
    const { isPro } = useMembership();

    const [loading, setLoading] = useState(true);
    const [testsToDisplay, setTestsToDisplay] = useState([]);
    const [currentLevelTitle, setCurrentLevelTitle] = useState("");
    const [progressData, setProgressData] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [currentLevelId, setCurrentLevelId] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                setLoading(true);
                try {
                    const [savedLevel, progressJson] = await Promise.all([
                        AsyncStorage.getItem(LEVEL_KEY),
                        AsyncStorage.getItem(PROGRESS_KEY),
                    ]);

                    const levelId = savedLevel || "A1";
                    setCurrentLevelId(levelId);

                    const levelData = await fetchLevelData(levelId);
                    setProgressData(progressJson ? JSON.parse(progressJson) : {});

                    if (levelData) {
                        setTestsToDisplay(levelData.tests || []);
                        setCurrentLevelTitle(levelData.title || levelId);
                    } else {
                        setTestsToDisplay([]);
                        setCurrentLevelTitle("No content found");
                    }
                } catch (e) {
                    console.error("Failed to load tests", e);
                    setTestsToDisplay([]);
                }
                setLoading(false);
            };

            loadData();
        }, [])
    );

    const handleTestPress = (test, isLocked) => {
        if (isLocked) {
            setModalVisible(true);
            return;
        }
        navigation.navigate(`test`, { test: test, origin: "Tests" });
    };

    const handleGoProNav = () => {
        setModalVisible(false);
        navigation.navigate("membership");
    };

    // --- SNAKE LOGIC ---
    const getSnakeStyle = index => {
        const groupIndex = Math.floor(index / 6);
        const indexInGroup = index % 6; // 0 to 5

        // Even groups wave RIGHT (+), Odd groups wave LEFT (-)
        const direction = groupIndex % 2 === 0 ? 1 : -1;

        // Map 0..5 to a semi-circle (0 to PI)
        const angle = (indexInGroup / 5) * Math.PI;

        const multiplier = Math.sin(angle);
        const translateX = multiplier * X_AMPLITUDE * direction;

        return { transform: [{ translateX }] };
    };

    const renderTestItem = useCallback(
        ({ item, index }) => {
            const testProgress = progressData[item.id];
            let progressPercent = 0;
            let progressText = "0%";
            let isCompleted = false;

            const isLocked = !isPro && index >= 5;

            if (testProgress) {
                const totalQuestions = item.questions.length;
                const completedIndex = testProgress.index;
                if (completedIndex >= totalQuestions) {
                    isCompleted = true;
                    progressPercent = 100;
                } else {
                    progressPercent = (completedIndex / totalQuestions) * 100;
                    progressText = `${completedIndex}/${totalQuestions}`;
                }
            }

            // --- DECORATION LOGIC ---
            const groupIndex = Math.floor(index / 6);
            const indexInGroup = index % 6;

            // Place image at the peak item (Index 2)
            const showDecoration = indexInGroup === 2;

            // Determine position to center it in the empty space
            const waveDirection = groupIndex % 2 === 0 ? 1 : -1;

            let decorationStyle = {};

            if (showDecoration) {
                // If Wave is RIGHT (1) -> Pocket is LEFT. Center of Left quadrant = width * 0.25
                // If Wave is LEFT (-1) -> Pocket is RIGHT. Center of Right quadrant = width * 0.75
                const centerX = waveDirection === 1 ? width * 0.25 : width * 0.75;

                decorationStyle = {
                    left: centerX - IMG_SIZE / 2, // Center the image horizontally
                    top: 10, // Slight vertical nudge to align with visual center of group
                };
            }

            // Divider appears after every 6th item
            const isEndOfGroup = (index + 1) % 6 === 0;

            return (
                <View style={styles.itemWrapper}>
                    {/* Placeholder Image (Centered in the Pocket) */}
                    {showDecoration && (
                        <View style={[styles.decorationContainer, decorationStyle]}>
                            <Image
                                source={require("../../assets/images/thinking_man.png")}
                                style={styles.decorationImage}
                                resizeMode="contain"
                            />
                        </View>
                    )}

                    {/* The Test Node */}
                    <View style={[styles.nodeContainer, getSnakeStyle(index)]}>
                        <TestListItem
                            item={item}
                            onPress={() => handleTestPress(item, isLocked)}
                            isViewable={true}
                            progressPercent={progressPercent}
                            progressText={progressText}
                            isCompleted={isCompleted}
                            isLocked={isLocked}
                        />
                    </View>

                    {/* Group Divider */}
                    {isEndOfGroup && index !== testsToDisplay.length - 1 && (
                        <View style={styles.groupDividerContainer}>
                            <View style={styles.groupDividerLine} />
                            <Text style={styles.groupDividerText}>SECTION {Math.floor(index / 6) + 1} COMPLETED</Text>
                            <View style={styles.groupDividerLine} />
                        </View>
                    )}
                </View>
            );
        },
        [progressData, isPro, testsToDisplay.length]
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
            <View style={styles.headerContainer}>
                <Text style={styles.titleText}>{currentLevelTitle}</Text>
                <DownloadButton levelId={currentLevelId} />
            </View>

            {testsToDisplay.length > 0 ? (
                <FlatList
                    data={testsToDisplay}
                    renderItem={renderTestItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    extraData={[progressData, isPro]}
                />
            ) : (
                <Text style={styles.name}>No tests found. Check connection.</Text>
            )}

            <ProModal visible={modalVisible} onClose={() => setModalVisible(false)} onGoPro={handleGoProNav} />
        </View>
    );
};

export default Tests;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2B29",
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    titleText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 30,
        alignItems: "center",
    },
    itemWrapper: {
        width: width,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 35,
    },
    nodeContainer: {
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },
    // --- DECORATION STYLES ---
    decorationContainer: {
        position: "absolute",
        opacity: 0.15, // Subtle watermark
        zIndex: 1,
    },
    decorationImage: {
        width: IMG_SIZE,
        height: IMG_SIZE,
        tintColor: "#81B64C",
    },
    name: {
        flex: 1,
        fontSize: 18,
        color: "#FFFFFF",
        fontWeight: "500",
        textAlign: "center",
        marginTop: 50,
    },
    groupDividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "85%",
        marginTop: 35,
        marginBottom: 5,
        opacity: 0.6,
    },
    groupDividerLine: {
        flex: 1,
        height: 1,
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: "#666",
        borderRadius: 1,
    },
    groupDividerText: {
        color: "#999",
        fontSize: 11,
        fontWeight: "800",
        marginHorizontal: 12,
        letterSpacing: 1,
        textTransform: "uppercase",
    },
});

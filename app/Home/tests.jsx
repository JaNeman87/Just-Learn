import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, View } from "react-native";
import DownloadButton from "../../components/DownloadButton";
import ProModal from "../../components/ProModal";
import StatusModal from "../../components/StatusModal";
import TestListItem from "../../components/TestListItem";
import { useMembership } from "../contexts/MembershipContext";
import { fetchLevelData } from "../services/contentService";

const LEVEL_KEY = "@JustLearn:selectedLevel";
const PROGRESS_KEY = "@JustLearnProgress";

// --- LAYOUT CONSTANTS ---
const { width } = Dimensions.get("window");
const ITEM_SIZE = 110;
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

    // Modals
    const [proModalVisible, setProModalVisible] = useState(false);
    const [sequenceModalVisible, setSequenceModalVisible] = useState(false);

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

    const handleTestPress = (test, isLocked, isDisabled) => {
        // Priority 1: Paywall Lock -> Show Pro Modal
        if (isLocked) {
            setProModalVisible(true);
            return;
        }

        // Priority 2: Sequential Lock -> Show Status Modal
        if (isDisabled) {
            setSequenceModalVisible(true);
            return;
        }

        navigation.navigate(`test`, { test: test, origin: "Tests" });
    };

    const handleGoProNav = () => {
        setProModalVisible(false);
        navigation.navigate("membership");
    };

    // --- SNAKE LOGIC ---
    const getSnakeStyle = index => {
        const groupIndex = Math.floor(index / 6);
        const indexInGroup = index % 6;
        const direction = groupIndex % 2 === 0 ? 1 : -1;
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

            // --- LOCK LOGIC ---

            // 1. Check Previous Completion (Sequential)
            let isPreviousCompleted = true;
            if (index > 0) {
                const prevItem = testsToDisplay[index - 1];
                const prevProgress = progressData[prevItem.id];
                if (prevProgress) {
                    const prevTotal = prevItem.questions.length;
                    const prevIndex = prevProgress.index;
                    isPreviousCompleted = prevIndex >= prevTotal;
                } else {
                    isPreviousCompleted = false;
                }
            }

            // 2. Paywall Lock
            // UPDATED: First 6 tests (0,1,2,3,4,5) are free. Index >= 6 is locked.
            const isPaywallLocked = !isPro && index >= 6;

            // 3. Sequential Lock
            // Only considered if NOT Paywall Locked (Paywall takes precedence visually)
            const isSequentialLocked = !isPreviousCompleted;

            // --- DECORATION LOGIC ---
            const groupIndex = Math.floor(index / 6);
            const indexInGroup = index % 6;
            const showDecoration = indexInGroup === 2;
            const waveDirection = groupIndex % 2 === 0 ? 1 : -1;
            let decorationStyle = {};

            if (showDecoration) {
                const centerX = waveDirection === 1 ? width * 0.25 : width * 0.75;
                decorationStyle = {
                    left: centerX - IMG_SIZE / 2,
                    top: 10,
                };
            }

            const isEndOfGroup = (index + 1) % 6 === 0;

            return (
                <View style={styles.itemWrapper}>
                    {showDecoration && (
                        <View style={[styles.decorationContainer, decorationStyle]}>
                            <Image
                                source={require("../../assets/images/thinking_man.png")}
                                style={styles.decorationImage}
                                resizeMode="contain"
                            />
                        </View>
                    )}

                    <View style={[styles.nodeContainer, getSnakeStyle(index)]}>
                        <TestListItem
                            item={item}
                            onPress={() => handleTestPress(item, isPaywallLocked, isSequentialLocked)}
                            isViewable={true}
                            progressPercent={progressPercent}
                            progressText={progressText}
                            isCompleted={isCompleted}
                            isLocked={isPaywallLocked} // Shows Lock Icon
                            isDisabled={isSequentialLocked} // Shows Clock Icon
                        />
                    </View>

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

            {/* Paywall Modal */}
            <ProModal visible={proModalVisible} onClose={() => setProModalVisible(false)} onGoPro={handleGoProNav} />

            {/* Sequence Modal */}
            <StatusModal
                visible={sequenceModalVisible}
                type="info"
                title="Locked"
                message="Please finish the previous test to unlock this one."
                confirmText="OK"
                onConfirm={() => setSequenceModalVisible(false)}
            />
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
    decorationContainer: {
        position: "absolute",
        opacity: 0.15,
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

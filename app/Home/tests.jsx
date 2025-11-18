import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native"; // Removed Alert
import TestListItem from "../../components/TestListItem";
import { useMembership } from "../contexts/MembershipContext";
import { LANGUAGE_LEVELS as tests } from "../services/mockData";
// 1. Import the new Modal
import ProModal from "../../components/ProModal";

const LEVEL_KEY = "@JustLearn:selectedLevel";
const PROGRESS_KEY = "@JustLearnProgress";

const Tests = () => {
    const navigation = useNavigation();
    const { isPro } = useMembership();

    const [loading, setLoading] = useState(true);
    const [testsToDisplay, setTestsToDisplay] = useState([]);
    const [currentLevelTitle, setCurrentLevelTitle] = useState("");
    const [viewableItems, setViewableItems] = useState(new Set());
    const [progressData, setProgressData] = useState({});

    // 2. Add Modal State
    const [modalVisible, setModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const loadSelectedTests = async () => {
                setLoading(true);
                try {
                    const [savedLevel, progressJson] = await Promise.all([
                        AsyncStorage.getItem(LEVEL_KEY),
                        AsyncStorage.getItem(PROGRESS_KEY),
                    ]);

                    const level = savedLevel || "A1";
                    const levelData = tests[level];

                    setProgressData(progressJson ? JSON.parse(progressJson) : {});

                    if (levelData) {
                        setTestsToDisplay(levelData.tests || []);
                        setCurrentLevelTitle(levelData.title || level);
                    } else {
                        setTestsToDisplay([]);
                        setCurrentLevelTitle("No level data found");
                    }
                } catch (e) {
                    console.error("Failed to load tests for level", e);
                    setTestsToDisplay([]);
                }
                setLoading(false);
            };

            loadSelectedTests();
        }, [])
    );

    // 3. Updated Handler using Modal
    const handleTestPress = (test, isLocked) => {
        if (isLocked) {
            setModalVisible(true); // Show Modal
            return;
        }
        navigation.navigate(`test`, { test: test, origin: "Tests" });
    };

    // 4. Handle Modal Actions
    const handleGoProNav = () => {
        setModalVisible(false);
        navigation.navigate("membership");
    };

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        const newViewableKeys = new Set(viewableItems.map(item => item.key));
        setViewableItems(newViewableKeys);
    }, []);

    const renderTestItem = useCallback(
        ({ item, index }) => {
            const testProgress = progressData[item.id];
            let progressPercent = 0;
            let progressText = "0%";
            let isCompleted = false;

            const isLocked = !isPro && index > 0;

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

            return (
                <TestListItem
                    item={item}
                    onPress={() => handleTestPress(item, isLocked)}
                    isViewable={viewableItems.has(item.id)}
                    progressPercent={progressPercent}
                    progressText={progressText}
                    isCompleted={isCompleted}
                    isLocked={isLocked}
                />
            );
        },
        [viewableItems, progressData, isPro]
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
            <Text style={styles.titleText}>{currentLevelTitle}</Text>
            {testsToDisplay.length > 0 ? (
                <FlatList
                    data={testsToDisplay}
                    renderItem={renderTestItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={{
                        itemVisiblePercentThreshold: 20,
                    }}
                    extraData={[progressData, isPro]}
                />
            ) : (
                <Text style={styles.name}>No tests found for this level.</Text>
            )}

            {/* 5. Render Modal */}
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
    scrollContent: {
        padding: 20,
        paddingTop: 0,
    },
    titleText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    name: {
        flex: 1,
        fontSize: 18,
        color: "#FFFFFF",
        fontWeight: "500",
    },
});

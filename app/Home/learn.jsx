import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import LearnTopicItem from "../../components/LearnTopicItem";
import ProModal from "../../components/ProModal";
import { useMembership } from "../contexts/MembershipContext";

// 1. Import Service & Download Button
import DownloadButton from "../../components/DownloadButton";
import { fetchLevelData } from "../services/contentService";

const LEVEL_KEY = "@JustLearn:selectedLevel";

const Learn = () => {
    const navigation = useNavigation();
    const { isPro } = useMembership();

    const [loading, setLoading] = useState(true);
    const [topicsToDisplay, setTopicsToDisplay] = useState([]);
    const [currentLevelTitle, setCurrentLevelTitle] = useState("");
    const [viewableItems, setViewableItems] = useState(new Set());
    const [modalVisible, setModalVisible] = useState(false);

    // 2. State for Level ID
    const [currentLevelId, setCurrentLevelId] = useState(null);

    useFocusEffect(
        useCallback(() => {
            setTopicsToDisplay([]);
            setViewableItems(new Set());

            const loadData = async () => {
                setLoading(true);
                try {
                    const savedLevel = (await AsyncStorage.getItem(LEVEL_KEY)) || "A1";
                    setCurrentLevelId(savedLevel); // Store ID for the button

                    // Fetch Data (Checks local storage first)
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

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        const newViewableKeys = new Set(viewableItems.map(item => item.key));
        setViewableItems(newViewableKeys);
    }, []);

    const renderTopicItem = useCallback(
        ({ item, index }) => {
            const isLocked = !isPro && index >= 5;

            return (
                <LearnTopicItem
                    item={item}
                    onPress={() => goToFlashcards(item, isLocked)}
                    isViewable={viewableItems.has(item.id)}
                    isLocked={isLocked}
                />
            );
        },
        [viewableItems, isPro]
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
            {/* 3. Header with Download Button */}
            <View style={styles.headerContainer}>
                <Text style={styles.titleText}>{currentLevelTitle}</Text>
                <DownloadButton levelId={currentLevelId} />
            </View>

            {topicsToDisplay.length > 0 ? (
                <FlatList
                    data={topicsToDisplay}
                    renderItem={renderTopicItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={{
                        itemVisiblePercentThreshold: 20,
                    }}
                    extraData={isPro}
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
        backgroundColor: "#2C2B29",
    },
    // 4. New Header Style
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
        padding: 20,
        paddingTop: 0,
    },
    noTopicsText: {
        flex: 1,
        fontSize: 18,
        color: "#AAAAAA",
        textAlign: "center",
        marginTop: 50,
    },
});

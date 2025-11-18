import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { LANGUAGE_LEVELS as tests } from "../services/mockData";
// 1. Import your new component
import LearnTopicItem from "../../components/LearnTopicItem"; // <-- Adjust path as needed

const LEVEL_KEY = "@JustLearn:selectedLevel";

const Learn = () => {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [topicsToDisplay, setTopicsToDisplay] = useState([]);
    const [currentLevelTitle, setCurrentLevelTitle] = useState("");
    const [viewableItems, setViewableItems] = useState(new Set());

    // 2. We use useFocusEffect to reload the level
    //    and reset animations every time
    useFocusEffect(
        useCallback(() => {
            // Clear list to force re-animation
            setTopicsToDisplay([]);
            setViewableItems(new Set());

            const loadSelectedTopics = async () => {
                setLoading(true);
                try {
                    const savedLevel = await AsyncStorage.getItem(LEVEL_KEY);
                    const level = savedLevel || "A1";
                    const levelData = tests[level];

                    if (levelData) {
                        setTopicsToDisplay(levelData.tests || []);
                        setCurrentLevelTitle(levelData.title || level);
                    } else {
                        setTopicsToDisplay([]);
                        setCurrentLevelTitle("No level data found");
                    }
                } catch (e) {
                    console.error("Failed to load topics for level", e);
                    setTopicsToDisplay([]);
                }
                setLoading(false);
            };

            loadSelectedTopics();
        }, [])
    );

    const goToFlashcards = testTopic => {
        navigation.navigate(`FlashcardScreen`, { questions: testTopic.questions });
    };

    // 3. New handler for when viewable items change
    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        const newViewableKeys = new Set(viewableItems.map(item => item.key));
        setViewableItems(newViewableKeys);
    }, []);

    // 4. New renderItem function for the FlatList
    const renderTopicItem = useCallback(
        ({ item }) => (
            <LearnTopicItem
                item={item}
                onPress={() => goToFlashcards(item)}
                isViewable={viewableItems.has(item.id)} // Pass viewability status
            />
        ),
        [viewableItems]
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#81B64C" />
            </View>
        );
    }

    return (
        // 5. Replaced ScrollView with FlatList
        <View style={styles.container}>
            <Text style={styles.titleText}>{currentLevelTitle}</Text>
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
                />
            ) : (
                <Text style={styles.noTopicsText}>No topics found for this level.</Text>
            )}
        </View>
    );
};

export default Learn;

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
    noTopicsText: {
        flex: 1,
        fontSize: 18,
        color: "#AAAAAA",
        textAlign: "center",
        marginTop: 50,
    },
});

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useFocusEffect } from "@react-navigation/native";
// import { useNavigation } from "expo-router";
// import { useCallback, useState } from "react";
// import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native"; // Removed Alert
// import LearnTopicItem from "../../components/LearnTopicItem";
// import { useMembership } from "../contexts/MembershipContext";
// import { LANGUAGE_LEVELS as tests } from "../services/mockData";
// // 1. Import Modal
// import ProModal from "../../components/ProModal";

// const LEVEL_KEY = "@JustLearn:selectedLevel";

// const Learn = () => {
//     const navigation = useNavigation();
//     const { isPro } = useMembership();

//     const [loading, setLoading] = useState(true);
//     const [topicsToDisplay, setTopicsToDisplay] = useState([]);
//     const [currentLevelTitle, setCurrentLevelTitle] = useState("");
//     const [viewableItems, setViewableItems] = useState(new Set());

//     // 2. Add Modal State
//     const [modalVisible, setModalVisible] = useState(false);

//     useFocusEffect(
//         useCallback(() => {
//             setTopicsToDisplay([]);
//             setViewableItems(new Set());

//             const loadSelectedTopics = async () => {
//                 setLoading(true);
//                 try {
//                     const savedLevel = await AsyncStorage.getItem(LEVEL_KEY);
//                     const level = savedLevel || "A1";
//                     const levelData = tests[level];

//                     if (levelData) {
//                         setTopicsToDisplay(levelData.tests || []);
//                         setCurrentLevelTitle(levelData.title || level);
//                     } else {
//                         setTopicsToDisplay([]);
//                         setCurrentLevelTitle("No level data found");
//                     }
//                 } catch (e) {
//                     console.error("Failed to load topics for level", e);
//                     setTopicsToDisplay([]);
//                 }
//                 setLoading(false);
//             };

//             loadSelectedTopics();
//         }, [])
//     );

//     // 3. Updated Handler
//     const goToFlashcards = (testTopic, isLocked) => {
//         if (isLocked) {
//             setModalVisible(true); // Show Modal
//             return;
//         }
//         navigation.navigate(`FlashcardScreen`, { questions: testTopic.questions });
//     };

//     // 4. Handler for Modal Action
//     const handleGoProNav = () => {
//         setModalVisible(false);
//         navigation.navigate("membership");
//     };

//     const onViewableItemsChanged = useCallback(({ viewableItems }) => {
//         const newViewableKeys = new Set(viewableItems.map(item => item.key));
//         setViewableItems(newViewableKeys);
//     }, []);

//     const renderTopicItem = useCallback(
//         ({ item, index }) => {
//             const isLocked = !isPro && index > 0;

//             return (
//                 <LearnTopicItem
//                     item={item}
//                     onPress={() => goToFlashcards(item, isLocked)}
//                     isViewable={viewableItems.has(item.id)}
//                     isLocked={isLocked}
//                 />
//             );
//         },
//         [viewableItems, isPro]
//     );

//     if (loading) {
//         return (
//             <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
//                 <ActivityIndicator size="large" color="#81B64C" />
//             </View>
//         );
//     }

//     return (
//         <View style={styles.container}>
//             <Text style={styles.titleText}>{currentLevelTitle}</Text>
//             {topicsToDisplay.length > 0 ? (
//                 <FlatList
//                     data={topicsToDisplay}
//                     renderItem={renderTopicItem}
//                     keyExtractor={item => item.id}
//                     contentContainerStyle={styles.scrollContent}
//                     showsVerticalScrollIndicator={false}
//                     onViewableItemsChanged={onViewableItemsChanged}
//                     viewabilityConfig={{
//                         itemVisiblePercentThreshold: 20,
//                     }}
//                     extraData={isPro}
//                 />
//             ) : (
//                 <Text style={styles.noTopicsText}>No topics found for this level.</Text>
//             )}

//             {/* 5. Render Modal */}
//             <ProModal visible={modalVisible} onClose={() => setModalVisible(false)} onGoPro={handleGoProNav} />
//         </View>
//     );
// };

// export default Learn;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#2C2B29",
//     },
//     scrollContent: {
//         padding: 20,
//         paddingTop: 0,
//     },
//     titleText: {
//         color: "#fff",
//         fontSize: 24,
//         fontWeight: "bold",
//         marginBottom: 20,
//         paddingHorizontal: 20,
//         paddingTop: 40,
//     },
//     noTopicsText: {
//         flex: 1,
//         fontSize: 18,
//         color: "#AAAAAA",
//         textAlign: "center",
//         marginTop: 50,
//     },
// });

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import LearnTopicItem from "../../components/LearnTopicItem";
import ProModal from "../../components/ProModal";
import { useMembership } from "../contexts/MembershipContext";

// 1. IMPORT THE NEW SERVICE
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

    useFocusEffect(
        useCallback(() => {
            setTopicsToDisplay([]);
            setViewableItems(new Set());

            const loadData = async () => {
                setLoading(true);
                try {
                    const savedLevel = (await AsyncStorage.getItem(LEVEL_KEY)) || "A1";

                    // 2. FETCH FROM SUPABASE
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

    // ... Rest of component remains the same ...
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
            const isLocked = !isPro && index > 0;
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
            <Text style={styles.titleText}>{currentLevelTitle}</Text>
            {topicsToDisplay.length > 0 ? (
                <FlatList
                    data={topicsToDisplay}
                    renderItem={renderTopicItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={{ itemVisiblePercentThreshold: 20 }}
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

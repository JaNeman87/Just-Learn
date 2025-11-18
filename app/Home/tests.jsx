// import { useNavigation } from "expo-router";
// import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
// import { LANGUAGE_LEVELS as tests } from "../services/mockData";
// // 1. --- Import useEffect ---
// import { useCallback, useEffect, useState } from "react";
// // 2. --- REMOVE useFocusEffect ---
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import TestListItem from "../../components/TestListItem"; // <-- Adjust path as needed

// const LEVEL_KEY = "@JustLearn:selectedLevel";

// const Tests = () => {
//     const navigation = useNavigation();

//     const [loading, setLoading] = useState(true);
//     const [testsToDisplay, setTestsToDisplay] = useState([]);
//     const [currentLevelTitle, setCurrentLevelTitle] = useState("");
//     const [viewableItems, setViewableItems] = useState(new Set());

//     // 3. --- REVERT to simple useEffect ---
//     useEffect(() => {
//         const loadSelectedTests = async () => {
//             setLoading(true);
//             try {
//                 const savedLevel = await AsyncStorage.getItem(LEVEL_KEY);
//                 const level = savedLevel || "A1";
//                 const levelData = tests[level];

//                 if (levelData) {
//                     setTestsToDisplay(levelData.tests || []);
//                     setCurrentLevelTitle(levelData.title || level);
//                 } else {
//                     setTestsToDisplay([]);
//                     setCurrentLevelTitle("No level data found");
//                 }
//             } catch (e) {
//                 console.error("Failed to load tests for level", e);
//                 setTestsToDisplay([]);
//             }
//             setLoading(false);
//         };

//         loadSelectedTests();
//     }, []); // The empty array `[]` means this runs ONCE when the screen mounts.

//     const goToTest = test => {
//         navigation.navigate(`test`, { test: test, origin: "Tests" });
//     };

//     const onViewableItemsChanged = useCallback(({ viewableItems }) => {
//         const newViewableKeys = new Set(viewableItems.map(item => item.key));
//         setViewableItems(newViewableKeys);
//     }, []);

//     const renderTestItem = useCallback(
//         ({ item }) => (
//             <TestListItem item={item} onPress={() => goToTest(item)} isViewable={viewableItems.has(item.id)} />
//         ),
//         [viewableItems]
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
//             {testsToDisplay.length > 0 ? (
//                 <FlatList
//                     data={testsToDisplay}
//                     renderItem={renderTestItem}
//                     keyExtractor={item => item.id}
//                     contentContainerStyle={styles.scrollContent}
//                     showsVerticalScrollIndicator={false}
//                     onViewableItemsChanged={onViewableItemsChanged}
//                     viewabilityConfig={{
//                         itemVisiblePercentThreshold: 20,
//                     }}
//                 />
//             ) : (
//                 <Text style={styles.name}>No tests found for this level.</Text>
//             )}
//         </View>
//     );
// };

// export default Tests;

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
//     name: {
//         flex: 1,
//         fontSize: 18,
//         color: "#FFFFFF",
//         fontWeight: "500",
//     },
// });

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "expo-router";
// import { useCallback, useEffect, useState } from "react";
// import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
// import TestListItem from "../../components/TestListItem";
// import { LANGUAGE_LEVELS as tests } from "../services/mockData";

// const LEVEL_KEY = "@JustLearn:selectedLevel";
// const PROGRESS_KEY = "@JustLearnProgress"; // 1. Add the progress key

// const Tests = () => {
//     const navigation = useNavigation();

//     const [loading, setLoading] = useState(true);
//     const [testsToDisplay, setTestsToDisplay] = useState([]);
//     const [currentLevelTitle, setCurrentLevelTitle] = useState("");
//     const [viewableItems, setViewableItems] = useState(new Set());

//     // 2. Add new state to hold all progress data
//     const [progressData, setProgressData] = useState({});

//     useEffect(() => {
//         const loadSelectedTests = async () => {
//             setLoading(true);
//             try {
//                 // 3. Load both level and progress data in parallel
//                 const [savedLevel, progressJson] = await Promise.all([
//                     AsyncStorage.getItem(LEVEL_KEY),
//                     AsyncStorage.getItem(PROGRESS_KEY),
//                 ]);

//                 const level = savedLevel || "A1";
//                 const levelData = tests[level];

//                 setProgressData(progressJson ? JSON.parse(progressJson) : {}); // 4. Save progress to state

//                 if (levelData) {
//                     setTestsToDisplay(levelData.tests || []);
//                     setCurrentLevelTitle(levelData.title || level);
//                 } else {
//                     setTestsToDisplay([]);
//                     setCurrentLevelTitle("No level data found");
//                 }
//             } catch (e) {
//                 console.error("Failed to load tests for level", e);
//                 setTestsToDisplay([]);
//             }
//             setLoading(false);
//         };

//         loadSelectedTests();
//     }, []);

//     const goToTest = test => {
//         navigation.navigate(`test`, { test: test, origin: "Tests" });
//     };

//     const onViewableItemsChanged = useCallback(({ viewableItems }) => {
//         const newViewableKeys = new Set(viewableItems.map(item => item.key));
//         setViewableItems(newViewableKeys);
//     }, []);

//     // 5. Update renderItem to pass new props
//     const renderTestItem = useCallback(
//         ({ item }) => {
//             const testProgress = progressData[item.id];
//             let progressText = "0%";
//             let progressPercent = 0;

//             if (testProgress) {
//                 const totalQuestions = item.questions.length;
//                 const completed = testProgress.index;
//                 progressPercent = (completed / totalQuestions) * 100;
//                 progressText = `${completed}/${totalQuestions}`;
//             }

//             return (
//                 <TestListItem
//                     item={item}
//                     onPress={() => goToTest(item)}
//                     isViewable={viewableItems.has(item.id)}
//                     progressPercent={progressPercent} // Pass the percentage
//                     progressText={progressText} // Pass the "5/30" text
//                 />
//             );
//         },
//         [viewableItems, progressData] // Re-render if progressData changes
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
//             {testsToDisplay.length > 0 ? (
//                 <FlatList
//                     data={testsToDisplay}
//                     renderItem={renderTestItem}
//                     keyExtractor={item => item.id}
//                     contentContainerStyle={styles.scrollContent}
//                     showsVerticalScrollIndicator={false}
//                     onViewableItemsChanged={onViewableItemsChanged}
//                     viewabilityConfig={{
//                         itemVisiblePercentThreshold: 20,
//                     }}
//                 />
//             ) : (
//                 <Text style={styles.name}>No tests found for this level.</Text>
//             )}
//         </View>
//     );
// };

// export default Tests;

// // Styles are unchanged from your last version
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
//     name: {
//         flex: 1,
//         fontSize: 18,
//         color: "#FFFFFF",
//         fontWeight: "500",
//     },
// });

import { useNavigation } from "expo-router";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { LANGUAGE_LEVELS as tests } from "../services/mockData";
// 1. --- Import useFocusEffect ---
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import TestListItem from "../../components/TestListItem";

const LEVEL_KEY = "@JustLearn:selectedLevel";
const PROGRESS_KEY = "@JustLearnProgress";

const Tests = () => {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [testsToDisplay, setTestsToDisplay] = useState([]);
    const [currentLevelTitle, setCurrentLevelTitle] = useState("");
    const [viewableItems, setViewableItems] = useState(new Set());
    const [progressData, setProgressData] = useState({});

    // 2. --- SWAPPED to useFocusEffect ---
    // This will now re-run every time the user visits this screen
    useFocusEffect(
        useCallback(() => {
            const loadSelectedTests = async () => {
                setLoading(true);
                try {
                    // Load both level and progress data in parallel
                    const [savedLevel, progressJson] = await Promise.all([
                        AsyncStorage.getItem(LEVEL_KEY),
                        AsyncStorage.getItem(PROGRESS_KEY),
                    ]);

                    const level = savedLevel || "A1";
                    const levelData = tests[level];

                    setProgressData(progressJson ? JSON.parse(progressJson) : {}); // Save progress

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
        }, []) // Empty array ensures it runs on focus
    );

    const goToTest = test => {
        navigation.navigate(`test`, { test: test, origin: "Tests" });
    };

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        const newViewableKeys = new Set(viewableItems.map(item => item.key));
        setViewableItems(newViewableKeys);
    }, []);

    // 3. Update renderItem to pass new props (Unchanged, but now receives new progressData)
    const renderTestItem = useCallback(
        ({ item }) => {
            const testProgress = progressData[item.id];
            let progressPercent = 0;
            let progressText = "0%";
            let isCompleted = false; // <-- NEW

            if (testProgress) {
                const totalQuestions = item.questions.length;
                const completedIndex = testProgress.index;

                // Check if test is marked as complete
                if (completedIndex >= totalQuestions) {
                    isCompleted = true; // <-- SET COMPLETED
                    progressPercent = 100;
                } else {
                    // It's in progress
                    progressPercent = (completedIndex / totalQuestions) * 100;
                    progressText = `${completedIndex}/${totalQuestions}`;
                }
            }

            return (
                <TestListItem
                    item={item}
                    onPress={() => goToTest(item)}
                    isViewable={viewableItems.has(item.id)}
                    progressPercent={progressPercent}
                    progressText={progressText}
                    isCompleted={isCompleted} // <-- PASS NEW PROP
                />
            );
        },
        [viewableItems, progressData]
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
                    // 4. Add this prop to force re-render when data changes
                    extraData={progressData}
                />
            ) : (
                <Text style={styles.name}>No tests found for this level.</Text>
            )}
        </View>
    );
};

export default Tests;

// Styles are unchanged
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

// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { useFocusEffect } from "@react-navigation/native";
// // import { useNavigation } from "expo-router";
// // import { useCallback, useState } from "react";
// // import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
// // import ProModal from "../../components/ProModal";
// // import TestListItem from "../../components/TestListItem";
// // import { useMembership } from "../contexts/MembershipContext";

// // // 1. IMPORT THE NEW SERVICE instead of mockData
// // import { fetchLevelData } from "../services/contentService";

// // const LEVEL_KEY = "@JustLearn:selectedLevel";
// // const PROGRESS_KEY = "@JustLearnProgress";

// // const Tests = () => {
// //     const navigation = useNavigation();
// //     const { isPro } = useMembership();

// //     const [loading, setLoading] = useState(true);
// //     const [testsToDisplay, setTestsToDisplay] = useState([]);
// //     const [currentLevelTitle, setCurrentLevelTitle] = useState("");
// //     const [viewableItems, setViewableItems] = useState(new Set());
// //     const [progressData, setProgressData] = useState({});
// //     const [modalVisible, setModalVisible] = useState(false);

// //     useFocusEffect(
// //         useCallback(() => {
// //             const loadData = async () => {
// //                 setLoading(true);
// //                 try {
// //                     const [savedLevel, progressJson] = await Promise.all([
// //                         AsyncStorage.getItem(LEVEL_KEY),
// //                         AsyncStorage.getItem(PROGRESS_KEY),
// //                     ]);

// //                     const levelId = savedLevel || "A1";

// //                     // 2. FETCH FROM SUPABASE
// //                     const levelData = await fetchLevelData(levelId);

// //                     setProgressData(progressJson ? JSON.parse(progressJson) : {});

// //                     if (levelData) {
// //                         setTestsToDisplay(levelData.tests || []);
// //                         setCurrentLevelTitle(levelData.title || levelId);
// //                     } else {
// //                         setTestsToDisplay([]);
// //                         setCurrentLevelTitle("No content found");
// //                     }
// //                 } catch (e) {
// //                     console.error("Failed to load tests", e);
// //                     setTestsToDisplay([]);
// //                 }
// //                 setLoading(false);
// //             };

// //             loadData();
// //         }, [])
// //     );

// //     const handleTestPress = (test, isLocked) => {
// //         if (isLocked) {
// //             setModalVisible(true);
// //             return;
// //         }
// //         navigation.navigate(`test`, { test: test, origin: "Tests" });
// //     };

// //     const handleGoProNav = () => {
// //         setModalVisible(false);
// //         navigation.navigate("membership");
// //     };

// //     const onViewableItemsChanged = useCallback(({ viewableItems }) => {
// //         const newViewableKeys = new Set(viewableItems.map(item => item.key));
// //         setViewableItems(newViewableKeys);
// //     }, []);

// //     const renderTestItem = useCallback(
// //         ({ item, index }) => {
// //             const testProgress = progressData[item.id];
// //             let progressPercent = 0;
// //             let progressText = "0%";
// //             let isCompleted = false;

// //             // Logic: First test (index 0) is free. Rest are locked if not Pro.
// //             const isLocked = !isPro && index > 0;

// //             if (testProgress) {
// //                 const totalQuestions = item.questions.length;
// //                 const completedIndex = testProgress.index;

// //                 if (completedIndex >= totalQuestions) {
// //                     isCompleted = true;
// //                     progressPercent = 100;
// //                 } else {
// //                     progressPercent = (completedIndex / totalQuestions) * 100;
// //                     progressText = `${completedIndex}/${totalQuestions}`;
// //                 }
// //             }

// //             return (
// //                 <TestListItem
// //                     item={item}
// //                     onPress={() => handleTestPress(item, isLocked)}
// //                     isViewable={viewableItems.has(item.id)}
// //                     progressPercent={progressPercent}
// //                     progressText={progressText}
// //                     isCompleted={isCompleted}
// //                     isLocked={isLocked}
// //                 />
// //             );
// //         },
// //         [viewableItems, progressData, isPro]
// //     );

// //     if (loading) {
// //         return (
// //             <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
// //                 <ActivityIndicator size="large" color="#81B64C" />
// //             </View>
// //         );
// //     }

// //     return (
// //         <View style={styles.container}>
// //             <Text style={styles.titleText}>{currentLevelTitle}</Text>
// //             {testsToDisplay.length > 0 ? (
// //                 <FlatList
// //                     data={testsToDisplay}
// //                     renderItem={renderTestItem}
// //                     keyExtractor={item => item.id}
// //                     contentContainerStyle={styles.scrollContent}
// //                     showsVerticalScrollIndicator={false}
// //                     onViewableItemsChanged={onViewableItemsChanged}
// //                     viewabilityConfig={{ itemVisiblePercentThreshold: 20 }}
// //                     extraData={[progressData, isPro]}
// //                 />
// //             ) : (
// //                 <Text style={styles.name}>No tests found. Check internet connection.</Text>
// //             )}

// //             <ProModal visible={modalVisible} onClose={() => setModalVisible(false)} onGoPro={handleGoProNav} />
// //         </View>
// //     );
// // };

// // export default Tests;

// // const styles = StyleSheet.create({
// //     container: {
// //         flex: 1,
// //         backgroundColor: "#2C2B29",
// //     },
// //     scrollContent: {
// //         padding: 20,
// //         paddingTop: 0,
// //     },
// //     titleText: {
// //         color: "#fff",
// //         fontSize: 24,
// //         fontWeight: "bold",
// //         marginBottom: 20,
// //         paddingHorizontal: 20,
// //         paddingTop: 40,
// //     },
// //     name: {
// //         flex: 1,
// //         fontSize: 18,
// //         color: "#FFFFFF",
// //         fontWeight: "500",
// //         textAlign: "center",
// //         marginTop: 50,
// //     },
// // });

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useFocusEffect } from "@react-navigation/native";
// import { useNavigation } from "expo-router";
// import { useCallback, useState } from "react";
// import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
// import ProModal from "../../components/ProModal";
// import TestListItem from "../../components/TestListItem";
// import { useMembership } from "../contexts/MembershipContext";

// // 1. Import Service & Component
// import DownloadButton from "../../components/DownloadButton";
// import { fetchLevelData } from "../services/contentService";

// const LEVEL_KEY = "@JustLearn:selectedLevel";
// const PROGRESS_KEY = "@JustLearnProgress";

// const Tests = () => {
//     const navigation = useNavigation();
//     const { isPro } = useMembership();

//     const [loading, setLoading] = useState(true);
//     const [testsToDisplay, setTestsToDisplay] = useState([]);
//     const [currentLevelTitle, setCurrentLevelTitle] = useState("");
//     const [viewableItems, setViewableItems] = useState(new Set());
//     const [progressData, setProgressData] = useState({});
//     const [modalVisible, setModalVisible] = useState(false);

//     // 2. State to store the Level ID (e.g., "A1")
//     const [currentLevelId, setCurrentLevelId] = useState(null);

//     useFocusEffect(
//         useCallback(() => {
//             const loadData = async () => {
//                 setLoading(true);
//                 try {
//                     const [savedLevel, progressJson] = await Promise.all([
//                         AsyncStorage.getItem(LEVEL_KEY),
//                         AsyncStorage.getItem(PROGRESS_KEY),
//                     ]);

//                     const levelId = savedLevel || "A1";
//                     setCurrentLevelId(levelId); // Store ID for the button

//                     // Fetch Data (Service checks local storage first automatically!)
//                     const levelData = await fetchLevelData(levelId);

//                     setProgressData(progressJson ? JSON.parse(progressJson) : {});

//                     if (levelData) {
//                         setTestsToDisplay(levelData.tests || []);
//                         setCurrentLevelTitle(levelData.title || levelId);
//                     } else {
//                         setTestsToDisplay([]);
//                         setCurrentLevelTitle("No content found");
//                     }
//                 } catch (e) {
//                     console.error("Failed to load tests", e);
//                     setTestsToDisplay([]);
//                 }
//                 setLoading(false);
//             };

//             loadData();
//         }, [])
//     );

//     const handleTestPress = (test, isLocked) => {
//         if (isLocked) {
//             setModalVisible(true);
//             return;
//         }
//         navigation.navigate(`test`, { test: test, origin: "Tests" });
//     };

//     const handleGoProNav = () => {
//         setModalVisible(false);
//         navigation.navigate("membership");
//     };

//     const onViewableItemsChanged = useCallback(({ viewableItems }) => {
//         const newViewableKeys = new Set(viewableItems.map(item => item.key));
//         setViewableItems(newViewableKeys);
//     }, []);

//     const renderTestItem = useCallback(
//         ({ item, index }) => {
//             const testProgress = progressData[item.id];
//             let progressPercent = 0;
//             let progressText = "0%";
//             let isCompleted = false;

//             const isLocked = !isPro && index > 0;

//             if (testProgress) {
//                 const totalQuestions = item.questions.length;
//                 const completedIndex = testProgress.index;
//                 if (completedIndex >= totalQuestions) {
//                     isCompleted = true;
//                     progressPercent = 100;
//                 } else {
//                     progressPercent = (completedIndex / totalQuestions) * 100;
//                     progressText = `${completedIndex}/${totalQuestions}`;
//                 }
//             }

//             return (
//                 <TestListItem
//                     item={item}
//                     onPress={() => handleTestPress(item, isLocked)}
//                     isViewable={viewableItems.has(item.id)}
//                     progressPercent={progressPercent}
//                     progressText={progressText}
//                     isCompleted={isCompleted}
//                     isLocked={isLocked}
//                 />
//             );
//         },
//         [viewableItems, progressData, isPro]
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
//             {/* 3. Updated Header with Download Button */}
//             <View style={styles.headerContainer}>
//                 <Text style={styles.titleText}>{currentLevelTitle}</Text>
//                 <DownloadButton levelId={currentLevelId} />
//             </View>

//             {testsToDisplay.length > 0 ? (
//                 <FlatList
//                     data={testsToDisplay}
//                     renderItem={renderTestItem}
//                     keyExtractor={item => item.id}
//                     contentContainerStyle={styles.scrollContent}
//                     showsVerticalScrollIndicator={false}
//                     onViewableItemsChanged={onViewableItemsChanged}
//                     viewabilityConfig={{ itemVisiblePercentThreshold: 20 }}
//                     extraData={[progressData, isPro]}
//                 />
//             ) : (
//                 <Text style={styles.name}>No tests found. Check connection.</Text>
//             )}

//             <ProModal visible={modalVisible} onClose={() => setModalVisible(false)} onGoPro={handleGoProNav} />
//         </View>
//     );
// };

// export default Tests;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#2C2B29",
//     },
//     // 4. New Header Style
//     headerContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingTop: 40, // Status bar padding
//         paddingBottom: 20,
//         paddingHorizontal: 20,
//     },
//     titleText: {
//         color: "#fff",
//         fontSize: 24,
//         fontWeight: "bold",
//         flex: 1, // Allow text to take available space
//     },
//     scrollContent: {
//         padding: 20,
//         paddingTop: 0,
//     },
//     name: {
//         flex: 1,
//         fontSize: 18,
//         color: "#FFFFFF",
//         fontWeight: "500",
//         textAlign: "center",
//         marginTop: 50,
//     },
// });

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import ProModal from "../../components/ProModal";
import TestListItem from "../../components/TestListItem";
import { useMembership } from "../contexts/MembershipContext";

// 1. Import Service & Component
import DownloadButton from "../../components/DownloadButton";
import { fetchLevelData } from "../services/contentService";

const LEVEL_KEY = "@JustLearn:selectedLevel";
const PROGRESS_KEY = "@JustLearnProgress";

const Tests = () => {
    const navigation = useNavigation();
    const { isPro } = useMembership();

    const [loading, setLoading] = useState(true);
    const [testsToDisplay, setTestsToDisplay] = useState([]);
    const [currentLevelTitle, setCurrentLevelTitle] = useState("");
    // REMOVED: const [viewableItems, setViewableItems] = useState(new Set());
    const [progressData, setProgressData] = useState({});
    const [modalVisible, setModalVisible] = useState(false);

    // 2. State to store the Level ID (e.g., "A1")
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
                    setCurrentLevelId(levelId); // Store ID for the button

                    // Fetch Data (Service checks local storage first automatically!)
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

    // REMOVED: onViewableItemsChanged

    const renderTestItem = useCallback(
        ({ item, index }) => {
            const testProgress = progressData[item.id];
            let progressPercent = 0;
            let progressText = "0%";
            let isCompleted = false;

            // CHANGE: Unlock the first 5 tests (Index 0 to 4)
            // Previously: const isLocked = !isPro && index > 0;
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

            return (
                <TestListItem
                    item={item}
                    onPress={() => handleTestPress(item, isLocked)}
                    isViewable={true}
                    progressPercent={progressPercent}
                    progressText={progressText}
                    isCompleted={isCompleted}
                    isLocked={isLocked}
                />
            );
        },
        [progressData, isPro]
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
            {/* 3. Updated Header with Download Button */}
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
                    // REMOVED: onViewableItemsChanged logic
                    // REMOVED: viewabilityConfig
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
    // 4. New Header Style
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 40, // Status bar padding
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    titleText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
        flex: 1, // Allow text to take available space
    },
    scrollContent: {
        padding: 20,
        paddingTop: 0,
    },
    name: {
        flex: 1,
        fontSize: 18,
        color: "#FFFFFF",
        fontWeight: "500",
        textAlign: "center",
        marginTop: 50,
    },
});

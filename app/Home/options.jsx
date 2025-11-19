// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Haptics from "expo-haptics";
// import { useRouter } from "expo-router";
// import { useEffect, useRef, useState } from "react";
// import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"; // Added Alert
// import Carousel, { Pagination } from "react-native-snap-carousel";
// import { useAuth } from "../contexts/AuthContext"; // Import Auth Hook

// const LEVEL_KEY = "@JustLearn:selectedLevel";
// const { width: screenWidth } = Dimensions.get("window");

// const Options = () => {
//     const router = useRouter();
//     const { isGuest, logout } = useAuth(); // Get auth state

//     const [entries, setEntries] = useState([
//         {
//             title: "A1",
//             description: "You can understand and use familiar, everyday expressions and very basic phrases.",
//             level: "Beginner",
//             color: "rgba(0, 122, 255, 1)",
//             checked: false,
//         },
//         {
//             title: "A2",
//             level: "Elementary",
//             description:
//                 "You can understand sentences and frequently used expressions related to areas of most immediate relevance.",
//             color: "rgba(55, 234, 61, 1)",
//         },
//         {
//             title: "B1",
//             level: "Intermediate",
//             description:
//                 "You can understand the main points of clear standard input on familiar matters regularly encountered in work, school, leisure, etc.",
//             color: "rgba(255, 0, 123, 1)",
//         },
//         {
//             title: "B2",
//             level: "Upper Intermediate",
//             description:
//                 "You can understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in your field of specialization.",
//             color: "rgba(25, 0, 255, 1)",
//         },
//     ]);

//     const [activeIndex, setActiveIndex] = useState(0);
//     const carouselRef = useRef(null);

//     useEffect(() => {
//         const loadSelectedLevel = async () => {
//             try {
//                 const savedLevel = await AsyncStorage.getItem(LEVEL_KEY);
//                 let savedIndex = 0;

//                 if (savedLevel) {
//                     const newEntries = entries.map((entry, index) => {
//                         const isChecked = entry.title === savedLevel;
//                         if (isChecked) {
//                             savedIndex = index;
//                         }
//                         return { ...entry, checked: isChecked };
//                     });
//                     setEntries(newEntries);

//                     setTimeout(() => {
//                         if (carouselRef.current) {
//                             carouselRef.current.snapToItem(savedIndex);
//                             setActiveIndex(savedIndex);
//                         }
//                     }, 50);
//                 } else {
//                     const newEntries = entries.map((entry, index) => ({
//                         ...entry,
//                         checked: index === 0,
//                     }));
//                     setEntries(newEntries);
//                     await AsyncStorage.setItem(LEVEL_KEY, "A1");
//                 }
//             } catch (e) {
//                 console.error("Failed to load selected level", e);
//             }
//         };

//         loadSelectedLevel();
//     }, []);

//     const handleCardPress = async (item, index) => {
//         try {
//             Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//             await AsyncStorage.setItem(LEVEL_KEY, item.title);
//             setEntries(prevEntries =>
//                 prevEntries.map(entry => ({
//                     ...entry,
//                     checked: entry.title === item.title,
//                 }))
//             );
//             if (carouselRef.current && index !== activeIndex) {
//                 carouselRef.current.snapToItem(index);
//             }
//         } catch (e) {
//             console.error("Failed to save level", e);
//         }
//     };

//     const handleLogout = () => {
//         Alert.alert("Log Out", "Are you sure you want to log out?", [
//             { text: "Cancel", style: "cancel" },
//             { text: "Log Out", style: "destructive", onPress: logout },
//         ]);
//     };

//     const _renderItem = ({ item, index }) => {
//         return (
//             <TouchableOpacity activeOpacity={0.9} onPress={() => handleCardPress(item, index)}>
//                 <View style={styles.slide}>
//                     <View style={styles.upperHalf}>
//                         <View style={styles.iconContainer}></View>
//                         <Text style={styles.title}>{item.title}</Text>
//                     </View>
//                     <View style={styles.lowerHalf}>
//                         <Text style={styles.descriptionBig}>{item.level}</Text>
//                         <Text style={styles.description}>{item.description}</Text>
//                         {item.checked && (
//                             <View style={styles.checkmarkContainer}>
//                                 <Ionicons name="checkmark-circle" size={40} color="#81B64C" />
//                             </View>
//                         )}
//                     </View>
//                 </View>
//             </TouchableOpacity>
//         );
//     };

//     return (
//         <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
//             <View style={styles.imageContainer}>
//                 <MaterialCommunityIcons name="head-lightbulb-outline" size={150} color="#81B64C" />
//             </View>
//             <Text style={styles.titleText}>Select language level</Text>
//             <Carousel
//                 ref={carouselRef}
//                 data={entries}
//                 renderItem={_renderItem}
//                 sliderWidth={screenWidth}
//                 itemWidth={screenWidth - 60}
//                 layout={"parallax"}
//                 onSnapToItem={index => setActiveIndex(index)}
//             />
//             <Pagination
//                 dotsLength={entries.length}
//                 activeDotIndex={activeIndex}
//                 containerStyle={{ paddingVertical: 10 }}
//                 dotStyle={{
//                     width: 10,
//                     height: 10,
//                     borderRadius: 5,
//                     marginHorizontal: 8,
//                     backgroundColor: "#81B64C",
//                 }}
//                 inactiveDotOpacity={0.4}
//                 inactiveDotScale={0.6}
//             />

//             {/* --- NEW AUTH BUTTON --- */}
//             <TouchableOpacity
//                 style={[styles.authButton, isGuest ? styles.loginButton : styles.logoutButton]}
//                 onPress={isGuest ? () => router.push("/Home/Auth") : handleLogout}
//             >
//                 <Ionicons
//                     name={isGuest ? "log-in-outline" : "log-out-outline"}
//                     size={24}
//                     color="#FFF"
//                     style={{ marginRight: 10 }}
//                 />
//                 <Text style={styles.authButtonText}>{isGuest ? "Log In / Sign Up" : "Log Out"}</Text>
//             </TouchableOpacity>

//             <View style={{ height: 40 }} />
//         </ScrollView>
//     );
// };

// export default Options;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#2C2B29",
//     },
//     scrollContent: {
//         alignItems: "center",
//         paddingBottom: 20,
//     },
//     imageContainer: {
//         height: 200,
//         alignItems: "center",
//         justifyContent: "center",
//     },
//     titleText: {
//         color: "#fff",
//         fontSize: 30,
//         fontWeight: "600",
//         marginBottom: 20,
//     },
//     slide: {
//         backgroundColor: "#2C2B29",
//         borderRadius: 25,
//         height: 400,
//         padding: 20,
//         marginLeft: 25,
//         marginRight: 25,
//         alignItems: "center",
//         justifyContent: "center",
//         shadowColor: "#81B64C",
//         borderWidth: 1,
//         borderColor: "#81B64C",
//         shadowOffset: {
//             width: 0,
//             height: 2,
//         },
//         shadowOpacity: 0.25,
//         shadowRadius: 3.84,
//         elevation: 25,
//     },
//     title: {
//         fontSize: 50,
//         fontWeight: "bold",
//         marginTop: 15,
//         color: "#81B64C",
//     },
//     upperHalf: {
//         flex: 1,
//         width: "100%",
//         flexDirection: "row",
//         justifyContent: "space-between",
//     },
//     lowerHalf: {
//         flex: 1,
//         width: "100%",
//         flexDirection: "column",
//         alignItems: "flex-start",
//         justifyContent: "center",
//     },
//     descriptionBig: {
//         fontSize: 22,
//         fontWeight: "600",
//         marginTop: 10,
//         color: "#fff",
//     },
//     description: {
//         fontSize: 16,
//         marginTop: 5,
//         color: "#fff",
//     },
//     iconContainer: {
//         flex: 1,
//         justifyContent: "flex-start",
//         marginTop: 30,
//         marginLeft: 30,
//     },
//     checkmarkContainer: {
//         position: "absolute",
//         bottom: -10,
//         right: -10,
//     },
//     // --- New Styles ---
//     authButton: {
//         flexDirection: "row",
//         alignItems: "center",
//         paddingVertical: 15,
//         paddingHorizontal: 40,
//         borderRadius: 25,
//         marginTop: 20,
//         borderWidth: 1,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 4,
//         elevation: 5,
//     },
//     loginButton: {
//         backgroundColor: "#81B64C", // Green for login
//         borderColor: "#81B64C",
//     },
//     logoutButton: {
//         backgroundColor: "#383633", // Dark grey for logout
//         borderColor: "#555",
//     },
//     authButtonText: {
//         color: "#FFF",
//         fontSize: 18,
//         fontWeight: "bold",
//     },
// });

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";
import StatusModal from "../../components/StatusModal"; // 1. Import Modal
import { useAuth } from "../contexts/AuthContext";

const LEVEL_KEY = "@JustLearn:selectedLevel";
const { width: screenWidth } = Dimensions.get("window");

const Options = () => {
    const router = useRouter();
    const { isGuest, logout } = useAuth();

    // 2. Modal State
    const [modalVisible, setModalVisible] = useState(false);

    // ... (Entries state and useEffect code remains the same) ...
    const [entries, setEntries] = useState([
        {
            title: "A1",
            description: "You can understand and use familiar, everyday expressions and very basic phrases.",
            level: "Beginner",
            color: "rgba(0, 122, 255, 1)",
            checked: false,
        },
        {
            title: "A2",
            level: "Elementary",
            description:
                "You can understand sentences and frequently used expressions related to areas of most immediate relevance.",
            color: "rgba(55, 234, 61, 1)",
        },
        {
            title: "B1",
            level: "Intermediate",
            description:
                "You can understand the main points of clear standard input on familiar matters regularly encountered in work, school, leisure, etc.",
            color: "rgba(255, 0, 123, 1)",
        },
        {
            title: "B2",
            level: "Upper Intermediate",
            description:
                "You can understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in your field of specialization.",
            color: "rgba(25, 0, 255, 1)",
        },
    ]);

    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef(null);

    useEffect(() => {
        const loadSelectedLevel = async () => {
            try {
                const savedLevel = await AsyncStorage.getItem(LEVEL_KEY);
                let savedIndex = 0;

                if (savedLevel) {
                    const newEntries = entries.map((entry, index) => {
                        const isChecked = entry.title === savedLevel;
                        if (isChecked) {
                            savedIndex = index;
                        }
                        return { ...entry, checked: isChecked };
                    });
                    setEntries(newEntries);

                    setTimeout(() => {
                        if (carouselRef.current) {
                            carouselRef.current.snapToItem(savedIndex);
                            setActiveIndex(savedIndex);
                        }
                    }, 50);
                } else {
                    const newEntries = entries.map((entry, index) => ({
                        ...entry,
                        checked: index === 0,
                    }));
                    setEntries(newEntries);
                    await AsyncStorage.setItem(LEVEL_KEY, "A1");
                }
            } catch (e) {
                console.error("Failed to load selected level", e);
            }
        };

        loadSelectedLevel();
    }, []);

    const handleCardPress = async (item, index) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await AsyncStorage.setItem(LEVEL_KEY, item.title);
            setEntries(prevEntries =>
                prevEntries.map(entry => ({
                    ...entry,
                    checked: entry.title === item.title,
                }))
            );
            if (carouselRef.current && index !== activeIndex) {
                carouselRef.current.snapToItem(index);
            }
        } catch (e) {
            console.error("Failed to save level", e);
        }
    };

    // 3. Trigger the Modal
    const handleLogoutPress = () => {
        setModalVisible(true);
    };

    const confirmLogout = async () => {
        setModalVisible(false);
        await logout();
    };

    const _renderItem = ({ item, index }) => {
        return (
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleCardPress(item, index)}>
                <View style={styles.slide}>
                    <View style={styles.upperHalf}>
                        <View style={styles.iconContainer}></View>
                        <Text style={styles.title}>{item.title}</Text>
                    </View>
                    <View style={styles.lowerHalf}>
                        <Text style={styles.descriptionBig}>{item.level}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                        {item.checked && (
                            <View style={styles.checkmarkContainer}>
                                <Ionicons name="checkmark-circle" size={40} color="#81B64C" />
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.imageContainer}>
                <MaterialCommunityIcons name="head-lightbulb-outline" size={150} color="#81B64C" />
            </View>
            <Text style={styles.titleText}>Select language level</Text>
            <Carousel
                ref={carouselRef}
                data={entries}
                renderItem={_renderItem}
                sliderWidth={screenWidth}
                itemWidth={screenWidth - 60}
                layout={"parallax"}
                onSnapToItem={index => setActiveIndex(index)}
            />
            <Pagination
                dotsLength={entries.length}
                activeDotIndex={activeIndex}
                containerStyle={{ paddingVertical: 10 }}
                dotStyle={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    marginHorizontal: 8,
                    backgroundColor: "#81B64C",
                }}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
            />

            <TouchableOpacity
                style={[styles.authButton, isGuest ? styles.loginButton : styles.logoutButton]}
                onPress={isGuest ? () => router.push("/Home/Auth") : handleLogoutPress}
            >
                <Ionicons
                    name={isGuest ? "log-in-outline" : "log-out-outline"}
                    size={24}
                    color="#FFF"
                    style={{ marginRight: 10 }}
                />
                <Text style={styles.authButtonText}>{isGuest ? "Log In / Sign Up" : "Log Out"}</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />

            {/* 4. Render Modal */}
            <StatusModal
                visible={modalVisible}
                type="question" // Yellow Question Icon
                title="Log Out?"
                message="Are you sure you want to log out? Your guest progress is safe."
                confirmText="Log Out"
                cancelText="Cancel"
                onConfirm={confirmLogout}
                onCancel={() => setModalVisible(false)}
            />
        </ScrollView>
    );
};

export default Options;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#2C2B29",
    },
    scrollContent: {
        alignItems: "center",
        paddingBottom: 20,
    },
    imageContainer: {
        height: 200,
        alignItems: "center",
        justifyContent: "center",
    },
    titleText: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "600",
        marginBottom: 20,
    },
    slide: {
        backgroundColor: "#2C2B29",
        borderRadius: 25,
        height: 400,
        padding: 20,
        marginLeft: 25,
        marginRight: 25,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#81B64C",
        borderWidth: 1,
        borderColor: "#81B64C",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 25,
    },
    title: {
        fontSize: 50,
        fontWeight: "bold",
        marginTop: 15,
        color: "#81B64C",
    },
    upperHalf: {
        flex: 1,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    lowerHalf: {
        flex: 1,
        width: "100%",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
    },
    descriptionBig: {
        fontSize: 22,
        fontWeight: "600",
        marginTop: 10,
        color: "#fff",
    },
    description: {
        fontSize: 16,
        marginTop: 5,
        color: "#fff",
    },
    iconContainer: {
        flex: 1,
        justifyContent: "flex-start",
        marginTop: 30,
        marginLeft: 30,
    },
    checkmarkContainer: {
        position: "absolute",
        bottom: -10,
        right: -10,
    },
    authButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        marginTop: 20,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    loginButton: {
        backgroundColor: "#81B64C",
        borderColor: "#81B64C",
    },
    logoutButton: {
        backgroundColor: "#383633",
        borderColor: "#555",
    },
    authButtonText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
    },
});

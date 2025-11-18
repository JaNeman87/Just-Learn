import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics"; // Added Haptics
import { useEffect, useRef, useState } from "react";
// 1. Import TouchableOpacity and AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";

// 2. Add a key for AsyncStorage
const LEVEL_KEY = "@JustLearn:selectedLevel";

// Get the screen width
const { width: screenWidth } = Dimensions.get("window");

const Options = () => {
    const [entries, setEntries] = useState([
        {
            title: "A1",
            description: "You can understand and use familiar, everyday expressions and very basic phrases.",
            level: "Beginner",
            color: "rgba(0, 122, 255, 1)",
            checked: false, // Set default to false, storage will update it
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

    // 3. Load the saved level when the component mounts
    useEffect(() => {
        const loadSelectedLevel = async () => {
            try {
                const savedLevel = await AsyncStorage.getItem(LEVEL_KEY);
                let savedIndex = 0; // Default to 0

                if (savedLevel) {
                    const newEntries = entries.map((entry, index) => {
                        const isChecked = entry.title === savedLevel;
                        if (isChecked) {
                            savedIndex = index; // Find the index of the saved level
                        }
                        return { ...entry, checked: isChecked };
                    });
                    setEntries(newEntries);

                    // Snap the carousel to the saved item
                    // Use setTimeout to ensure carousel is ready
                    setTimeout(() => {
                        if (carouselRef.current) {
                            carouselRef.current.snapToItem(savedIndex);
                            setActiveIndex(savedIndex);
                        }
                    }, 50);
                } else {
                    // No level saved, default to A1
                    const newEntries = entries.map((entry, index) => ({
                        ...entry,
                        checked: index === 0, // Check A1 by default
                    }));
                    setEntries(newEntries);
                    await AsyncStorage.setItem(LEVEL_KEY, "A1"); // Save A1 as default
                }
            } catch (e) {
                console.error("Failed to load selected level", e);
            }
        };

        loadSelectedLevel();
    }, []); // Empty array means this runs only once on mount

    // 4. Handle the card press
    const handleCardPress = async (item, index) => {
        try {
            // Give haptic feedback
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // 1. Save to AsyncStorage
            await AsyncStorage.setItem(LEVEL_KEY, item.title);

            // 2. Update state to reflect the new checkmark
            setEntries(prevEntries =>
                prevEntries.map(entry => ({
                    ...entry,
                    checked: entry.title === item.title,
                }))
            );

            // 3. Snap the carousel to the clicked item
            if (carouselRef.current && index !== activeIndex) {
                carouselRef.current.snapToItem(index);
            }
        } catch (e) {
            console.error("Failed to save level", e);
        }
    };

    const _renderItem = ({ item, index }) => {
        return (
            // 5. Changed View to TouchableOpacity
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleCardPress(item, index)} // Added onPress
            >
                <View style={styles.slide}>
                    <View style={styles.upperHalf}>
                        <View style={styles.iconContainer}>
                            {/* <Entypo name="language" size={120} color="#81B64C" /> */}
                        </View>
                        <Text style={styles.title}>{item.title}</Text>
                    </View>
                    <View style={styles.lowerHalf}>
                        <Text style={styles.descriptionBig}>{item.level}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                        {/* This is now dynamic based on state */}
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
});

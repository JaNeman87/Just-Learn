// import { Ionicons } from "@expo/vector-icons";
// import React, { useEffect, useRef, useState } from "react";
// import { StyleSheet, Text, TouchableOpacity } from "react-native";
// import * as Animatable from "react-native-animatable";

// // This is a "memoized" component, meaning it only re-renders when its props change.
// // This is very important for FlatList performance.
// const LearnTopicItem = React.memo(({ item, onPress, isViewable }) => {
//     const animRef = useRef(null);
//     // This state tracks if the component has *ever* animated in.
//     const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

//     useEffect(() => {
//         // If the item is viewable AND it has NOT animated in yet...
//         if (isViewable && !hasAnimatedIn && animRef.current) {
//             // ...run the animation.
//             animRef.current.fadeInUp(500);
//             // ...and set the lock.
//             setHasAnimatedIn(true);
//         }
//     }, [isViewable, hasAnimatedIn]); // Run when these change

//     return (
//         <Animatable.View
//             ref={animRef}
//             useNativeDriver={true}
//             style={[styles.animatableView, { marginBottom: 15 }]} // Start invisible
//         >
//             <TouchableOpacity style={styles.topicItem} onPress={onPress}>
//                 {/* 1. Changed icon to "book-outline" */}
//                 <Ionicons name="book-outline" size={32} style={styles.iconStyle} />
//                 <Text style={styles.name}>{item.title}</Text>
//                 <Ionicons name="chevron-forward-outline" size={24} color="#555" />
//             </TouchableOpacity>
//         </Animatable.View>
//     );
// });

// const styles = StyleSheet.create({
//     // 2. Copied your working styles
//     animatableView: {
//         opacity: 0,
//         transform: [{ translateY: 50 }],
//     },
//     topicItem: {
//         backgroundColor: "#383633",
//         padding: 20,
//         borderRadius: 10,
//         width: "100%",
//         borderWidth: 1,
//         borderColor: "#444",
//         flexDirection: "row",
//         alignItems: "center",
//         shadowColor: "#81B64C",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.3,
//         shadowRadius: 4,
//         elevation: 5,
//     },
//     iconStyle: {
//         color: "#81B64C",
//         marginRight: 15,
//     },
//     name: {
//         flex: 1,
//         fontSize: 18,
//         color: "#FFFFFF",
//         fontWeight: "500",
//     },
// });

// export default LearnTopicItem;

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";

// 1. Receive isLocked prop
const LearnTopicItem = React.memo(({ item, onPress, isViewable, isLocked }) => {
    const animRef = useRef(null);
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

    useEffect(() => {
        if (isViewable && !hasAnimatedIn && animRef.current) {
            animRef.current.fadeInUp(500);
            setHasAnimatedIn(true);
        }
    }, [isViewable, hasAnimatedIn]);

    return (
        <Animatable.View ref={animRef} useNativeDriver={true} style={[styles.animatableView, { marginBottom: 15 }]}>
            {/* 2. Apply locked styles to the container */}
            <TouchableOpacity
                style={[styles.topicItem, isLocked && styles.topicItemLocked]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                {/* 3. Switch Icon: Book vs Lock */}
                {isLocked ? (
                    <View style={styles.lockedIconContainer}>
                        <Ionicons name="lock-closed" size={24} color="#888" />
                    </View>
                ) : (
                    <Ionicons name="book-outline" size={32} style={styles.iconStyle} />
                )}

                {/* 4. Dim text if locked */}
                <Text style={[styles.name, isLocked && styles.nameLocked]}>{item.title}</Text>

                {/* 5. Right Icon */}
                <Ionicons
                    name={isLocked ? "lock-closed-outline" : "chevron-forward-outline"}
                    size={24}
                    color={isLocked ? "#555" : "#555"}
                />
            </TouchableOpacity>
        </Animatable.View>
    );
});

const styles = StyleSheet.create({
    animatableView: {
        opacity: 0,
        transform: [{ translateY: 50 }],
    },
    topicItem: {
        backgroundColor: "#383633",
        padding: 20,
        borderRadius: 10,
        width: "100%",
        borderWidth: 1,
        borderColor: "#444",
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#81B64C",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    // Locked state styling
    topicItemLocked: {
        backgroundColor: "#2a2927", // Darker background
        borderColor: "#333",
        shadowOpacity: 0, // Remove glow
    },
    iconStyle: {
        color: "#81B64C",
        marginRight: 15,
    },
    lockedIconContainer: {
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
        borderWidth: 2,
        borderColor: "#555",
        borderRadius: 16,
    },
    name: {
        flex: 1,
        fontSize: 18,
        color: "#FFFFFF",
        fontWeight: "500",
    },
    nameLocked: {
        color: "#888", // Dim text
    },
});

export default LearnTopicItem;

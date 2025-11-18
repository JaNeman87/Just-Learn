// import { Ionicons } from "@expo/vector-icons";
// import React, { useEffect, useRef, useState } from "react";
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import * as Animatable from "react-native-animatable";
// import Svg, { Circle } from "react-native-svg";

// const CIRCLE_SIZE = 40;
// const STROKE_WIDTH = 4;
// const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
// const CIRCUMFERENCE = RADIUS * 2 * Math.PI;

// const TestListItem = React.memo(({ item, onPress, isViewable, progressPercent, progressText, isCompleted }) => {
//     // 1. Add isCompleted
//     const animRef = useRef(null);
//     const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

//     const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * progressPercent) / 100;

//     useEffect(() => {
//         if (isViewable && !hasAnimatedIn && animRef.current) {
//             animRef.current.fadeInUp(500);
//             setHasAnimatedIn(true);
//         }
//     }, [isViewable, hasAnimatedIn]);

//     return (
//         <Animatable.View ref={animRef} useNativeDriver={true} style={[styles.animatableView, { marginBottom: 15 }]}>
//             <TouchableOpacity style={styles.testItem} onPress={onPress}>
//                 <View style={styles.iconContainer}>
//                     {/* --- 2. NEW RENDER LOGIC --- */}
//                     {isCompleted ? (
//                         // 1. Show Checkmark if completed
//                         <Animatable.View animation="bounceIn" duration={500}>
//                             <Ionicons name="checkmark-circle" size={CIRCLE_SIZE} color="#81B64C" />
//                         </Animatable.View>
//                     ) : progressPercent > 0 ? (
//                         // 2. Show Progress Circle if in-progress
//                         <>
//                             <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}>
//                                 <Circle
//                                     stroke="#555"
//                                     cx={CIRCLE_SIZE / 2}
//                                     cy={CIRCLE_SIZE / 2}
//                                     r={RADIUS}
//                                     strokeWidth={STROKE_WIDTH}
//                                 />
//                                 <Circle
//                                     stroke="#81B64C"
//                                     cx={CIRCLE_SIZE / 2}
//                                     cy={CIRCLE_SIZE / 2}
//                                     r={RADIUS}
//                                     strokeWidth={STROKE_WIDTH}
//                                     strokeDasharray={CIRCUMFERENCE}
//                                     strokeDashoffset={strokeDashoffset}
//                                     strokeLinecap="round"
//                                     transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
//                                 />
//                             </Svg>
//                             <Text style={styles.progressText}>{Math.floor(progressPercent)}%</Text>
//                         </>
//                     ) : (
//                         // 3. Show Play Icon if not started
//                         <Ionicons name="play-circle-outline" size={CIRCLE_SIZE} color="#81B64C" />
//                     )}
//                     {/* --- END NEW RENDER LOGIC --- */}
//                 </View>

//                 <Text style={styles.name}>{item.title}</Text>
//                 <Ionicons name="chevron-forward-outline" size={24} color="#555" />
//             </TouchableOpacity>
//         </Animatable.View>
//     );
// });

// const styles = StyleSheet.create({
//     animatableView: {
//         opacity: 0,
//         transform: [{ translateY: 50 }],
//     },
//     testItem: {
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
//     iconContainer: {
//         width: CIRCLE_SIZE,
//         height: CIRCLE_SIZE,
//         justifyContent: "center",
//         alignItems: "center",
//         marginRight: 15,
//     },
//     progressText: {
//         position: "absolute",
//         color: "#81B64C",
//         fontSize: 12,
//         fontWeight: "bold",
//     },
//     name: {
//         flex: 1,
//         fontSize: 18,
//         color: "#FFFFFF",
//         fontWeight: "500",
//     },
// });

// export default TestListItem;

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";
import Svg, { Circle } from "react-native-svg";

const CIRCLE_SIZE = 40;
const STROKE_WIDTH = 4;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = RADIUS * 2 * Math.PI;

// 1. Add isLocked to props
const TestListItem = React.memo(
    ({ item, onPress, isViewable, progressPercent, progressText, isCompleted, isLocked }) => {
        const animRef = useRef(null);
        const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

        const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * progressPercent) / 100;

        useEffect(() => {
            if (isViewable && !hasAnimatedIn && animRef.current) {
                animRef.current.fadeInUp(500);
                setHasAnimatedIn(true);
            }
        }, [isViewable, hasAnimatedIn]);

        return (
            <Animatable.View ref={animRef} useNativeDriver={true} style={[styles.animatableView, { marginBottom: 15 }]}>
                {/* 2. Pass isLocked to style to reduce opacity if locked */}
                <TouchableOpacity
                    style={[styles.testItem, isLocked && styles.testItemLocked]}
                    onPress={onPress}
                    activeOpacity={0.7}
                >
                    <View style={styles.iconContainer}>
                        {/* 3. RENDER LOGIC PRIORITY: Locked > Completed > In Progress > Not Started */}
                        {isLocked ? (
                            <View style={styles.lockedCircle}>
                                <Ionicons name="lock-closed" size={20} color="#888" />
                            </View>
                        ) : isCompleted ? (
                            <Animatable.View animation="bounceIn" duration={500}>
                                <Ionicons name="checkmark-circle" size={CIRCLE_SIZE} color="#81B64C" />
                            </Animatable.View>
                        ) : progressPercent > 0 ? (
                            <>
                                <Svg
                                    width={CIRCLE_SIZE}
                                    height={CIRCLE_SIZE}
                                    viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
                                >
                                    <Circle
                                        stroke="#555"
                                        cx={CIRCLE_SIZE / 2}
                                        cy={CIRCLE_SIZE / 2}
                                        r={RADIUS}
                                        strokeWidth={STROKE_WIDTH}
                                    />
                                    <Circle
                                        stroke="#81B64C"
                                        cx={CIRCLE_SIZE / 2}
                                        cy={CIRCLE_SIZE / 2}
                                        r={RADIUS}
                                        strokeWidth={STROKE_WIDTH}
                                        strokeDasharray={CIRCUMFERENCE}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
                                    />
                                </Svg>
                                <Text style={styles.progressText}>{Math.floor(progressPercent)}%</Text>
                            </>
                        ) : (
                            <Ionicons name="play-circle-outline" size={CIRCLE_SIZE} color="#81B64C" />
                        )}
                    </View>

                    {/* 4. Change Text Color if Locked */}
                    <Text style={[styles.name, isLocked && styles.textLocked]}>{item.title}</Text>

                    {/* 5. Change Chevron to Lock if Locked (Optional, but looks nice) */}
                    <Ionicons
                        name={isLocked ? "lock-closed-outline" : "chevron-forward-outline"}
                        size={24}
                        color={isLocked ? "#555" : "#555"}
                    />
                </TouchableOpacity>
            </Animatable.View>
        );
    }
);

const styles = StyleSheet.create({
    animatableView: {
        opacity: 0,
        transform: [{ translateY: 50 }],
    },
    testItem: {
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
    // Dim the background slightly if locked
    testItemLocked: {
        backgroundColor: "#2a2927",
        borderColor: "#333",
        shadowOpacity: 0, // Remove glow
    },
    iconContainer: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    lockedCircle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        borderWidth: 2,
        borderColor: "#555",
        justifyContent: "center",
        alignItems: "center",
    },
    progressText: {
        position: "absolute",
        color: "#81B64C",
        fontSize: 12,
        fontWeight: "bold",
    },
    name: {
        flex: 1,
        fontSize: 18,
        color: "#FFFFFF",
        fontWeight: "500",
    },
    textLocked: {
        color: "#888", // Dim text color
    },
});

export default TestListItem;

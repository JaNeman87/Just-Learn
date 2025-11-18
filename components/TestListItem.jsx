// import { Ionicons } from "@expo/vector-icons";
// import React, { useEffect, useRef, useState } from "react";
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native"; // 1. Import View
// import * as Animatable from "react-native-animatable";
// import Svg, { Circle } from "react-native-svg"; // 2. Import Svg components

// // 3. Define props for the progress bar
// const CIRCLE_SIZE = 40;
// const STROKE_WIDTH = 4;
// const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
// const CIRCUMFERENCE = RADIUS * 2 * Math.PI;

// // This is a "memoized" component, meaning it only re-renders when its props change.
// const TestListItem = React.memo(({ item, onPress, isViewable, progressPercent, progressText }) => {
//     const animRef = useRef(null);
//     const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

//     // This calculates the "empty" part of the circle
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
//                 {/* 4. --- REPLACED ICON --- */}
//                 <View style={styles.iconContainer}>
//                     <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}>
//                         {/* Background Track */}
//                         <Circle
//                             stroke="#555" // Dark grey track
//                             cx={CIRCLE_SIZE / 2}
//                             cy={CIRCLE_SIZE / 2}
//                             r={RADIUS}
//                             strokeWidth={STROKE_WIDTH}
//                         />
//                         {/* Progress Fill */}
//                         <Circle
//                             stroke="#81B64C" // Green progress
//                             cx={CIRCLE_SIZE / 2}
//                             cy={CIRCLE_SIZE / 2}
//                             r={RADIUS}
//                             strokeWidth={STROKE_WIDTH}
//                             strokeDasharray={CIRCUMFERENCE}
//                             strokeDashoffset={strokeDashoffset}
//                             strokeLinecap="round" // Makes the ends rounded
//                             transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`} // Start from the top
//                         />
//                     </Svg>
//                     {/* Progress Text */}
//                     {/* Show a Play icon if 0%, otherwise show the % */}
//                     {progressPercent === 0 ? (
//                         <Ionicons name="play" size={18} color="#81B64C" style={styles.progressTextIcon} />
//                     ) : (
//                         <Text style={styles.progressText}>{Math.floor(progressPercent)}%</Text>
//                     )}
//                 </View>
//                 {/* --- END REPLACEMENT --- */}

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
//     // --- 5. UPDATED/NEW STYLES ---
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
//     progressTextIcon: {
//         position: "absolute",
//         left: 13,
//     },
//     // ---
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

const TestListItem = React.memo(({ item, onPress, isViewable, progressPercent, progressText, isCompleted }) => {
    // 1. Add isCompleted
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
            <TouchableOpacity style={styles.testItem} onPress={onPress}>
                <View style={styles.iconContainer}>
                    {/* --- 2. NEW RENDER LOGIC --- */}
                    {isCompleted ? (
                        // 1. Show Checkmark if completed
                        <Animatable.View animation="bounceIn" duration={500}>
                            <Ionicons name="checkmark-circle" size={CIRCLE_SIZE} color="#81B64C" />
                        </Animatable.View>
                    ) : progressPercent > 0 ? (
                        // 2. Show Progress Circle if in-progress
                        <>
                            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}>
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
                        // 3. Show Play Icon if not started
                        <Ionicons name="play-circle-outline" size={CIRCLE_SIZE} color="#81B64C" />
                    )}
                    {/* --- END NEW RENDER LOGIC --- */}
                </View>

                <Text style={styles.name}>{item.title}</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#555" />
            </TouchableOpacity>
        </Animatable.View>
    );
});

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
    iconContainer: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
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
});

export default TestListItem;

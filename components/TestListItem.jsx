import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";
import Svg, { Circle } from "react-native-svg";

const ITEM_SIZE = 110;
const PROGRESS_SIZE = 100;
const STROKE_WIDTH = 5;
const RADIUS = (PROGRESS_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = RADIUS * 2 * Math.PI;

const TestListItem = React.memo(
    ({ item, onPress, isViewable, progressPercent, progressText, isCompleted, isLocked, isDisabled }) => {
        const animRef = useRef(null);
        const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

        const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * progressPercent) / 100;

        useEffect(() => {
            if (isViewable && !hasAnimatedIn && animRef.current) {
                animRef.current.fadeInUp(500);
                setHasAnimatedIn(true);
            }
        }, [isViewable, hasAnimatedIn]);

        // "Active" check: Not locked (paywall) and Not disabled (sequential)
        const isNotActive = isLocked || isDisabled;

        return (
            <Animatable.View ref={animRef} useNativeDriver={true} style={styles.wrapper}>
                <TouchableOpacity style={styles.touchableContainer} onPress={onPress} activeOpacity={0.7}>
                    {/* Circle Node Style */}
                    <View
                        style={[
                            styles.circleNode,
                            isNotActive ? styles.circleNodeLocked : styles.circleNodeActive,
                            isCompleted && styles.circleNodeCompleted, // <--- NEW STYLE
                        ]}
                    >
                        {/* ICON LOGIC */}
                        {isLocked ? (
                            <Ionicons name="lock-closed" size={32} color="#555" />
                        ) : isDisabled ? (
                            <Ionicons name="time" size={32} color="#555" />
                        ) : isCompleted ? (
                            <Animatable.View animation="bounceIn" duration={500}>
                                {/* CHANGED: Trophy Icon, White Color */}
                                <Ionicons name="trophy" size={40} color="#FFFFFF" />
                            </Animatable.View>
                        ) : (
                            <View style={styles.progressContainer}>
                                {progressPercent > 0 && (
                                    <Svg
                                        width={PROGRESS_SIZE}
                                        height={PROGRESS_SIZE}
                                        viewBox={`0 0 ${PROGRESS_SIZE} ${PROGRESS_SIZE}`}
                                        style={styles.svgOverlay}
                                    >
                                        <Circle
                                            stroke="#333"
                                            cx={PROGRESS_SIZE / 2}
                                            cy={PROGRESS_SIZE / 2}
                                            r={RADIUS}
                                            strokeWidth={STROKE_WIDTH}
                                        />
                                        <Circle
                                            stroke="#81B64C"
                                            cx={PROGRESS_SIZE / 2}
                                            cy={PROGRESS_SIZE / 2}
                                            r={RADIUS}
                                            strokeWidth={STROKE_WIDTH}
                                            strokeDasharray={CIRCUMFERENCE}
                                            strokeDashoffset={strokeDashoffset}
                                            strokeLinecap="round"
                                            transform={`rotate(-90 ${PROGRESS_SIZE / 2} ${PROGRESS_SIZE / 2})`}
                                            fill="transparent"
                                        />
                                    </Svg>
                                )}
                                <Ionicons name="play" size={36} color={progressPercent > 0 ? "#fff" : "#81B64C"} />
                            </View>
                        )}
                    </View>

                    <Text style={[styles.title, isNotActive && styles.titleLocked]} numberOfLines={2}>
                        {item.title}
                    </Text>
                </TouchableOpacity>
            </Animatable.View>
        );
    }
);

const styles = StyleSheet.create({
    wrapper: {
        alignItems: "center",
        justifyContent: "center",
        width: 140,
    },
    touchableContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    circleNode: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        borderRadius: ITEM_SIZE / 2,
        backgroundColor: "#2C2B29",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
        borderWidth: 2,
    },
    circleNodeActive: {
        borderColor: "#81B64C",
        shadowColor: "#81B64C",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 15,
    },
    circleNodeLocked: {
        borderColor: "#444",
        backgroundColor: "#222",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    // NEW STYLE FOR COMPLETED STATE
    circleNodeCompleted: {
        backgroundColor: "#81B64C", // Solid Green Background
        borderColor: "#81B64C",
        shadowColor: "#81B64C",
        shadowOpacity: 0.8,
        shadowRadius: 12,
        elevation: 10,
    },
    progressContainer: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    svgOverlay: {
        position: "absolute",
    },
    title: {
        fontSize: 14,
        color: "#fff",
        textAlign: "center",
        fontWeight: "700",
        maxWidth: 130,
        textShadowColor: "rgba(0, 0, 0, 0.75)",
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    titleLocked: {
        color: "#666",
        fontWeight: "500",
    },
});

export default TestListItem;

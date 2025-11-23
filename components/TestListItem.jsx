import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";
import Svg, { Circle } from "react-native-svg";

const ITEM_SIZE = 110;
const PROGRESS_SIZE = 100;
const STROKE_WIDTH = 5;
const RADIUS = (PROGRESS_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = RADIUS * 2 * Math.PI;

// 1. Ring Ripple: Expands outward and fades
const ringPulseAnimation = {
    0: { transform: [{ scale: 1 }], opacity: 0.6 },
    1: { transform: [{ scale: 1.5 }], opacity: 0 },
};

// 2. Trophy Pulse: Scales up and down (Heartbeat)
const trophyPulseAnimation = {
    0: { transform: [{ scale: 1 }] },
    0.5: { transform: [{ scale: 1.2 }] }, // Peak scale
    1: { transform: [{ scale: 1 }] },
};

const TestListItem = React.memo(
    ({ item, onPress, isViewable, progressPercent, progressText, isCompleted, isLocked, isDisabled }) => {
        const animRef = useRef(null);
        const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

        const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * progressPercent) / 100;

        useEffect(() => {
            if (isViewable && !hasAnimatedIn && animRef.current) {
                // animRef.current.fadeInUp(500);
                setHasAnimatedIn(true);
            }
        }, [isViewable, hasAnimatedIn]);

        const isNotActive = isLocked || isDisabled;

        const renderContent = () => {
            if (isLocked) return <Ionicons name="lock-closed" size={32} color="#555" />;
            if (isDisabled) return <Ionicons name="time" size={32} color="#555" />;

            if (isCompleted) {
                return (
                    // UPDATED: Use custom animation with matching duration
                    <Animatable.View
                        animation={trophyPulseAnimation}
                        easing="ease-out"
                        iterationCount="infinite"
                        duration={2000} // Matches Ring Duration
                    >
                        <Ionicons name="trophy" size={44} color="#FFFFFF" />
                    </Animatable.View>
                );
            }
            return (
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
            );
        };

        return (
            <Animatable.View ref={animRef} useNativeDriver={true} style={styles.wrapper}>
                <TouchableOpacity style={styles.touchableContainer} onPress={onPress} activeOpacity={0.7}>
                    <View style={styles.nodeAnchor}>
                        {/* Ring Ripple */}
                        {isCompleted && (
                            <Animatable.View
                                animation={ringPulseAnimation}
                                iterationCount="infinite"
                                duration={2000} // Matches Trophy Duration
                                easing="ease-out"
                                style={styles.pulseRing}
                                useNativeDriver={true}
                            />
                        )}

                        {/* Main Circle Node */}
                        {isCompleted ? (
                            <LinearGradient
                                colors={["#96d15c", "#70a040"]}
                                style={[styles.circleNode, styles.circleNodeCompleted]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                {renderContent()}
                            </LinearGradient>
                        ) : (
                            <View
                                style={[
                                    styles.circleNode,
                                    isNotActive ? styles.circleNodeLocked : styles.circleNodeActive,
                                ]}
                            >
                                {renderContent()}
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
    nodeAnchor: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
        position: "relative",
    },
    pulseRing: {
        position: "absolute",
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        borderRadius: ITEM_SIZE / 2,
        backgroundColor: "#81B64C",
        zIndex: -1,
    },
    circleNode: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        borderRadius: ITEM_SIZE / 2,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
    },
    circleNodeActive: {
        backgroundColor: "#2C2B29",
        borderColor: "#81B64C",
        shadowColor: "#81B64C",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 15,
    },
    circleNodeLocked: {
        backgroundColor: "#222",
        borderColor: "#444",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    circleNodeCompleted: {
        borderColor: "#FFFFFF",
        borderWidth: 4,
        shadowColor: "#81B64C",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 20,
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

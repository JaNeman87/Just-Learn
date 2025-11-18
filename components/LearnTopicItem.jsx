import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";

// This is a "memoized" component, meaning it only re-renders when its props change.
// This is very important for FlatList performance.
const LearnTopicItem = React.memo(({ item, onPress, isViewable }) => {
    const animRef = useRef(null);
    // This state tracks if the component has *ever* animated in.
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

    useEffect(() => {
        // If the item is viewable AND it has NOT animated in yet...
        if (isViewable && !hasAnimatedIn && animRef.current) {
            // ...run the animation.
            animRef.current.fadeInUp(500);
            // ...and set the lock.
            setHasAnimatedIn(true);
        }
    }, [isViewable, hasAnimatedIn]); // Run when these change

    return (
        <Animatable.View
            ref={animRef}
            useNativeDriver={true}
            style={[styles.animatableView, { marginBottom: 15 }]} // Start invisible
        >
            <TouchableOpacity style={styles.topicItem} onPress={onPress}>
                {/* 1. Changed icon to "book-outline" */}
                <Ionicons name="book-outline" size={32} style={styles.iconStyle} />
                <Text style={styles.name}>{item.title}</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#555" />
            </TouchableOpacity>
        </Animatable.View>
    );
});

const styles = StyleSheet.create({
    // 2. Copied your working styles
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
    iconStyle: {
        color: "#81B64C",
        marginRight: 15,
    },
    name: {
        flex: 1,
        fontSize: 18,
        color: "#FFFFFF",
        fontWeight: "500",
    },
});

export default LearnTopicItem;

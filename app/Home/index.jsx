import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Home() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [color, setColor] = useState("green");
    const viewRef = useRef(null);
    const openDrawer = () => {
        navigation.toggleDrawer();
    };

    const goTo = page => {
        navigation.navigate(page);
    };

    return (
        <>
            <View style={{ ...styles.container }}>
                <View style={styles.pagesContainer}>
                    <TouchableOpacity style={styles.card} onPress={() => goTo("tests")}>
                        <MaterialCommunityIcons name="lightbulb-question" size={80} color="#81B64C" />
                        <Text style={styles.cardText}>Tests</Text>
                    </TouchableOpacity>
                    <View style={styles.card} onTouchEnd={() => goTo("learn")}>
                        <Ionicons name="book" size={80} color="#81B64C" />
                        <Text style={styles.cardText}>Learn</Text>
                    </View>
                </View>
                <View style={styles.pagesContainer}>
                    <TouchableOpacity style={styles.card} onPress={() => goTo("Bookmarks")}>
                        <Ionicons name="bookmarks" size={80} color="#81B64C" />
                        <Text style={styles.cardText}>Bookmarks</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.card} onPress={() => goTo("options")}>
                        <Ionicons name="options" size={80} color="#81B64C" />
                        <Text style={styles.cardText}>Options</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#2C2B29",
    },

    header: {
        height: 100,
        width: "100%",
        // position: "absolute",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2d2c2cff",
    },
    headerIcon: {
        width: 100,
        height: 100,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        marginRight: 10,
    },

    headerInfo: {
        height: 80,
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
    },
    headerSubInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    hamburger: {
        height: 40,
        width: 60,
        justifyContent: "center",
        alignItems: "center",
    },
    userName: {
        fontSize: 18,
        fontWeight: "500",
        color: "#4e4444ff",
    },
    tag: {
        width: 60,
        height: 25,
        backgroundColor: "#4e4444ff",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        marginRight: 10,
    },
    tagText: {
        color: "white",
        marginLeft: 5,
    },
    animatable: {
        width: 200,
        height: 40,
        // backgroundColor: "blue",
        borderRadius: 10,
    },
    pagesContainer: {
        height: "45%",
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    card: {
        backgroundColor: "#2C2B29",
        borderRadius: 25,
        height: "80%",
        width: "45%",
        padding: 20,
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
    background: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: "110%",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
    },
    cardText: {
        marginTop: 15,
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
});

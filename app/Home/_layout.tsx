import { Stack } from "expo-router";

export default function HomeStackLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: "#2C2B29", // <-- Use your app's dark background color
                },
                // animation: "none",
            }}
        >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
                name="tests"
                options={{
                    title: "tests",
                }}
            />
            <Stack.Screen
                name="test"
                options={{
                    title: "test",
                }}
            />
            <Stack.Screen
                name="Auth"
                options={{
                    title: "Auth",
                }}
            />
            <Stack.Screen
                name="Bookmarks"
                options={{
                    title: "Bookmarks",
                    presentation: "formSheet",
                    gestureDirection: "vertical",
                    animation: "slide_from_bottom",
                    sheetGrabberVisible: true,
                    sheetAllowedDetents: [1],
                    sheetCornerRadius: 20,
                    sheetExpandsWhenScrolledToEdge: true,
                    sheetElevation: 24,
                }}
            />
            <Stack.Screen
                name="learn"
                options={{
                    title: "learn",
                }}
            />

            <Stack.Screen
                name="FlashcardScreen"
                options={{
                    title: "Flashcard Screen",
                    presentation: "formSheet",
                    gestureDirection: "vertical",
                    animation: "slide_from_bottom",
                    sheetGrabberVisible: true,
                    sheetAllowedDetents: [1],
                    sheetCornerRadius: 20,
                    sheetExpandsWhenScrolledToEdge: true,
                    sheetElevation: 24,
                }}
            />

            <Stack.Screen
                name="options"
                options={{
                    title: "Options",
                    presentation: "formSheet",
                    gestureDirection: "vertical",
                    animation: "slide_from_bottom",
                    sheetGrabberVisible: true,
                    sheetAllowedDetents: [1],
                    sheetCornerRadius: 20,
                    sheetExpandsWhenScrolledToEdge: true,
                    sheetElevation: 24,
                }}
            />
        </Stack>
    );
}

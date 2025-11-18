import { DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { Image, Text, View } from "react-native";

const CustomDrawerContent = props => {
    const router = useRouter();
    return (
        <DrawerContentScrollView
            {...props}
            scrollEnabled={false}
            contentContainerStyle={{ flex: 1, backgroundColor: "#2C2B29" }}
        >
            <View
                style={{
                    // height: 150,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                }}
            >
                <Image
                    source={{ uri: "https://imagedelivery.net/xE-VtsYZUS2Y8MtLMcbXAg/4a05b139a21e91fdb87f/sm" }}
                    style={{ width: 150, height: 150, borderRadius: 50 }}
                />
                <Text style={{ marginTop: 10, fontSize: 18, fontWeight: "500", color: "#fff" }}>Chuchumiga</Text>
            </View>
            <DrawerItemList {...props} />
            <DrawerItem
                style={{
                    position: "absolute",
                    bottom: 50,
                    width: "100%",
                }}
                label="Logout"
                onPress={() => {}}
                labelStyle={{ color: "#fff" }}
            />
        </DrawerContentScrollView>
    );
};

export default CustomDrawerContent;

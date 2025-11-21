// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { useState } from "react";
// import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import StatusModal from "../../components/StatusModal";
// import { useAuth } from "../contexts/AuthContext";
// import { useMembership } from "../contexts/MembershipContext";

// // 1. DEFINE THE RANK SYSTEM
// const RANKS = [
//     { name: "Novice", minXP: 0, color: "#A0A0A0" },       // Grey
//     { name: "Apprentice", minXP: 100, color: "#8FBC8F" }, // Greenish
//     { name: "Learner", minXP: 500, color: "#32CD32" },    // Lime Green
//     { name: "Scholar", minXP: 1000, color: "#1E90FF" },   // Dodger Blue
//     { name: "Master", minXP: 2500, color: "#FFD700" },    // Gold
//     { name: "Grandmaster", minXP: 5000, color: "#FF8C00" }, // Dark Orange
//     { name: "Legend", minXP: 10000, color: "#FF0000" },   // Red
// ];

// // 2. HELPER TO GET RANK
// const getCurrentRank = (xp) => {
//     // Sort ranks by XP descending to find the highest matching rank
//     const sortedRanks = [...RANKS].sort((a, b) => b.minXP - a.minXP);
//     return sortedRanks.find(rank => xp >= rank.minXP) || RANKS[0];
// };

// export default function Profile() {
//     const router = useRouter();
//     const { user, logout, isGuest } = useAuth();
//     const { isPro, streak, totalXP } = useMembership();
    
//     const [modalVisible, setModalVisible] = useState(false);

//     // 3. CALCULATE CURRENT RANK
//     const currentRank = getCurrentRank(totalXP || 0);

//     const handleLogoutPress = () => {
//         setModalVisible(true);
//     };

//     const confirmLogout = async () => {
//         setModalVisible(false);
//         await logout();
//         router.replace("/");
//     };

//     const handleEditProfile = () => {
//         if (isGuest) {
//            alert("Please sign up to edit your profile."); 
//         } else {
//            alert("Edit profile functionality is coming soon!");
//         }
//     };

//     return (
//         <View style={styles.container}>
//             <ScrollView contentContainerStyle={styles.scrollContent}>
//                 {/* User Info Section */}
//                 <View style={styles.userInfoSection}>
//                     <View style={styles.avatarContainer}>
//                         <Ionicons name="person-circle-outline" size={80} color="#FFFFFF" />
//                         {isPro && (
//                             <View style={styles.proBadge}>
//                                 <Ionicons name="star" size={12} color="#FFF" />
//                             </View>
//                         )}
//                     </View>
//                     <Text style={styles.userName}>
//                         {isGuest ? "Guest User" : user?.email || "User"}
//                     </Text>
//                     <Text style={styles.userHandle}>
//                         {isGuest ? "Sign up to save progress" : "Just Learn Member"}
//                     </Text>
//                 </View>

//                 {/* 4. UPDATED STATS GRID WITH RANK */}
//                 <View style={styles.statsContainer}>
//                     {/* Streak */}
//                     <View style={styles.statCard}>
//                         <Ionicons name="flame" size={24} color="#FFD700" />
//                         <Text style={styles.statValue}>{streak}</Text>
//                         <Text style={styles.statLabel}>Streak</Text>
//                     </View>

//                     {/* Rank (Dynamic Color & Title) */}
//                     <View style={[styles.statCard, { borderColor: currentRank.color }]}>
//                         <Ionicons name="trophy" size={24} color={currentRank.color} />
//                         {/* Show Rank Name */}
//                         <Text style={[styles.statValue, { color: currentRank.color, fontSize: 16 }]}>
//                             {currentRank.name}
//                         </Text>
//                         {/* Show Raw XP below */}
//                         <Text style={styles.statLabel}>{totalXP} XP</Text>
//                     </View>

//                     {/* Membership */}
//                     <View style={styles.statCard}>
//                         <Ionicons name={isPro ? "diamond" : "cube-outline"} size={24} color="#81B64C" />
//                         <Text style={styles.statValue}>{isPro ? "PRO" : "Free"}</Text>
//                         <Text style={styles.statLabel}>Plan</Text>
//                     </View>
//                 </View>

//                 {/* Menu Options */}
//                 <View style={styles.menuWrapper}>
//                     <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
//                         <View style={styles.menuIcon}>
//                             <Ionicons name="person-outline" size={22} color="#FFFFFF" />
//                         </View>
//                         <Text style={styles.menuText}>Edit Profile</Text>
//                         <Ionicons name="chevron-forward" size={20} color="#666" />
//                     </TouchableOpacity>

//                     <TouchableOpacity 
//                         style={styles.menuItem} 
//                         onPress={() => router.push("/membership")}
//                     >
//                         <View style={styles.menuIcon}>
//                             <Ionicons name="card-outline" size={22} color="#FFFFFF" />
//                         </View>
//                         <View style={{ flex: 1 }}>
//                             <Text style={styles.menuText}>Subscription</Text>
//                             {!isPro && <Text style={styles.subText}>Upgrade to Pro</Text>}
//                         </View>
//                         <Ionicons name="chevron-forward" size={20} color="#666" />
//                     </TouchableOpacity>

//                     <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/Settings")}>
//                         <View style={styles.menuIcon}>
//                             <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
//                         </View>
//                         <Text style={styles.menuText}>Settings</Text>
//                         <Ionicons name="chevron-forward" size={20} color="#666" />
//                     </TouchableOpacity>
//                 </View>

//                 {/* Dynamic Auth Button */}
//                 <View style={{ alignItems: 'center' }}>
//                     <TouchableOpacity
//                         style={[styles.authButton, isGuest ? styles.loginButton : styles.logoutButton]}
//                         onPress={isGuest ? () => router.push("/Home/Auth") : handleLogoutPress}
//                     >
//                         <Ionicons
//                             name={isGuest ? "log-in-outline" : "log-out-outline"}
//                             size={24}
//                             color="#FFF"
//                             style={{ marginRight: 10 }}
//                         />
//                         <Text style={styles.authButtonText}>{isGuest ? "Log In / Sign Up" : "Log Out"}</Text>
//                     </TouchableOpacity>
//                 </View>

//             </ScrollView>

//             <StatusModal
//                 visible={modalVisible}
//                 type="question"
//                 title="Log Out?"
//                 message="Are you sure you want to log out?"
//                 confirmText="Log Out"
//                 cancelText="Cancel"
//                 onConfirm={confirmLogout}
//                 onCancel={() => setModalVisible(false)}
//             />
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#2C2B29",
//     },
//     header: {
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "space-between",
//         paddingHorizontal: 20,
//         paddingTop: 60,
//         paddingBottom: 20,
//         backgroundColor: "#2C2B29",
//     },
//     headerTitle: {
//         fontSize: 20,
//         fontWeight: "bold",
//         color: "#FFFFFF",
//     },
//     backButton: {
//         padding: 5,
//     },
//     scrollContent: {
//         paddingBottom: 40,
//     },
//     userInfoSection: {
//         alignItems: "center",
//         marginBottom: 30,
//         marginTop: 10,
//     },
//     avatarContainer: {
//         position: "relative",
//         marginBottom: 15,
//     },
//     proBadge: {
//         position: "absolute",
//         bottom: 0,
//         right: 0,
//         backgroundColor: "#81B64C",
//         width: 30,
//         height: 30,
//         borderRadius: 15,
//         alignItems: "center",
//         justifyContent: "center",
//         borderWidth: 2,
//         borderColor: "#2C2B29",
//     },
//     userName: {
//         fontSize: 24,
//         fontWeight: "bold",
//         color: "#FFFFFF",
//         marginBottom: 5,
//     },
//     userHandle: {
//         fontSize: 14,
//         color: "#AAAAAA",
//     },
//     statsContainer: {
//         flexDirection: "row",
//         justifyContent: "space-evenly", 
//         marginBottom: 30,
//         paddingHorizontal: 10, 
//     },
//     statCard: {
//         backgroundColor: "rgba(255, 255, 255, 0.05)",
//         borderRadius: 16,
//         paddingVertical: 15,
//         paddingHorizontal: 5,
//         alignItems: "center",
//         width: "30%", 
//         borderWidth: 1,
//         borderColor: "rgba(255, 255, 255, 0.1)",
//     },
//     statValue: {
//         fontSize: 18, 
//         fontWeight: "bold",
//         color: "#FFFFFF",
//         marginTop: 8,
//         textAlign: 'center', 
//     },
//     statLabel: {
//         fontSize: 12,
//         color: "#AAAAAA",
//         marginTop: 4,
//     },
//     menuWrapper: {
//         backgroundColor: "rgba(255, 255, 255, 0.05)",
//         marginHorizontal: 20,
//         borderRadius: 16,
//         marginBottom: 30,
//         overflow: "hidden",
//     },
//     menuItem: {
//         flexDirection: "row",
//         alignItems: "center",
//         padding: 16,
//         borderBottomWidth: 1,
//         borderBottomColor: "rgba(255, 255, 255, 0.05)",
//     },
//     menuIcon: {
//         width: 36,
//         height: 36,
//         borderRadius: 18,
//         backgroundColor: "rgba(129, 182, 76, 0.2)",
//         alignItems: "center",
//         justifyContent: "center",
//         marginRight: 15,
//     },
//     menuText: {
//         flex: 1,
//         fontSize: 16,
//         color: "#FFFFFF",
//         fontWeight: "500",
//     },
//     subText: {
//         fontSize: 12,
//         color: "#81B64C",
//         marginTop: 2,
//     },
//     authButton: {
//         flexDirection: "row",
//         alignItems: "center",
//         paddingVertical: 15,
//         paddingHorizontal: 40,
//         borderRadius: 25,
//         marginTop: 10,
//         borderWidth: 1,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 4,
//         elevation: 5,
//     },
//     loginButton: {
//         backgroundColor: "#81B64C",
//         borderColor: "#81B64C",
//     },
//     logoutButton: {
//         backgroundColor: "#383633",
//         borderColor: "#555",
//     },
//     authButtonText: {
//         color: "#FFF",
//         fontSize: 18,
//         fontWeight: "bold",
//     },
// });

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RankingModal from "../../components/RankingModal"; // <--- 1. Import the new Modal
import StatusModal from "../../components/StatusModal";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../contexts/MembershipContext";

// DEFINE RANKS (Passed to Modal later)
const RANKS = [
    { name: "Novice", minXP: 0, color: "#A0A0A0" },       
    { name: "Apprentice", minXP: 100, color: "#8FBC8F" }, 
    { name: "Learner", minXP: 500, color: "#32CD32" },    
    { name: "Scholar", minXP: 1000, color: "#1E90FF" },   
    { name: "Master", minXP: 2500, color: "#FFD700" },    
    { name: "Grandmaster", minXP: 5000, color: "#FF8C00" }, 
    { name: "Legend", minXP: 10000, color: "#FF0000" },   
];

const getCurrentRank = (xp) => {
    const sortedRanks = [...RANKS].sort((a, b) => b.minXP - a.minXP);
    return sortedRanks.find(rank => xp >= rank.minXP) || RANKS[0];
};

export default function Profile() {
    const router = useRouter();
    const { user, logout, isGuest } = useAuth();
    const { isPro, streak, totalXP } = useMembership();
    
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [rankingModalVisible, setRankingModalVisible] = useState(false); // <--- 2. New State

    const currentRank = getCurrentRank(totalXP || 0);

    const handleLogoutPress = () => {
        setLogoutModalVisible(true);
    };

    const confirmLogout = async () => {
        setLogoutModalVisible(false);
        await logout();
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.userInfoSection}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person-circle-outline" size={80} color="#FFFFFF" />
                        {isPro && (
                            <View style={styles.proBadge}>
                                <Ionicons name="star" size={12} color="#FFF" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.userName}>
                        {isGuest ? "Guest User" : user?.email || "User"}
                    </Text>
                    <Text style={styles.userHandle}>
                        {isGuest ? "Sign up to save progress" : "Just Learn Member"}
                    </Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Ionicons name="flame" size={24} color="#FFD700" />
                        <Text style={styles.statValue}>{streak}</Text>
                        <Text style={styles.statLabel}>Streak</Text>
                    </View>

                    {/* 3. Make Rank Card Clickable */}
                    <TouchableOpacity 
                        style={[styles.statCard, { borderColor: currentRank.color }]}
                        onPress={() => setRankingModalVisible(true)} // Open Modal
                    >
                        <Ionicons name="trophy" size={24} color={currentRank.color} />
                        <Text style={[styles.statValue, { color: currentRank.color, fontSize: 16 }]}>
                            {currentRank.name}
                        </Text>
                        <Text style={styles.statLabel}>{totalXP} XP</Text>
                    </TouchableOpacity>

                    <View style={styles.statCard}>
                        <Ionicons name={isPro ? "diamond" : "cube-outline"} size={24} color="#81B64C" />
                        <Text style={styles.statValue}>{isPro ? "PRO" : "Free"}</Text>
                        <Text style={styles.statLabel}>Plan</Text>
                    </View>
                </View>

                {/* Menu Options */}
                <View style={styles.menuWrapper}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => alert("Coming soon")}>
                        <View style={styles.menuIcon}>
                            <Ionicons name="person-outline" size={22} color="#FFFFFF" />
                        </View>
                        <Text style={styles.menuText}>Edit Profile</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuItem} 
                        onPress={() => router.push("/membership")}
                    >
                        <View style={styles.menuIcon}>
                            <Ionicons name="card-outline" size={22} color="#FFFFFF" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.menuText}>Subscription</Text>
                            {!isPro && <Text style={styles.subText}>Upgrade to Pro</Text>}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/Settings")}>
                        <View style={styles.menuIcon}>
                            <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
                        </View>
                        <Text style={styles.menuText}>Settings</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity
                        style={[styles.authButton, isGuest ? styles.loginButton : styles.logoutButton]}
                        onPress={isGuest ? () => router.push("/Home/Auth") : handleLogoutPress}
                    >
                        <Ionicons
                            name={isGuest ? "log-in-outline" : "log-out-outline"}
                            size={24}
                            color="#FFF"
                            style={{ marginRight: 10 }}
                        />
                        <Text style={styles.authButtonText}>{isGuest ? "Log In / Sign Up" : "Log Out"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* 4. Include the Ranking Modal */}
            <RankingModal 
                visible={rankingModalVisible}
                onClose={() => setRankingModalVisible(false)}
                currentXP={totalXP}
                ranks={RANKS}
            />

            <StatusModal
                visible={logoutModalVisible}
                type="question"
                title="Log Out?"
                message="Are you sure you want to log out?"
                confirmText="Log Out"
                cancelText="Cancel"
                onConfirm={confirmLogout}
                onCancel={() => setLogoutModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#2C2B29" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: "#2C2B29" },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF" },
    backButton: { padding: 5 },
    scrollContent: { paddingBottom: 40 },
    userInfoSection: { alignItems: "center", marginBottom: 30, marginTop: 10 },
    avatarContainer: { position: "relative", marginBottom: 15 },
    proBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#81B64C", width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#2C2B29" },
    userName: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF", marginBottom: 5 },
    userHandle: { fontSize: 14, color: "#AAAAAA" },
    statsContainer: { flexDirection: "row", justifyContent: "space-evenly", marginBottom: 30, paddingHorizontal: 10 },
    statCard: { backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: 16, paddingVertical: 15, paddingHorizontal: 5, alignItems: "center", width: "30%", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)" },
    statValue: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF", marginTop: 8, textAlign: 'center' },
    statLabel: { fontSize: 12, color: "#AAAAAA", marginTop: 4 },
    menuWrapper: { backgroundColor: "rgba(255, 255, 255, 0.05)", marginHorizontal: 20, borderRadius: 16, marginBottom: 30, overflow: "hidden" },
    menuItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.05)" },
    menuIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(129, 182, 76, 0.2)", alignItems: "center", justifyContent: "center", marginRight: 15 },
    menuText: { flex: 1, fontSize: 16, color: "#FFFFFF", fontWeight: "500" },
    subText: { fontSize: 12, color: "#81B64C", marginTop: 2 },
    authButton: { flexDirection: "row", alignItems: "center", paddingVertical: 15, paddingHorizontal: 40, borderRadius: 25, marginTop: 10, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
    loginButton: { backgroundColor: "#81B64C", borderColor: "#81B64C" },
    logoutButton: { backgroundColor: "#383633", borderColor: "#555" },
    authButtonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});
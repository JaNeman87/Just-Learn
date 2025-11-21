

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useMembership } from "../app/contexts/MembershipContext";
import { downloadLevelData, downloadQuestions } from "../app/services/contentService";
import ProModal from "./ProModal";
import StatusModal from "./StatusModal";

const DownloadButton = ({ levelId, bookmarkIds, type = "level" }) => {
    const router = useRouter(); 
    const { isPro } = useMembership();
    const [loading, setLoading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const [showProModal, setShowProModal] = useState(false);

    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [statusConfig, setStatusConfig] = useState({
        type: "info", title: "", message: "", confirmText: "OK", cancelText: null,
    });
    const showStatus = config => { setStatusConfig(config); setStatusModalVisible(true); };

    useEffect(() => {
        const checkStatus = async () => {
            if (type === "level" && levelId) {
                const stored = await AsyncStorage.getItem(`@OfflineContent:${levelId}`);
                setDownloaded(!!stored);
            } else if (type === "bookmarks") {
                // Check the specific bookmarks offline key
                const stored = await AsyncStorage.getItem(`@OfflineContent:Bookmarks`);
                setDownloaded(!!stored);
            }
        };
        checkStatus();
    }, [levelId, type, isPro]);

    const handlePress = async () => {
        if (!isPro) {
            setShowProModal(true);
            return;
        }

        // Logic for updating vs downloading
        if (downloaded) {
             showStatus({
                type: "question",
                title: "Update Content?",
                message: "You have an offline copy. Download again to sync latest changes?",
                confirmText: "Update",
                cancelText: "Cancel",
                onConfirm: performDownload,
            });
        } else {
            showStatus({
                type: "question",
                title: "Download Content?",
                message: "Do you want to save this content for offline use?",
                confirmText: "Download",
                cancelText: "Cancel",
                onConfirm: performDownload,
            });
        }
    };

    const performDownload = async () => {
        setStatusModalVisible(false);
        setLoading(true);
        let success = false;
        if (type === "level" && levelId) {
            success = await downloadLevelData(levelId);
        } else if (type === "bookmarks" && bookmarkIds) {
            success = await downloadQuestions(bookmarkIds);
        }
        setLoading(false);
        if (success) {
            setDownloaded(true);
            setTimeout(() => {
                showStatus({ type: "success", title: "Download Complete", message: "Content saved offline.", confirmText: "Great!", onConfirm: () => setStatusModalVisible(false) });
            }, 300);
        } else {
            setTimeout(() => {
                showStatus({ type: "error", title: "Download Failed", message: "Could not download content. Check internet.", confirmText: "OK", onConfirm: () => setStatusModalVisible(false) });
            }, 300);
        }
    };

    const handleGoProNav = () => {
        setShowProModal(false);
        router.push("/membership");
    };

    return (
        <>
            <TouchableOpacity
                onPress={handlePress}
                style={[styles.button, downloaded && styles.buttonDownloaded]}
                activeOpacity={0.7}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                    <Ionicons
                        name={!isPro ? "lock-closed" : downloaded ? "checkmark-circle" : "cloud-download-outline"}
                        size={22}
                        color={!isPro ? "#FFD700" : "#FFF"}
                    />
                )}
            </TouchableOpacity>

            <ProModal
                visible={showProModal}
                onClose={() => setShowProModal(false)}
                onGoPro={handleGoProNav}
                featureTitle="Unlock Offline Mode"
                featureDescription="Download your content and learn anywhere, even without an internet connection."
            />

            <StatusModal
                visible={statusModalVisible}
                type={statusConfig.type}
                title={statusConfig.title}
                message={statusConfig.message}
                confirmText={statusConfig.confirmText}
                cancelText={statusConfig.cancelText}
                onConfirm={statusConfig.onConfirm || (() => setStatusModalVisible(false))}
                onCancel={statusConfig.cancelText ? () => setStatusModalVisible(false) : undefined}
            />
        </>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.1)",
        marginLeft: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonDownloaded: {
        backgroundColor: "#81B64C",
    },
});

export default DownloadButton;
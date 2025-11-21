
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../lib/supabase";

const OFFLINE_PREFIX = "@OfflineContent:";
const BOOKMARKS_OFFLINE_KEY = `${OFFLINE_PREFIX}Bookmarks`;

// ... (fetchLevelData and downloadLevelData remain the same) ...
export const fetchLevelData = async (levelId) => {
    try {
        const localJson = await AsyncStorage.getItem(`${OFFLINE_PREFIX}${levelId}`);
        if (localJson) {
            console.log(`📱 Loaded ${levelId} from local storage`);
            return JSON.parse(localJson);
        }

        console.log(`☁️ Fetching ${levelId} from Supabase...`);
        const { data, error } = await supabase
            .from("levels")
            .select(`
                title,
                description,
                tests (
                    id,
                    title,
                    questions (
                        id,
                        type,
                        question_text,
                        content,
                        sort_order
                    )
                )
            `)
            .eq("id", levelId)
            .single();

        if (error) throw error;
        if (!data) return null;

        const formattedTests = data.tests.map(t => ({
            id: t.id,
            title: t.title,
            questions: t.questions
                .sort((a, b) => a.sort_order - b.sort_order)
                .map(q => ({
                    id: q.id,
                    type: q.type,
                    questionText: q.question_text,
                    ...q.content,
                })),
        }));

        formattedTests.sort((a, b) => a.id.localeCompare(b.id));

        return {
            title: data.title,
            description: data.description,
            tests: formattedTests,
        };

    } catch (error) {
        console.error(`Error fetching level ${levelId}:`, error);
        return null;
    }
};

export const downloadLevelData = async (levelId) => {
    try {
        const { data, error } = await supabase
            .from("levels")
            .select(`
                title,
                description,
                tests (
                    id,
                    title,
                    questions (
                        id,
                        type,
                        question_text,
                        content,
                        sort_order
                    )
                )
            `)
            .eq("id", levelId)
            .single();

        if (error || !data) throw error;

        const formattedTests = data.tests.map(t => ({
            id: t.id,
            title: t.title,
            questions: t.questions
                .sort((a, b) => a.sort_order - b.sort_order)
                .map(q => ({
                    id: q.id,
                    type: q.type,
                    questionText: q.question_text,
                    ...q.content,
                })),
        }));
        
        formattedTests.sort((a, b) => a.id.localeCompare(b.id));

        const fullData = {
            title: data.title,
            description: data.description,
            tests: formattedTests,
        };

        await AsyncStorage.setItem(`${OFFLINE_PREFIX}${levelId}`, JSON.stringify(fullData));
        return true;
    } catch (error) {
        console.error("Download failed:", error);
        return false;
    }
};

// --- BOOKMARKS LOGIC ---

export const downloadQuestions = async (ids) => {
    try {
        if (!ids || ids.length === 0) return false;
        
        console.log("Downloading bookmarks...");
        // Fetch fresh from DB
        const { data, error } = await supabase.from("questions").select("*").in("id", ids);
        
        if (error) throw error;

        const formattedQuestions = data.map(q => ({
            id: q.id,
            type: q.type,
            questionText: q.question_text,
            ...q.content,
        }));

        // Save to special Bookmarks Offline Key
        await AsyncStorage.setItem(BOOKMARKS_OFFLINE_KEY, JSON.stringify(formattedQuestions));
        return true;
    } catch (e) {
        console.error("Bookmark download failed", e);
        return false;
    }
};

export const fetchQuestionsByIds = async ids => {
    if (!ids || ids.length === 0) return [];

    try {
        // 1. Try Offline Cache First
        const localJson = await AsyncStorage.getItem(BOOKMARKS_OFFLINE_KEY);
        if (localJson) {
            const allOfflineBookmarks = JSON.parse(localJson);
            // Filter for the requested IDs
            const foundLocally = allOfflineBookmarks.filter(q => ids.includes(q.id));
            
            // If we found ALL requested bookmarks locally, return them
            // (If some are missing, we might want to fallback to DB, but for now let's return what we have 
            // or assume the user should hit 'download' again to sync new ones)
            if (foundLocally.length > 0) {
                 console.log("📱 Loaded bookmarks from local storage");
                 return foundLocally;
            }
        }

        // 2. Fallback to Supabase
        const { data, error } = await supabase.from("questions").select("*").in("id", ids);
        if (error) throw error;
        return data.map(q => ({
            id: q.id,
            type: q.type,
            questionText: q.question_text,
            ...q.content,
        }));
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        return [];
    }
};

// Cleanup
export const clearAllOfflineContent = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const offlineKeys = keys.filter(key => key.startsWith(OFFLINE_PREFIX));
        
        if (offlineKeys.length > 0) {
            await AsyncStorage.multiRemove(offlineKeys);
            console.log("🧹 Removed offline content:", offlineKeys);
        }
    } catch (error) {
        console.error("Failed to clear offline content:", error);
    }
};
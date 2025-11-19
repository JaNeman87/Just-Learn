import { supabase } from "../../lib/supabase";

export const fetchLevelData = async levelId => {
    try {
        // 1. Fetch Level, Tests, and Questions in one query
        const { data, error } = await supabase
            .from("levels")
            .select(
                `
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
            `
            )
            .eq("id", levelId)
            .single();

        if (error) throw error;
        if (!data) return null;

        // 2. Transform the data to match your old local file structure
        // We stored 'options', 'pairs', 'correctSentence' inside the 'content' JSON column.
        // Now we pull them out so the UI sees them as top-level properties.
        const formattedTests = data.tests.map(t => ({
            id: t.id,
            title: t.title,
            questions: t.questions
                .sort((a, b) => a.sort_order - b.sort_order) // Ensure correct order
                .map(q => ({
                    id: q.id,
                    type: q.type,
                    questionText: q.question_text, // Map snake_case DB field to camelCase prop
                    ...q.content, // Spread the JSONB fields (options, pairs, etc.) directly here
                })),
        }));

        // Sort tests alphabetically (e.g., T1, T2, T3)
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

export const fetchQuestionsByIds = async ids => {
    if (!ids || ids.length === 0) return [];

    try {
        const { data, error } = await supabase.from("questions").select("*").in("id", ids); // Efficiently finds only the requested IDs

        if (error) throw error;

        // Transform the data to match the app's expected format
        return data.map(q => ({
            id: q.id,
            type: q.type,
            questionText: q.question_text,
            ...q.content, // Flatten the JSON content
        }));
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        return [];
    }
};

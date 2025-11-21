import { supabase } from "../../lib/supabase";

export const getGrammarExplanation = async (context, wrongWord, correctWord, fullSentence) => {
    try {
        console.log("🤖 AI Service called...");
        
        // DEBUG LOGS
        console.log("Target Project:", process.env.EXPO_PUBLIC_SUPABASE_URL); 
        // Don't log the full key, just the length to see if it exists
        console.log("Key Length:", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.length);

        const { data, error } = await supabase.functions.invoke('explain-mistake', {
            body: { context, wrongWord, correctWord, fullSentence }
        });
        
        if (error) {
            console.error("Full Error Object:", JSON.stringify(error, null, 2)); // Get detailed error
            throw error;
        }
        return data.explanation;

    } catch (e) {
        console.error("AI Service Error:", e);
        return "Could not connect to AI Coach. Please check your internet or try again later.";
    }
};
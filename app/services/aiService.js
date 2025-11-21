import { supabase } from "../../lib/supabase";

export const getGrammarExplanation = async (context, wrongWord, correctWord, fullSentence) => {
    try {
        const { data, error } = await supabase.functions.invoke('explain-mistake', {
            body: { context, wrongWord, correctWord, fullSentence }
        });

        if (error) throw error;
        return data.explanation;
    } catch (e) {
        console.error("AI Service Error:", e);
        return "Could not load explanation. Please try again.";
    }
};
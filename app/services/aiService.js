
import { supabase } from "../../lib/supabase";
// --- FIX: Use legacy import to support readAsStringAsync ---
import * as FileSystem from 'expo-file-system/legacy';

export const getGrammarExplanation = async (context, wrongWord, correctWord, fullSentence) => {
    try {
        const { data, error } = await supabase.functions.invoke('explain-mistake', {
            body: { context, wrongWord, correctWord, fullSentence }
        });

        if (error) {
            console.error("Supabase Function Error:", error);
            throw error;
        }
        
        return data.explanation;

    } catch (e) {
        console.error("AI Service Error:", e);
        return "Could not connect to AI Coach. Please check your internet or try again later.";
    }
};

export const transcribeAudio = async (uri) => {
    try {
        console.log("🎙️ Transcribing audio...");
        
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
        });

        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
            body: { audioData: base64Audio }
        });

        if (error) throw error;
        
        console.log("✅ Transcription:", data.text);
        return data.text;

    } catch (e) {
        console.error("Transcription Error:", e);
        return null;
    }
};
// supabase/functions/explain-mistake/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS for React Native requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { context, wrongWord, correctWord, fullSentence } = await req.json()

        const prompt = `
    You are a friendly German teacher. A student made a mistake building this sentence: "${fullSentence}".
    They have currently built: "${context}".
    They tried to add: "${wrongWord}".
    The correct next word is: "${correctWord}".
    
    Explain simply (in 1-2 sentences) why "${wrongWord}" is wrong here or why "${correctWord}" fits better. 
    Focus on grammar (word order, gender, case). Don't just say "it's wrong".
    `

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "llama3-8b-8192", // Fast & Free
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3, // Low temperature for factual grammar advice
            })
        })

        const data = await response.json()
        const explanation = data.choices[0].message.content

        return new Response(JSON.stringify({ explanation }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
    }
})
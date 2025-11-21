import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        if (!GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is not set in Supabase Secrets")
        }

        const { context, wrongWord, correctWord, fullSentence } = await req.json()
        console.log(`Request received for: "${wrongWord}" vs "${correctWord}"`)

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // --- FIX: Updated Model Name ---
                model: "llama-3.1-8b-instant",
                messages: [{
                    role: "user",
                    content: `Explain simply why "${wrongWord}" is wrong in the sentence "${fullSentence}" and why "${correctWord}" is correct. Keep it short.`
                }],
                temperature: 0.3,
            })
        })

        const data = await response.json()

        if (data.error) {
            console.error("Groq API Error:", JSON.stringify(data.error))
            throw new Error(`Groq Error: ${data.error.message}`)
        }

        if (!data.choices || data.choices.length === 0) {
            console.error("Unexpected Groq Response:", JSON.stringify(data))
            throw new Error("Groq returned no choices")
        }

        const explanation = data.choices[0].message.content
        console.log("Success! Explanation generated.")

        return new Response(JSON.stringify({ explanation }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })

    } catch (error) {
        console.error("Function Error:", error.message)

        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
    }
})
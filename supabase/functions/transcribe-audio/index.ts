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
        if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is missing")

        // 1. Get the Base64 Audio from the request
        const { audioData } = await req.json()

        if (!audioData) throw new Error("No audio data provided")

        // 2. Convert Base64 to Blob
        const binaryString = atob(audioData)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
        }
        const fileBlob = new Blob([bytes], { type: 'audio/m4a' })

        // 3. Prepare FormData for Groq
        const formData = new FormData()
        formData.append('file', fileBlob, 'recording.m4a')
        formData.append('model', 'whisper-large-v3') // The best open-source speech model
        formData.append('language', 'de') // Hint that it's German for better accuracy

        // 4. Call Groq Whisper API
        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: formData
        })

        const data = await response.json()

        if (data.error) throw new Error(data.error.message)

        return new Response(JSON.stringify({ text: data.text }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
    }
})
const {VertexAI, HarmCategory, HarmBlockThreshold} = require('@google-cloud/vertexai');
const fs = require('fs');
const { jsonrepair } = require('jsonrepair')

const  { geminiPrompts:prompts } = require('../modules/gemini_prompts')


async function gemini(taskType, input) {
    const selectedPrompt = prompts[taskType];
    const project = 'wordwarden-419113';
    const location = 'europe-west9';
    const credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));

    const vertex_ai = new VertexAI({
        project,
        location,
        credentials
    });

    const generativeModel = vertex_ai.getGenerativeModel({
        model: 'gemini-1.5-pro-preview-0409	',
        safety_settings: [{
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }],
        generation_config: {
            temperature: 0.5
        },
    });

    const request = {
        contents: [{
                role: 'user',
                parts: [{
                    text: selectedPrompt
                }]
            },
            {
                role: 'model',
                parts: [{
                    text: 'Please provide me the text.'
                }]
            },
            {
                role: 'user',
                parts: [{
                    text: input
                }]
            }
        ],
    };

    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {


        try {
            const resp = await generativeModel.generateContent(request);
            const model = resp.response.candidates[0].content.parts[0].text;
            const cleanStr = model.replace(/^\s*```\s*json\s*\n/i, '').replace(/\n```\s*$/i, '').trim();

            return JSON.parse(jsonrepair(cleanStr))
        } catch (error) {
            console.error("Attempt " + (attempt + 1) + " failed, error: " + error);
            attempt++;

            if (attempt === maxRetries) {
                console.error("Maximum retries reached, unable to process the request.");
                // Optionally, return a fallback or default value
                return { error: "Unable to process request after multiple attempts." };
            }
        }
    }
    
}


module.exports = { gemini };

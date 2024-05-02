const {prompts} = require('../modules/prompts')
const OpenAI = require('openai')


async function openai(taskType, input) {
    
    console.log('running openai')

    const openai = new OpenAI();

    const selectedPrompt = prompts[taskType];

    if (!selectedPrompt) {
        throw new Error('Invalid task specified');
    }
    
    console.log('waiting for completion')

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: selectedPrompt },
    {role: "user", content: input},
],
    response_format: { "type": "json_object" },
    model: "gpt-4-turbo-preview",
    seed: 1,
  });

  try {
    const parsedAnswer = JSON.parse(completion.choices[0].message.content);
    return parsedAnswer;
} catch (error) {
    return 'Error parsing JSON: ' + error
}
    
  }

module.exports = { openai };

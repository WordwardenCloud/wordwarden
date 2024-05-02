const path = require('path');
const {prompts} = require('../modules/prompts')

let LlamaModel, LlamaGrammar, LlamaContext, LlamaChatSession, LlamaJsonSchemaGrammar;

async function mistral(taskType, input) {

    const selectedPrompt = prompts[taskType];

    if (!selectedPrompt) {
        throw new Error('Invalid task specified');
    }

	if (!LlamaModel || !LlamaGrammar || !LlamaContext || !LlamaChatSession || !LlamaJsonSchemaGrammar || !LlamaChatPromptWrapper) {
        const llama = await import('node-llama-cpp');
        LlamaModel = llama.LlamaModel;
        LlamaGrammar = llama.LlamaGrammar;
        LlamaContext = llama.LlamaContext;
        LlamaChatSession = llama.LlamaChatSession;
        LlamaJsonSchemaGrammar = llama.LlamaJsonSchemaGrammar;
        LlamaChatPromptWrapper = llama.LlamaChatPromptWrapper;
      }
    
      const model = new LlamaModel({
        modelPath: path.join(__dirname, "..", "llm", "capybarahermes-2.5-mistral-7b.Q4_K_M.gguf"),
        /* temperature: 0.7 */
      });

      const grammar = new LlamaJsonSchemaGrammar({
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "excerpt": {
                    "type": "string"
                },
                "proposition": {
                    "type": "string"
                },
                "importance": {
                    "type": "string"
                }
            },
            "required": ["excerpt", "proposition", "importance"],
            "additionalProperties": false
        }
    });
    
        const context = new LlamaContext({ model, batchSize: 4096 });
    
        class MyCustomChatPromptWrapper extends LlamaChatPromptWrapper {
        constructor() {
            super();
            this.wrapperName = "WordWarden";
          }
    
        wrapPrompt(prompt) {
           
          return `SYSTEM: ${selectedPrompt} \n USER: ${prompt} \n ASSISTANT:`;
        }
    
        getStopStrings() {
            return ["USER:"];
        }
    
        getDefaultStopString() {
            return "USER:";
        }
    }
    
    let session = new LlamaChatSession({
        context,
        promptWrapper: new MyCustomChatPromptWrapper()
    });
    
      const answer = await session.prompt(input, {
          grammar,
          maxTokens: context.getContextSize(),
      });

        try {
            const parsedAnswer = JSON.parse(answer);
            return parsedAnswer;
        } catch (error) {
            return 'Error parsing JSON: ' + error
        }

    
  }

module.exports = { mistral };

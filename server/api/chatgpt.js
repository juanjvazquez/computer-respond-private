const { Configuration, OpenAIApi } = require('openai');

const createChatGPT = async (fields) => {
    const apiKey = fields.key;
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    const messages = JSON.parse(fields.messages)
    // console.log('Messages: ', messages)
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
        // maxTokens: 60,
        // n: 1,
        // stop: '\n',
    });
    return response.data.choices[0].message;
};

module.exports = { createChatGPT };
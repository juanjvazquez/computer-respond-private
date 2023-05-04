const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const path = require('path');

const uploadDir = process.env.NODE_ENV === 'development' ? './tmp' : '/tmp';

const createWhisper = async (files, fields) => {
    const apiKey = fields.key;
    const language = fields.language
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    const filename = files.audio.originalFilename;
    const oldPath = files.audio.filepath;
    const newPath = path.join(uploadDir, `copy_${filename}`);

    // console.log("AUDIO filename: ", filename)
    console.log("AUDIO oldPath: ", oldPath)
    console.log("AUDIO newPath: ", newPath)

    fs.renameSync(oldPath, newPath);

    const audioFile = fs.createReadStream(newPath);
    const response = await openai.createTranscription(audioFile, 'whisper-1', language);
    // console.log(response.data.text)
    setTimeout(() => {
        fs.unlinkSync(newPath);
    }, 1000);
    
    return response.data.text
};

module.exports = { createWhisper };
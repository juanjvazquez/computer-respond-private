const say = require('say');
const fs = require('fs');
const path = require('path');

const uploadDir = process.env.NODE_ENV === 'development' ? './tmp' : '/tmp';

const createSay = async (fields, res) => {
    const text = fields.transcription;
    console.log("TEXT:", text)
    console.log('PLATFORM:', process.platform);
    try {
        const audioName = 'audio.wav';
        const audioPath = path.join(uploadDir, audioName);
        console.log(audioPath)
        await new Promise((resolve, reject) => {
            say.getInstalledVoices((err, voices) => {
                console.log('getVoices() called');
                console.log('voices', voices);
                if (err) {
                    return reject(err);
                }
                say.export(text, voices[0], 1, audioPath, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        });
        const buffer = fs.readFileSync(audioPath);
        fs.unlinkSync(audioPath);

        return buffer;
    } catch (err) {
        console.error(err);
        return null;
    }
};

module.exports = { createSay };
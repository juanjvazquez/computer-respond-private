const formidable = require('formidable');
const { createWhisper } = require('./whisper');
const { createChatGPT } = require('./chatgpt');
// const { createSay } = require('./say');
const { createAWSPolly } = require('./aws-polly');

const uploadDir = process.env.NODE_ENV === 'development' ? './tmp' : '/tmp';


const whisperHandler = async (req, res) => {
    const form = formidable({ multiples: false, uploadDir });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.status(400).send('Error parsing form data');
            return;
        }
        try {
            const response = await createWhisper(files,fields);
            res.end(JSON.stringify(response));
        } catch (error) {
            console.error('Error calling Whisper API', error);
            res.status(500).send('Error processing audio file');
        }
  });
};

const chatGPTHandler = async (req, res) => {
    const form = formidable({ multiples: false, uploadDir });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.status(400).send('Error parsing form data');
            return;
        }
        try {
            const response = await createChatGPT(fields);
            res.json(response);
        } catch (error) {
            console.error('Error calling ChatGPT API', error);
            res.status(500).send('Error querying ChatGPT');
        }
    });
};

const awsPollyHandler = async (req, res) => {
    const form = formidable({ multiples: false, uploadDir });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.status(400).send('Error parsing form data');
            return;
        }
        try {
            const response = await createAWSPolly(fields);
            res.json(response);
        } catch (error) {
            console.error('Error calling Say API', error);
            res.status(500).send('Error querying Say');
        }
    });
};

// const sayHandler = async (req, res) => {
//     const form = formidable({ multiples: false, uploadDir });
//     form.parse(req, async (err, fields, files) => {
//         if (err) {
//             res.status(400).send('Error parsing form data');
//             return;
//         }
//         try {
//             const response = await createPolly(fields);
//             res.json(response);
//         } catch (error) {
//             console.error('Error calling Say API', error);
//             res.status(500).send('Error querying Say');
//         }
//     });
// };
  
module.exports = { whisperHandler, chatGPTHandler, awsPollyHandler };

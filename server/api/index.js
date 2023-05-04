var dotenv = require('dotenv');
var dotenvExpand = require('dotenv-expand')
var myEnv = dotenv.config();
dotenvExpand.expand(myEnv)

const express = require('express');
const cors = require('cors');
const { whisperHandler, chatGPTHandler , awsPollyHandler } = require('./apiHandlers');

const app = express();
const port = process.env.PORT_NODE || 8080;
const allowedOrigin = process.env.REACT_APP_ALLOWED_ORIGIN;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    credentials: true
  }));

app.post('/api/chatgpt', (req, res) => {
    console.log('POST request received for /api/chatgpt endpoint');
    chatGPTHandler(req, res);
});

app.post('/api/whisper', (req, res) => {
    console.log('POST request received for /api/whisper endpoint');
    whisperHandler(req, res);
});

app.post('/api/aws-polly', (req, res) => {
    console.log('POST request received for /api/say endpoint');
    awsPollyHandler(req, res);
});

app.use('*', (req, res) => {
    res.status(404).send('Page not found');
});

app.listen(port, () => {
    console.log(`Server is listening on port http://localhost:${port}`);
});
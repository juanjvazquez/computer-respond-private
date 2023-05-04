const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const uploadDir = process.env.NODE_ENV === 'development' ? './tmp' : '/tmp';
const cacheDir = path.join(uploadDir, 'cache');

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const polly = new AWS.Polly();

const generateHash = (text, language, gender) => {
  return crypto.createHash('md5').update(text + language + gender).digest('hex');
};

const printFilesInTmpDir = () => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
    console.log('Files in tmp directory:');
    files.forEach(file => {
      console.log(file);
    });
  });
};

const printFilesInCacheDir = () => {
  fs.readdir(cacheDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
    console.log('Files in tmp/cache directory:');
    files.forEach(file => {
      console.log(file);
    });
  });
};

const getVoiceId = (language, gender) => {
    const voiceMap = {
      'English US': {
        male: 'Joey',
        female: 'Joanna',
      },
      'English UK': {
        male: 'Brian',
        female: 'Amy',
      },
      'Spanish': {
        male: 'Enrique',
        female: 'Lucia',
      },
      'French': {
        male: 'Mathieu',
        female: 'Celine',
      },
      'German': {
        male: 'Hans',
        female: 'Marlene',
      },
      'Portuguese': {
        male: 'Cristiano',
        female: 'Ines',
      },
      'Italian': {
        male: 'Giorgio',
        female: 'Carla',
      },
      'Romanian': {
        male: 'Carmen',
        female: 'Carmen',
      },
      'Dutch': {
        male: 'Ruben',
        female: 'Lotte',
      },
      'Catalan': {
        male: 'Arlet',
        female: 'Arlet',
      },
      'Arabic': {
        male: 'Zeina',
        female: 'Zeina',
      },
      'Hindi': {
        male: 'Aditi',
        female: 'Aditi',
      },
      'Japanese': {
        male: 'Takumi',
        female: 'Mizuki',
      },
    };
  
    const selectedLanguage = voiceMap[language];
    if (selectedLanguage) {
      return selectedLanguage[gender.toLowerCase()] || null;
    }
    return null;
};  

const createAWSPolly = async (fields) => {
  const text = fields.transcription;
  const speechRate = '105%';
  const language = fields.language;
  const gender = fields.gender;

  const voiceId = getVoiceId(language, gender);
  console.log("Language:", language)
  console.log("Gender:", gender)
  console.log("voiceId:", voiceId)
  if (!voiceId) {
    console.error('Invalid language or gender');
    return null;
  }

  const ssmlText = `<speak><prosody rate="${speechRate}">${text}</prosody></speak>`;
  // console.log("SSML Text:", ssmlText);

  const textHash = generateHash(ssmlText, language, gender);

  const cachedAudioPath = path.join(cacheDir, `${textHash}.mp3`);
  if (fs.existsSync(cachedAudioPath)) {
    console.log('Returning cached audio file');
    const buffer = fs.readFileSync(cachedAudioPath);
    return buffer;
  }

  try {
    const params = {
      OutputFormat: 'mp3',
      Text: ssmlText,
      TextType: 'ssml',
      VoiceId: voiceId,
    };

    const synthResult = await polly.synthesizeSpeech(params).promise();
    const audioName = 'audio.mp3';
    const audioPath = path.join(uploadDir, audioName);
    // console.log(audioPath);

    fs.writeFileSync(audioPath, synthResult.AudioStream);

    fs.writeFileSync(cachedAudioPath, synthResult.AudioStream);
    console.log('Cached audio path: ', cachedAudioPath)
    const buffer = fs.readFileSync(audioPath);
    fs.unlinkSync(audioPath);

    printFilesInTmpDir();
    printFilesInCacheDir();

    return buffer;
  } catch (err) {
    console.error(err);
    return null;
  }
};

module.exports = { createAWSPolly };

import React from 'react';
import FormattedContent from './FormattedContent';
import './App.css';
import { postAWSPolly } from '../utils/postData';

const MessageBubble = React.memo(({
  role,
  content,
  language,
  gender,
  currentAudio,
  setCurrentAudio,
  isAudioPlaying,
  setIsAudioPlaying,
  onStopAudio
}) => {
  const handleSpeakClick = async () => {
    onStopAudio();

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }

    const pollyData = new FormData();
    pollyData.append('transcription', content);
    pollyData.append('language', language);
    pollyData.append('gender', gender);
    const pollyResponse = await postAWSPolly(pollyData);

    const bufferData = new Uint8Array(pollyResponse.data);
    const sayBlob = new Blob([bufferData], { type: 'audio/wav' });
    const audioResponseUrl = URL.createObjectURL(sayBlob);

    const audio = new Audio(audioResponseUrl);
    setCurrentAudio(audio);
    audio.play();

    setIsAudioPlaying(true);
    audio.onended = () => {
      setIsAudioPlaying(false);
      setCurrentAudio(null);
    };
  };

  const generateHash = async (text, language, gender) => {
    const data = text + language + gender;
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };
  
  const handleDownloadClick = async () => {
    const pollyData = new FormData();
    pollyData.append('transcription', content);
    pollyData.append('language', language);
    pollyData.append('gender', gender);

    const textHash = await generateHash(content, language, gender);

    const pollyResponse = await postAWSPolly(pollyData);

    const bufferData = new Uint8Array(pollyResponse.data);
    const sayBlob = new Blob([bufferData], { type: 'audio/mp3' });
    const audioResponseUrl = URL.createObjectURL(sayBlob);

    const link = document.createElement('a');
    link.href = audioResponseUrl;
    link.download = `computer-respond-${textHash}.mp3`;
    link.click();
    link.remove();
  };

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // alert('Content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy content: ', err);
    }
  };
  

  return (
    <div className={`message-bubble ${role} ${isAudioPlaying ? 'is-audio-playing' : ''}`}>
      <FormattedContent content={content} />

      <div className={`volume-icon ${role}`} onClick={handleSpeakClick}>
        <div className="circle"></div>
        <div className="bar bar1"></div>
        <div className="bar bar2"></div>
        <div className="bar bar3"></div>
      </div>
      <div className={`clipboard-icon ${role}`} onClick={handleCopyClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          className="feather feather-clipboard clipboard-svg"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth=""
          fill=""
          stroke=""
        >
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect height="4" rx="1" ry="1" width="8" x="8" y="2" />
        </svg>
      </div>
      <div className={`download-icon ${role}`} onClick={handleDownloadClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="19"
          height="19"
          className="feather feather-download download-svg"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth=""
          fill=""
          stroke=""
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
      </div>
    </div>
  );
});

export default MessageBubble;

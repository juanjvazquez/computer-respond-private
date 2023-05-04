import React, { useState, useEffect, useRef, Suspense, useLayoutEffect  } from 'react';
import { Canvas } from '@react-three/fiber';
import { postChatGPT, postWhisper, postAWSPolly } from '../utils/postData';
import MessageBubble from './MessageBubble';
import { AnimatedBlob, Env } from './Three-old'
import './App.css';

function App() {
    const [recording, setRecording] = useState(false);
    const [audioChunks, setAudioChunks] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);

    const [currentAudio, setCurrentAudio] = useState(null);

    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

    const [chosenCategory, setChosenCategory] = useState("Default");

    const apiKey = import.meta.env.VITE_API_KEY;

    const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false);
    const [isKeyPopupOpen, setIsKeyPopupOpen] = useState(true);
    const [errorText, setErrorText] = useState("");

    const [chosenLanguage, setChosenLanguage] = useState("English US");
    const [chosenGender, setChosenGender] = useState("Female");

    const [isButtonPause, setIsButtonPause] = useState(true);

    const filteredMessages = messages.filter(message => message.role !== 'system');

    const languageMapping = {
      'English UK': 'en-GB',
      'English US': 'en-US',
      'Spanish': 'es',
      'French': 'fr',
      'German': 'de',
      'Romanian': 'ro',
      'Portuguese': 'pt',
      'Dutch': 'nl',
      'Arabic': 'ar',
      'Catalan': 'ca',
      'Hindi': 'hi',
      'Italian': 'it',
      'Japanese': 'ja',
    };    

    const mediaRecorderRef = useRef(null);

    const getDefaultPrompt = async () => {
      const res = await fetch('/prompts/Default.prompt');
      const defaultPrompt = await res.text();
      setMessages(messages => messages.length === 0 ? [{ role: 'system', content: defaultPrompt }] : messages);
    };
    
    useEffect(() => {
      getDefaultPrompt();
    }, []);
    
    function ErrorPopup({ isOpen, onClose, errorText }) {
      if (!isOpen) return null;
    
      return (
        <div className="error-popup">
          <div className="error-popup-content">
            <p>Error: ${errorText}</p>
            <p>Reminder: Make sure to provide your API key in settings!</p>
            <button className="close-button" onClick={onClose}>
                X
            </button>
          </div>
        </div>
      );
    }

    function APIKeyPopup({ isOpen, onClose }) {
      if (!isOpen) return null;

      return (
        <div className="error-popup">
          <div className="error-popup-content">
            <p>This is a private deployment of <em>Computer, Respond!</em>.</p>
            <p>App created by <a href="https://github.com/juanjvazquez" style={{color: '#BC00FE', textDecoration: 'none'}} target="_blank" rel="noopener noreferrer">juanjvazquez</a>.</p>
          </div>
          <button className="close-button" onClick={onClose}>
            X
          </button>
        </div>
      );
    }

    const handleButtonClick = () => {
      handleStopAudio();
      if (!recording && !isButtonDisabled) {
        setAudioChunks([]);
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.start();
            setRecording(true);
            const audioChunks = [];
            mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
              audioChunks.push(event.data);
            });
            mediaRecorderRef.current.addEventListener("stop", async () => {
              setIsButtonDisabled(true);
              setRecording(false);
              try {
                const audioBlob = new Blob(audioChunks);
                const whisperData = new FormData();
                whisperData.append('audio', audioBlob, 'audio.wav');
                whisperData.append('key', apiKey);
                whisperData.append('language', languageMapping[chosenLanguage]);
                const prompt = await postWhisper(whisperData);

                const userMessage = { role: 'user', content: prompt };
                setMessages(messages => [...messages, userMessage]);

                const updatedMessages = [...messages, userMessage];

                const chatGPTData = new FormData();
                chatGPTData.append('messages', JSON.stringify(updatedMessages));
                chatGPTData.append('key', apiKey);
                const chatGPTResponse = await postChatGPT(chatGPTData);

                const botMessage = { role: 'assistant', content: chatGPTResponse.content.trimStart() };
                setMessages(messages => [...messages, botMessage]);

                if (currentAudio) {
                  currentAudio.pause();
                  currentAudio.currentTime = 0;
                  setCurrentAudio(null);
                }

                const pollyData = new FormData();
                pollyData.append('transcription', chatGPTResponse.content);
                pollyData.append('language', chosenLanguage);
                pollyData.append('gender', chosenGender);
                const pollyResponse = await postAWSPolly(pollyData);

                const bufferData = new Uint8Array(pollyResponse.data);
                const sayBlob = new Blob([bufferData], { type: 'audio/wav' });
                const audioResponseUrl = URL.createObjectURL(sayBlob);

                const audio = new Audio(audioResponseUrl);
                audio.play();

                setCurrentAudio(audio);

                setIsAudioPlaying(true);
                setIsButtonDisabled(false);
                audio.onended = () => setIsAudioPlaying(false);
              } catch (error) {
                console.error(error);
                setIsButtonDisabled(false);
                setErrorText(error.message);
                setIsErrorPopupOpen(true);
              }
            });
            setTimeout(() => {
              if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
              }
            }, 80000);
          });
      } else {
        setRecording(false);
        setIsButtonDisabled(true);
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          mediaRecorderRef.current.stop();
        }
      }
    };


    const handleStopAudio = () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
        setIsAudioPlaying(false);
      }
    };

    const toggleSettingsMenu = () => {
      setIsSettingsMenuOpen(!isSettingsMenuOpen);
    };
    
    function PromptDropdownMenu({ chosenCategory, setChosenCategory }) {
      const [chosen, setChosen] = useState(chosenCategory);
      const categories = ["Default", "Coding", "Research", "Gaming"];
    
      const handleItemClick = (event) => {
        setChosen(event.target.textContent);
        setChosenCategory(event.target.textContent);
    
        const fetchPrompt = async (cat) => {
          const res = await fetch(`src/assets/prompts/${cat}.prompt`);
          const prompt = await res.text();
          const updatedMessages = [{ role: 'system', content: prompt }, ...messages.slice(1)];
          setMessages(updatedMessages);
        };
    
        fetchPrompt(event.target.textContent);
      };
    
      return (
        <div className="dropdown">
          <div className="button-container">
            <button className="category-select">{chosen}</button>
          </div>
          <div className="dropdown-content">
            {categories
              .filter((item) => item !== chosen)
              .map((category) => (
                <div className="dropdown-item" key={category} onClick={handleItemClick}>
                  {category}
                </div>
              ))}
          </div>
        </div>
      );
    }
    

    function LanguageDropdownMenu({ chosenLanguage, setChosenLanguage }) {
      const [chosen, setChosen] = useState(chosenLanguage);
      const languages = [
        'English UK',
        'English US',
        'Spanish',
        'French',
        'German',
        'Romanian',
        'Portuguese',
        'Dutch',
        // 'Arabic',
        // 'Catalan',
        'Hindi',
        'Italian',
        'Japanese',
      ];

      const handleItemClick = (event) => {
        setChosen(event.target.textContent);
        setChosenLanguage(event.target.textContent);
      };
    
      return (
        <div className="dropdown">
          <div className="button-container">
            <button className="category-select">{chosen}</button>
          </div>
          <div className="dropdown-content">
            {languages
            .filter((item) => item !== chosen)
            .map((language) => (
              <div key={language} className="dropdown-item" onClick={handleItemClick}>
                {language}
              </div>
            ))}
          </div>
        </div>
      );
    }

    function GenderDropdownMenu({ chosenGender, setChosenGender }) {
      const [chosen, setChosen] = useState(chosenGender);
    
      const handleItemClick = (event) => {
        setChosen(event.target.textContent);
        setChosenGender(event.target.textContent);
      };
    
      return (
        <div className="dropdown">
          <div className="button-container">
            <button className="category-select">{chosen}</button>
          </div>
          <div className="dropdown-content">
            {['Male', 'Female']
            .filter((item) => item !== chosen)
            .map((gender) => (
              <div key={gender} className="dropdown-item" onClick={handleItemClick}>
                {gender}
              </div>
            ))}
          </div>
        </div>
      );
    }

    function ChatMessages(props) {

      const messagesContainerRef = useRef(null);

      useLayoutEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, [props.messages.length]);

      return (
        <div className="messages-container" ref={messagesContainerRef}>
          <div className="instructional-text">
            {props.messages.length === 1
              ? "Start a conversation by pressing the 'Speak' button.\n Submit your message by pressing again."
              : <span>You are now conversing with <em>Computer, Respond!</em>.</span>}  
          </div>
          {props.filteredMessages.map((message, index) => (
            <MessageBubble
              key={index}
              role={message.role}
              content={message.content}
              language={props.chosenLanguage}
              gender={props.chosenGender}
              currentAudio={props.currentAudio}
              setCurrentAudio={props.setCurrentAudio}
              isAudioPlaying={props.isAudioPlaying}
              setIsAudioPlaying={props.setIsAudioPlaying}
              onStopAudio={props.onStopAudio}
            />
          ))}
        </div>
      );
    }

    const pauseUnpauseCurrentAudio = () => {
      if (currentAudio) {
        if (isAudioPlaying) {
          currentAudio.pause();
          setIsAudioPlaying(false);
        } else {
          currentAudio.play();
          setIsAudioPlaying(true);
        }
        setIsButtonPause(!isButtonPause);
        currentAudio.onended = () => {
          setIsAudioPlaying(false);
          setIsButtonPause(true);
        };
      }
    };

    return (
      <>
        <div className={`container ${isSettingsMenuOpen ? "blurred" : ""} ${isErrorPopupOpen ? "blurred" : ""} ${isKeyPopupOpen ? "blurred" : ""}` }>
            <div className='overlay'>
                <div className='content'>
                    <div className='record-button'>
                        <button id='record-btn' onClick={handleButtonClick} disabled={isButtonDisabled}>{recording ? 'Stop recording' : 'Speak'}</button>
                        <button id='settings-btn' onClick={toggleSettingsMenu}><img src="/images/settings.svg" alt="Settings"></img></button>
                        <button id="play-pause-btn" onClick={pauseUnpauseCurrentAudio}>
                          {isButtonPause ? (
                            <img src="/images/pause.svg" alt="Pause" className="pause-img"/>
                          ) : (
                            <img src="/images/play.svg" alt="Play" className="play-img"/>
                          )}
                        </button>
                        {/* MIT Licenses: https://www.svgrepo.com/svg/514191/pause, https://www.svgrepo.com/svg/514197/play*/}


                    </div>
                    <ChatMessages
                      messages={messages}
                      chosenLanguage={chosenLanguage}
                      chosenGender={chosenGender}
                      currentAudio={currentAudio}
                      setCurrentAudio={setCurrentAudio}
                      isAudioPlaying={isAudioPlaying}
                      setIsAudioPlaying={setIsAudioPlaying}
                      onStopAudio={handleStopAudio}
                      filteredMessages={filteredMessages}
                    />
                </div>
            </div>
            <div className='canvas'>
                <Canvas 
                shadows
                eventSource={document.getElementById('root')}
                camera={{ position: [5, 0.9, 5], fov: 70 }}
                raycaster={{ enabled: true, computeOffsets: true }}
                >
                    <color attach="background" args={['#00b8ff']} />
                    <group position={[3.5, 1.65, 3.5]} rotation={[0, -0.75, 0]}>
                    <Suspense fallback={null}>
                      <AnimatedBlob isAudioPlaying={isAudioPlaying}/>
                    </Suspense>
                    </group>
                    <Env/>
                </Canvas>
            </div>
            {isSettingsMenuOpen && (
            <div className={`settings-menu`}>
              <button className="close-button" onClick={toggleSettingsMenu}>
                X
              </button>
              <div className="category">
                <div className="category-name">Language</div>
                <LanguageDropdownMenu chosenLanguage={chosenLanguage} setChosenLanguage={setChosenLanguage} />
              </div>
              <div className="category">
                <div className="category-name">Voice gender</div>
                <GenderDropdownMenu chosenGender={chosenGender} setChosenGender={setChosenGender} />
              </div>
              <div className="category">
                <div className="category-name">Priming prompt</div>
                  <PromptDropdownMenu chosenCategory={chosenCategory} setChosenCategory={setChosenCategory}/>
              </div>
              <div className="category">
                <div className="category-name">OpenAI key</div>
                <div className="dropdown">
                <input
                  className="apiKeyInput"
                  placeholder="Enter your key..."
                  value="API not required"
                  disabled
                />
                </div>
              </div>
            </div>
            )}
        </div>
        <APIKeyPopup isOpen={isKeyPopupOpen} onClose={() => setIsKeyPopupOpen(false)} />
        <ErrorPopup isOpen={isErrorPopupOpen} onClose={() => setIsErrorPopupOpen(false)} errorText={errorText} />
      </>
    );
}

export default App;
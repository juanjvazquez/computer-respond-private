# Instructions

You have to open two terminals inside root folder

Terminal 1:
```
npm run dev
```

Terminal 2:
```
node src/api/api
```


T1 should open in port 3000, T2 should open in port 8080.

### To-do list:
These are in order of priority:
1. work on actual ChatGPT prompt so it's actually helpful. For now, priming it with a recommended prompt should be fine.
    - in the future, it would be cool to have a dropdown menu where you can choose among 5 or 6 pre-made priming prompts like "research assistant", "study partner", "chatbot", "gaming buddy", etc.
2. NEW: Put memory in server-side code, currently in client side code.
3. Use tokenizer to extend lifetime of bot (memory wise).
4. use audio processing so that user does not have to press stop button. Add toggle button where:
    - option 1: voice recognition is used so that you can give commands to chatgpt such that "stop speaking", voice recognition is necessary since if other peoiple are speakign aroudn you it could trigger chatgpt. (Add code that the initial message from the speaker is a voice recognition script "this is my voice, if I dont speak for three seconds, save my audio input and process it to whisper and then to chatgpt")
    - option 2: chatgpt cannot be interrupted when speaking unless you click the button "Stop speaking" (this will be the first implemented")
5. What delays the response the most from the app, is chatgpt taking too long to create the response. We could try using "stream" and dynamically use text-to-speech on the streamed strings. Speak-as-you-go (?)

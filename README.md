# whisper-client

### Mic → Whisper → ChatGPT → Speech for React-Native

**Lightweight drop-in that turns voice into AI answers in a single call.**
Works on **bare React-Native 0.72 +** or Expo config-plugin builds.

---

## ✨ Features

| 🔈 Record                                                     | 📝 Transcribe                                                | 🤖 Chat                                                    | 🔊 Speak                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------------- |
| Saves temp `.m4a` using `react-native-audio-recorder-player`. | Sends to **OpenAI Whisper** (`audio.transcriptions.create`). | Streams to **ChatGPT** (any model, `gpt-4o-mini` default). | Replies via **device TTS** (RN-TTS) *or* **OpenAI Audio TTS**. |

---

## 1 · Installation

```bash
npm install whisper-client
npx pod-install         # iOS pods
```

Installs & autolinks:

* `react-native-audio-recorder-player`
* `react-native-permissions`
* `openai`

---

## 2 · Permissions

### Android – `AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### iOS – `Info.plist`

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs your microphone for voice interviews.</string>
```

After editing `Info.plist`, run `npx pod-install` (or `expo prebuild`).

---

## 3 · Quick Start

```tsx
import React, { useRef, useState } from 'react';
import { View, Button, Text } from 'react-native';
import { WhisperClient } from 'whisper-client';

export default function InterviewScreen() {
  const [speech, setSpeech] = useState('');
  const [reply,  setReply]  = useState('');

  // Keep one instance to preserve conversation history
  const vc = useRef(
    new WhisperClient(process.env.OPENAI_API_KEY!, {
      chatModel: 'gpt-4o-mini',   // optional override
      ttsEngine: 'device',        // 'device' | 'openai'
      language:  'en',
    }),
  ).current;

  return (
    <View style={{ flex: 1, gap: 12, padding: 24 }}>
      <Button title="Start Recording" onPress={vc.startRecording} />

      <Button
        title="Stop & Answer"
        onPress={async () => {
          const { transcript, answer } = await vc.stopAndAnswer();
          setSpeech(transcript);
          setReply(answer);
        }}
      />

      <Text style={{ marginTop: 16, fontWeight: '600' }}>You said:</Text>
      <Text>{speech}</Text>

      <Text style={{ marginTop: 16, fontWeight: '600' }}>AI replied:</Text>
      <Text>{reply}</Text>
    </View>
  );
}
```

---

## 4 · API

| Constructor / Method                         | Purpose                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `new WhisperClient(apiKey, opts?)`           | Build a reusable instance.<br/>• `opts.whisperModel` default `'whisper-1'`<br/>• `opts.chatModel` default `'gpt-4o-mini'`<br/>• `opts.language` default `'en'`<br/>• `opts.ttsEngine` `'device' \| 'openai'` (default `'device'`)<br/>• `opts.systemPrompt` custom system role<br/>• `opts.onState(state)` callback (`idle → recording → transcribing → thinking → speaking`) |
| `startRecording()`                           | Opens the mic and begins writing to a temp file.                                                                                                                                                                                                                                                                                                                              |
| `stopAndAnswer()` → `{ transcript, answer }` | Stops recording, sends audio → Whisper → Chat → TTS, returns both strings.                                                                                                                                                                                                                                                                                                    |
| `nextQuestion()` → `{ answer }`              | Ask ChatGPT without recording (e.g. *next OSCE question*).                                                                                                                                                                                                                                                                                                                    |
| `cancel()`                                   | Abort any in-flight request or playback.                                                                                                                                                                                                                                                                                                                                      |
| `destroy()`                                  | Release native resources (call on unmount).                                                                                                                                                                                                                                                                                                                                   |

---

## 5 · Troubleshooting

| Problem                              | Fix                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------- |
| **Mic permission denied**            | Ensure runtime prompt accepted / `Info.plist` key present.             |
| TS errors for `AudioSet` enums       | Upgrade `react-native-audio-recorder-player` ≥ 3.6.                    |
| OpenAI 401 / network errors          | Check `OPENAI_API_KEY` and connectivity.                               |
| Latency > 4 s                        | Lower `opts.maxAudioMs`, use Wi-Fi, or prefer device TTS.              |

---

## 6 · Roadmap

* Streaming partial transcripts & GPT tokens
* Silence detection → auto-stop recording
* Local transcript caching
* LangChain agent plug-in

---

## 7. Contributions
  https://github.com/apium-io/whisper-client#
---
## License

MIT © 2025 Apium Innovations

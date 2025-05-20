import OpenAI from "openai";
import { VoiceChatOpts } from "./types";
import { RecorderService } from "./recorder";
import { WhisperService } from "./stt";
import { ChatService } from "./chat";
import { SpeechService } from "./tts";

class WhisperClient {
  private recorder = new RecorderService();
  private openai: OpenAI;
  private whisper: WhisperService;
  private chat: ChatService;
  private speech: SpeechService;

  constructor(apiKey: string, opts: VoiceChatOpts = {}) {
    const {
      whisperModel = "whisper-1",
      chatModel = "gpt-4o-mini",
      language = "en",
      ttsEngine = "device",
    } = opts;

    this.openai = new OpenAI({ apiKey });
    this.whisper = new WhisperService(this.openai, whisperModel, language);
    this.chat = new ChatService(this.openai, chatModel);
    this.speech = new SpeechService(this.openai, ttsEngine, language);
  }

  /** Start recording (UI should show waveform). */
  async startRecording(): Promise<void> {
    try {
      return await this.recorder.start();
    } catch (error) {
      throw new Error(
        `Failed to start recording: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /** Stop recording → STT → Chat → TTS; returns transcript & answer. */
  async stopAndAnswer(): Promise<{ transcript: string; answer: string }> {
    try {
      const audio = await this.recorder.stop();
      const transcript = await this.whisper.transcribe(audio);
      const answer = await this.chat.send(transcript);
      await this.speech.speak(answer);
      return { transcript, answer };
    } catch (error) {
      throw new Error(
        `Failed to process stopAndAnswer: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

export { WhisperClient };
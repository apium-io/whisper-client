import TTS from "react-native-tts";
import OpenAI from "openai";
import RNFS from "react-native-fs";
import { v4 as uuid } from "uuid";
import AudioRecorderPlayer from "react-native-audio-recorder-player";

export class SpeechService {
  private player = new AudioRecorderPlayer();

  constructor(
    private openai: OpenAI,
    private engine: "device" | "openai",
    private language: string
  ) {}

  async speak(text: string): Promise<void> {
    if (!text) return;
    try {
      if (this.engine === "openai") {
        const wav = await this.openai.audio.speech
          .create({
            model: "tts-1",
            voice: "alloy",
            input: text,
            response_format: "wav",
          })
          .then((a) => a.arrayBuffer());

        const tmp = `${RNFS.CachesDirectoryPath}/${uuid()}.wav`;
        // Convert ArrayBuffer to base64 string
        const uint8Array = new Uint8Array(wav);
        let binary = "";
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64 = btoa(binary);
        await RNFS.writeFile(tmp, base64, "base64");
        await this.player.startPlayer(tmp);
      } else {
        TTS.setDefaultLanguage(this.language);
        TTS.speak(text);
      }
    } catch (error) {
      throw new Error(
        `Failed to speak: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

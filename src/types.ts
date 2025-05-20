export interface VoiceChatOpts {
  /** Whisper model name (default: `"whisper-1"`). */
  whisperModel?: string;
  /** Chat model name (default: `"gpt-4o-mini"`). */
  chatModel?: string;
  /** 2-letter BCP-47 language (default: `"en"`). */
  language?: string;
  /** `"device"` = use native TTS, `"openai"` = use OpenAI TTS (default: `"device"`). */
  ttsEngine?: "device" | "openai";
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

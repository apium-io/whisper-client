import OpenAI from "openai";

export class WhisperService {
  constructor(
    private openai: OpenAI,
    private model: string,
    private language: string
  ) {}

  async transcribe(bytes: Uint8Array): Promise<string> {
    try {
      // Create a File-like object for OpenAI SDK
      const file = new File([bytes], "audio.m4a", { type: "audio/m4a" });
      const response = await this.openai.audio.transcriptions.create({
        file,
        model: this.model,
        language: this.language,
        response_format: "text",
      });
      return response as unknown as string;
    } catch (error) {
      throw new Error(
        `Failed to transcribe audio: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

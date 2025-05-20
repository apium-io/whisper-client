import OpenAI from "openai";
import { ChatMessage } from "./types";

export class ChatService {
  private thread: ChatMessage[] = [];

  constructor(private openai: OpenAI, private model: string) {}

  async send(userText: string): Promise<string> {
    this.thread.push({ role: "user", content: userText });
    try {
      const res = await this.openai.chat.completions.create({
        model: this.model,
        messages: this.thread,
      });
      const answer = res.choices[0]?.message?.content ?? "";
      this.thread.push({ role: "assistant", content: answer });
      return answer;
    } catch (error) {
      throw new Error(
        `Failed to send chat message: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

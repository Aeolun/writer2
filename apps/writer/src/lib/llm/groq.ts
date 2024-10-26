import OpenAI from "openai";
import { instructions } from "../ai-instructions.ts";
import type { LlmInterface } from "./llm-interface";
import { settingsState } from "../stores/settings.ts";

export class Groq implements LlmInterface {
  api?: OpenAI;
  model?: string;
  initialized = false;

  async init() {
    if (this.initialized) {
      return;
    }
    const key = settingsState.groqKey;
    this.model = settingsState.aiModel ?? undefined;
    if (!key) {
      throw new Error("No groq key set");
    }
    this.api = new OpenAI({
      apiKey: key,
      dangerouslyAllowBrowser: true,
      timeout: 10000,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  async listModels() {
    await this.init();
    if (!this.api) {
      throw new Error("Not initialized yet");
    }
    const result = await this.api.models.list();
    return result.data.map((m) => m.id);
  }
  async chat(
    kind: keyof typeof instructions,
    text: string,
    options?: {
      additionalInstructions?: string;
    },
  ) {
    await this.init();
    if (!this.api) {
      throw new Error("Not initialized yet");
    }
    const result = await this.api.chat.completions.create({
      messages: [
        {
          role: "system",
          content: instructions[kind],
        },
        {
          role: "user",
          content: options?.additionalInstructions
            ? `${options?.additionalInstructions}\n\n${text}`
            : text,
        },
      ],
      max_tokens: 2000,
      temperature: 0.6,
      frequency_penalty: 0.5,
      model: this.model ?? "",
    });

    return result.choices[0].message.content ?? "";
  }
}

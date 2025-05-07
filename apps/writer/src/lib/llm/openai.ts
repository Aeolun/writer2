import { OpenAI as OpenAIAPI } from "openai";
import { instructions } from "../ai-instructions.ts";
import type { LlmInterface } from "./llm-interface";
import { settingsState } from "../stores/settings.ts";
import { unwrap } from "solid-js/store";

export class OpenAI implements LlmInterface {
  api?: OpenAIAPI;
  model?: string;
  initialized = false;

  async init() {
    if (this.initialized) {
      return;
    }
    const key = unwrap(settingsState).openaiKey;
    this.model = unwrap(settingsState).aiModel ?? undefined;
    if (!key) {
      throw new Error("No openai key set");
    }
    this.api = new OpenAIAPI({
      apiKey: key,
      timeout: 30000,
      dangerouslyAllowBrowser: true,
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
      max_completion_tokens: 2000,
      temperature: 1,
      model: this.model ?? "",
    });

    return result.choices[0].message.content ?? "";
  }
}

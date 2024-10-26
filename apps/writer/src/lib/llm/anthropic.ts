import { Anthropic as AnthropicAPI } from "@anthropic-ai/sdk";
import { instructions } from "../ai-instructions.ts";
import type { LlmInterface } from "./llm-interface";
import { settingsState } from "../stores/settings.ts";

export class Anthropic implements LlmInterface {
  api?: AnthropicAPI;
  model?: string;
  initialized = false;

  async init() {
    if (this.initialized) {
      return;
    }
    const key = settingsState.anthropicKey;
    this.model = settingsState.aiModel ?? undefined;
    if (!key) {
      throw new Error("No anthropic key set");
    }
    this.api = new AnthropicAPI({
      apiKey: key,
      timeout: 20000,
      dangerouslyAllowBrowser: true,
    });
  }
  async listModels() {
    await this.init();
    return [
      "claude-3-5-sonnet-20240620",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
    ];
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
    const result = await this.api.messages.create({
      messages: [
        {
          role: "user",
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
      temperature: 1.0,
      model: this.model ?? "",
    });

    return result.content[0].type === "text" ? result.content[0].text : "";
  }
}

import { settingsStore } from "../global-settings-store.ts";
import type { instructions } from "./ai-instructions.ts";
import { Anthropic } from "./llm/anthropic.ts";
import { Groq } from "./llm/groq.ts";
import { Ollama } from "./llm/ollama.ts";
import { OpenAI } from "./llm/openai.ts";
import { store } from "./store.ts";

export async function useAi(
  kind: keyof typeof instructions,
  text: string,
  addInstructions = true,
) {
  const aiSource = await settingsStore.get<string>("ai-source");
  const data = store.getState();

  if (aiSource === "openai") {
    const openai = new OpenAI();
    await openai.init();
    return openai.chat(kind, text, {
      additionalInstructions: addInstructions
        ? data.story.settings?.aiInstructions
        : undefined,
    });
  }
  if (aiSource === "groq") {
    const groq = new Groq();
    await groq.init();
    return groq.chat(kind, text, {
      additionalInstructions: addInstructions
        ? data.story.settings?.aiInstructions
        : undefined,
    });
  }
  if (aiSource === "anthropic") {
    const anthropic = new Anthropic();
    await anthropic.init();
    return anthropic.chat(kind, text, {
      additionalInstructions: addInstructions
        ? data.story.settings?.aiInstructions
        : undefined,
    });
  }
  if (aiSource === "ollama") {
    const ollama = new Ollama();
    await ollama.init();
    return ollama.chat(kind, text, {
      additionalInstructions: addInstructions
        ? data.story.settings?.aiInstructions
        : undefined,
    });
  }
  throw new Error("Unsupported AI source");
}

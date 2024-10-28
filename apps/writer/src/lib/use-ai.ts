import type { instructions } from "./ai-instructions.ts";
import { Anthropic } from "./llm/anthropic.ts";
import { Cerebras } from "./llm/cerebras.ts";
import { Groq } from "./llm/groq.ts";
import { Ollama } from "./llm/ollama.ts";
import { OpenAI } from "./llm/openai.ts";
import { settingsState } from "./stores/settings.ts";
import { storyState } from "./stores/story.ts";

export async function useAi(
  kind: keyof typeof instructions,
  text: string,
  addInstructions = true,
) {
  const aiSource = settingsState.aiSource;
  const storyInstructions = storyState.story?.settings?.aiInstructions;

  console.log("using", aiSource, storyInstructions);
  if (aiSource === "openai") {
    const openai = new OpenAI();
    await openai.init();
    return openai.chat(kind, text, {
      additionalInstructions: addInstructions ? storyInstructions : undefined,
    });
  }
  if (aiSource === "groq") {
    const groq = new Groq();
    await groq.init();
    return groq.chat(kind, text, {
      additionalInstructions: addInstructions ? storyInstructions : undefined,
    });
  }
  if (aiSource === "cerebras") {
    const cerebras = new Cerebras();
    await cerebras.init();
    return cerebras.chat(kind, text, {
      additionalInstructions: addInstructions ? storyInstructions : undefined,
    });
  }
  if (aiSource === "anthropic") {
    const anthropic = new Anthropic();
    await anthropic.init();
    return anthropic.chat(kind, text, {
      additionalInstructions: addInstructions ? storyInstructions : undefined,
    });
  }
  if (aiSource === "ollama") {
    const ollama = new Ollama();
    await ollama.init();
    return ollama.chat(kind, text, {
      additionalInstructions: addInstructions ? storyInstructions : undefined,
    });
  }
  throw new Error("Unsupported AI source");
}

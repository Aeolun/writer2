import { Store } from "@tauri-apps/plugin-store";
import OpenAI from "openai";
import { instructions } from "./ai-instructions.ts";
import { store } from "./store.ts";

const settingStore = new Store("global-settings.bin");

export async function useAi(
  kind: keyof typeof instructions,
  text: string,
  addInstructions = true,
) {
  const key = await settingStore.get<string>("openai-key");
  if (!key) {
    throw new Error("No openai key set");
  }
  const openai = new OpenAI({
    apiKey: key,
    dangerouslyAllowBrowser: true,
  });

  const data = store.getState();

  const result = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: instructions[kind],
      },
      {
        role: "user",
        content: addInstructions
          ? data.story.settings?.aiInstructions + "\n\n" + text
          : text,
      },
    ],
    max_tokens: 2000,
    model: "gpt-4o-mini",
  });

  console.log(JSON.stringify(result, null, 2));
  return result.choices[0].message.content;
}

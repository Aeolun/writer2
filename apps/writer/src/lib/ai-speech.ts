import { appCacheDir } from "@tauri-apps/api/path";
import {
  BaseDirectory,
  mkdir,
  readFile,
  writeFile,
} from "@tauri-apps/plugin-fs";
import { Store } from "@tauri-apps/plugin-store";

import OpenAI from "openai";

const store = new Store("global-settings.bin");

const createHash = (val: string) =>
  crypto.subtle.digest("SHA-256", new TextEncoder().encode(val)).then((h) => {
    const hexes = [],
      view = new DataView(h);
    for (let i = 0; i < view.byteLength; i += 4)
      hexes.push(("00000000" + view.getUint32(i).toString(16)).slice(-8));
    return hexes.join("");
  });

export const aiSpeech = async (text: string) => {
  const openai = new OpenAI({
    apiKey: (await store.get("openai-key")) ?? undefined,
    dangerouslyAllowBrowser: true,
  });

  const appCacheDirPath = await appCacheDir();

  const speechFile = `${text
    .substring(0, 20)
    .replaceAll(/[^0-9a-zA-Z]+/g, "-")}-${await createHash(text)}.mp3`;

  let buffer: Uint8Array | undefined = undefined;
  try {
    buffer = await readFile(`${appCacheDirPath}/audio/${speechFile}`);
  } catch (e) {
    const result = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
    });
    console.log(result.headers.get("content-type"));

    buffer = await result.arrayBuffer().then((ab) => new Uint8Array(ab));
    if (!buffer) {
      return undefined;
    }
    await mkdir(`${appCacheDirPath}/audio`, { recursive: true });
    await writeFile(`${appCacheDirPath}/audio/${speechFile}`, buffer);
  }

  return buffer
    ? URL.createObjectURL(new Blob([buffer.buffer], { type: "audio/mpeg" }))
    : undefined;
};

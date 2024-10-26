import { createStore } from "solid-js/store";
import { Store } from "@tauri-apps/plugin-store";
import type { LLMName } from "../llm";
import debounce from "debounce";

export interface SettingsState {
  clientToken: string;
  openaiKey: string;
  groqKey: string;
  anthropicKey: string;
  serverUrl: string;
  aiSource: LLMName | "";
  aiModel: string;
  royalRoadEmail: string;
  royalRoadPassword: string;
  recentStories: { name: string; path: string }[];
}

const initialSettings: SettingsState = {
  clientToken: "",
  openaiKey: "",
  groqKey: "",
  anthropicKey: "",
  serverUrl: "",
  aiSource: "",
  aiModel: "",
  royalRoadEmail: "",
  royalRoadPassword: "",
  recentStories: [],
};

export const [settingsState, setSettingsState] = createStore(initialSettings);

export const tauriSettingsStore = new Store("global-settings.bin");

const debounceSave = debounce(() => {
  tauriSettingsStore.save();
}, 1000);

const setSetting = <T extends keyof SettingsState>(
  key: T,
  value: SettingsState[T],
) => {
  setSettingsState(key, value);
  tauriSettingsStore.set(key, value);
  debounceSave();
};

const setSettings = (settings: SettingsState) => {
  setSettingsState(settings);
  for (const key of Object.keys(settings)) {
    tauriSettingsStore.set(key, settings[key as keyof SettingsState]);
  }
  // when we set the whole store at once, we can save immediately (as additional events of the same kind are unlikely)
  tauriSettingsStore.save();
};

export { setSetting, setSettings };

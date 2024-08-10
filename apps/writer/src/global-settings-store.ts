import { Store } from "@tauri-apps/plugin-store";

export const settingsStore = new Store("global-settings.bin");

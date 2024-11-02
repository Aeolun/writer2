import { createEffect, onCleanup, type ParentProps } from "solid-js";
import {
  tauriSettingsStore,
  setSettings,
  SettingsState,
  settingsState,
} from "./lib/stores/settings";
import { setSignedInUser } from "./lib/stores/user";
import { trpc } from "./lib/trpc";
import { AiPopup } from "./components/AiPopup";
import { NotificationManager } from "./components/NotificationManager";
import { saveStory } from "./lib/persistence/save-story";
import { addNotification } from "./lib/stores/notifications";
import { storyState } from "./lib/stores/story";

export const Root = (props: ParentProps) => {
  const colorMode = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

  createEffect(async () => {
    await tauriSettingsStore.load();
    const settings = Object.fromEntries(await tauriSettingsStore.entries());
    console.log("settings", settings);
    setSettings(settings as unknown as SettingsState);
  });

  createEffect(async () => {
    try {
      if (settingsState.clientToken) {
        const res = await trpc.whoAmI.query();
        setSignedInUser(res ?? undefined);
      } else {
        setSignedInUser(undefined);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setSignedInUser(undefined);
    }
  });

  let saveCount = 0;
  const autosaveTimeout = setInterval(() => {
    if (storyState.storyLoaded) {
      console.log("autosaving", saveCount);
      saveStory(saveCount % 4 === 0).catch((error) => {
        console.error("Error autosaving:", error);
        addNotification({
          title: "Autosave failed",
          message: error.message,
          type: "error",
        });
      });
      saveCount++;
    }
  }, 30000);

  onCleanup(() => {
    clearInterval(autosaveTimeout);
  });

  return (
    <div data-theme={colorMode === "light" ? "fantasy" : "forest"}>
      <AiPopup />
      <NotificationManager />
      {props.children}
    </div>
  );
};

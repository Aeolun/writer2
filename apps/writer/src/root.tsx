import { createEffect, onCleanup, type ParentProps } from "solid-js";
import {
  tauriSettingsStore,
  setSettings,
  type SettingsState,
  settingsState,
} from "./lib/stores/settings";
import { setSignedInUser } from "./lib/stores/user";
import { reloadTrpc, trpc } from "./lib/trpc";
import { AiPopup } from "./components/AiPopup";
import { NotificationManager } from "./components/NotificationManager";
import { saveStory } from "./lib/persistence/save-story";
import { addNotification } from "./lib/stores/notifications";
import { storyState, unloadStory } from "./lib/stores/story";
import { ImportDialog } from "./components/ImportDialog";
import { unloadFromState } from "./lib/persistence/unload-from-state";
import { unwrap } from "solid-js/store";
import { useNavigate } from "@solidjs/router";

let saveCount = 0;
let autosaveTimeout: number;

export const Root = (props: ParentProps) => {
  const navigate = useNavigate();
  const colorMode = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

  onCleanup(() => {
    console.log("unloading state when root gets cleaned up");
    unloadFromState();
    navigate("/");
  });

  createEffect(async () => {
    await tauriSettingsStore.load();
    const settings = Object.fromEntries(await tauriSettingsStore.entries());
    console.log("settings", settings);
    setSettings(settings as unknown as SettingsState);
    reloadTrpc();
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

  createEffect(() => {
    if (autosaveTimeout) {
      clearInterval(autosaveTimeout);
    }
    console.log("recreate autosave interval");
    autosaveTimeout = window.setInterval(() => {
      const storyLoaded = storyState.storyLoaded;
      console.log("is story loaded", unwrap(storyState));
      if (storyLoaded) {
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
      } else {
        console.log("not autosaving, no story loaded");
      }
    }, 30000);
  });

  onCleanup(() => {
    clearInterval(autosaveTimeout);
  });

  return (
    <div data-theme={colorMode === "light" ? "fantasy" : "forest"}>
      <AiPopup />
      <NotificationManager />
      <ImportDialog />
      {props.children}
    </div>
  );
};

import { createEffect, onCleanup, type ParentProps, Show } from "solid-js";
import {
  tauriSettingsStore,
  setSettings,
  type SettingsState,
  settingsState,
  getTokenForServer,
} from "./lib/stores/settings";
import { setSignedInUser, userState } from "./lib/stores/user";
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
import { LoadFromServerConflictDialog } from "./components/LoadFromServerConflictDialog";
import { SyncStatusDialog } from "./components/SyncStatusDialog";

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
    const settings = Object.fromEntries(await tauriSettingsStore.entries());
    console.log("settings", settings);
    setSettings(settings as unknown as SettingsState);
    reloadTrpc();

    // Now that we have settings and TRPC is reloaded, check auth state
    try {
      const token = getTokenForServer(settingsState.serverUrl);
      if (token) {
        const res = await trpc.whoAmI.query();
        setSignedInUser(res ?? null);
      } else {
        setSignedInUser(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setSignedInUser(null);
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
      <LoadFromServerConflictDialog />
      <SyncStatusDialog />
      <ImportDialog />
      <Show when={!userState.authLoading} fallback={
        <div class="flex min-h-screen w-full items-center justify-center bg-base-200">
          <span class="loading loading-spinner loading-lg text-primary" />
        </div>
      }>
        {props.children}
      </Show>
    </div>
  );
};

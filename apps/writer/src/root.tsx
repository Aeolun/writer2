import { createEffect, type ParentProps } from "solid-js";
import {
  tauriSettingsStore,
  setSettings,
  SettingsState,
  settingsState,
} from "./lib/stores/settings";
import { setSignedInUser } from "./lib/stores/user";
import { trpc } from "./lib/trpc";
// import { AiPopup } from "./components/AiPopup.tsx";
// import { Autosave } from "./components/Autosave.tsx";
// import { SigninPopup } from "./components/SigninPopup.tsx";

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

  return (
    <div data-theme={colorMode === "light" ? "fantasy" : "forest"}>
      {/* <Autosave />
      <AiPopup />
      <SigninPopup /> */}
      {props.children}
    </div>
  );
};

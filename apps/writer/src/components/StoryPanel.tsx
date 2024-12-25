import { createEffect, createSignal, JSX, onCleanup } from "solid-js";
import { LanguageForm } from "./LanguageForm";
import { SceneButtons } from "./SceneButtons";
import { ParagraphsList } from "./ParagraphsList";
import { GenerateNext } from "./GenerateNext";
import { InventoryActions } from "./InventoryActions";
import { PlotpointActions } from "./PlotPointActions";
import { getItemsAtParagraph } from "../lib/stores/retrieval/get-items-at-paragraph";
import { setShowInventory, uiState } from "../lib/stores/ui";
import {
  createSceneParagraph,
  removeSceneParagraph,
  scenesState,
  updateSceneParagraphData,
} from "../lib/stores/scenes";
import { currentScene } from "../lib/stores/retrieval/current-scene";
import { CurrentInventory } from "./CurrentInventory";
import { Editor } from "./editor/Editor";
import { createShortcut } from "@solid-primitives/keyboard";
import type { SceneParagraph } from "@writer/shared";
import shortUUID from "short-uuid";

export const StoryPanel = () => {
  const listener = (e) => {
    // pass
  };
  window.addEventListener("keydown", listener);
  onCleanup(() => {
    window.removeEventListener("keydown", listener);
  });
  createShortcut(
    ["Control", "Enter"],
    () => {
      console.log("new paragraph createshortcut");
      createSceneParagraph(
        currentScene()?.id ?? "",
        {
          id: shortUUID.generate(),
          text: "New",
          state: "draft",
          comments: [],
        } satisfies SceneParagraph,
        currentScene()?.selectedParagraph,
      );
    },
    { preventDefault: false },
  );
  createShortcut(
    ["Control", "Backspace"],
    () => {
      removeSceneParagraph(
        currentScene()?.id ?? "",
        currentScene()?.selectedParagraph ?? "",
      );
    },
    { preventDefault: false },
  );

  return currentScene() ? (
    <div class="flex flex-col h-full overflow-hidden">
      {uiState.showInventory && currentScene()?.selectedParagraph ? (
        <CurrentInventory
          currentParagraphId={currentScene()?.selectedParagraph ?? ""}
          onClose={() => setShowInventory(false)}
        />
      ) : null}
      <div class="flex flex-row flex-1 gap-4 h-full overflow-hidden justify-around">
        <div class="flex-1 overflow-auto flex flex-col items-start pb-48 p-4">
          <ParagraphsList />
          {/* <Editor onChange={() => {}} /> */}
          <GenerateNext />
          <div class="min-h-96 w-full" />
        </div>
        {currentScene()?.extra ? (
          <textarea
            class="flex-0.5 overflow-auto flex flex-col items-start whitespace-pre-wrap h-full bg-gray-100 p-4 max-w-80"
            onInput={(e) => {
              const thisScene = currentScene();
              if (thisScene?.selectedParagraph) {
                updateSceneParagraphData(
                  thisScene.id,
                  thisScene.selectedParagraph,
                  {
                    extra: e.currentTarget.value,
                  },
                );
              }
            }}
            value={currentScene()?.extra}
          />
        ) : null}
      </div>
      <div class="flex flex-col gap-2 py-2 px-4 bg-gray-300">
        <SceneButtons />
        <InventoryActions />
        <PlotpointActions />
      </div>
    </div>
  ) : null;
};

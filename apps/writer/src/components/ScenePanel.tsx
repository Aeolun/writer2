import { Show } from "solid-js";
import type { HelpKind } from "../lib/ai-instructions";
import { currentScene } from "../lib/stores/retrieval/current-scene";
import { deleteScene, updateSceneData } from "../lib/stores/scenes";
import { useAi } from "../lib/use-ai";
import { FormField } from "./styled/FormField";
import { findNode } from "../lib/stores/tree";

export const ScenePanel = () => {
  const help = (helpKind: HelpKind, extra = false) => {
    const text = `Scene text:\n\n${currentScene()
      ?.paragraphs.map((p) => p.text)
      .join("\n\n")}\n\nOutput only the summary.`;
    useAi(helpKind, text).then((res) => {
      const sceneId = currentScene()?.id;
      if (sceneId && extra) {
        updateSceneData(sceneId, { extra: res ?? undefined });
      } else if (sceneId) {
        updateSceneData(sceneId, { summary: res ?? undefined });
      }
    });
  };

  return (
    <Show when={currentScene()} fallback={<div class="p-4">No data</div>}>
      <div class="flex flex-col flex-1 p-4 h-full overflow-auto">
        <FormField label="Id">
          <input
            class="input input-bordered"
            value={currentScene()?.id ?? ""}
            disabled
          />
        </FormField>
        <FormField label="Title">
          <input
            class="input input-bordered"
            placeholder={"title"}
            onChange={(e) => {
              updateSceneData(currentScene()?.id ?? "", {
                title: e.target.value,
              });
            }}
            value={currentScene()?.title ?? ""}
          />
        </FormField>
        <FormField label="Summary">
          <textarea
            class="textarea textarea-bordered"
            onChange={(e) => {
              updateSceneData(currentScene()?.id ?? "", {
                summary: e.target.value,
              });
            }}
            rows={6}
            placeholder="summary"
            style={{ width: "100%" }}
            value={currentScene()?.summary ?? ""}
          />
        </FormField>
        {currentScene()?.extra && (
          <FormField label="Extra">
            <textarea
              class="textarea textarea-bordered"
              onChange={(e) => {
                updateSceneData(currentScene()?.id ?? "", {
                  extra: e.target.value,
                });
              }}
              rows={18}
              placeholder="extra"
              style={{ width: "100%" }}
              value={currentScene()?.extra ?? ""}
            />
          </FormField>
        )}
        <FormField label="Uploaded">
          <label class="label cursor-pointer max-w-40">
            <input
              type="checkbox"
              checked={currentScene()?.posted ?? false}
              onChange={() => {
                updateSceneData(currentScene()?.id ?? "", {
                  posted: !currentScene()?.posted,
                });
              }}
              class="checkbox"
            />
            <span class="label-text">Uploaded</span>
          </label>
        </FormField>
        <div class="flex gap-2">
          <button
            type="button"
            class="btn btn-primary"
            onClick={() => {
              help("summarize");
            }}
          >
            [AI] Summarize
          </button>
          <button
            type="button"
            class="btn btn-primary"
            onClick={() => {
              help("improvements", true);
            }}
          >
            [AI] Improvements
          </button>
          <button
            type="button"
            class="btn btn-error"
            onClick={() => {
              deleteScene(currentScene()?.id ?? "");
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </Show>
  );
};

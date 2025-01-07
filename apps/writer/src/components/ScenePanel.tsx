import { Show, For } from "solid-js";
import type { HelpKind } from "../lib/ai-instructions";
import { currentScene } from "../lib/stores/retrieval/current-scene";
import { deleteScene, updateSceneData } from "../lib/stores/scenes";
import { useAi } from "../lib/use-ai";
import { FormField } from "./styled/FormField";
import { findNode } from "../lib/stores/tree";
import { contentSchemaToText } from "../lib/persistence/content-schema-to-html";
import { storyState } from "../lib/stores/story";
import { charactersState } from "../lib/stores/characters";
import { CharacterSelect } from "./CharacterSelect";
import { LocationList } from "./snowflake/LocationList";
import { CharacterList } from "./snowflake/CharacterList";
import type { Node } from "@writer/shared";

export const ScenePanel = () => {
  const help = (helpKind: "summarize" | "improvements", extra = false) => {
    const text = `Scene text:\n\n${currentScene()
      ?.paragraphs.map((p) =>
        typeof p.text === "string" ? p.text : contentSchemaToText(p.text),
      )
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

  const sceneAsNode = (): Node | undefined => {
    const scene = currentScene();
    if (!scene) return undefined;
    
    return {
      id: scene.id,
      name: scene.title,
      type: "scene",
      isOpen: true,
      oneliner: scene.summary
    };
  };

  return currentScene() ? (
    <div class="flex flex-col p-4 w-full gap-2 overflow-y-auto h-full">
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
      <FormField
        label="Perspective"
        helpText="The perspective this scene is written from."
      >
        <select
          class="select select-bordered w-full"
          value={
            currentScene()?.perspective ??
            storyState.story?.settings?.defaultPerspective ??
            "third"
          }
          onChange={(e) =>
            updateSceneData(currentScene()?.id ?? "", {
              perspective: e.currentTarget.value as "first" | "third",
            })
          }
        >
          <option value="first">First Person</option>
          <option value="third">Third Person</option>
        </select>
      </FormField>

      <FormField
        label="Protagonist"
        helpText="The character whose perspective this scene is written from."
      >
        <CharacterSelect
          value={currentScene()?.protagonistId}
          onChange={(value) => {
            const id = currentScene()?.id;
            if (!id) return;

            updateSceneData(id, {
              protagonistId: value || undefined,
            });
          }}
          placeholder="Select protagonist..."
        />
      </FormField>

      <FormField label="Characters & Location">
        <div class="flex flex-col gap-4 p-2 border rounded-lg">
          {(() => {
            const node = sceneAsNode();
            return node ? (
              <>
                <CharacterList node={node} />
                <LocationList node={node} />
              </>
            ) : null;
          })()}
        </div>
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
  ) : null;
};

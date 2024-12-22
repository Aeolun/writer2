import { For } from "solid-js";
import {
  setStoryProperty,
  setStorySetting,
  storyState,
} from "../lib/stores/story";
import { FileSelector } from "./FileSelector";
import { FormField } from "./styled/FormField";
import { charactersState } from "../lib/stores/characters";
import { scenesState, updateSceneData } from "../lib/stores/scenes";
import { addNotification } from "../lib/stores/notifications";
import { CharacterSelect } from "./CharacterSelect";

export const StorySettings = () => {
  const updateAllScenePerspectives = () => {
    const defaultPerspective = storyState.story?.settings?.defaultPerspective;
    const defaultProtagonistId =
      storyState.story?.settings?.defaultProtagonistId;

    if (!defaultPerspective) return;

    for (const scene of Object.values(scenesState.scenes ?? {})) {
      updateSceneData(scene.id, {
        perspective: defaultPerspective,
        protagonistId: defaultProtagonistId,
      });
    }

    addNotification({
      type: "success",
      title: "Perspective Updated",
      message:
        "All scenes have been updated with the default perspective settings.",
    });
  };

  const updateAllProtagonists = () => {
    const defaultProtagonistId =
      storyState.story?.settings?.defaultProtagonistId;

    console.log("udpating to ", defaultProtagonistId);
    for (const scene of Object.values(scenesState.scenes ?? {})) {
      updateSceneData(scene.id, {
        protagonistId: defaultProtagonistId,
      });
    }

    addNotification({
      type: "success",
      title: "Protagonist Updated",
      message: "All scenes have been updated with the default protagonist.",
    });
  };

  return (
    <div class="flex flex-col p-4 w-full gap-2 overflow-y-auto h-full">
      <FormField
        label="Story Name"
        helpText="This is the name of the story that will be displayed in the reader (if you upload it)."
      >
        <input
          class="input input-bordered"
          value={storyState.story?.name}
          onInput={(e) => setStoryProperty("name", e.currentTarget.value)}
        />
      </FormField>

      <FormField
        label="Default Perspective"
        helpText="This will be used as the default perspective for new scenes."
      >
        <select
          class="select select-bordered w-full"
          value={storyState.story?.settings?.defaultPerspective ?? "third"}
          onChange={(e) =>
            setStorySetting("defaultPerspective", e.currentTarget.value)
          }
        >
          <option value="first">First Person</option>
          <option value="third">Third Person</option>
        </select>
      </FormField>

      <FormField
        label="Default Protagonist"
        helpText="This character will be used as the default protagonist for new scenes."
      >
        <CharacterSelect
          value={storyState.story?.settings?.defaultProtagonistId}
          onChange={(value) => {
            console.log("default protagonist", value);
            setStorySetting("defaultProtagonistId", value);
          }}
          placeholder="Select default protagonist..."
        />
      </FormField>

      <div class="flex gap-2">
        <button
          type="button"
          class="btn btn-primary flex-1"
          onClick={updateAllScenePerspectives}
        >
          Update All Scenes to Default Perspective
        </button>
        <button
          type="button"
          class="btn btn-primary flex-1"
          onClick={updateAllProtagonists}
        >
          Update All Scenes to Default Protagonist
        </button>
      </div>

      <FormField
        label="Header Image"
        helpText="This is the image that will be displayed at the top of the story."
      >
        <FileSelector
          value={storyState.story?.settings?.headerImage}
          showOnlyUploaded={true}
          onChange={(file) => setStorySetting("headerImage", file)}
        />
      </FormField>

      <FormField
        label="Instructions to give AI"
        helpText="You can use this to give specific instructions to the AI for this story, beyond the instructions already given as part of every command. E.g. 'All writing should be in present tense.'"
      >
        <textarea
          rows={4}
          placeholder="Instructions"
          value={storyState.story?.settings?.aiInstructions ?? ""}
          onInput={(e) =>
            setStorySetting("aiInstructions", e.currentTarget.value)
          }
          class="textarea textarea-bordered"
        />
      </FormField>

      <FormField
        label="Royal Road ID"
        helpText="When this is set, and you are logged into the online service, you can use the 'Import' function to import a story from Royal Road."
      >
        <input
          placeholder="Royal Road ID"
          value={storyState.story?.settings?.royalRoadId ?? ""}
          onInput={(e) => setStorySetting("royalRoadId", e.currentTarget.value)}
          class="input input-bordered"
        />
      </FormField>
    </div>
  );
};

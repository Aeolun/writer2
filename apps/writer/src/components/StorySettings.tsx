import { createSignal } from "solid-js";
import { FormField } from "./styled/FormField";
import {
  setStory,
  setStoryProperty,
  setStorySetting,
  storyState,
} from "../lib/stores/story";
import { FileSelector } from "./FileSelector";
import StoryStatus from "./StoryStatus";

export const StorySettings = () => {
  return (
    <div class="flex flex-col p-4 w-full gap-2 overflow-hidden">
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
        label="Header Image"
        helpText="This is the image that will be displayed at the top of the story."
      >
        <FileSelector
          value={storyState.story?.settings?.headerImage}
          showOnlyUploaded={true}
          onChange={(file) => {
            setStorySetting("headerImage", file);
          }}
        />
      </FormField>
      {/* <StoryStatus storyId={storyState.story?.id} /> */}
      <FormField
        label="Instructions to give AI"
        helpText="You can use this to give specific instructions to the AI for this story, beyond the instructions already given as part of every command."
      >
        <textarea
          rows={8}
          placeholder="Instructions"
          value={storyState.story?.settings?.aiInstructions}
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
          value={storyState.story?.settings?.royalRoadId}
          onInput={(e) => setStorySetting("royalRoadId", e.currentTarget.value)}
          class="input input-bordered"
        />
      </FormField>
    </div>
  );
};

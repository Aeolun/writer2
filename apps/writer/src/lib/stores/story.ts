import { createStore } from "solid-js/store";
import short from "short-uuid";
import { Story, StorySettings } from "@writer/shared";
import { join } from "@tauri-apps/api/path";
import { readTextFile, stat, writeTextFile } from "@tauri-apps/plugin-fs";

type StoryStateProperties = Pick<
  Story,
  | "id"
  | "name"
  | "modifiedTime"
  | "settings"
  | "uploadedFiles"
  | "lastPublishTime"
>;

export const [storyState, setStoryState] = createStore<{
  story: StoryStateProperties | undefined;
  openPath?: string;
  expectedLastModified: number;
  storyLoaded: boolean;
}>({
  story: {
    id: short.generate(),
    name: "",
    modifiedTime: 0,
    settings: {},
    uploadedFiles: {},
    lastPublishTime: 0,
  },
  expectedLastModified: 0,
  storyLoaded: false,
});

export const setStory = (story: StoryStateProperties) => {
  setStoryState("story", {
    id: story.id,
    name: story.name,
    modifiedTime: story.modifiedTime,
    settings: story.settings,
    uploadedFiles: story.uploadedFiles,
    lastPublishTime: story.lastPublishTime,
  });
  setStoryState("storyLoaded", true);
};

// New functions to update the moved properties
export const newStory = async (opts: { name: string; projectPath: string }) => {
  const id = short.generate();
  setStoryState("openPath", opts.projectPath);
  const storyFile = await join(opts.projectPath, "index.json");
  writeTextFile(
    storyFile,
    JSON.stringify(
      {
        story: {
          name: opts.name,
          id,
          settings: {},
        },
      },
      null,
      2,
    ),
  );
  const newFileStat = await stat(storyFile);
  setStoryState("story", {
    id,
    name: opts.name,
    modifiedTime: newFileStat.mtime ? newFileStat.mtime.getTime() : 0,
    settings: {},
  });
  setExpectedLastModified(newFileStat.mtime ? newFileStat.mtime.getTime() : 0);
  setStoryLoaded(true);
};

// TODO: Think add a function here to load a story from the disk

export const setOpenPath = (path: string) => setStoryState("openPath", path);
export const setExpectedLastModified = (time: number) =>
  setStoryState("expectedLastModified", time);
export const setStoryLoaded = (loaded: boolean) =>
  setStoryState("storyLoaded", loaded);
export const unloadStory = () => {
  setStoryState("story", undefined);
  setStoryState("openPath", undefined);
  setStoryState("expectedLastModified", 0);
  setStoryState("storyLoaded", false);
};

export const setStoryProperty = <K extends keyof StoryStateProperties>(
  property: K,
  value: StoryStateProperties[K],
) => {
  setStoryState("story", property, value);
};

export const setStorySetting = <K extends keyof StorySettings>(
  property: K,
  value: StorySettings[K],
) => {
  setStoryState("story", "settings", property, value);
};
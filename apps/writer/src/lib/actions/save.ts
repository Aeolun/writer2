import axios from "axios";
import type z from "zod";
import type { saveSchema } from "../persistence";
import { saveProject } from "../persistence/save-project.ts";
import { globalActions } from "../slices/global";
import { storyActions } from "../slices/story";
import { store } from "../store";

export const save = async (newAutoSave: boolean) => {
  const { base, ...rest } = store.getState();
  if (!base.openPath) {
    throw new Error(
      "Cannot save without having an openPath set in the global store.",
    );
  }
  await saveProject(base.openPath, {
    ...rest,
    newAutosave: newAutoSave,
    expectedLastModified: base.expectedLastModified ?? 0,
  });
};

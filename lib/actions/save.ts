import axios from "axios";
import type z from "zod";
import type { saveSchema } from "../persistence";
import { globalActions } from "../slices/global";
import { storyActions } from "../slices/story";
import { store } from "../store";

export const save = async (newAutoSave: boolean) => {
  store.dispatch(globalActions.setSaving(true));
  const { base, ...rest } = store.getState();
  axios
    .post(`/api/save/${rest.story.name}`, {
      ...rest,
      newAutosave: newAutoSave,
      expectedLastModified: base.expectedLastModified ?? 0,
    } satisfies z.infer<typeof saveSchema>)
    .then((result) => {
      store.dispatch(globalActions.setSaving(false));
      console.log("new modified time", result.data.lastModified);
      store.dispatch(
        globalActions.setExpectedLastModified(result.data.lastModified),
      );
    })
    .catch((error) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        store.dispatch(globalActions.setSaving(false));
        store.dispatch(storyActions.unload());
      } else {
        throw error;
      }
    });
};

import axios from "axios";
import { globalActions } from "../slices/global";
import { storyActions } from "../slices/story";
import { store } from "../store";

export const save = async () => {
  store.dispatch(globalActions.setSaving(true));
  const { base, ...rest } = store.getState();
  axios
    .post("/api/save/" + rest.story.name, {
      ...rest,
      expectedLastModified: base.expectedLastModified,
    })
    .then((result) => {
      store.dispatch(globalActions.setSaving(false));
      store.dispatch(globalActions.setDirty(!result.data.isClean));
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

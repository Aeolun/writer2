import axios from "axios";
import { globalActions } from "../slices/global";
import { store } from "../store";

export const save = async () => {
  store.dispatch(globalActions.setSaving(true));
  const { base, ...rest } = store.getState();
  axios.post("/api/save/" + rest.story.name, rest).then((result) => {
    store.dispatch(globalActions.setSaving(false));
    store.dispatch(globalActions.setDirty(!result.data.isClean));
  });
};

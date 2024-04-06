import axios from "axios";
import {store} from "../store";
import {globalActions} from "../slices/global";

export const save = async () => {
  store.dispatch(globalActions.setSaving(true));
  const { base, ...rest } = store.getState();
  axios.post("/api/save/"+rest.story.name, rest).then((result) => {
    store.dispatch(globalActions.setSaving(false));
  });
}
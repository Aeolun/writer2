import axios from "axios";
import {store} from "../store";
import {globalActions} from "../slices/global";

export const save = async () => {
  store.dispatch(globalActions.setSaving(true));
  axios.post("/api/save/"+store.getState().story.name, store.getState().story).then((result) => {
    store.dispatch(globalActions.setSaving(false));
  });
}
import axios from "axios";
import {HelpKind} from "../ai-instructions";
import {store} from "../store";

export async function aiHelp(kind: HelpKind, text: string) {
  const aiBackend = store.getState().base.aiBackend
  return axios.post('/api/help', {
    kind: kind,
    method: aiBackend,
    timeout: 60000,
    text: text,
  })
}
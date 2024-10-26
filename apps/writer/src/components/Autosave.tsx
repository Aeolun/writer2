import { useAutosave } from "../lib/hooks/use-autosave";
import { storyState } from "../lib/stores/story";

export const Autosave = () => {
  useAutosave(!!storyState.story?.id);

  return <></>;
};

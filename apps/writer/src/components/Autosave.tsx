import { useAutosave } from "../lib/hooks/use-autosave";
import { useAppSelector } from "../lib/store";

export const Autosave = () => {
  const story = useAppSelector((state) => state.story.id);
  useAutosave(!!story);

  return <></>;
};

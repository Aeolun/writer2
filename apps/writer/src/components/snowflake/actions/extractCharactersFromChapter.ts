import { addNotification } from "../../../lib/stores/notifications";
import { extractNewCharacters } from "./extractNewCharacters";
import { setLoadingStates } from "../store";
import type { Node } from "@writer/shared";

export const extractCharactersFromChapter = async (node: Node) => {
  if (!node.oneliner) return;

  setLoadingStates({ [node.id + "_chars"]: true });
  try {
    const newCharacters = await extractNewCharacters([node.oneliner]);

    if (newCharacters.length === 0) {
      addNotification({
        type: "info",
        title: "No New Characters",
        message: "No new named characters found in this chapter.",
      });
    }
  } catch (error: unknown) {
    addNotification({
      type: "error",
      title: "Failed to extract characters",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  } finally {
    setLoadingStates({ [node.id + "_chars"]: false });
  }
};

import { addNotification } from "../../../lib/stores/notifications";
import { createScene } from "../../../lib/stores/scenes";
import { storyState } from "../../../lib/stores/story";
import {
  findPathToNode,
  treeState,
  updateNode,
} from "../../../lib/stores/tree";
import { useAi } from "../../../lib/use-ai";
import { setLoadingStates } from "../store";
import type { Node } from "@writer/shared";

export const expandChapter = async (node: Node) => {
  if (!node.oneliner) {
    addNotification({
      type: "error",
      title: "Missing Summary",
      message: "Please add a one-line summary for the chapter first.",
    });
    return;
  }

  setLoadingStates({ [node.id]: true });
  try {
    // Find surrounding chapters and their scenes
    const path = findPathToNode(node.id);
    if (!path) return;

    const [bookNode, arcNode, chapterNode] = path;
    const book = treeState.structure.find((b) => b.id === bookNode.id);
    const arc = book?.children?.find((a) => a.id === arcNode.id);
    const chapters = arc?.children ?? [];
    const currentIndex = chapters.findIndex((c) => c.id === node.id);

    const previousChapter =
      currentIndex > 0 ? chapters[currentIndex - 1] : null;
    const nextChapter =
      currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

    const previousScene =
      previousChapter?.children?.[previousChapter.children.length - 1]
        ?.oneliner;
    const nextScene = nextChapter?.children?.[0]?.oneliner;

    const prompt = [
      "Story Context:",
      `Overall Story: ${storyState.story?.oneliner ?? ""}`,
      "",
      previousScene && "Previous Chapter's Final Scene:",
      previousScene && previousScene,
      "",
      `Current Chapter: ${node.oneliner}`,
      "",
      nextScene && "Next Chapter's First Scene:",
      nextScene && nextScene,
    ]
      .filter(Boolean)
      .join("\n");

    const summaries = await useAi("snowflake_expand_chapter", prompt);
    const sceneSummaries = summaries.split("\n").filter((s) => s.trim());

    for (const summary of sceneSummaries) {
      const scene = await createScene(node.id);
      updateNode(scene.id, { oneliner: summary.trim() });
    }
  } catch (error: unknown) {
    addNotification({
      type: "error",
      title: "Failed to expand chapter",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  } finally {
    setLoadingStates({ [node.id]: false });
  }
};

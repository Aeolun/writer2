import { createChapter } from "../../../lib/stores/chapters";
import { charactersState } from "../../../lib/stores/characters";
import { addNotification } from "../../../lib/stores/notifications";
import { storyState } from "../../../lib/stores/story";
import { updateNode } from "../../../lib/stores/tree";
import { useAi } from "../../../lib/use-ai";
import { getNodeContext } from "./getNodeContext";
import { setLoadingStates } from "../store";
import type { Node } from "@writer/shared";

export const expandArc = async (node: Node, chapterCount: number) => {
  if (!node.oneliner) {
    addNotification({
      type: "error",
      title: "Missing Summary",
      message: "Please add a one-line summary for the arc first.",
    });
    return;
  }

  setLoadingStates({ [node.id]: true });
  try {
    const context = getNodeContext(node);

    // Add character context to the prompt
    const characterContext = Object.values(charactersState.characters)
      .map((char) => `${char.firstName} ${char.lastName}: ${char.summary}`)
      .join("\n");

    // Group previous arcs with their chapters
    const previousArcsWithChapters = (context.prevArcs || []).map(
      (arc, arcIndex) => {
        const arcChapters = (context.previousChapters || [])
          .filter((chapter) => chapter.startsWith(`Arc ${arcIndex + 1}, `))
          .map((chapter) => chapter.replace(`Arc ${arcIndex + 1}, `, ""));

        return [
          `Arc ${arcIndex + 1}: ${arc}`,
          ...(arcChapters.length ? ["Chapters:", ...arcChapters] : []),
          "", // Empty line between arcs
        ].join("\n");
      },
    );

    const prompt = [
      "Story Context:",
      `Overall Story: ${storyState.story?.oneliner ?? ""}`,
      "",
      "Previous Books:",
      ...previousArcsWithChapters,
      `Current Arc: ${node.oneliner}`,
      context.nextArcSummary && `Next Arc: ${context.nextArcSummary}`,
      "",
      `Generate ${chapterCount} chapters for the current arc. Each chapter should follow naturally from the previous story events and build towards this arc's resolution.`,
    ]
      .filter(Boolean)
      .join("\n");

    console.log(prompt);
    const summaries = await useAi("snowflake_expand_arc", prompt);
    const chapterSummaries = summaries.split("\n").filter((s) => s.trim());

    if (chapterSummaries.length !== chapterCount) {
      addNotification({
        type: "error",
        title: "Invalid AI Response",
        message: `Expected ${chapterCount} chapter summaries but received ${chapterSummaries.length}`,
      });
      return;
    }

    // Create the chapters without character extraction
    for (const summary of chapterSummaries) {
      const chapter = await createChapter(node.id);
      updateNode(chapter.id, { oneliner: summary.trim() });
    }
  } catch (error: unknown) {
    addNotification({
      type: "error",
      title: "Failed to expand arc",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  } finally {
    setLoadingStates({ [node.id]: false });
  }
};

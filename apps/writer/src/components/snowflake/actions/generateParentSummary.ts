import { addNotification } from "../../../lib/stores/notifications";
import { updateNode } from "../../../lib/stores/tree";
import { useAi } from "../../../lib/use-ai";
import { setLoadingStates } from "../store";
import type { Node } from "@writer/shared";

export const generateParentSummary = async (node: Node) => {
  setLoadingStates({ [node.id]: true });
  try {
    if (!node.children?.length) return;

    // Check if all children have oneliners
    const allChildrenHaveOneliners = node.children.every(
      (child) => child.oneliner,
    );
    if (!allChildrenHaveOneliners) {
      addNotification({
        type: "error",
        title: "Missing summaries",
        message: `All child elements must have a one-line summary first: ${node.children
          .filter((c) => !c.oneliner)
          .map((c) => c.name)
          .join(", ")} missing summaries.`,
      });
      return;
    }

    const childSummaries = node.children
      .map((child) => child.oneliner)
      .join("\n");

    const summary = await useAi(
      "snowflake_parent",
      [
        {
          text: childSummaries,
          canCache: false,
        },
      ],
      false,
    );

    updateNode(node.id, { oneliner: summary });
  } catch (error) {
    addNotification({
      type: "error",
      title: "Failed to generate summary",
      message: error.message,
    });
  } finally {
    setLoadingStates({ [node.id]: false });
  }
};

import type { Arc } from "@writer/shared";
import { createStore } from "solid-js/store";
import short from "short-uuid";
import { appendNode, findNode, removeNode, updateNode } from "./tree"; // Import functions from tree.ts

export const [arcsStore, setArcsStore] = createStore<{
  arcs: Record<string, Arc>;
}>({
  arcs: {},
});

// Function to create a new arc
export function createArc(bookId: string) {
  const newId = short.generate().toString();
  setArcsStore("arcs", newId, {
    id: newId,
    title: "New Arc",
    modifiedAt: Date.now(),
    summary: "",
    start_date: "",
  } satisfies Arc);
  appendNode(
    {
      id: newId,
      name: "New Arc",
      type: "arc",
      isOpen: false,
      children: [],
    },
    bookId,
  );
}

// Function to update an existing arc
export function updateArc(arcId: string, updatedData: Partial<Arc>) {
  setArcsStore("arcs", arcId, (arc) => ({
    ...arc,
    ...updatedData,
    modifiedAt: Date.now(),
  }));
  updateNode(arcId, {
    name: updatedData.title,
  });
}

// Function to delete an arc
export function deleteArc(arcId: string) {
  const arcNode = findNode(arcId);
  if (arcNode && (!arcNode.children || arcNode.children.length === 0)) {
    setArcsStore("arcs", (arcs) => {
      const { [arcId]: _, ...rest } = arcs;
      return rest;
    });
    removeNode(arcId);
  } else {
    alert(`Remove ${arcNode?.children?.length} chapters first`);
  }
}

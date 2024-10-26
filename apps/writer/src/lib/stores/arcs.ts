import { Arc } from "@writer/shared";
import { createStore } from "solid-js/store";
import short from "short-uuid";
import { updateItemInStructure } from "./tree"; // Import functions from tree.ts

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
  });
  addItemToStructure(bookId, {
    id: newId,
    name: "New Arc",
    type: "arc",
    isOpen: false,
    children: [],
  });
}

// Function to update an existing arc
export function updateArc(arcId: string, updatedData: Partial<Arc>) {
  setArcsStore("arcs", arcId, (arc) => ({
    ...arc,
    ...updatedData,
    modifiedAt: Date.now(),
  }));
  updateItemInStructure(treeState.structure, arcId, {
    name: updatedData.title,
  });
}

// Function to delete an arc
export function deleteArc(arcId: string) {
  const arcNode = findNodeInStructure(treeState.structure, arcId);
  if (arcNode && (!arcNode.children || arcNode.children.length === 0)) {
    setArcsStore("arcs", (arcs) => {
      const { [arcId]: _, ...rest } = arcs;
      return rest;
    });
    removeItemFromStructure(arcId);
  } else {
    alert(`Remove children ${arcNode?.children?.length} first`);
  }
}

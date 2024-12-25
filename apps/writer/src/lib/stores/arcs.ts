import type { Arc } from "@writer/shared";
import { createStore } from "solid-js/store";
import short from "short-uuid";
import {
  appendNode,
  findNode,
  removeNode,
  updateNode,
  insertNode,
} from "./tree"; // Import functions from tree.ts

const arcsStoreDefault = {
  arcs: {},
};
export const [arcsStore, setArcsStore] = createStore<{
  arcs: Record<string, Arc>;
}>(arcsStoreDefault);

export const resetArcsStore = () => {
  setArcsStore("arcs", {});
};

// Function to create a new arc
export function createArc(bookId: string, beforeId?: string) {
  const newArc = {
    id: short.generate(),
    type: "arc" as const,
    name: "New Arc",
    children: [],
    isOpen: true,
  };

  setArcsStore("arcs", newArc.id, {
    id: newArc.id,
    title: newArc.name,
    summary: "",
    modifiedAt: Date.now(),
  } satisfies Arc);
  insertNode(newArc, bookId, beforeId);
  return newArc;
}

// Function to update an existing arc
export function updateArc(arcId: string, updatedData: Partial<Arc>) {
  const currentValue = arcsStore.arcs[arcId];
  setArcsStore("arcs", arcId, {
    summary: "",
    id: arcId,
    ...currentValue,
    ...updatedData,
    modifiedAt: Date.now(),
  });
  console.log(arcsStore.arcs[arcId]);
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

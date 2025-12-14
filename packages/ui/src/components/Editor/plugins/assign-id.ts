import { generate } from "short-uuid";
import { Plugin } from "prosemirror-state";

export const assignIdPlugin = new Plugin({
  appendTransaction(transactions, oldState, newState) {
    let tr = newState.tr;
    let modified = false;

    newState.doc.descendants((node, pos) => {
      if (node.isBlock && !node.attrs.id) {
        const newAttrs = { ...node.attrs, id: generate() };
        tr = tr.setNodeMarkup(pos, undefined, newAttrs);
        modified = true;
      }
    });

    return modified ? tr : null;
  },
});

import { EditorView } from "prosemirror-view";
import { contentSchema } from "../../components/editor/schema";
import { createStore } from "solid-js/store";
import { ContentNode } from "@writer/shared";

type EditorStore = {
  editors: Record<string, EditorView>;
};

export const [editorState, setEditorState] = createStore<EditorStore>({
  editors: {},
});

export const registerEditor = (paragraphId: string, view: EditorView) => {
  setEditorState("editors", paragraphId, view);
};

export const unregisterEditor = (paragraphId: string) => {
  setEditorState("editors", paragraphId, undefined as any);
};

export const updateEditorContent = (paragraphId: string, content: string | ContentNode) => {
  const view = editorState.editors[paragraphId];
  if (!view) return;

  const doc = typeof content === "string" 
    ? contentSchema.node("doc", null, [
        contentSchema.node("paragraph", null, [contentSchema.text(content)])
      ])
    : contentSchema.nodeFromJSON(content);

  const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content);
  view.dispatch(tr);
  console.log("updateEditorContent", view.state.doc.toJSON());
}; 
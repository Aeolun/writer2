import { createEffect, createSignal } from "solid-js";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { undo, redo, history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap, toggleMark } from "prosemirror-commands";
import "./style.css";
import { contentSchema } from "./schema";
import { toggleTranslationMark } from "./functions/toggle-title-mark";
import { blockMenuPlugin } from "./plugins/block-menu";
import { assignIdPlugin } from "./plugins/assign-id";
import { inlineMenuPlugin } from "./plugins/inline-menu";
import { Node } from "prosemirror-model";
import {
  inputRules,
  emDash,
  smartQuotes,
  ellipsis,
} from "prosemirror-inputrules";
import { ContentNode } from "@writer/shared";

const italic = toggleMark(contentSchema.marks.em);

export const Editor = (props: {
  defaultValue: object | string;
  onChange: (data: ContentNode) => void;
}) => {
  const [editor, setEditor] = createSignal<HTMLDivElement>();

  createEffect(() => {
    const editorNode = editor();
    if (editorNode && editorNode.childNodes.length > 0) return;

    let doc: Node;
    if (typeof props.defaultValue === "string") {
      doc = contentSchema.node(
        "doc",
        null,

        contentSchema.node(
          "paragraph",
          null,
          !props.defaultValue ? [] : [contentSchema.text(props.defaultValue)],
        ),
      );
    } else {
      doc = contentSchema.nodeFromJSON(props.defaultValue);
    }

    const state = EditorState.create({
      doc: doc,
      schema: contentSchema,
      plugins: [
        history(),
        keymap({
          "Mod-z": undo,
          "Mod-y": redo,
          "Mod-i": italic,
          "Control-Enter": () => {
            console.log("new paragraph editor shortcut");
            return true;
          },
        }),
        keymap(baseKeymap),
        inlineMenuPlugin,
        assignIdPlugin,
        inputRules({ rules: smartQuotes.concat([emDash, ellipsis]) }),
      ],
    });
    const view = new EditorView(editor() ?? null, {
      state,
      dispatchTransaction(transaction) {
        const newState = view.state.apply(transaction);
        view.updateState(newState);

        props.onChange(newState.doc.toJSON());
      },
    });
  });

  return <div class="editor" ref={setEditor} />;
};

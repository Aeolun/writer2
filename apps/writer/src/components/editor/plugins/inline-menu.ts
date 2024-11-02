import {
  NodeSelection,
  PluginKey,
  TextSelection,
  Plugin,
} from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { toggleTranslationMark } from "../functions/toggle-title-mark";
import { Node } from "prosemirror-model";

const menuPluginKey = new PluginKey("menuPlugin");

function createInlineMenu(
  view: EditorView,
  coords: { top: number; left: number },
) {
  const menu = document.createElement("div");
  menu.className = "inline-menu";
  menu.style.position = "absolute";
  menu.style.top = `${coords.top - 30}px`; // Adjust y-offset as needed
  menu.style.left = `${coords.left}px`;

  const boldButton = document.createElement("button");
  boldButton.textContent = "Bold";

  const removeTranslationButton = document.createElement("button");
  removeTranslationButton.textContent = "Remove Translation";

  function updateButtonStyle() {
    const { state } = view;
    const { from, to } = state.selection;
    const hasMark = state.doc.rangeHasMark(from, to, state.schema.marks.strong);

    if (hasMark) {
      boldButton.classList.add("active");
    } else {
      boldButton.classList.remove("active");
    }
  }

  const { state } = view;
  const { from, to } = state.selection;
  const hasTranslationMark = state.doc.rangeHasMark(
    from,
    to,
    state.schema.marks.translation,
  );

  const englishButton = document.createElement("button");
  englishButton.textContent = "English To Gaelic";
  englishButton.onclick = () => {
    const { state, dispatch } = view;
    toggleTranslationMark({ from: "en", to: "gd" }, state, dispatch);
    closeMenu();
  };

  const gaelicButton = document.createElement("button");
  gaelicButton.textContent = "Gaelic To English";
  gaelicButton.onclick = () => {
    const { state, dispatch } = view;
    toggleTranslationMark({ from: "gd", to: "en" }, state, dispatch);
    closeMenu();
  };

  removeTranslationButton.onclick = () => {
    const { state, dispatch } = view;
    toggleTranslationMark({ from: "en", to: "gd" }, state, dispatch);
    closeMenu();
  };

  boldButton.onclick = () => {
    const { state, dispatch } = view;
    const { from, to } = state.selection;
    const hasMark = state.doc.rangeHasMark(from, to, state.schema.marks.strong);

    const tr = state.tr;

    if (hasMark) {
      tr.removeMark(from, to, state.schema.marks.strong);
    } else {
      tr.addMark(from, to, state.schema.marks.strong.create());
    }

    dispatch(tr);
    updateButtonStyle(); // Update button style after state change
    closeMenu();
  };

  menu.appendChild(boldButton);
  if (hasTranslationMark) {
    menu.appendChild(removeTranslationButton);
  } else {
    menu.appendChild(englishButton);
    menu.appendChild(gaelicButton);
  }
  document.body.appendChild(menu);

  updateButtonStyle();

  return menu;
}

function closeMenu() {
  const existingMenu = document.querySelector(".inline-menu");
  if (existingMenu) {
    existingMenu.remove();
  }
}

function getClosestBlock(view: EditorView): { node: Node | null; pos: number } {
  const { state } = view;
  const { selection } = state;
  let { $from } = selection;

  if (selection instanceof NodeSelection) {
    return { node: selection.node, pos: selection.from };
  }

  while ($from.depth > 0) {
    const node = $from.node($from.depth);
    if (node.isBlock) {
      return { node, pos: $from.before($from.depth) };
    }
    $from = state.doc.resolve($from.before());
  }

  const rootBlock = $from.node(0);
  return { node: rootBlock, pos: 0 };
}

function getSelectionBoundingBox(view: EditorView) {
  const { from, to } = view.state.selection;
  const domSelection = window.getSelection();
  domSelection?.removeAllRanges();

  const range = document.createRange();
  range.setStart(view.domAtPos(from).node, view.domAtPos(from).offset);
  range.setEnd(view.domAtPos(to).node, view.domAtPos(to).offset);

  domSelection?.addRange(range);

  const rect = range.getBoundingClientRect();
  const scrollTop =
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop;
  const scrollLeft =
    window.pageXOffset ||
    document.documentElement.scrollLeft ||
    document.body.scrollLeft;

  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
  };
}

export const inlineMenuPlugin = new Plugin({
  key: menuPluginKey,
  view(editorView) {
    return {
      update(view, lastState) {
        const { state } = view;
        const { selection } = state;

        closeMenu(); // Close menu on every update

        if (
          selection instanceof TextSelection &&
          selection.from !== selection.to
        ) {
          const startNode = selection.$from.node();
          const endNode = selection.$to.node();

          if (startNode.isTextblock && endNode.isTextblock) {
            const coords = getSelectionBoundingBox(view);
            createInlineMenu(view, coords);
          }
        }
      },
    };
  },
});

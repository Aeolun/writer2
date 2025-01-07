import { toggleMark } from "prosemirror-commands";
import { contentSchema } from "../schema";
import { EditorState, Transaction } from "prosemirror-state";
import { useAi } from "../../../lib/use-ai";

const TRANSLATION_LANGUAGES = ["en", "nl", "gd"];
const TRANSLATION_LANGUAGES_NAMES = ["English", "Dutch", "Scots Gaelic"];

export function toggleTranslationMark(
  options: {
    from: string;
    to: string;
  },
  state: EditorState,
  dispatch: (tr: Transaction) => void,
) {
  const translationMarkType = contentSchema.marks.translation;
  const { from, to } = state.selection;
  const hasMark = state.doc.rangeHasMark(from, to, translationMarkType);

  if (hasMark) {
    return toggleMark(translationMarkType)(state, dispatch);
  }

  const fromLanguage = TRANSLATION_LANGUAGES_NAMES[TRANSLATION_LANGUAGES.indexOf(options.from)];
  const toLanguage = TRANSLATION_LANGUAGES_NAMES[TRANSLATION_LANGUAGES.indexOf(options.to)];
  useAi(
    "free",
    `Translate the following text from ${fromLanguage} to ${toLanguage}. Output only the translation, nothing else:\n\n${state.doc.textBetween(
      from,
      to,
      " ",
    )}`,
    false,
  ).then((res) => {
    if (res) {
      const attrs = { title: res, from: options.from, to: options.to };
      return toggleMark(translationMarkType, attrs)(state, dispatch);
    }
  });

  return false;
}

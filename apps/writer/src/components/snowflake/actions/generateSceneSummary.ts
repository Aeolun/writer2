import { contentSchemaToText } from "../../../lib/persistence/content-schema-to-html";
import { charactersState } from "../../../lib/stores/characters";
import { addNotification } from "../../../lib/stores/notifications";
import { scenesState } from "../../../lib/stores/scenes";
import { updateNode } from "../../../lib/stores/tree";
import { useAi } from "../../../lib/use-ai";
import { detectFirstPerson } from "./detectFirstPerson";
import { setLoadingStates } from "../store";

export const generateSceneSummary = async (sceneId: string) => {
  setLoadingStates({ [sceneId]: true });
  try {
    const scene = scenesState.scenes[sceneId];
    if (!scene) return;

    const content = scene.paragraphs
      .map((p) =>
        typeof p.text === "string" ? p.text : contentSchemaToText(p.text),
      )
      .join("\n\n");

    const isFirstPerson =
      scene.perspective === "first" || detectFirstPerson(content);
    let context = "";

    if (isFirstPerson) {
      const protagonist = scene.protagonistId
        ? charactersState.characters[scene.protagonistId]
        : null;

      if (protagonist) {
        context = `This scene is written in first person from ${protagonist.name}'s perspective. Replace first person pronouns with "${protagonist.name}".`;
      } else {
        addNotification({
          type: "warning",
          title: "Missing Protagonist",
          message:
            "This scene appears to be in first person but has no protagonist set. Using generic 'the protagonist' instead.",
        });
        context =
          "This scene is written in first person. Use 'the protagonist' instead of first person pronouns.";
      }
    }

    const summary = await useAi(
      "snowflake_scene",
      [
        {
          text: context ? `${context}\n\n${content}` : content,
          canCache: false,
        },
      ],
      false,
    );

    updateNode(sceneId, { oneliner: summary });
  } catch (error) {
    addNotification({
      type: "error",
      title: "Failed to generate summary",
      message: error.message,
    });
  } finally {
    setLoadingStates({ [sceneId]: false });
  }
};

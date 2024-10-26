import { Paragraph } from "./Paragraph";
import { currentScene } from "../lib/stores/retrieval/current-scene";

export const ParagraphsList = () => {
  return currentScene() ? (
    <>
      {currentScene()?.paragraphs.length === 0 ? (
        <button type="button" class="btn btn-primary" onClick={() => {}}>
          Create paragraph
        </button>
      ) : null}
      {currentScene()?.paragraphs.map((p) => {
        const thisScene = currentScene();
        if (thisScene) {
          return <Paragraph sceneId={thisScene.id} paragraph={p} />;
        }
        return null;
      })}
    </>
  ) : null;
};

import { useDispatch, useSelector } from "react-redux";
import { selectedSceneParagraphsSelector } from "../lib/selectors/selectedSceneParagraphsSelector";
import { Button } from "@chakra-ui/react";
import { storyActions } from "../lib/slices/story";
import { Paragraph } from "./Paragraph";

export const ParagraphsList = () => {
  const scene = useSelector(selectedSceneParagraphsSelector);
  const dispatch = useDispatch();

  return scene ? (
    <>
      {scene.paragraphs.length === 0 ? (
        <Button
          onClick={() => {
            dispatch(
              storyActions.createSceneParagraph({
                sceneId: scene.id,
              }),
            );
          }}
        >
          Create paragraph
        </Button>
      ) : null}
      {scene.paragraphs.map((p) => {
        return <Paragraph key={p.id} sceneId={scene.id} paragraphId={p.id} />;
      })}
    </>
  ) : null;
};

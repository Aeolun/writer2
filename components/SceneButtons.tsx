import { Button, HStack } from "@chakra-ui/react";
import type React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Scene } from "../lib/persistence";
import { globalActions } from "../lib/slices/global";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";

export const SceneButtons = (props: { scene: Scene }) => {
  const dispatch = useDispatch();
  const languages = useSelector((store: RootState) =>
    Object.values(store.language.languages),
  );
  const selectedLanguage = useSelector(
    (store: RootState) => store.base.selectedLanguage,
  );

  return (
    <HStack gap={1}>
      <Button
        onClick={() => {
          props.scene.paragraphs.forEach((p) => {
            dispatch(
              storyActions.updateSceneParagraph({
                sceneId: props.scene.id,
                paragraphId: p.id,
                extra: p.text,
                text: "",
              }),
            );
          });
        }}
      >
        Shift to extra
      </Button>
      <Button
        colorScheme={"orange"}
        onClick={() => {
          props.scene.paragraphs.forEach((p) => {
            dispatch(
              storyActions.updateSceneParagraph({
                sceneId: props.scene.id,
                paragraphId: p.id,
                state: "ai",
              }),
            );
          });
        }}
      >
        All AI
      </Button>
      <Button
        colorScheme={"orange"}
        onClick={() => {
          props.scene.paragraphs.forEach((p) => {
            dispatch(
              storyActions.updateSceneParagraph({
                sceneId: props.scene.id,
                paragraphId: p.id,
                state: "draft",
              }),
            );
          });
        }}
      >
        All Draft
      </Button>
      {languages.map((lang) => {
        return (
          <Button
            onClick={() => {
              if (selectedLanguage) {
                dispatch(globalActions.setSelectedLanguage(undefined));
              } else {
                dispatch(globalActions.setSelectedLanguage(lang.id));
              }
            }}
          >
            {lang.title}
          </Button>
        );
      })}
    </HStack>
  );
};

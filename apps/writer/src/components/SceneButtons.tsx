import { Button, HStack, Text } from "@chakra-ui/react";
import type React from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "../lib/slices/global";
import { storyActions } from "../lib/slices/story";
import { useAppSelector, type RootState } from "../lib/store";
import { selectedSceneParagraphsSelector } from "../lib/selectors/selectedSceneParagraphsSelector.ts";

export const SceneButtons = () => {
  const dispatch = useDispatch();
  const languages = useSelector((store: RootState) =>
    Object.values(store.language.languages),
  );
  const scene = useAppSelector(selectedSceneParagraphsSelector);
  const selectedLanguage = useSelector(
    (store: RootState) => store.base.selectedLanguage,
  );

  return scene ? (
    <HStack bg={"gray.300"} px={4} py={2} gap={1}>
      <Text minW="6em">Actions</Text>
      <Button
        onClick={() => {
          scene.paragraphs.forEach((p) => {
            dispatch(
              storyActions.updateSceneParagraph({
                sceneId: scene.id,
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
          scene.paragraphs.forEach((p) => {
            dispatch(
              storyActions.updateSceneParagraph({
                sceneId: scene.id,
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
          scene.paragraphs.forEach((p) => {
            dispatch(
              storyActions.updateSceneParagraph({
                sceneId: scene.id,
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
  ) : null;
};

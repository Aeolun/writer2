import { Box, Button, Checkbox, Input, Textarea } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { aiHelp } from "../lib/actions/aiHelp";
import type { HelpKind } from "../lib/ai-instructions";
import { selectedObjectSelector } from "../lib/selectors/selectedObjectSelector";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";
import { useAi } from "../lib/use-ai";

export const ScenePanel = () => {
  const selectedScene = useSelector(selectedObjectSelector);
  const protagonist = useSelector((store: RootState) =>
    Object.values(store.story.characters).find((char) => char.isProtagonist),
  );
  const dispatch = useDispatch();

  const help = useCallback(
    (helpKind: HelpKind, extra = false) => {
      if (selectedScene?.type === "scene") {
        const text =
          "Protagonist: " +
          protagonist?.name +
          "\n\nScene text:\n\n" +
          selectedScene.data.text +
          "\n\nOutput only the summary.";
        useAi(helpKind, text).then((res) => {
          dispatch(
            storyActions.updateScene({
              id: selectedScene?.id,
              summary: res ?? undefined,
            }),
          );
        });
      }
    },
    [selectedScene],
  );

  return selectedScene && selectedScene.type === "scene" ? (
    <>
      <div>
        <Input
          placeholder={"title"}
          onChange={(e) => {
            dispatch(
              storyActions.updateScene({
                id: selectedScene.id,
                title: e.target.value,
              }),
            );
          }}
          value={selectedScene.data.title}
        />
      </div>
      <Textarea
        mt={2}
        onChange={(e) => {
          dispatch(
            storyActions.updateScene({
              id: selectedScene.id,
              summary: e.target.value,
            }),
          );
        }}
        rows={6}
        placeholder="summary"
        style={{ width: "100%" }}
        value={selectedScene.data.summary}
      />
      <Box>
        <Checkbox
          isChecked={selectedScene.data.posted ?? false}
          onChange={() => {
            dispatch(
              storyActions.updateScene({
                id: selectedScene.id,
                posted: !selectedScene.data.posted,
              }),
            );
          }}
        >
          Uploaded
        </Checkbox>
      </Box>
      <Button
        colorScheme={"blue"}
        onClick={() => {
          help("summarize");
        }}
      >
        [AI] Summarize
      </Button>
      <Button
        colorScheme={"red"}
        onClick={() => {
          dispatch(storyActions.deleteScene({ sceneId: selectedScene.id }));
        }}
      >
        Delete
      </Button>
    </>
  ) : null;
};

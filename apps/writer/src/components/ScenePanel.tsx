import { Box, Button, Checkbox, Input, Textarea } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { aiHelp } from "../lib/actions/aiHelp";
import type { HelpKind } from "../lib/ai-instructions";
import { selectedObjectSelector } from "../lib/selectors/selectedObjectSelector";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";
import { useAi } from "../lib/use-ai";
import { selectedSceneSelector } from "../lib/selectors/selectedSceneSelector";

export const ScenePanel = () => {
  const selectedScene = useSelector(selectedSceneSelector);
  const protagonist = useSelector((store: RootState) =>
    Object.values(store.story.characters).find((char) => char.isProtagonist),
  );
  const dispatch = useDispatch();

  const help = useCallback(
    (helpKind: HelpKind, extra = false) => {
      const text =
        "Protagonist: " +
        protagonist?.name +
        "\n\nScene text:\n\n" +
        selectedScene?.paragraphs.map((p) => p.text).join("\n\n") +
        "\n\nOutput only the summary.";
      useAi(helpKind, text).then((res) => {
        if (extra) {
          dispatch(
            storyActions.updateScene({
              id: selectedScene?.id,
              extra: res ?? undefined,
            }),
          );
        } else {
          dispatch(
            storyActions.updateScene({
              id: selectedScene?.id,
              summary: res ?? undefined,
            }),
          );
        }
      });
    },
    [selectedScene],
  );

  return selectedScene ? (
    <Box flex={1} p={4} height="100%" overflow="auto">
      <div>
        Id: {selectedScene.id}
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
          value={selectedScene.title}
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
        value={selectedScene.summary}
      />
      {selectedScene.extra && (
        <Textarea
          mt={2}
          onChange={(e) => {
            dispatch(
              storyActions.updateScene({
                id: selectedScene.id,
                extra: e.target.value,
              }),
            );
          }}
          rows={18}
          placeholder="extra"
          style={{ width: "100%" }}
          value={selectedScene.extra}
        />
      )}
      <Box>
        <Checkbox
          isChecked={selectedScene.posted ?? false}
          onChange={() => {
            dispatch(
              storyActions.updateScene({
                id: selectedScene.id,
                posted: !selectedScene.posted,
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
        colorScheme={"blue"}
        onClick={() => {
          help("improvements", true);
        }}
      >
        [AI] Improvements
      </Button>
      <Button
        colorScheme={"red"}
        onClick={() => {
          dispatch(storyActions.deleteScene({ sceneId: selectedScene.id }));
        }}
      >
        Delete
      </Button>
    </Box>
  ) : null;
};

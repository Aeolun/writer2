import { Box, Button, Flex, HStack, Spinner, Tag } from "@chakra-ui/react";
import { Check, Trash, TrashSolid } from "iconoir-react";
import React, { Fragment, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Scene, SceneParagraph } from "../../../shared/src/schema.ts";
import { plotpointSelector } from "../lib/selectors/plotpointSelector";
import { storyActions } from "../lib/slices/story";
import { AutoResizeTextarea } from "./AutoResizeTextarea";
import { Row } from "./StoryPanel";
import { StoryParagraphButtons } from "./StoryParagraphButtons";
import { sceneSelector } from "../lib/selectors/sceneSelector.ts";
import { RootState } from "../lib/store.ts";
import { paragraphSelector } from "../lib/selectors/paragraphSelector.ts";

const statusColor: Record<SceneParagraph["state"], string> = {
  draft: "yellow.500",
  revise: "red.500",
  sdt: "blue.500",
  final: "green.500",
  ai: "purple.500",
};

export const Paragraph = (props: { sceneId: string; paragraphId: string }) => {
  const scene = useSelector((state: RootState) => {
    return sceneSelector(state, props.sceneId);
  });
  const paragraph = useSelector((state: RootState) => {
    return paragraphSelector(state, props.sceneId, props.paragraphId);
  });
  const dispatch = useDispatch();
  const [issues, setIssues] = useState<
    {
      message: string;
    }[]
  >([]);

  const plotpoints = useSelector(plotpointSelector);
  const [suggestion, setSuggestion] = useState("");

  return scene && paragraph ? (
    <>
      <Row
        selected={scene.selectedParagraph === props.paragraphId}
        borderColor={
          statusColor[paragraph.state as SceneParagraph["state"]] ?? undefined
        }
        suggestion={suggestion}
        main={
          <>
            <AutoResizeTextarea
              key={props.paragraphId}
              id={`p_${props.paragraphId}`}
              defaultValue={paragraph.text}
              onBlur={(e) => {
                dispatch(
                  storyActions.updateSceneParagraph({
                    sceneId: scene.id,
                    paragraphId: paragraph.id,
                    text: e.target.value,
                  }),
                );
              }}
              onFocus={(e) => {
                console.log("selectionstart on focus", e.target.selectionStart);
                dispatch(
                  storyActions.updateScene({
                    id: scene.id,
                    selectedParagraph: paragraph.id,
                    cursor: e.currentTarget.selectionStart,
                  }),
                );
              }}
              onKeyDown={(e) => {
                const pe = document.getElementById(
                  `p_${paragraph.id}`,
                ) as HTMLTextAreaElement;
                if (e.key === "Enter" && e.ctrlKey) {
                  dispatch(
                    storyActions.createSceneParagraph({
                      sceneId: scene.id,
                      afterParagraphId: paragraph.id,
                    }),
                  );
                  e.preventDefault();
                  e.stopPropagation();
                } else if (e.key === "Backspace" && e.ctrlKey) {
                  dispatch(
                    storyActions.deleteSceneParagraph({
                      sceneId: scene.id,
                      paragraphId: paragraph.id,
                    }),
                  );
                  e.preventDefault();
                  e.stopPropagation();
                } else if (e.key === "ArrowUp" && e.shiftKey && e.ctrlKey) {
                  dispatch(
                    storyActions.moveSceneParagraph({
                      sceneId: scene.id,
                      paragraphId: paragraph.id,
                      direction: "up",
                    }),
                  );
                  e.preventDefault();
                  e.stopPropagation();
                } else if (e.key === "ArrowDown" && e.shiftKey && e.ctrlKey) {
                  dispatch(
                    storyActions.moveSceneParagraph({
                      sceneId: scene.id,
                      paragraphId: paragraph.id,
                      direction: "down",
                    }),
                  );
                  e.preventDefault();
                  e.stopPropagation();
                } else if (
                  e.key === "ArrowDown" &&
                  pe.selectionStart === pe.value.length
                ) {
                  // scene?.paragraphs.forEach((p, i) => {
                  //   if (
                  //     paragraph.id === scene.selectedParagraph &&
                  //     scene.paragraphs[i + 1]
                  //   ) {
                  //     const nextEl = document.getElementById(
                  //       `p_${scene.paragraphs[i + 1].id}`,
                  //     ) as HTMLTextAreaElement;
                  //     nextEl.focus();
                  //     setTimeout(() => {
                  //       nextEl.selectionStart = 0;
                  //       nextEl.selectionEnd = 0;
                  //     }, 1);
                  //   }
                  // });
                } else if (e.key === "ArrowUp" && pe.selectionStart === 0) {
                  // scene?.paragraphs.forEach((p, i) => {
                  //   if (
                  //     paragraph.id === scene.selectedParagraph &&
                  //     scene.paragraphs[i - 1]
                  //   ) {
                  //     const nextEl = document.getElementById(
                  //       `p_${scene.paragraphs[i - 1].id}`,
                  //     ) as HTMLTextAreaElement;
                  //     nextEl.focus();
                  //     setTimeout(() => {
                  //       nextEl.selectionStart = nextEl.value.length;
                  //       nextEl.selectionEnd = nextEl.value.length;
                  //     }, 1);
                  //   }
                  // });
                } else {
                  // dispatch(
                  //   storyActions.updateScene({
                  //     id: scene.id,
                  //     cursor: e.currentTarget.selectionStart,
                  //   }),
                  // );
                  console.log(e.key);
                }
              }}
            />
            {issues && issues.length > 0 ? (
              <Box px={8} pb={4}>
                {issues.map((issue) => (
                  <Box key={issue.message} color={"red.500"}>
                    {issue.message}
                  </Box>
                ))}
              </Box>
            ) : null}
            {paragraph.translation ? (
              <Box
                px={8}
                textIndent={"1em"}
                fontFamily={"Noteworthy, Comic Sans MS, sans-serif"}
              >
                {paragraph.translation}
              </Box>
            ) : null}
          </>
        }
        buttons={
          paragraph.id === scene.selectedParagraph ? (
            <StoryParagraphButtons paragraphId={paragraph.id} scene={scene} />
          ) : (
            <Box minHeight={"52px"} />
          )
        }
        extra={
          paragraph.extraLoading ? (
            <Flex
              alignItems={"center"}
              justifyContent={"center"}
              height={"100%"}
            >
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            </Flex>
          ) : paragraph.extra ? (
            <>
              <HStack gap={0} position={"absolute"} top={4} right={2}>
                <Button
                  _hover={{ color: "green.500" }}
                  variant={"link"}
                  onClick={() => {
                    dispatch(
                      storyActions.updateSceneParagraph({
                        sceneId: scene.id,
                        paragraphId: paragraph.id,
                        text: paragraph.extra,
                        extra: "",
                      }),
                    );
                  }}
                >
                  <Check />
                </Button>
                <Button
                  _hover={{ color: "red.500" }}
                  variant={"link"}
                  onClick={() => {
                    dispatch(
                      storyActions.updateSceneParagraph({
                        sceneId: scene.id,
                        paragraphId: paragraph.id,
                        extra: "",
                      }),
                    );
                  }}
                >
                  <Trash />
                </Button>
              </HStack>
              <AutoResizeTextarea
                onChange={(e) => {
                  dispatch(
                    storyActions.updateSceneParagraph({
                      sceneId: scene.id,
                      paragraphId: paragraph.id,
                      extra: e.currentTarget.value,
                    }),
                  );
                }}
                value={paragraph.extra}
              />
            </>
          ) : null
        }
      />
    </>
  ) : null;
};

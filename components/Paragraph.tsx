import { Box, Button, Flex, HStack, Spinner, Tag } from "@chakra-ui/react";
import { Check, Trash, TrashSolid } from "iconoir-react";
import React, { Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Scene, SceneParagraph } from "../lib/persistence";
import { plotpointSelector } from "../lib/selectors/plotpointSelector";
import { storyActions } from "../lib/slices/story";
import { AutoResizeTextarea } from "./AutoResizeTextarea";
import { Row } from "./StoryPanel";
import { StoryParagraphButtons } from "./StoryParagraphButtons";

const statusColor: Record<SceneParagraph["state"], string> = {
  draft: "yellow.500",
  revise: "red.500",
  final: "green.500",
  ai: "purple.500",
};

export const Paragraph = (props: {
  scene: Scene;
  paragraph: SceneParagraph;
}) => {
  const dispatch = useDispatch();
  const plotpoints = useSelector(plotpointSelector);

  return (
    <>
      <Row
        selected={props.scene.selectedParagraph === props.paragraph.id}
        borderColor={
          statusColor[props.paragraph.state as SceneParagraph["state"]] ??
          undefined
        }
        main={
          <>
            <AutoResizeTextarea
              key={props.paragraph.id}
              id={`p_${props.paragraph.id}`}
              flex={1}
              outline={"1px solid transparent"}
              value={props.paragraph.text}
              onChange={(e) => {
                dispatch(
                  storyActions.updateSceneParagraph({
                    sceneId: props.scene.id,
                    paragraphId: props.paragraph.id,
                    text: e.target.value,
                  }),
                );
              }}
              onFocus={(e) => {
                console.log("selectionstart on focus", e.target.selectionStart);
                dispatch(
                  storyActions.updateScene({
                    id: props.scene.id,
                    selectedParagraph: props.paragraph.id,
                    cursor: e.currentTarget.selectionStart,
                  }),
                );
              }}
              onKeyDown={(e) => {
                const pe = document.getElementById(
                  `p_${props.paragraph.id}`,
                ) as HTMLTextAreaElement;
                if (e.key === "Enter" && e.shiftKey) {
                  dispatch(
                    storyActions.createSceneParagraph({
                      sceneId: props.scene.id,
                      afterParagraphId: props.paragraph.id,
                    }),
                  );
                  e.preventDefault();
                  e.stopPropagation();
                } else if (e.key === "Backspace" && e.shiftKey) {
                  dispatch(
                    storyActions.deleteSceneParagraph({
                      sceneId: props.scene.id,
                      paragraphId: props.paragraph.id,
                    }),
                  );
                  e.preventDefault();
                  e.stopPropagation();
                } else if (e.key === "ArrowUp" && e.shiftKey && e.ctrlKey) {
                  dispatch(
                    storyActions.moveSceneParagraph({
                      sceneId: props.scene.id,
                      paragraphId: props.paragraph.id,
                      direction: "up",
                    }),
                  );
                  e.preventDefault();
                  e.stopPropagation();
                } else if (e.key === "ArrowDown" && e.shiftKey && e.ctrlKey) {
                  dispatch(
                    storyActions.moveSceneParagraph({
                      sceneId: props.scene.id,
                      paragraphId: props.paragraph.id,
                      direction: "down",
                    }),
                  );
                  e.preventDefault();
                  e.stopPropagation();
                } else if (
                  e.key === "ArrowDown" &&
                  pe.selectionStart === pe.value.length
                ) {
                  props.scene?.paragraphs.forEach((p, i) => {
                    if (
                      props.paragraph.id === props.scene.selectedParagraph &&
                      props.scene.paragraphs[i + 1]
                    ) {
                      const nextEl = document.getElementById(
                        `p_${props.scene.paragraphs[i + 1].id}`,
                      ) as HTMLTextAreaElement;
                      nextEl.focus();
                      setTimeout(() => {
                        nextEl.selectionStart = 0;
                        nextEl.selectionEnd = 0;
                      }, 1);
                    }
                  });
                } else if (e.key === "ArrowUp" && pe.selectionStart === 0) {
                  props.scene?.paragraphs.forEach((p, i) => {
                    if (
                      props.paragraph.id === props.scene.selectedParagraph &&
                      props.scene.paragraphs[i - 1]
                    ) {
                      const nextEl = document.getElementById(
                        `p_${props.scene.paragraphs[i - 1].id}`,
                      ) as HTMLTextAreaElement;
                      nextEl.focus();
                      setTimeout(() => {
                        nextEl.selectionStart = nextEl.value.length;
                        nextEl.selectionEnd = nextEl.value.length;
                      }, 1);
                    }
                  });
                } else {
                  dispatch(
                    storyActions.updateScene({
                      id: props.scene.id,
                      cursor: e.currentTarget.selectionStart,
                    }),
                  );
                  console.log(e.key);
                }
              }}
            />
            {props.paragraph.translation ? (
              <Box
                px={8}
                textIndent={"1em"}
                fontFamily={"Noteworthy, Comic Sans MS, sans-serif"}
              >
                {props.paragraph.translation}
              </Box>
            ) : null}
          </>
        }
        buttons={
          props.paragraph.id === props.scene.selectedParagraph ? (
            <StoryParagraphButtons
              paragraphId={props.paragraph.id}
              scene={props.scene}
            />
          ) : null
        }
        extra={
          props.paragraph.extraLoading ? (
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
          ) : props.paragraph.extra ? (
            <>
              <HStack gap={0} position={"absolute"} top={4} right={2}>
                <Button
                  _hover={{ color: "green.500" }}
                  variant={"link"}
                  onClick={() => {
                    dispatch(
                      storyActions.updateSceneParagraph({
                        sceneId: props.scene.id,
                        paragraphId: props.paragraph.id,
                        text: props.paragraph.extra,
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
                        sceneId: props.scene.id,
                        paragraphId: props.paragraph.id,
                        extra: "",
                      }),
                    );
                  }}
                >
                  <Trash />
                </Button>
              </HStack>
              <AutoResizeTextarea
                outline={"1px solid transparent"}
                onChange={(e) => {
                  dispatch(
                    storyActions.updateSceneParagraph({
                      sceneId: props.scene.id,
                      paragraphId: props.paragraph.id,
                      extra: e.currentTarget.value,
                    }),
                  );
                }}
                value={props.paragraph.extra}
              />
            </>
          ) : null
        }
      />
      <Row
        borderColor={
          statusColor[props.paragraph.state as SceneParagraph["state"]] ??
          undefined
        }
        selected={props.scene.selectedParagraph === props.paragraph.id}
        main={
          props.paragraph?.plot_point_actions &&
          props.paragraph?.plot_point_actions.length > 0 ? (
            <Flex flexDirection={"row"} px={8} pb={4} gap={1} flexWrap={"wrap"}>
              {props.paragraph?.plot_point_actions.map((link) => {
                const point = plotpoints[link.plot_point_id];
                return (
                  <Tag key={link.plot_point_id} p={2} colorScheme={"blue"}>
                    {point?.title} {link.action}
                    <Button
                      variant={"link"}
                      size={"xs"}
                      ml={2}
                      onClick={() => {
                        if (props.paragraph && props.scene) {
                          dispatch(
                            storyActions.removePlotPointFromSceneParagraph({
                              sceneId: props.scene.id,
                              paragraphId: props.paragraph.id,
                              plotpointId: link.plot_point_id,
                              action: link.action,
                            }),
                          );
                        } else {
                          console.error("no scene or paragraph");
                        }
                      }}
                    >
                      <TrashSolid />
                    </Button>
                  </Tag>
                );
              })}
            </Flex>
          ) : (
            <Box pb={4} />
          )
        }
      />
    </>
  );
};

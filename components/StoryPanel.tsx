import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  Spinner,
  Tag,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  Check,
  Crop,
  Crown,
  Menu as MenuIcon,
  Pacman,
  RefreshDouble,
  Trash,
  TrashSolid,
} from "iconoir-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { aiHelp } from "../lib/actions/aiHelp";
import type { HelpKind } from "../lib/ai-instructions";
import type { SceneParagraph } from "../lib/persistence";
import { plotpointSelector } from "../lib/selectors/plotpointSelector";

import { selectedSceneSelector } from "../lib/selectors/selectedSceneSelector";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";
import { AutoResizeTextarea } from "./AutoResizeTextarea";
import { LanguageForm } from "./LanguageForm";

const statusColor: Record<SceneParagraph["state"], string> = {
  draft: "yellow.500",
  revise: "red.500",
  final: "green.500",
  ai: "purple.500",
};

export const Row = (props: {
  main: React.ReactNode;
  buttons?: React.ReactNode;
  extra?: React.ReactNode;
  selected?: boolean;
  borderColor?: string;
}) => {
  const selectedColor = useColorModeValue("gray.100", "gray.700");
  const color = useColorModeValue("white", "gray.800");

  const altSelectedColor = useColorModeValue("blue.100", "blue.700");
  const altColor = useColorModeValue("white", "blue.800");

  return (
    <Grid
      position={"relative"}
      templateColumns={props.extra ? "1fr 100px 1fr" : "1fr 90px"}
      justifyContent={"center"}
      width={"70%"}
      maxWidth={"1164px"}
    >
      <GridItem
        borderLeft={"0.5rem"}
        px={1}
        background={props.selected ? selectedColor : color}
        gap={2}
        flex={1}
        position={"relative"}
        borderLeftStyle={"solid"}
        borderLeftColor={props.borderColor}
      >
        {props.main}
      </GridItem>
      <GridItem
        gap={2}
        background={props.selected ? selectedColor : color}
        p={props.buttons ? 2 : 0}
      >
        {props.buttons}
      </GridItem>
      {props.extra ? (
        <GridItem
          flex={1}
          background={props.selected ? altSelectedColor : altColor}
        >
          {props.extra}
        </GridItem>
      ) : null}
    </Grid>
  );
};

export const StoryPanel = () => {
  const scene = useSelector(selectedSceneSelector);
  const [selectedScene, setSelectedScene] = useState<string>("");
  const [plotPoint, setPlotPoint] = useState<string>();
  const [action, setAction] = useState<string>("mentioned");
  const plotpoints = useSelector(plotpointSelector);
  const languages = useSelector((store: RootState) =>
    Object.values(store.language.languages),
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(
    undefined,
  );

  const help = useCallback(
    (helpKind: HelpKind, extra = false) => {
      const currentParagraph = scene?.paragraphs.find(
        (p) => p.id === scene.selectedParagraph,
      );

      if (!scene) return;
      if (!currentParagraph) {
        return;
      }
      return aiHelp(helpKind, `${currentParagraph.text}`).then((res) => {
        if (extra) {
          dispatch(
            storyActions.updateSceneParagraph({
              sceneId: scene.id,
              paragraphId: currentParagraph?.id,
              extra: res.data.text,
            }),
          );
        } else {
          dispatch(
            storyActions.updateSceneParagraph({
              sceneId: scene.id,
              paragraphId: currentParagraph?.id,
              extra: res.data.text,
            }),
          );
        }
      });
    },
    [scene],
  );

  const dispatch = useDispatch();
  useEffect(() => {
    if (scene?.id === selectedScene) {
      return;
    }
    setSelectedScene(scene?.id ?? "");
    const paragraph = document.getElementById(
      `p_${scene?.selectedParagraph}`,
    ) as HTMLTextAreaElement | null;
    if (paragraph && scene?.cursor) {
      console.log("focus", scene.cursor);
      paragraph.focus();
      paragraph.selectionStart = scene.cursor;
      paragraph.selectionEnd = scene.cursor;
    }
  }, [scene, selectedScene]);

  if (!scene) {
    return null;
  }

  return (
    <Flex flexDirection={"column"} height={"100%"} overflow={"hidden"}>
      <Flex
        flexDirection={"row"}
        flex={1}
        gap={4}
        height={"100%"}
        overflow={"hidden"}
        justifyContent={"space-around"}
      >
        <Flex
          flex={1}
          overflow={"auto"}
          flexDirection={"column"}
          alignItems={"center"}
        >
          {scene.paragraphs.map((p) => {
            return (
              <>
                <Row
                  selected={scene.selectedParagraph === p.id}
                  borderColor={
                    statusColor[p.state as SceneParagraph["state"]] ?? undefined
                  }
                  main={
                    <AutoResizeTextarea
                      key={p.id}
                      id={`p_${p.id}`}
                      flex={1}
                      outline={"1px solid transparent"}
                      value={p.text}
                      onChange={(e) => {
                        dispatch(
                          storyActions.updateSceneParagraph({
                            sceneId: scene.id,
                            paragraphId: p.id,
                            text: e.target.value,
                          }),
                        );
                      }}
                      onFocus={(e) => {
                        dispatch(
                          storyActions.updateScene({
                            id: scene.id,
                            selectedParagraph: p.id,
                            cursor: e.currentTarget.selectionStart,
                          }),
                        );
                      }}
                      onKeyDown={(e) => {
                        const pe = document.getElementById(
                          `p_${p.id}`,
                        ) as HTMLTextAreaElement;
                        if (e.key === "Enter" && e.shiftKey) {
                          dispatch(
                            storyActions.createSceneParagraph({
                              sceneId: scene.id,
                              afterParagraphId: p.id,
                            }),
                          );
                          e.preventDefault();
                          e.stopPropagation();
                        } else if (e.key === "Backspace" && e.shiftKey) {
                          dispatch(
                            storyActions.deleteSceneParagraph({
                              sceneId: scene.id,
                              paragraphId: p.id,
                            }),
                          );
                          e.preventDefault();
                          e.stopPropagation();
                        } else if (
                          e.key === "ArrowDown" &&
                          pe.selectionStart === pe.value.length
                        ) {
                          scene?.paragraphs.forEach((p, i) => {
                            if (
                              p.id === scene.selectedParagraph &&
                              scene.paragraphs[i + 1]
                            ) {
                              const nextEl = document.getElementById(
                                `p_${scene.paragraphs[i + 1].id}`,
                              ) as HTMLTextAreaElement;
                              nextEl.focus();
                              setTimeout(() => {
                                nextEl.selectionStart = 0;
                                nextEl.selectionEnd = 0;
                              }, 1);
                            }
                          });
                        } else if (
                          e.key === "ArrowUp" &&
                          pe.selectionStart === 0
                        ) {
                          scene?.paragraphs.forEach((p, i) => {
                            if (
                              p.id === scene.selectedParagraph &&
                              scene.paragraphs[i - 1]
                            ) {
                              const nextEl = document.getElementById(
                                `p_${scene.paragraphs[i - 1].id}`,
                              ) as HTMLTextAreaElement;
                              nextEl.focus();
                              setTimeout(() => {
                                nextEl.selectionStart = nextEl.value.length;
                                nextEl.selectionEnd = nextEl.value.length;
                              }, 1);
                            }
                          });
                        } else {
                          console.log(e.key);
                        }
                      }}
                    />
                  }
                  buttons={
                    p.id === scene.selectedParagraph ? (
                      <HStack spacing={2} p={2} w={"90px"}>
                        <IconButton
                          aria-label={"rewrite"}
                          icon={<RefreshDouble />}
                          size={"sm"}
                          onClick={() => {
                            dispatch(
                              storyActions.updateSceneParagraph({
                                sceneId: scene.id,
                                paragraphId: p.id,
                                extraLoading: true,
                              }),
                            );
                            help("rewrite")?.then(() => {
                              dispatch(
                                storyActions.updateSceneParagraph({
                                  sceneId: scene.id,
                                  paragraphId: p.id,
                                  extraLoading: false,
                                }),
                              );
                            });
                          }}
                        >
                          Rewrite
                        </IconButton>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            size={"sm"}
                            aria-label="Options"
                            icon={<MenuIcon />}
                          />
                          <MenuList>
                            <MenuItem
                              icon={<Crown />}
                              onClick={() => {
                                dispatch(
                                  storyActions.updateSceneParagraph({
                                    sceneId: scene.id,
                                    paragraphId: p.id,
                                    state: "draft",
                                  }),
                                );
                              }}
                              command="⌘T"
                            >
                              Draft
                            </MenuItem>
                            <MenuItem
                              icon={<Crop />}
                              onClick={() => {
                                dispatch(
                                  storyActions.updateSceneParagraph({
                                    sceneId: scene.id,
                                    paragraphId: p.id,
                                    state: "revise",
                                  }),
                                );
                              }}
                              command="⌘N"
                            >
                              Revise
                            </MenuItem>
                            <MenuItem
                              icon={<Pacman />}
                              onClick={() => {
                                dispatch(
                                  storyActions.updateSceneParagraph({
                                    sceneId: scene.id,
                                    paragraphId: p.id,
                                    state: "ai",
                                  }),
                                );
                              }}
                              command="⌘⇧N"
                            >
                              AI
                            </MenuItem>
                            <MenuItem
                              icon={<Check />}
                              onClick={() => {
                                dispatch(
                                  storyActions.updateSceneParagraph({
                                    sceneId: scene.id,
                                    paragraphId: p.id,
                                    state: "final",
                                  }),
                                );
                              }}
                              command="⌘⇧N"
                            >
                              Finalized
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </HStack>
                    ) : null
                  }
                  extra={
                    p.extraLoading ? (
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
                    ) : p.extra ? (
                      <>
                        <Button
                          position={"absolute"}
                          top={4}
                          _hover={{ color: "red.500" }}
                          right={2}
                          variant={"link"}
                          onClick={() => {
                            dispatch(
                              storyActions.updateSceneParagraph({
                                sceneId: scene.id,
                                paragraphId: p.id,
                                extra: "",
                              }),
                            );
                          }}
                        >
                          <Trash />
                        </Button>
                        <AutoResizeTextarea
                          outline={"1px solid transparent"}
                          onChange={(e) => {
                            dispatch(
                              storyActions.updateSceneParagraph({
                                sceneId: scene.id,
                                paragraphId: p.id,
                                extra: e.currentTarget.value,
                              }),
                            );
                          }}
                          value={p.extra}
                        />
                      </>
                    ) : null
                  }
                />
                <Row
                  borderColor={
                    statusColor[p.state as SceneParagraph["state"]] ?? undefined
                  }
                  selected={scene.selectedParagraph === p.id}
                  main={
                    p?.plot_point_actions &&
                    p?.plot_point_actions.length > 0 ? (
                      <Flex
                        flexDirection={"row"}
                        px={8}
                        pb={4}
                        gap={1}
                        flexWrap={"wrap"}
                      >
                        {p?.plot_point_actions.map((link) => {
                          const point = plotpoints[link.plot_point_id];
                          return (
                            <Tag
                              key={link.plot_point_id}
                              p={2}
                              colorScheme={"blue"}
                            >
                              {point?.title} {link.action}
                              <Button
                                variant={"link"}
                                size={"xs"}
                                ml={2}
                                onClick={() => {
                                  if (p && scene) {
                                    dispatch(
                                      storyActions.removePlotPointFromSceneParagraph(
                                        {
                                          sceneId: scene.id,
                                          paragraphId: p.id,
                                          plotpointId: link.plot_point_id,
                                          action: link.action,
                                        },
                                      ),
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
          })}
        </Flex>
        {selectedLanguage ? (
          <Flex flex={1} overflow={"auto"} height={"100%"}>
            <LanguageForm languageId={selectedLanguage} />
          </Flex>
        ) : null}
      </Flex>
      <HStack gap={1}>
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
                  setSelectedLanguage(undefined);
                } else {
                  setSelectedLanguage(lang.id);
                }
              }}
            >
              {lang.title}
            </Button>
          );
        })}
      </HStack>
      <Box>
        <Heading size={"md"} mt={4}>
          Plot Points
        </Heading>

        <div style={{ marginTop: "8px", display: "flex" }}>
          <Select
            value={plotPoint}
            onChange={(e) => {
              setPlotPoint(e.currentTarget.value);
            }}
          >
            <option>-- select --</option>
            {Object.values(plotpoints).map((point) => (
              <option key={point.id} value={point.id}>
                {point.title}
              </option>
            ))}
          </Select>
          <Select
            value={action}
            onChange={(e) => {
              setAction(e.currentTarget.value);
            }}
          >
            <option>mentioned</option>
            <option>partially resolved</option>
            <option>resolved</option>
          </Select>
          <Button
            onClick={() => {
              if (scene && plotPoint && scene.selectedParagraph) {
                dispatch(
                  storyActions.addPlotPointToSceneParagraph({
                    sceneId: scene.id,
                    paragraphId: scene.selectedParagraph,
                    plotpointId: plotPoint,
                    action: action,
                  }),
                );
              }
            }}
          >
            Add
          </Button>
        </div>
      </Box>
    </Flex>
  );
};

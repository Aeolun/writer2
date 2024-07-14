import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";
import type React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { plotpointSelector } from "../lib/selectors/plotpointSelector";

import { selectedSceneSelector } from "../lib/selectors/selectedSceneSelector";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";
import { LanguageForm } from "./LanguageForm";
import { Paragraph } from "./Paragraph";
import { SceneButtons } from "./SceneButtons";

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
      templateColumns={props.extra ? "1fr 100px 1fr" : "1fr 100px"}
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
  const [selectedParagraph, setSelectedParagraph] = useState<string>("");
  const [plotPoint, setPlotPoint] = useState<string>();
  const [action, setAction] = useState<string>("mentioned");
  const plotpoints = useSelector(plotpointSelector);
  const selectedLanguage = useSelector(
    (store: RootState) => store.base.selectedLanguage,
  );

  const dispatch = useDispatch();
  useEffect(() => {
    const paragraph = document.getElementById(
      `p_${scene?.selectedParagraph}`,
    ) as HTMLTextAreaElement | null;

    if (
      scene?.id === selectedScene &&
      scene.selectedParagraph === selectedParagraph
    ) {
      return;
    }
    setSelectedScene(scene?.id ?? "");
    setSelectedParagraph(scene?.selectedParagraph ?? "");

    console.log("paragraph", paragraph, scene?.cursor);
    if (paragraph && scene?.cursor !== undefined) {
      console.log("focus", scene.cursor);
      paragraph.selectionStart = scene.cursor;
      paragraph.selectionEnd = scene.cursor;
      paragraph.focus();
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
            return <Paragraph key={p.id} scene={scene} paragraph={p} />;
          })}
        </Flex>
        {selectedLanguage ? (
          <Flex flex={1} overflow={"auto"} height={"100%"}>
            <LanguageForm languageId={selectedLanguage} />
          </Flex>
        ) : null}
      </Flex>
      <SceneButtons scene={scene} />
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

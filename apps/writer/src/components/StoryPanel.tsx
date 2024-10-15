import {
  Box,
  Flex,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  type ModalProps,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";
import type React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { itemsUntilParagraphSelector } from "../lib/selectors/itemsUntilParagraphSelector";
import { selectedSceneSelector } from "../lib/selectors/selectedSceneSelector";
import { storyActions } from "../lib/slices/story";
import { useAppSelector } from "../lib/store";
import { LanguageForm } from "./LanguageForm";
import { SceneButtons } from "./SceneButtons";
import { ParagraphsList } from "./ParagraphsList.tsx";
import { selectedSceneCursorSelector } from "../lib/selectors/selectedSceneCursorSelector.ts";
import { GenerateNext } from "./GenerateNext.tsx";
import { InventoryActions } from "./InventoryActions.tsx";
import { PlotpointActions } from "./PlotPointActions.tsx";
import { globalActions } from "../lib/slices/global.ts";
import { createSelector } from "reselect";

export const Row = (props: {
  main: React.ReactNode;
  buttons?: React.ReactNode;
  suggestion?: React.ReactNode;
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
      templateColumns={props.extra ? "1fr 100px 1fr 0.3fr" : "1fr 100px 0.3fr"}
      justifyContent={"center"}
      width={"100%"}
      maxWidth={"1464px"}
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
      <GridItem>
        {props.suggestion && props.selected ? (
          <Box
            bg="white"
            fontSize={"70%"}
            borderRadius="5px"
            p={1}
            maxH="150px"
            overflow="auto"
            whiteSpace={"pre-wrap"}
            marginLeft={1}
          >
            {props.suggestion}
          </Box>
        ) : null}
      </GridItem>
    </Grid>
  );
};

export const CurrentInventory = (props: {
  currentParagraphId?: string;
  onClose: ModalProps["onClose"];
}) => {
  const itemsUntilParagraph = useSelector(itemsUntilParagraphSelector);

  return (
    <Modal isOpen={true} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Current Inventory</ModalHeader>
        <ModalBody>
          <ul>
            {Object.keys(itemsUntilParagraph)
              .filter((item) => itemsUntilParagraph[item] > 0)
              .map((item) => (
                <li key={item}>
                  {item} x{itemsUntilParagraph[item]}
                </li>
              ))}
          </ul>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const extraSelector = createSelector(selectedSceneSelector, (scene) => {
  return {
    extra: scene?.extra,
    id: scene?.id,
  };
});

export const StoryPanel = () => {
  const [selectedScene, setSelectedScene] = useState<string>("");
  const [selectedParagraph, setSelectedParagraph] = useState<string>("");
  const showCurrentInventory = useAppSelector(
    (store) => store.base.showInventory,
  );

  const selectedCursor = useAppSelector(selectedSceneCursorSelector);
  const extra = useAppSelector(extraSelector);

  const selectedLanguage = useAppSelector(
    (store) => store.base.selectedLanguage,
  );

  const dispatch = useDispatch();
  // useEffect(() => {
  //   const paragraph = document.getElementById(
  //     `p_${selectedCursor?.selectedParagraph}`,
  //   ) as HTMLTextAreaElement | null;

  //   if (
  //     selectedCursor?.id === selectedScene &&
  //     selectedCursor.selectedParagraph === selectedParagraph
  //   ) {
  //     return;
  //   }
  //   setSelectedScene(selectedCursor?.id ?? "");
  //   setSelectedParagraph(selectedCursor?.selectedParagraph ?? "");

  //   if (paragraph && selectedCursor?.cursor !== undefined) {
  //     console.log("focus", selectedCursor.cursor);
  //     paragraph.selectionStart = selectedCursor.cursor;
  //     paragraph.selectionEnd = selectedCursor.cursor;
  //     paragraph.focus();
  //   }
  // }, [selectedCursor, selectedScene]);

  if (!selectedCursor) return null;

  return (
    <Flex flexDirection={"column"} height={"100%"} overflow={"hidden"}>
      {showCurrentInventory ? (
        <CurrentInventory
          currentParagraphId={selectedCursor.selectedParagraph}
          onClose={() => dispatch(globalActions.setShowInventory(false))}
        />
      ) : null}
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
          alignItems={"flex-start"}
          paddingBottom={"12em"}
          p={4}
        >
          <ParagraphsList />
          <GenerateNext />
          <Box minH={"400px"} w={"100%"} />
        </Flex>
        {extra.extra ? (
          <Textarea
            flex={0.5}
            overflow={"auto"}
            flexDirection={"column"}
            alignItems={"flex-start"}
            whiteSpace={"pre-wrap"}
            height="100%"
            bg={"gray.100"}
            p={4}
            onChange={(e) => {
              dispatch(
                storyActions.updateScene({
                  id: extra.id,
                  extra: e.currentTarget.value,
                }),
              );
            }}
            value={extra.extra}
          />
        ) : null}
        {selectedLanguage ? (
          <Flex flex={"1"} overflow={"auto"} height={"100%"}>
            <LanguageForm languageId={selectedLanguage} />
          </Flex>
        ) : null}
      </Flex>
      <SceneButtons />
      <Box px={4} py={2} bg={"gray.300"}>
        <InventoryActions />
        <PlotpointActions />
      </Box>
    </Flex>
  );
};
StoryPanel.whyDidYouRender = true;

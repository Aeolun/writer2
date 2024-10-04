import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  GridItem,
  Heading,
  Select,
  useColorModeValue,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalProps,
  ModalBody,
  Textarea,
} from "@chakra-ui/react";
import {
  AutoComplete,
  AutoCompleteInput,
  AutoCompleteItem,
  AutoCompleteList,
} from "@choc-ui/chakra-autocomplete";
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
import { useAi } from "../lib/use-ai";
import { InventoryAction } from "@writer/shared";
import { itemsUntilParagraphSelector } from "../lib/selectors/itemsUntilParagraphSelector";

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

export const StoryPanel = () => {
  const scene = useSelector(selectedSceneSelector);
  const [selectedScene, setSelectedScene] = useState<string>("");
  const [selectedParagraph, setSelectedParagraph] = useState<string>("");
  const [plotPoint, setPlotPoint] = useState<string>();
  const [nextParagraph, setNextParagraph] = useState<string>();
  const items = useSelector((store: RootState) => store.story.item);
  const [showCurrentInventory, setShowCurrentInventory] =
    useState<boolean>(false);
  const [inventory, setInventory] = useState<InventoryAction>({
    type: "add",
    item_name: "",
    item_amount: 1,
  });
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
      {showCurrentInventory ? (
        <CurrentInventory
          currentParagraphId={scene.selectedParagraph}
          onClose={() => setShowCurrentInventory(false)}
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
          <Flex flexDirection={"column"} alignItems={"flex-start"} w={"100%"}>
            <Textarea
              value={nextParagraph}
              placeholder={"What happens in this paragraph"}
              onChange={(event) => {
                setNextParagraph(event.target.value);
              }}
            />
            <Button
              mt={2}
              onClick={() => {
                useAi(
                  "next_paragraph",
                  `The summary of the scene is: \n\n${scene.summary}\n\nScene so far:\n\n\`\`\`\n${scene.paragraphs.map((p) => p.text).join("\n\n")}\n\`\`\`\n\nWrite a scene in which the following happens: ${nextParagraph}`,
                  false,
                ).then((result) => {
                  dispatch(
                    storyActions.createSceneParagraph({
                      sceneId: scene.id,
                      text: result ?? undefined,
                    }),
                  );
                });
              }}
            >
              Generate Next Paragraph
            </Button>
          </Flex>
          <Box minH={"400px"} w={"100%"} />
        </Flex>
        {scene.extra ? (
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
                  id: scene.id,
                  extra: e.currentTarget.value,
                }),
              );
            }}
            value={scene.extra}
          />
        ) : null}
        {selectedLanguage ? (
          <Flex flex={"1"} overflow={"auto"} height={"100%"}>
            <LanguageForm languageId={selectedLanguage} />
          </Flex>
        ) : null}
      </Flex>
      <SceneButtons scene={scene} />
      <Box px={4} py={2} bg={"gray.300"}>
        <Flex gap={1} alignItems="center" mt="2">
          <Text minW="6em">Inventory</Text>
          <Button
            onClick={() => {
              setShowCurrentInventory(!showCurrentInventory);
            }}
          >
            Current
          </Button>
          <Select
            value={inventory.type}
            onChange={(e) => {
              setInventory({
                ...inventory,
                type: e.currentTarget.value as "add" | "remove",
              });
            }}
          >
            <option value="add">Add</option>
            <option value="remove">Remove</option>
          </Select>
          <AutoComplete
            openOnFocus
            onSelectOption={(option) => {
              setInventory({
                ...inventory,
                item_name: option.item.value,
              });
            }}
          >
            <AutoCompleteInput
              variant="filled"
              value={inventory.item_name}
              onChange={(e) => {
                setInventory({
                  ...inventory,
                  item_name: e.currentTarget.value,
                });
              }}
            />
            <AutoCompleteList>
              {Object.values(items ?? {}).map((item) => (
                <AutoCompleteItem key={`option-${item.id}`} value={item.name}>
                  {item.name}
                </AutoCompleteItem>
              ))}
            </AutoCompleteList>
          </AutoComplete>
          <Input
            type="number"
            value={inventory.item_amount}
            onChange={(e) => {
              setInventory({
                ...inventory,
                item_amount: parseInt(e.currentTarget.value),
              });
            }}
          />
          <Button
            onClick={() => {
              if (scene && inventory && scene.selectedParagraph) {
                dispatch(
                  storyActions.addInventoryActionToSceneParagraph({
                    sceneId: scene.id,
                    paragraphId: scene.selectedParagraph,
                    ...inventory,
                  }),
                );
              }
            }}
          >
            Add
          </Button>
        </Flex>
        <Flex gap={1} alignItems="center" mt="2">
          <Text minW="6em">Plot Points</Text>
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
        </Flex>
      </Box>
    </Flex>
  );
};

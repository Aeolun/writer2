import {
  Box,
  Button,
  Checkbox,
  HStack,
  Input,
  Table,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { aiHelp } from "../lib/actions/aiHelp";
import type { HelpKind } from "../lib/ai-instructions";
import { selectedObjectSelector } from "../lib/selectors/selectedObjectSelector";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";
import { useAi } from "../lib/use-ai";
import { AutoSaveFile, listAutosaves } from "../lib/persistence/list-autosaves";
import { DirEntry } from "@tauri-apps/plugin-fs";

const Entry = (props: { v: AutoSaveFile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const v = props.v;

  return (
    <Tr>
      <Td>{v.savedDate.toLocaleString()}</Td>
      <Td>{v.name}</Td>
      <Td>{v.words}</Td>
      <Td>
        <HStack>
          <Button
            size="xs"
            onClick={() => {
              dispatch(storyActions.updateScene(v.object));
            }}
          >
            Restore
          </Button>
          <Button
            size="xs"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? "Close" : "Open"}
          </Button>
        </HStack>
      </Td>
      {isOpen ? (
        <Box>
          <pre>{JSON.stringify(v.object, null, 2)}</pre>
        </Box>
      ) : null}
    </Tr>
  );
};

export const SceneHistoryPanel = () => {
  const selectedScene = useSelector(selectedObjectSelector);
  const projectPath = useSelector((store: RootState) => store.base.openPath);

  const [historicalVersions, setHistoricalVersions] =
    useState<AutoSaveFile[]>();

  useEffect(() => {
    if (projectPath && selectedScene?.id) {
      setHistoricalVersions([]);
      listAutosaves(projectPath, "scene", selectedScene.id).then((result) => {
        setHistoricalVersions(result);
      });
    }
  }, [selectedScene, projectPath]);

  return selectedScene && selectedScene.type === "scene" ? (
    <Box flex={1} p={4} height="100%" overflow="auto">
      <VStack gap={2} alignItems={"flex-start"}>
        <Table>
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Name</Th>
              <Th>Words</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {historicalVersions?.map((v) => {
              return <Entry v={v} key={v.name} />;
            })}
          </Tbody>
        </Table>
      </VStack>
    </Box>
  ) : null;
};

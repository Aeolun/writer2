import {
  Box,
  Button,
  Checkbox,
  Input,
  Textarea,
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
    <Box>
      <Box>
        {v.savedDate.toLocaleString()}: {v.name} ({v.words}){" "}
        <Button
          onClick={() => {
            dispatch(storyActions.updateScene(v.object));
          }}
        >
          Restore
        </Button>
        <Button
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? "Close" : "Open"}
        </Button>
      </Box>
      {isOpen ? (
        <Box>
          <pre>{JSON.stringify(v.object, null, 2)}</pre>
        </Box>
      ) : null}
    </Box>
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
  }, [selectedScene]);

  return selectedScene && selectedScene.type === "scene" ? (
    <Box overflow="auto" flex="1" h="100%" p={2}>
      <VStack gap={2} alignItems={"flex-start"}>
        {historicalVersions?.map((v) => {
          return <Entry v={v} key={v.name} />;
        })}
      </VStack>
    </Box>
  ) : null;
};

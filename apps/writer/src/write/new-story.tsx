import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-dialog";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { storySettingsSelector } from "../lib/selectors/storySettings";
import { storyActions } from "../lib/slices/story";
import { store, type RootState } from "../lib/store";
import { globalActions } from "../lib/slices/global";
import { useLocation } from "wouter";
import { stat, writeTextFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

const Home = () => {
  const dispatch = useDispatch();
  const [storyName, setStoryName] = useState("");
  const [location, setLocation] = useLocation();

  useEffect(() => {
    dispatch(storyActions.unload());
  }, []);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      <Flex flex={1} direction={"column"} p={4} gap={2} overflow={"hidden"}>
        <Heading size={"lg"}>New Story</Heading>
        <Box p={4} mt={4} border={"black.200"} borderWidth={1}>
          <h2>Create new story</h2>
          <Input
            value={storyName}
            onChange={(e) => {
              setStoryName(e.currentTarget.value);
            }}
          />
          <Button
            mt={2}
            isDisabled={storyName.length === 0}
            onClick={async () => {
              const projectPath = await open({
                multiple: false,
                directory: true,
              });
              if (projectPath === null) {
                return;
              }
              dispatch(storyActions.newStory(storyName));
              dispatch(globalActions.setOpenPath(projectPath));
              const storeData = store.getState();
              const storyFile = await join(projectPath, "index.json");
              writeTextFile(
                storyFile,
                JSON.stringify(
                  {
                    story: {
                      ...storeData.story,
                      name: storyName,
                    },
                    language: storeData.language,
                  },
                  null,
                  2,
                ),
              );
              const newFileStat = await stat(storyFile);
              dispatch(
                globalActions.setExpectedLastModified(
                  newFileStat.mtime ? newFileStat.mtime.getTime() : 0,
                ),
              );
              setLocation("/");
            }}
          >
            Create
          </Button>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Home;

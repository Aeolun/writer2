import {
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
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { NoStory } from "../components/NoStory";
import { WriteHeaderMenu } from "../components/WriteHeaderMenu";
import { storySettingsSelector } from "../lib/selectors/storySettings";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";
import { checkProject } from "../lib/persistence/check-project";
import { loadProject } from "../lib/persistence/load-project";
import { useLocation } from "wouter";

const Home = () => {
  const storyLoaded = useSelector((store: RootState) => store.story.name);
  const settings = useSelector(storySettingsSelector);
  const [location, setLocation] = useLocation();
  const dispatch = useDispatch();

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      <Flex flex={1} direction={"column"} p={4} gap={2} overflow={"hidden"}>
        <Heading size={"lg"}>Open Story</Heading>
        <Flex width={"80"} direction={"column"} margin={"4em auto"}>
          No story is loaded, load a story?
          <Button
            onClick={async () => {
              const projectPath = await open({
                multiple: false,
                directory: true,
              });
              if (!projectPath) {
                alert("Please select a folder");
                return;
              }
              const validProject = await checkProject(projectPath);
              if (!validProject) {
                alert("This is not a folder with a writer project");
                return;
              }
              try {
                await loadProject(projectPath);
                setLocation("/");
              } catch (error) {
                if (error instanceof Error) {
                  alert(error.message);
                } else {
                  alert("Unknown error occurred");
                }
              }
            }}
          >
            Load a story
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Home;

import { Box, Button, Flex, Input } from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-dialog";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "wouter";
import { NavTree } from "../components/NavTree";
import { PageImage } from "../components/PageImage";
import { StoryNavigation } from "../components/StoryNavigation";
import { StoryPane } from "../components/StoryPane";
import { WriteHeaderMenu } from "../components/WriteHeaderMenu";
import { checkProject } from "../lib/persistence/check-project.ts";
import { loadProject } from "../lib/persistence/load-project.ts";
import { storySettingsSelector } from "../lib/selectors/storySettings";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";

const Home = () => {
  const dispatch = useDispatch();
  const storySettings = useSelector(storySettingsSelector);
  const [location, setLocation] = useLocation();
  const storyLoaded = useSelector((store: RootState) => store.story.name);
  const stories = useSelector((store: RootState) => store.base.stories);
  const [storyName, setStoryName] = useState("");

  useEffect(() => {
    if (!storyLoaded) {
      setLocation("/open-story");
    }
  }, [storyLoaded, setLocation]);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      {storyLoaded ? (
        <>
          <WriteHeaderMenu />
          <Flex flex={1} overflow={"hidden"}>
            {storySettings?.mangaChapterPath ? (
              <>
                <NavTree />
                <PageImage display={"image"} />
              </>
            ) : null}
            <StoryNavigation />
            <StoryPane />
          </Flex>
        </>
      ) : (
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
              onClick={() => {
                dispatch(storyActions.newStory(storyName));
              }}
            >
              Create
            </Button>
          </Box>
        </Flex>
      )}
    </Flex>
  );
};

export default Home;

import { StoryPanel } from "./StoryPanel";
import React, { Suspense, useState } from "react";

import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Textarea,
} from "@chakra-ui/react";

import { useDispatch, useSelector } from "react-redux";
import { selectedSceneSelector } from "../lib/selectors/selectedSceneSelector";
import { selectedChapterSelector } from "../lib/selectors/selectedChapterSelector";
import { ScenePanel } from "./ScenePanel";
import { storyActions } from "../lib/slices/story";
import { PlotPointPanel } from "./PlotPointPanel";

export const StoryPane = (props) => {
  const chapterObj = useSelector(selectedChapterSelector);
  const sceneObj = useSelector(selectedSceneSelector);

  const dispatch = useDispatch();

  return (
    <Flex flex={1} flexDirection={"column"} height={"100%"} width={"37%"}>
      <Box p={2} bg={"green.200"}>
        {chapterObj?.title} ({chapterObj?.id})
        {sceneObj ? (
          <span>
            {" "}
            -&gt; {sceneObj?.title} ({sceneObj?.id})
          </span>
        ) : null}
      </Box>
      {chapterObj && !sceneObj ? (
        <Tabs>
          <TabList>
            <Tab>Overview</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  placeholder={"title"}
                  onChange={(e) => {
                    dispatch(
                      storyActions.updateChapter({
                        id: chapterObj.id,
                        title: e.target.value,
                      })
                    );
                  }}
                  value={chapterObj.title}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Summary</FormLabel>
                <Textarea
                  mt={2}
                  onChange={(e) => {
                    dispatch(
                      storyActions.updateChapter({
                        id: chapterObj.id,
                        summary: e.target.value,
                      })
                    );
                  }}
                  placeholder="summary"
                  height={"300px"}
                  value={chapterObj.summary}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Start date</FormLabel>
                <Input
                  mt={2}
                  onChange={(e) => {
                    dispatch(
                      storyActions.updateChapter({
                        id: chapterObj.id,
                        start_date: e.target.value,
                      })
                    );
                  }}
                  placeholder={"start date"}
                  value={chapterObj.start_date}
                />
              </FormControl>
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : (
        <Tabs
          display={"flex"}
          overflow={"hidden"}
          flexDirection={"column"}
          flex={1}
        >
          <TabList>
            <Tab>Story</Tab>
            <Tab>Scene</Tab>
            <Tab>Plot points</Tab>
            {/*<Tab>Characters</Tab>*/}
          </TabList>

          <TabPanels
            flex={1}
            overflow={"hidden"}
            display={"flex"}
            flexDirection={"column"}
          >
            <TabPanel flex={1}>
              <StoryPanel scene={sceneObj} />
            </TabPanel>
            <TabPanel flex={1}>
              <ScenePanel />
            </TabPanel>
            <TabPanel flex={1} overflow={"auto"}>
              <PlotPointPanel />
            </TabPanel>
            {/*<TabPanel>*/}
            {/*  <Suspense fallback={"Loading master of stuff"}>*/}
            {/*    <CharacterPanel />*/}
            {/*  </Suspense>*/}
            {/*</TabPanel>*/}
          </TabPanels>
        </Tabs>
      )}
    </Flex>
  );
};
StoryPane.whyDidYouRender = true;

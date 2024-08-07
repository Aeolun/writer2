import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { StoryPanel } from "../components/StoryPanel";
import { ScenePanel } from "../components/ScenePanel";
import React from "react";

export const SceneTabs = () => {
  return (
    <Tabs
      display={"flex"}
      overflow={"hidden"}
      flexDirection={"column"}
      flex={1}
    >
      <TabList>
        <Tab>Story</Tab>
        <Tab>Scene</Tab>
      </TabList>

      <TabPanels
        flex={1}
        overflow={"hidden"}
        display={"flex"}
        flexDirection={"column"}
      >
        <TabPanel flex={1} p={0} overflow={"hidden"}>
          <StoryPanel />
        </TabPanel>
        <TabPanel flex={1}>
          <ScenePanel />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import React from "react";
import { ScenePanel } from "../components/ScenePanel";

import { StoryPanel } from "./StoryPanel.tsx";
import { SceneHistoryPanel } from "./SceneHistoryPanel.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";

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
        <Tab>History</Tab>
      </TabList>

      <TabPanels
        flex={1}
        overflow={"hidden"}
        display={"flex"}
        flexDirection={"column"}
      >
        <TabPanel flex={1} p={0} overflow={"hidden"}>
          <ErrorBoundary>
            <StoryPanel />
          </ErrorBoundary>
        </TabPanel>
        <TabPanel flex={1} p={0} overflow={"hidden"}>
          <ScenePanel />
        </TabPanel>
        <TabPanel flex={1} p={0} overflow={"hidden"}>
          <SceneHistoryPanel />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

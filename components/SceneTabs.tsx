import {Tab, TabList, TabPanel, TabPanels, Tabs} from "@chakra-ui/react";
import {StoryPanel} from "../components/StoryPanel";
import {ScenePanel} from "../components/ScenePanel";
import React from "react";
import {selectedSceneSelector} from "../lib/selectors/selectedSceneSelector";
import {useSelector} from "react-redux";

export const SceneTabs = () => {
  const sceneObj = useSelector(selectedSceneSelector);

  return <Tabs
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
      <TabPanel flex={1}>
        <StoryPanel scene={sceneObj} />
      </TabPanel>
      <TabPanel flex={1}>
        <ScenePanel />
      </TabPanel>
    </TabPanels>
  </Tabs>
}
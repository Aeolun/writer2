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
import { useAutosave } from "../lib/hooks/use-autosave";
import { checkProject } from "../lib/persistence/check-project.ts";
import { loadProject } from "../lib/persistence/load-project.ts";
import { storySettingsSelector } from "../lib/selectors/storySettings";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";
import { SearchPane } from "../components/SearchPane.tsx";

const Home = () => {
  const [location, setLocation] = useLocation();
  const storyLoaded = useSelector((store: RootState) => store.story.name);

  useEffect(() => {
    if (!storyLoaded) {
      setLocation("/open-story");
    }
  }, [storyLoaded, setLocation]);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      <WriteHeaderMenu />
      <Flex flex={1} overflow={"hidden"}>
        <StoryNavigation />
        <SearchPane />
      </Flex>
    </Flex>
  );
};

export default Home;

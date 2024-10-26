import { Box, Button, Flex, Input } from "@chakra-ui/react";
import { open } from "@tauri-apps/plugin-dialog";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "wouter";
import { EmbedSearchPane } from "../components/EmbedSearchPane.tsx";
import { NavTree } from "../components/NavTree.tsx";
import { PageImage } from "../components/PageImage.tsx";
import { SearchPane } from "../components/SearchPane.tsx";
import { StoryNavigation } from "../components/StoryNavigation.tsx";
import { StoryPane } from "../components/StoryPane.tsx";
import { WriteHeaderMenu } from "../components/WriteHeaderMenu.tsx";
import { checkProject } from "../lib/persistence/check-project.ts";
import { loadProject } from "../lib/persistence/load-project.ts";
import { storySettingsSelector } from "../lib/selectors/storySettings.ts";
import { storyActions } from "../lib/slices/story.ts";
import type { RootState } from "../lib/store";

const EmbedSearch = () => {
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
        <EmbedSearchPane />
      </Flex>
    </Flex>
  );
};

export default EmbedSearch;

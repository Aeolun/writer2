import React from "react";

import {
  Box,
  Flex,
} from "@chakra-ui/react";

import { useDispatch, useSelector } from "react-redux";
import { selectedSceneSelector } from "../lib/selectors/selectedSceneSelector";
import { selectedChapterSelector } from "../lib/selectors/selectedChapterSelector";
import {RootState} from "../lib/store";
import {ChapterTabs} from "../components/ChapterTabs";
import {SceneTabs} from "../components/SceneTabs";
import {ArcTabs} from "../components/ArcTabs";
import {BookTabs} from "../components/BookTabs";

export const StoryPane = () => {
  const chapterObj = useSelector(selectedChapterSelector);
  const sceneObj = useSelector(selectedSceneSelector);
  const selectedEntity = useSelector((store: RootState) => store.base.selectedEntity);

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
      {selectedEntity === 'book' ? <BookTabs /> : null}
      {selectedEntity === 'arc' ? <ArcTabs /> : null}
      {selectedEntity === 'chapter' ? <ChapterTabs /> : null}
      {selectedEntity === 'scene' ? <SceneTabs /> : null}
    </Flex>
  );
};
StoryPane.whyDidYouRender = true;

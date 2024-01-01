import React from "react";

import {
  Box,
  Flex,
} from "@chakra-ui/react";

import { useDispatch, useSelector } from "react-redux";
import {RootState} from "../lib/store";
import {ChapterTabs} from "../components/ChapterTabs";
import {SceneTabs} from "../components/SceneTabs";
import {ArcTabs} from "../components/ArcTabs";
import {BookTabs} from "../components/BookTabs";
import {selectedObjectSelector} from "../lib/selectors/selectedObjectSelector";

export const StoryPane = () => {
  const selectedObject = useSelector(selectedObjectSelector);
  const selectedEntity = useSelector((store: RootState) => store.base.selectedEntity);

  const dispatch = useDispatch();

  return (
    <Flex flex={1} flexDirection={"column"} height={"100%"} width={"37%"}>
      <Box p={2} bg={"green.200"}>
        {selectedEntity === 'book' ? `${selectedObject?.data?.title} (${selectedObject?.id})` : ''}
        {selectedEntity === 'arc' ? `${selectedObject?.data?.title} (${selectedObject?.data?.id})` : ''}
        {selectedEntity === 'chapter' || selectedEntity === 'scene' ? <>{selectedObject?.data?.title}</> : null }
      </Box>
      {selectedEntity === 'book' ? <BookTabs /> : null}
      {selectedEntity === 'arc' ? <ArcTabs /> : null}
      {selectedEntity === 'chapter' ? <ChapterTabs /> : null}
      {selectedEntity === 'scene' ? <SceneTabs /> : null}
    </Flex>
  );
};
StoryPane.whyDidYouRender = true;

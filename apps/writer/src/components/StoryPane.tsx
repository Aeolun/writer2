import React from "react";

import { Box, Flex, useColorModeValue } from "@chakra-ui/react";

import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { RootState } from "../lib/store";
import { ChapterTabs } from "../components/ChapterTabs";
import { SceneTabs } from "../components/SceneTabs";
import { ArcTabs } from "../components/ArcTabs";
import { BookTabs } from "../components/BookTabs";
import { selectedObjectSelector } from "../lib/selectors/selectedObjectSelector";
import { ErrorBoundary } from "./ErrorBoundary";

export const StoryPane = () => {
  const selectedObject = useSelector(selectedObjectSelector);
  const selectedEntity = useSelector(
    (store: RootState) => store.base.selectedEntity,
  );

  const dispatch = useDispatch();
  const color = useColorModeValue("blue.200", "gray.600");
  const backgroundColor = useColorModeValue("blue.400", "black");

  return (
    <ErrorBoundary>
      <Flex
        flex={1}
        flexDirection={"column"}
        height={"100%"}
        width={"37%"}
        backgroundColor={backgroundColor}
        backgroundImage={"url(/rice-paper.png)"}
      >
        <Box p={2} bg={color}>
          {selectedEntity === "book"
            ? `${selectedObject?.data?.title} (${selectedObject?.id})`
            : ""}
          {selectedEntity === "arc"
            ? `${selectedObject?.data?.title} (${selectedObject?.data?.id})`
            : ""}
          {selectedEntity === "chapter" || selectedEntity === "scene" ? (
            <>{selectedObject?.data?.title}</>
          ) : null}
        </Box>
        {selectedEntity === "book" ? <BookTabs /> : null}
        {selectedEntity === "arc" ? <ArcTabs /> : null}
        {selectedEntity === "chapter" ? <ChapterTabs /> : null}
        {selectedEntity === "scene" ? <SceneTabs /> : null}
      </Flex>
    </ErrorBoundary>
  );
};
StoryPane.whyDidYouRender = true;

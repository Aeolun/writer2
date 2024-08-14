import { Flex } from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";
import { FilePanel } from "../components/FilePanel.tsx";
import { NoStory } from "../components/NoStory";
import { WriteHeaderMenu } from "../components/WriteHeaderMenu";
import type { RootState } from "../lib/store";

const Files = () => {
  const storyLoaded = useSelector((store: RootState) => store.story.name);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      {storyLoaded ? (
        <>
          <WriteHeaderMenu />
          <Flex flex={1} overflow={"hidden"}>
            <FilePanel />
          </Flex>
        </>
      ) : (
        <NoStory />
      )}
    </Flex>
  );
};

export default Files;

import { Flex } from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";
import { LanguagePanel } from "../components/LanguagePanel";
import { NoStory } from "../components/NoStory";
import { WriteHeaderMenu } from "../components/WriteHeaderMenu";
import type { RootState } from "../lib/store";

const Language = () => {
  const storyLoaded = useSelector((store: RootState) => store.story.name);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      {storyLoaded ? (
        <>
          <WriteHeaderMenu />
          <Flex flex={1} overflow={"hidden"}>
            <LanguagePanel />
          </Flex>
        </>
      ) : (
        <NoStory />
      )}
    </Flex>
  );
};

export default Language;

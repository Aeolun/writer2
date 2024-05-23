import { Flex } from "@chakra-ui/react";
import type { NextPage } from "next";
import React from "react";
import { useSelector } from "react-redux";
import { CharacterPanel } from "../../components/CharacterPanel";
import { NoStory } from "../../components/NoStory";
import { WriteHeaderMenu } from "../../components/WriteHeaderMenu";
import type { RootState } from "../../lib/store";

const Home: NextPage = () => {
  const storyLoaded = useSelector((store: RootState) => store.story.name);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      {storyLoaded ? (
        <>
          <WriteHeaderMenu />
          <Flex flex={1} overflow={"hidden"}>
            <CharacterPanel />
          </Flex>
        </>
      ) : (
        <NoStory />
      )}
    </Flex>
  );
};

export default Home;

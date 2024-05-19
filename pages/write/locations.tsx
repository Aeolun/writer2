import { Flex } from "@chakra-ui/react";
import type { NextPage } from "next";
import React from "react";
import { useSelector } from "react-redux";
import { HeaderMenu } from "../../components/HeaderMenu";
import { NoStory } from "../../components/NoStory";
import type { RootState } from "../../lib/store";

const Home: NextPage = () => {
  const storyLoaded = useSelector((store: RootState) => store.story.name);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      {storyLoaded ? (
        <>
          <HeaderMenu />
          <Flex flex={1} overflow={"hidden"}>
            Locations
          </Flex>
        </>
      ) : (
        <NoStory />
      )}
    </Flex>
  );
};

export default Home;

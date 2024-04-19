import type { NextPage } from "next";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import { RootState } from "../lib/store";
import axios from "axios";
import { Box, Button, Flex, Input } from "@chakra-ui/react";
import { HeaderMenu } from "../components/HeaderMenu";
import { CharacterPanel } from "../components/CharacterPanel";
import Link from "next/link";
import { NoStory } from "../components/NoStory";

const Home: NextPage = () => {
  const storyLoaded = useSelector((store: RootState) => store.story.name);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      {storyLoaded ? (
        <>
          <HeaderMenu />
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

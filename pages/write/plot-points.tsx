import { Flex } from "@chakra-ui/react";
import type { NextPage } from "next";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HeaderMenu } from "../../components/HeaderMenu";
import { NoStory } from "../../components/NoStory";
import { PlotPointPanel } from "../../components/PlotPointPanel";
import type { RootState } from "../../lib/store";

const Home: NextPage = () => {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const storyLoaded = useSelector((store: RootState) => store.story.name);
  const stories = useSelector((store: RootState) => store.base.stories);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      {storyLoaded ? (
        <>
          <HeaderMenu />
          <Flex flex={1} overflow={"hidden"}>
            <PlotPointPanel />
          </Flex>
        </>
      ) : (
        <NoStory />
      )}
    </Flex>
  );
};

export default Home;

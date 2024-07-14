import { Flex } from "@chakra-ui/react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NoStory } from "../components/NoStory";
import { PlotPointPanel } from "../components/PlotPointPanel";
import { WriteHeaderMenu } from "../components/WriteHeaderMenu";
import type { RootState } from "../lib/store";

const Home = () => {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const storyLoaded = useSelector((store: RootState) => store.story.name);
  const stories = useSelector((store: RootState) => store.base.stories);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      {storyLoaded ? (
        <>
          <WriteHeaderMenu />
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

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Preview } from "../components/Preview";
import { sortedBookObjects } from "../lib/selectors/sortedBookObjects";
import type { RootState } from "../lib/store";
import { Flex } from "@chakra-ui/react";
import { WriteHeaderMenu } from "../components/WriteHeaderMenu";

const Home = () => {
  const storyLoaded = useSelector((store: RootState) => store.story.name);
  const scenes = useSelector(sortedBookObjects);

  const dispatch = useDispatch();

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      <WriteHeaderMenu />
      {scenes ? (
        <Preview objects={scenes} />
      ) : (
        <Flex flex={1} overflow={"hidden"}>
          Select a paragraph in the story navigation to see a preview
        </Flex>
      )}
    </Flex>
  );
};

export default Home;

import {
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Textarea,
} from "@chakra-ui/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { NoStory } from "../components/NoStory";
import { WriteHeaderMenu } from "../components/WriteHeaderMenu";
import { storySettingsSelector } from "../lib/selectors/storySettings";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";

const Home = () => {
  const storyLoaded = useSelector((store: RootState) => store.story.name);
  const settings = useSelector(storySettingsSelector);
  const dispatch = useDispatch();

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      <WriteHeaderMenu />
      <Flex flex={1} direction={"column"} p={4} gap={2} overflow={"hidden"}>
        <Heading size={"lg"}>Profile</Heading>
      </Flex>
    </Flex>
  );
};

export default Home;

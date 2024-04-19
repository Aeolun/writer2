import type { NextPage } from "next";
import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { RootState } from "../lib/store";
import {
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { HeaderMenu } from "../components/HeaderMenu";
import { storySettingsSelector } from "../lib/selectors/storySettings";
import { storyActions } from "../lib/slices/story";
import { NoStory } from "../components/NoStory";

const Home: NextPage = () => {
  const storyLoaded = useSelector((store: RootState) => store.story.name);
  const settings = useSelector(storySettingsSelector);
  const dispatch = useDispatch();

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      {storyLoaded ? (
        <>
          <HeaderMenu />
          <Flex flex={1} direction={"column"} p={4} gap={2} overflow={"hidden"}>
            <FormControl>
              <FormLabel>Image path</FormLabel>
              <Input
                placeholder={"Image path"}
                value={settings?.mangaChapterPath}
                onChange={(e) => {
                  dispatch(
                    storyActions.setSetting({
                      key: "mangaChapterPath",
                      value: e.currentTarget.value,
                    })
                  );
                }}
              />
              <FormHelperText>
                If this is for converting manga, where the chapter images are
                stored.
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>Instructions to give AI</FormLabel>
              <Textarea
                rows={8}
                placeholder={"Instructions"}
                value={settings?.aiInstructions}
                onChange={(e) => {
                  dispatch(
                    storyActions.setSetting({
                      key: "aiInstructions",
                      value: e.currentTarget.value,
                    })
                  );
                }}
              />
              <FormHelperText>
                You can use this to give specific instructions to the AI for
                this story, beyond the instructions already given as part of
                every command.
              </FormHelperText>
            </FormControl>
          </Flex>
        </>
      ) : (
        <NoStory />
      )}
    </Flex>
  );
};

export default Home;

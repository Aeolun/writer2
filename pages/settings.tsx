import type {NextPage} from "next";
import {useDispatch, useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import {RootState} from "../lib/store";
import {Box, Button, Flex, FormControl, FormHelperText, FormLabel, Input, InputGroup} from "@chakra-ui/react";
import {HeaderMenu} from "../components/HeaderMenu";
import Link from "next/link";
import {storySettingsSelector} from "../lib/selectors/storySettings";
import {storyActions} from "../lib/slices/story";

const Home: NextPage = () => {
  const storyLoaded = useSelector((store: RootState) => store.story.name);
  const settings = useSelector(storySettingsSelector);
  const dispatch = useDispatch();

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      {storyLoaded ? <>
        <HeaderMenu />
        <Flex flex={1} direction={'column'} p={4} gap={2} overflow={"hidden"}>
          <FormControl>
            <FormLabel>Image path</FormLabel>
            <Input placeholder={"Image path"} value={settings?.mangaChapterPath}
                   onChange={(e) => {
                     dispatch(
                       storyActions.setSetting({ key: 'mangaChapterPath', value: e.currentTarget.value})
                     );
                   }} />
            <FormHelperText>If this is for converting manga, where the chapter images are stored.</FormHelperText>
          </FormControl>

        </Flex>
      </> : <Flex width={'80'} direction={'column'} margin={'0 auto'}>
        No story loaded. <Link href={'/'}>Load a story</Link>
      </Flex>}

    </Flex>
  );
};

export default Home;

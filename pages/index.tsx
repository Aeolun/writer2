import type { NextPage } from "next";
import { NavTree } from "../components/NavTree";
import { PageImage } from "../components/PageImage";
import React, {Suspense, useEffect, useMemo, useState} from "react";
import { StoryNavigation } from "../components/StoryNavigation";
import { StoryPane } from "../components/StoryPane";
import axios from "axios";
import {useDispatch, useSelector} from "react-redux";
import { storyActions } from "../lib/slices/story";
import {Box, Button, CircularProgress, Flex, Input,} from "@chakra-ui/react";
import {RootState, store} from "../lib/store";
import {globalActions} from "../lib/slices/global";
import Link from "next/link";
import {HeaderMenu} from "../components/HeaderMenu";
import {storySettingsSelector} from "../lib/selectors/storySettings";
import {save} from "../lib/actions/save";
import language from "./language";
import {languageActions} from "../lib/slices/language";
import Head from "next/head";


const Home: NextPage = () => {
  const dispatch = useDispatch();
  const storySettings = useSelector(storySettingsSelector);
  const [saving, setSaving] = useState(false);
  const storyLoaded = useSelector((store: RootState) => store.story.name);
  const stories = useSelector((store: RootState) => store.base.stories);
  const [storyName, setStoryName] = useState('');

  useEffect(() => {
    if (storyLoaded) {
      const saveInterval = setInterval(() => {
        save().catch(e => {
          console.error(e);
        });
      }, 10000)

      return () => {
        clearInterval(saveInterval)
      }
    }
  }, [storyLoaded])

  useEffect(() => {
    axios.get('/api/list').then((res) => {
      dispatch(globalActions.setStories(res.data));
    });
  }, []);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      {storyLoaded ? <>
        <Head>
          <title>{storyLoaded}</title>
        </Head>
        <HeaderMenu />
        <Flex flex={1} overflow={"hidden"}>
          {storySettings?.mangaChapterPath ? <>
          <NavTree />
          <PageImage display={"image"} />
            </> : null }
          <StoryNavigation />
          <StoryPane />
        </Flex>
      </> : <Flex width={'80'} direction={'column'} margin={'0 auto'}>
        <Head>
          <title>Writer</title>
        </Head>
        What story do you want to load?

        {stories?.map((story) => {
          return <Button onClick={() => {
              axios.get(`/api/load/${story.name}`).then((res) => {
                dispatch(storyActions.setStory(res.data.story));
                if (res.data.language) {
                  dispatch(languageActions.setLanguages(res.data.language));
                }
              });
            }
            }>{story.name}</Button>

       })}
        <Box p={4} mt={4} border={"black.200"} borderWidth={1}>
        <h2>Create new story</h2>
        <Input value={storyName} onChange={(e) => {
          setStoryName(e.currentTarget.value);
        }} />
        <Button mt={2} onClick={() => {
          dispatch(storyActions.newStory(storyName));
        }}>Create</Button>
        </Box>
      </Flex>}
    </Flex>
  );
};

export default Home;

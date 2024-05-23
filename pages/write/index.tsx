import { Box, Button, Flex, Input } from "@chakra-ui/react";
import axios from "axios";
import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavTree } from "../../components/NavTree";
import { PageImage } from "../../components/PageImage";
import { StoryNavigation } from "../../components/StoryNavigation";
import { StoryPane } from "../../components/StoryPane";
import { WriteHeaderMenu } from "../../components/WriteHeaderMenu";
import { useAutosave } from "../../lib/hooks/use-autosave";
import { storySettingsSelector } from "../../lib/selectors/storySettings";
import { globalActions } from "../../lib/slices/global";
import { languageActions } from "../../lib/slices/language";
import { storyActions } from "../../lib/slices/story";
import type { RootState } from "../../lib/store";

const Home: NextPage = () => {
  const dispatch = useDispatch();
  const storySettings = useSelector(storySettingsSelector);
  const [saving, setSaving] = useState(false);
  const storyLoaded = useSelector((store: RootState) => store.story.name);
  const stories = useSelector((store: RootState) => store.base.stories);
  const [storyName, setStoryName] = useState("");

  useEffect(() => {
    axios.get("/api/list").then((res) => {
      dispatch(globalActions.setStories(res.data));
    });
  }, []);

  useAutosave(!!storyLoaded);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      {storyLoaded ? (
        <>
          <Head>
            <title>{storyLoaded}</title>
          </Head>
          <WriteHeaderMenu />
          <Flex flex={1} overflow={"hidden"}>
            {storySettings?.mangaChapterPath ? (
              <>
                <NavTree />
                <PageImage display={"image"} />
              </>
            ) : null}
            <StoryNavigation />
            <StoryPane />
          </Flex>
        </>
      ) : (
        <Flex width={"80"} direction={"column"} margin={"4em auto"}>
          <Head>
            <title>Writer</title>
          </Head>
          What story do you want to load?
          {stories?.map((story) => {
            return (
              <Button
                onClick={() => {
                  axios.get(`/api/load/${story.name}`).then((res) => {
                    dispatch(storyActions.setStory(res.data.story));
                    dispatch(
                      globalActions.setExpectedLastModified(
                        res.data.lastModified,
                      ),
                    );
                    if (res.data.language) {
                      dispatch(languageActions.setLanguages(res.data.language));
                    }
                  });
                }}
              >
                {story.name}
              </Button>
            );
          })}
          <Box p={4} mt={4} border={"black.200"} borderWidth={1}>
            <h2>Create new story</h2>
            <Input
              value={storyName}
              onChange={(e) => {
                setStoryName(e.currentTarget.value);
              }}
            />
            <Button
              mt={2}
              onClick={() => {
                dispatch(storyActions.newStory(storyName));
              }}
            >
              Create
            </Button>
          </Box>
        </Flex>
      )}
    </Flex>
  );
};

export default Home;

import type { NextPage } from "next";
import { Nav } from "../components/styled/Nav";
import { NavTree } from "../components/NavTree";
import { PageImage } from "../components/PageImage";
import React, { Suspense, useEffect, useState } from "react";
import { StoryNavigation } from "../components/StoryNavigation";
import { StoryPane } from "../components/StoryPane";
import axios from "axios";
import { useDispatch } from "react-redux";
import { storyActions } from "../lib/slices/story";
import { Box, Button, CircularProgress, Flex } from "@chakra-ui/react";
import { store } from "../lib/store";

const Home: NextPage = () => {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get("/api/load").then((res) => {
      dispatch(storyActions.setStory(res.data));
    });
  }, []);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      <Flex bg={"green.300"} px={2} py={1} justifyContent={"flex-end"}>
        {saving ? (
          <CircularProgress isIndeterminate color="green.300" />
        ) : (
          <Button
            onClick={() => {
              setSaving(true);
              axios.post("/api/save", store.getState().story).then((result) => {
                setSaving(false);
              });
            }}
          >
            Save
          </Button>
        )}
      </Flex>
      <Flex flex={1} overflow={"hidden"}>
        <NavTree />
        <PageImage display={"image"} />
        <StoryNavigation />
        <StoryPane />
      </Flex>
    </Flex>
  );
};

export default Home;

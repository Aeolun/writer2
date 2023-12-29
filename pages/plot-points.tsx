import type {NextPage} from "next";
import {useDispatch, useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import {RootState} from "../lib/store";
import {Box, Button, Flex, Input} from "@chakra-ui/react";
import {HeaderMenu} from "../components/HeaderMenu";
import {PlotPointPanel} from "../components/PlotPointPanel";
import Link from "next/link";

const Home: NextPage = () => {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const storyLoaded = useSelector((store: RootState) => store.story.name);
  const stories = useSelector((store: RootState) => store.base.stories);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      {storyLoaded ? <>
        <HeaderMenu />
        <Flex flex={1} overflow={"hidden"}>
          <PlotPointPanel />
        </Flex>
      </> : <Flex width={'80'} direction={'column'} margin={'0 auto'}>
        No story loaded. <Link href={'/'}>Load a story</Link>
      </Flex>}

    </Flex>
  );
};

export default Home;

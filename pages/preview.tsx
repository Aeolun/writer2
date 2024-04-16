import type {NextPage} from "next";
import {useDispatch, useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import {RootState} from "../lib/store";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  Textarea
} from "@chakra-ui/react";
import {HeaderMenu} from "../components/HeaderMenu";
import Link from "next/link";
import {storySettingsSelector} from "../lib/selectors/storySettings";
import {storyActions} from "../lib/slices/story";
import {sortedBookScenes} from "../lib/selectors/sortedBookScenes";
import {sortedBookObjects} from "../lib/selectors/sortedBookObjects";
import Markdown from 'markdown-to-jsx'

const Home: NextPage = () => {
  const storyLoaded = useSelector((store: RootState) => store.story.name);
  const scenes = useSelector(sortedBookObjects);
  const dispatch = useDispatch();

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      {storyLoaded ? <>
        <Box maxWidth={'40em'} m={'auto'}>
        {scenes?.map((scene) => {
          if (scene.type === 'summary') {
            return <Box p={4} my={2} bg={'gray.600'}>
              Words: {scene.words}, Books: {scene.books}, Chapters: {scene.chapters}, Scenes: {scene.scenes}, Reading time: {Math.round(scene.words / 14280*100)/100} hours
            </Box>
          } else if (scene.type === 'chapter_header') {
            return <Box position={'relative'} bg={'content-box radial-gradient(white, rgba(0, 0, 0, 0))'} backgroundSize={'contain'}>
              <Box my={12} w={'70%'} mx={'auto'} color={'gray.800'}><img style={{filter: 'invert(1)'}} src={'/chapter.svg'} /></Box>
              <Heading position={'absolute'} ml={'-30%'} mt={'-1.0em'} w={'60%'} color={'gray.900'} boxShadow={'sm'} textShadow={'0px 0px 7px #fff, 0px 0px 27px #fff, 0px 0px 37px #fff, 0px 0px 47px #fff'} h={'2.2em'} py={4} top={'50%'} left={'50%'} textAlign={'center'} fontFamily={'big caslon'}>
              {scene.text}
            </Heading></Box>
          } else if (scene.type === 'break') {
            return <Box my={12} w={'70%'} mx={'auto'}><img style={{filter: 'invert(1)'}} src={'/divider.svg'} /></Box>
          } else if (scene.type === 'paragraph') {
            return <Box as={'p'} textIndent={'2em'} color={scene.state === 'revise' ? 'red.500' : undefined} my={'1em'} fontFamily={'georgia, garamond, serif'} fontWeight={'500'} onClick={() => {
              dispatch(storyActions.updateSceneParagraph({
                sceneId: scene.sceneId,
                paragraphId: scene.paragraphId,
                state: 'revise'
              }))
            }}>
              {scene.text ? <Markdown options={{ wrapper: 'div' }}>{scene.text.replaceAll('--', '—')}</Markdown> : null }
            </Box>
          }
        })}
        </Box>
      </> : <Flex width={'80'} direction={'column'} margin={'0 auto'}>
        No story loaded. <Link href={'/'}>Load a story</Link>
      </Flex>}

    </Flex>
  );
};

export default Home;

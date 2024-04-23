import { Box, Flex, Heading, useColorModeValue } from "@chakra-ui/react";
import Markdown from "markdown-to-jsx";
import type { NextPage } from "next";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { NoStory } from "../components/NoStory";
import { useAutosave } from "../lib/hooks/use-autosave";
import { sortedBookObjects } from "../lib/selectors/sortedBookObjects";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";

const Home: NextPage = () => {
  const storyLoaded = useSelector((store: RootState) => store.story.name);
  const scenes = useSelector(sortedBookObjects);
  const imageStyle = useColorModeValue(
    { width: "500px", margin: "2em auto" },
    { filter: "invert(1)", width: "500px", margin: "2em auto" },
  );
  const dispatch = useDispatch();
  useAutosave(!!storyLoaded);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      {storyLoaded ? (
        <>
          <Box maxWidth={"40em"} m={"auto"}>
            {scenes?.map((scene) => {
              if (scene.type === "summary") {
                return (
                  <Box p={4} my={2} bg={"gray.600"}>
                    Words: {scene.words}, AI Words: {scene.aiWords}, Books:{" "}
                    {scene.books}, Chapters: {scene.chapters}, Scenes:{" "}
                    {scene.scenes}, Reading time:{" "}
                    {Math.round(((scene.words + scene.aiWords) / 14280) * 100) /
                      100}{" "}
                    hours
                  </Box>
                );
              } else if (scene.type === "chapter_header") {
                return (
                  <Box
                    position={"relative"}
                    bg={"content-box radial-gradient(white, rgba(0, 0, 0, 0))"}
                    backgroundSize={"contain"}
                  >
                    <Box my={12} w={"70%"} mx={"auto"} color={"gray.800"}>
                      <img
                        style={imageStyle}
                        src={
                          "https://pub-43e7e0f137a34d1ca1ce3be7325ba046.r2.dev/Chapter.png"
                        }
                      />
                    </Box>
                    <Heading
                      position={"absolute"}
                      ml={"-30%"}
                      mt={"-1.0em"}
                      w={"60%"}
                      color={"gray.900"}
                      boxShadow={"sm"}
                      textShadow={
                        "0px 0px 7px #fff, 0px 0px 27px #fff, 0px 0px 37px #fff, 0px 0px 47px #fff"
                      }
                      h={"2.2em"}
                      py={4}
                      top={"50%"}
                      left={"50%"}
                      textAlign={"center"}
                      fontFamily={"big caslon"}
                    >
                      {scene.text}
                    </Heading>
                  </Box>
                );
              } else if (scene.type === "break") {
                return (
                  <Box my={12} w={"70%"} mx={"auto"}>
                    <img
                      style={imageStyle}
                      src={
                        "https://pub-43e7e0f137a34d1ca1ce3be7325ba046.r2.dev/Group.png"
                      }
                    />
                  </Box>
                );
              } else if (scene.type === "paragraph") {
                return (
                  <Box
                    as={"p"}
                    textIndent={"2em"}
                    color={
                      scene.state === "revise"
                        ? "red.500"
                        : scene.posted
                          ? "gray.400"
                          : undefined
                    }
                    my={"1em"}
                    fontFamily={"georgia, garamond, serif"}
                    fontWeight={"500"}
                    onClick={() => {
                      dispatch(
                        storyActions.updateSceneParagraph({
                          sceneId: scene.sceneId,
                          paragraphId: scene.paragraphId,
                          state: scene.state === "revise" ? "draft" : "revise",
                        }),
                      );
                    }}
                  >
                    {scene.text ? (
                      <Markdown options={{ wrapper: "div" }}>
                        {scene.text.replaceAll("--", "—")}
                      </Markdown>
                    ) : null}
                  </Box>
                );
              }
            })}
          </Box>
        </>
      ) : (
        <NoStory />
      )}
    </Flex>
  );
};

export default Home;

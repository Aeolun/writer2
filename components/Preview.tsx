import { Box, Flex, Heading, useColorModeValue } from "@chakra-ui/react";
import Markdown from "markdown-to-jsx";
import React from "react";
import { useDispatch } from "react-redux";
import type { SortedBookObject } from "../lib/selectors/sortedBookObjects";
import { storyActions } from "../lib/slices/story";

export const Preview = (props: { objects: SortedBookObject[] }) => {
  const dispatch = useDispatch();

  const imageStyle = useColorModeValue(
    { width: "300px", margin: "2em auto" },
    { filter: "invert(1)", width: "300px", margin: "2em auto" },
  );

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      <Box maxWidth={"40em"} m={"auto"}>
        {props.objects?.map((scene) => {
          if (scene.type === "summary") {
            return (
              <Box p={4} my={2} bg={"gray.600"}>
                Words: {scene.words}, TTS Cost:{" "}
                {((scene.words * 6) / 1_000_000) * 15} AI Words: {scene.aiWords}
                , Books: {scene.books}, Chapters: {scene.chapters}, Scenes:{" "}
                {scene.scenes}, Reading time:{" "}
                {Math.round(((scene.words + scene.aiWords) / 14280) * 100) /
                  100}{" "}
                hours
              </Box>
            );
          }
          if (scene.type === "chapter_header") {
            return (
              <Heading
                w={"100%"}
                color={"gray.900"}
                textShadow={
                  "0px 0px 7px #fff, 0px 0px 27px #fff, 0px 0px 37px #fff, 0px 0px 47px #fff"
                }
                h={"2.2em"}
                py={4}
                textAlign={"center"}
                fontFamily={"big caslon"}
              >
                {scene.text}
              </Heading>
            );
          }
          if (scene.type === "break") {
            return (
              <Box my={12} w={"70%"} mx={"auto"}>
                <img
                  style={imageStyle}
                  alt={"break"}
                  src={
                    "https://pub-43e7e0f137a34d1ca1ce3be7325ba046.r2.dev/Group.png"
                  }
                />
              </Box>
            );
          }
          if (scene.type === "paragraph") {
            return (
              <Box
                as={"p"}
                position={"relative"}
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
    </Flex>
  );
};

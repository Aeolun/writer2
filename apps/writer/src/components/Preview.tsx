import {
  Box,
  Button,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "wouter";
import type { SortedBookObject } from "../lib/selectors/sortedBookObjects";
import { storyActions } from "../lib/slices/story";

export const Preview = (props: { objects: SortedBookObject[] }) => {
  const dispatch = useDispatch();

  const imageStyle = useColorModeValue(
    { width: "300px", margin: "2em auto" },
    { filter: "invert(1)", width: "300px", margin: "2em auto" },
  );
  const statsBackground = useColorModeValue("gray.200", "gray.700");
  const text = props.objects
    .map((item) => {
      if (item.type === "paragraph") {
        return `${item.text.replaceAll("--", "—").trim()}`;
      }
      if (item.type === "chapter_header") {
        return `<h1>${item.text}</h1>`;
      }
      if (item.type === "break") {
        return `<div><img style="margin: 2em auto; display: block;" src="https://pub-43e7e0f137a34d1ca1ce3be7325ba046.r2.dev/Group.png" /></div>`;
      }
      return undefined;
    })
    .filter((i) => i)
    .join("\n");

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      <Tabs>
        <TabList>
          <Tab>Source</Tab>
          <Tab>HTML</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Text mb={2}>
              Designed for easy copying to the place you publish
            </Text>
            <Textarea
              id={"preview"}
              value={text}
              minHeight={"70vh"}
              onClick={() => {
                //select all
                setTimeout(() => {
                  const textarea: HTMLTextAreaElement | null =
                    document.querySelector("#preview");
                  if (textarea) {
                    textarea.select();
                    textarea.setSelectionRange(0, 99999);
                    navigator.clipboard.writeText(textarea.value);
                  }
                }, 0);
              }}
            />
          </TabPanel>
          <TabPanel>
            <Box maxWidth={"40em"} m={"auto"}>
              {props.objects?.map((scene) => {
                if (scene.type === "summary") {
                  return (
                    <Box p={4} my={2} bg={statsBackground}>
                      Words: {scene.words}, TTS Cost:{" "}
                      {((scene.words * 6) / 1_000_000) * 15} AI Words:{" "}
                      {scene.aiWords}, Books: {scene.books}, Chapters:{" "}
                      {scene.chapters}, Scenes: {scene.scenes}, Reading time:{" "}
                      {Math.round(
                        ((scene.words + scene.aiWords) / 14280) * 100,
                      ) / 100}{" "}
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
                        scene.state === "sdt"
                          ? "purple.500"
                          : scene.state === "revise"
                            ? "red.500"
                            : scene.posted
                              ? "gray.600"
                              : undefined
                      }
                      role={"group"}
                      my={"1em"}
                      fontFamily={"georgia, garamond, serif"}
                      fontWeight={"500"}
                    >
                      {scene.text ? (
                        <Markdown options={{ wrapper: "div" }}>
                          {scene.text.replaceAll("--", "—")}
                        </Markdown>
                      ) : null}
                      <Box
                        position={"absolute"}
                        display={"flex"}
                        gap={2}
                        userSelect={"none"}
                        visibility={"hidden"}
                        _groupHover={{
                          visibility: "visible",
                        }}
                        background={"#ccc"}
                        right={"-120px"}
                        width={"120px"}
                        padding={2}
                        top={0}
                      >
                        <Button
                          size={"xs"}
                          title={"Revise"}
                          onClick={() => {
                            dispatch(
                              storyActions.updateSceneParagraph({
                                sceneId: scene.sceneId,
                                paragraphId: scene.paragraphId,
                                state: "revise",
                              }),
                            );
                          }}
                        >
                          R
                        </Button>
                        <Button
                          size={"xs"}
                          title={"Show don't tell"}
                          onClick={() => {
                            dispatch(
                              storyActions.updateSceneParagraph({
                                sceneId: scene.sceneId,
                                paragraphId: scene.paragraphId,
                                state: "sdt",
                              }),
                            );
                          }}
                        >
                          SDT
                        </Button>
                      </Box>
                    </Box>
                  );
                }
              })}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

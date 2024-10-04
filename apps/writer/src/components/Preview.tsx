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
import { writeTextFile } from "@tauri-apps/plugin-fs";
import markdownit from "markdown-it";
import Markdown from "markdown-to-jsx";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { open } from "@tauri-apps/plugin-dialog";
import type { SortedBookObject } from "../lib/selectors/sortedBookObjects";
import { storyActions } from "../lib/slices/story";

const md = markdownit();

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
        return `${md.render(item.text.replaceAll("--", "—").trim())}`;
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

  const [typstText, setTypstText] = useState("");
  useEffect(() => {
    const process = async () => {
      const contentText = await Promise.all(
        props.objects.map(async (item) => {
          if (item.type === "paragraph") {
            return `${item.text
              .replace("* * *", "#line(length: 100%)")
              .replaceAll("#", "\\#")
              .replaceAll("$", "\\$")
              .replaceAll("@", "\\@")
              .replace(/^\* /gm, "- ")
              .replace(/_{2,}/g, "`--`")}\n`;
          }
          if (item.type === "chapter_header") {
            return `= ${item.text}\n`;
          }
          if (item.type === "break") {
            return `#align(center)[\n  #image("public/Group.png", width: 50%)\n]\n`;
          }
          return undefined;
        }),
      ).then((i) => {
        return i.filter((i) => i).join("\n");
      });
      const newTypstText = `#import "@preview/cmarker:0.1.0"
#set text(
  font: "New Computer Modern",
  size: 10pt
)
#set page(
  paper: "a5",
  margin: (x: 1.8cm, y: 1.5cm),
)
#set heading(numbering: "1.a)")
#set par(
  justify: true,
  leading: 0.52em,
  first-line-indent: 1em,
)\n\n${contentText}`;
      setTypstText(newTypstText);
    };
    process();
  }, [props.objects]);

  return (
    <Flex flexDirection={"column"} height={"100%"}>
      <Tabs>
        <TabList>
          <Tab>HTML Source</Tab>
          <Tab>Typst Source</Tab>
          <Tab>Rendered</Tab>
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
            <Text mb={2}>Designed for easy rendering to PDF/HTML/Markdown</Text>
            <Textarea
              id={"preview_typst"}
              value={typstText}
              minHeight={"70vh"}
              onClick={() => {
                //select all
                setTimeout(() => {
                  const textarea: HTMLTextAreaElement | null =
                    document.querySelector("#preview_typst");
                  if (textarea) {
                    textarea.select();
                    textarea.setSelectionRange(0, 99999);
                    navigator.clipboard.writeText(textarea.value);
                  }
                }, 0);
              }}
            />
            <Button
              onClick={async () => {
                const savePath = await open({
                  multiple: false,
                  directory: false,
                });
                if (savePath) {
                  await writeTextFile(savePath.path, typstText);
                }
              }}
            >
              Save
            </Button>
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

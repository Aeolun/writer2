import React, { useState } from "react";

import { Box, Flex, Input, useColorModeValue } from "@chakra-ui/react";

import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { RootState } from "../lib/store";
import { ChapterTabs } from "../components/ChapterTabs";
import { SceneTabs } from "../components/SceneTabs";
import { ArcTabs } from "../components/ArcTabs";
import { BookTabs } from "../components/BookTabs";
import { selectedObjectSelector } from "../lib/selectors/selectedObjectSelector";
import { sortedBookObjects } from "../lib/selectors/sortedBookObjects";
import { Paragraph } from "./Paragraph";

export const SearchPane = () => {
  const selectedObject = useSelector(selectedObjectSelector);
  const selectedEntity = useSelector(
    (store: RootState) => store.base.selectedEntity,
  );

  const objects = useSelector(sortedBookObjects);
  const scenes = useSelector((store: RootState) => store.story.scene);

  const [search, setSearch] = useState("");

  const dispatch = useDispatch();
  const color = useColorModeValue("blue.200", "gray.600");
  const backgroundColor = useColorModeValue("blue.400", "black");

  return (
    <Flex
      flex={1}
      flexDirection={"column"}
      height={"100%"}
      backgroundColor={backgroundColor}
      backgroundImage={"url(/rice-paper.png)"}
    >
      <Input
        placeholder="Search"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      {search.length > 3
        ? objects
            ?.filter((i) => i.type === "paragraph" && i.text.includes(search))
            .map((i) => {
              if (i.type === "paragraph") {
                const p = scenes[i.sceneId].paragraphs.find(
                  (p) => p.id === i.paragraphId,
                );
                if (p) {
                  return (
                    <Paragraph
                      key={p.id}
                      scene={scenes[i.sceneId]}
                      paragraph={p}
                    />
                  );
                } else {
                  return null;
                }
              } else {
                return null;
              }
            })
        : null}
    </Flex>
  );
};
import { FullChapter } from "./FullChapter";
import React, { useState } from "react";
import { RootState } from "../lib/store";
import { useSelector } from "react-redux";
import { Box } from "@chakra-ui/react";

export const PageImage = (props: { display: "chapter" | "image" }) => {
  const image = useSelector((state: RootState) => state.base.imagePath);

  return (
    <Box width={"40%"} overflow={"auto"}>
      {props.display === "chapter" ? <FullChapter chapter={1} /> : null}
      {props.display === "image" ? (
        <div>
          <img src={image ? "/api/image?path=" + image : undefined} />
        </div>
      ) : null}
    </Box>
  );
};
